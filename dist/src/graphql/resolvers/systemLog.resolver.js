"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const merge_1 = require("./merge");
const systemLog_model_1 = require("../../models/systemLog.model");
const systemLogQueries = {
    systemLog: async (_, args, context, info) => {
        try {
            const projections = merge_1.getProjection(info);
            let doc = await systemLog_model_1.SystemLog.findById(args.id, projections).exec();
            if (projections.causer) {
                doc = merge_1.tranformLog(doc);
            }
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    systemLogs: async (_, args, context, info) => {
        // from: Float!
        // to: Float!
        // page: Int!
        // perPage: Int!
        // user: ID
        try {
            const projections = merge_1.getProjection(info);
            const query = {
                $and: [
                    { createdAt: { $gte: args.input.from } },
                    { createdAt: { $lte: args.input.to } },
                ]
            };
            if (args.input.user) {
                // @ts-ignore
                query.$and.push({ causer: args.input.user });
            }
            let docs = await systemLog_model_1.SystemLog
                .find(query, projections)
                .skip(args.input.page * args.input.perPage)
                .limit(args.input.perPage).exec();
            if (projections.causer) {
                docs = docs.map(merge_1.tranformLog);
            }
            return docs;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.systemLogQueries = systemLogQueries;
const systemLogMutations = {};
exports.systemLogMutations = systemLogMutations;
//# sourceMappingURL=systemLog.resolver.js.map