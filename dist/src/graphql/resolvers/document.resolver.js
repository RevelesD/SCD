"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const merge_1 = require("./merge");
const documents_model_1 = require("../../models/documents.model");
const apollo_server_1 = require("apollo-server");
const documentQueries = {
    document: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.docente]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let doc = await documents_model_1.Document.findById(args.id, projections);
            if (projections.category) {
                doc = merge_1.transCatInDocument(doc);
            }
            if (projections.owner) {
                doc = merge_1.transOwnerInDocument(doc);
            }
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    documents: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.docente]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const user = context.user;
            const projections = merge_1.getProjection(info);
            const conditions = {
                $and: [
                    { owner: args.search.user }
                ]
            };
            if (args.search.category) {
                // @ts-ignore
                conditions.$and.push({ category: args.search.category });
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
            return docs;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.documentQueries = documentQueries;
const documentMutations = {
    updateDocument: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.docente]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            args.input.updatedAt = Date.now();
            let doc = await documents_model_1.Document
                .findById(args.id, projections)
                .update(args.input).exec();
            if (projections.category) {
                doc = merge_1.transCatInDocument(doc);
            }
            if (projections.owner) {
                doc = merge_1.transOwnerInDocument(doc);
            }
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    deleteDocument: async (_, args, context) => {
        // if (!await isAuth(context, [config.permission.docente]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const res = await documents_model_1.Document.findByIdAndDelete(args.id);
            return res;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.documentMutations = documentMutations;
//# sourceMappingURL=document.resolver.js.map