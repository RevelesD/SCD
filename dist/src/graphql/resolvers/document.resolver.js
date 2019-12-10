"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("./merge");
const documents_model_1 = require("../../models/documents.model");
const category_model_1 = require("../../models/category.model");
const apollo_server_1 = require("apollo-server");
const config_const_1 = require("../../../config.const");
const is_auth_1 = require("../../middleware/is-auth");
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const logAction_1 = require("../../middleware/logAction");
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
     *
     * @args categoryId
     * @args UpdateDocument{ fileName, category }
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
     *
     * @args documentId
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
            if (doc.owner.toString() !== context.user.userId) {
                logAction_1.registerGenericLog(context, qType, qName, 'User can\'t update documents that are not his own');
                throw new apollo_server_1.ApolloError('User can\'t update documents that are not his own');
            }
            const errors = [];
            // delete the document
            doc = await documents_model_1.Document.deleteOne({ _id: args.id }, (err) => {
                if (err) {
                    errors.push(err);
                }
            });
            console.log(doc);
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
     *
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
     *
     * @args [documentId]
     * @return DeletedResponses{ deletedCount, errors }
     */
    deleteDocuments: async (_, args, context) => {
        const qType = 'Mutation';
        const qName = 'deleteDocuments';
        try {
            const docs = await documents_model_1.Document.find({ _id: { $in: args.ids } });
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
            const errors = [];
            for (const d of docs) {
                bucket.delete(d.fileId, (err) => {
                    if (err) {
                        errors.push(err);
                    }
                });
            }
            const idd = await documents_model_1.Document.deleteMany({ _id: { $in: args.ids } });
            return {
                deletedCount: idd.deletedCount,
                errors: errors
            };
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.documentMutations = documentMutations;
//# sourceMappingURL=document.resolver.js.map