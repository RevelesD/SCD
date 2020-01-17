"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("./merge");
const documents_model_1 = require("../../models/documents.model");
const category_model_1 = require("../../models/category.model");
const apollo_server_1 = require("apollo-server");
const config_const_1 = require("../../../config.const");
const is_auth_1 = require("../../middleware/is-auth");
const mongodb = require('mongodb');
// const MongoClient = require('mongodb').MongoClient;
const logAction_1 = require("../../middleware/logAction");
const mongodb_1 = require("mongodb");
const documentQueries = {
    /**
     *
     * @args documentId
     * @return { Document } - a mongodb document
     */
    document: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'document';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let doc = await documents_model_1.Document.findById(args.id, projections);
            if (projections.category) {
                doc = merge_1.transCatInDocument(doc);
            }
            if (projections.owner) {
                doc = merge_1.transOwnerInDocument(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, args.id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args SearchDocument{ user, page, perPage, category, filename }
     * @return { [Document] } - a mongodb document
     */
    documents: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'documents';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const conditions = {
                $and: [
                    { owner: args.search.user }
                ]
            };
            if (args.search.category) {
                const auxCat = await category_model_1.Category.findOne({ clave: args.search.category }, { _id: true });
                // @ts-ignore
                conditions.$and.push({ category: auxCat._id });
            }
            if (args.search.fileName) {
                // @ts-ignore
                conditions.$and.push({ fileName: /args.search.fileName/ });
            }
            let docs = await documents_model_1.Document
                .find(conditions, projections)
                .skip(args.search.page * args.search.perPage)
                .limit(args.search.perPage).exec();
            if (projections.category) {
                docs = docs.map(merge_1.transCatInDocument);
                // doc = transCatInDocument(doc);
            }
            if (projections.owner) {
                docs = docs.map(merge_1.transOwnerInDocument);
                // doc = transOwnerInDocument(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return docs;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    documentsQuantity: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'documents';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const cat = await category_model_1.Category.findOne({ clave: args.category }, { _id: true });
            let conditions = {
                owner: args.user
            };
            if (args.category !== '000') {
                conditions.category = cat._id;
            }
            const count = await documents_model_1.Document.countDocuments(conditions);
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return count;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.documentQueries = documentQueries;
const documentMutations = {
    /**
     * Update the data of a single document
     * @args {id}
     * @args {UpdateDocument { fileName, category } }
     * @return { Document } - a mongodb document
     */
    updateDocument: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateDocument';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            args.input.updatedAt = Date.now();
            let doc = await documents_model_1.Document.findById(args.id, projections);
            if (doc.owner !== context.user.userId) {
                logAction_1.registerGenericLog(context, qType, qName, 'User can\'t update documents that are not his own');
                throw new apollo_server_1.ApolloError('User can\'t update documents that are not his own');
            }
            doc = await documents_model_1.Document.updateOne(doc._id, args.input, { new: true });
            if (projections.category) {
                doc = merge_1.transCatInDocument(doc);
            }
            if (projections.owner) {
                doc = merge_1.transOwnerInDocument(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Delete a single document
     * @param {string} args.documentId - Id of the document for delete
     * @return { Document } - a mongodb document
     */
    deleteDocument: async (_, args, context) => {
        const qType = 'Mutation';
        const qName = 'deleteDocument';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            // check if the document belong to the user trying to modify it
            let doc = await documents_model_1.Document.findById(args.id);
            // check if the documents belong to the user trying to delete them
            if (doc.owner.toString() !== context.user.userId) {
                logDenyDeleteOfDocuments(context, qType, qName);
            }
            const bucket = await CreateGFSBucketConnection();
            const errors = [];
            // Delete de files and chunks from the gridfs bucket
            bucket.delete(new mongodb_1.ObjectId(doc.fileId), (err) => {
                if (err) {
                    // If there are any error push them into the errors array for further use.
                    errors.push(err);
                }
            });
            // Delete the document
            doc = await documents_model_1.Document.deleteOne({ _id: args.id });
            logAction_1.registerGoodLog(context, qType, qName, args.id);
            return {
                deletedCount: doc.deletedCount,
                errors: errors
            };
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Move a single document to another category
     * @args documentId
     * @args ( categoryID ) - receiver categoryId
     * @return { Document } - a mongodb document
     */
    moveDocument: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'moveDocument';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const cat = await category_model_1.Category.findById(args.cat, { _id: true, path: true });
            let doc = await documents_model_1.Document.findById(args.doc, { _id: true, path: true, category: true, fileName: true });
            // const path = doc.path.split('/');
            const updates = {
                // path: cat.path + '/' + path[path.length - 1],
                path: cat.path + '/' + doc.fileName,
                category: cat._id
            };
            doc = await documents_model_1.Document.findByIdAndUpdate(args.doc, updates, {
                new: true,
                fields: projections
            });
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Delete multiple documents
     * @args [documentId]
     * @return DeletedResponses{ deletedCount, errors }
     */
    deleteDocuments: async (_, args, context) => {
        const qType = 'Mutation';
        const qName = 'deleteDocuments';
        try {
            const docs = await documents_model_1.Document.find({ _id: { $in: args.ids } });
            // check if there are documents in the search
            if (docs.length === 0) {
                return {
                    deletedCount: 0,
                    errors: []
                };
            }
            // check if the documents belong to the user trying to delete them
            if (docs[0].owner.toString() !== context.user.userId) {
                logDenyDeleteOfDocuments(context, qType, qName);
            }
            const bucket = await CreateGFSBucketConnection();
            const errors = [];
            for (const d of docs) {
                // cast the string stored to oid and delete the files and his respective chunks from the bucket.
                bucket.delete(new mongodb_1.ObjectId(d.fileId), (err) => {
                    if (err) {
                        // if there are any error push them into the errors array for further use.
                        errors.push(err);
                    }
                });
            }
            // Delete the documents
            const idd = await documents_model_1.Document.deleteMany({ _id: { $in: args.ids } });
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return {
                deletedCount: idd.deletedCount,
                errors: errors
            };
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Move multiple documents to another category
     * @param { String } cat - id as string of the target category
     * @param { String[] } oids - array of id as strings of the documents that are going to be moved
     * @return { DeletedResponses }
     */
    moveMultipleDocuments: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'moveMultipleDocuments';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const cat = await category_model_1.Category.findById(args.cat, { _id: true, path: true });
            const docs = await documents_model_1.Document.find({ _id: { $in: args.oids } }, { _id: true, path: true, category: true, fileName: true });
            const updatedFiles = await moveDocument(cat, docs);
            return updatedFiles;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.documentMutations = documentMutations;
/**
 * Change the category of a group of documents
 * @param cat - Category mongodb document
 * @param docs - Group of documents mongodb documents
 * @return updatedFiles - object that contains the amount of files updated,
 * a list of ids of updated documents and a list of errors found during the execution
 */
async function moveDocument(cat, docs) {
    let updatedFiles = {
        qty: 0,
        files: [],
        errors: []
    };
    for (let i = 0; i < docs.length; i++) {
        try {
            console.log(`Doc ${i}`, docs[i]);
            await documents_model_1.Document.findByIdAndUpdate(docs[i]._id, {
                path: cat.path + '/' + docs[i].fileName,
                category: cat._id
            }, { new: true, fields: { _id: true } });
            updatedFiles.qty++;
            updatedFiles.files.push(docs[i].fileId);
        }
        catch (e) {
            updatedFiles.errors.push(e.toString());
        }
    }
    return updatedFiles;
}
async function CreateGFSBucketConnection() {
    // Create a mongodb client connection
    const con = await mongodb_1.MongoClient.connect(process.env.DB_PATH, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    // Connect to a database using the previous mongo client
    const db = con.db(process.env.DB_NAME);
    // GridFS
    const bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'archivos',
    });
    return bucket;
}
function logDenyDeleteOfDocuments(context, qT, qN) {
    logAction_1.registerGenericLog(context, qT, qN, 'User can\'t delete documents that are not his own');
    throw new apollo_server_1.ApolloError('User can\'t delete documents that are not his own');
}
//# sourceMappingURL=document.resolver.js.map