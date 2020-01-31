"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const is_auth_1 = require("../../utils/is-auth");
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const PromiseAll = require('promises-all');
const documents_model_1 = require("../../models/documents.model");
const category_model_1 = require("../../models/category.model");
const config_const_1 = require("../../../config.const");
const apollo_server_1 = require("apollo-server");
const logAction_1 = require("../../utils/logAction");
/**
 * Saves one file as binary in the database
 * @param {Upload} upload - The file as received from the front end
 * @param {InputDocument} input - The ownership information of the document
 * @return Mongodb document
 */
const processUpload = async (upload, input) => {
    try {
        const { createReadStream, filename, mimetype } = await upload;
        const stream = createReadStream();
        if (mimetype !== 'application/pdf') {
            throw new apollo_server_1.ForbiddenError('Tipo de documento no valido');
        }
        const con = await MongoClient.connect(process.env.DB_PATH, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        const db = con.db(process.env.DB_NAME);
        // ===================== GridFS ========================
        // pending to check uploads of smaller sizes
        let bucket = new mongodb.GridFSBucket(db, {
            bucketName: 'archivos',
        });
        const uploadStream = bucket.openUploadStream(filename, {
            disableMD5: true
        });
        // 2.3 upload the file to mongo
        await new Promise((resolve, reject) => {
            stream
                .pipe(uploadStream)
                .on("error", reject)
                .on("finish", resolve);
        });
        // close connection with the database.
        await con.close();
        const docData = { _id: uploadStream.id, filename, mimetype, length: uploadStream.length };
        // create, wait and return the document entry on the database
        return await createDocument(input.category, input.owner, docData);
    }
    catch (e) {
        throw new apollo_server_1.ApolloError(e);
    }
};
/**
 * Store the information of the file as a document in mongodb
 * @param {string} catId - category id
 * @param {string} owner - owner id
 * @param {Object} docData - metadata of the docuemnt retrieved from the db
 * @return mongodb document
 */
async function createDocument(catId, owner, docData) {
    try {
        const category = await category_model_1.Category.findById(catId);
        const doc = {
            fileName: docData.filename,
            fileId: docData._id,
            mimetype: docData.mimetype,
            size: docData.length,
            path: `${category.path}/${docData.filename}`,
            category: catId,
            owner: owner
        };
        const dbdoc = await documents_model_1.Document.create(doc);
        return dbdoc;
    }
    catch (e) {
        throw new apollo_server_1.ApolloError(e);
    }
}
const uploadsQueries = {};
exports.uploadsQueries = uploadsQueries;
const uploadsMutations = {
    /**
     * Handles the upload of a single document
     * @param {Upload} file - The document to be stored
     * @param {InputDocument{category, owner}} input - The ownership information of the document
     * @return {Document} document as stored on the db
     */
    singleUpload: async (_, { file, input }, context) => {
        const qType = 'Mutation';
        const qName = 'singleUpload';
        try {
            const err = await is_auth_1.isAuth(context, qType, qName, [config_const_1.config.permission.docente]);
            if (err !== null) {
                throw err;
            }
            const doc = await processUpload(file, input);
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Handles the upload of multiple documents at the same time
     * @param {Upload[]} files - The documents to be stored
     * @param {InputDocument{category, owner}} input - The ownership information of the documents
     * @return {Document[]} list of documents as stored on the db
     */
    multipleUpload: async (_, { files, input }, context) => {
        const qType = 'Mutation';
        const qName = 'multipleUpload';
        try {
            const err = await is_auth_1.isAuth(context, qType, qName, [config_const_1.config.permission.docente]);
            if (err !== null) {
                throw err;
            }
            const { resolve, reject } = await PromiseAll.all(files.map(async (x) => await processUpload(x, input)));
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return resolve;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.uploadsMutations = uploadsMutations;
//# sourceMappingURL=uploads.resolver.js.map