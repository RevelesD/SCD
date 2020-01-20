"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const merge_1 = require("./merge");
const systemLog_model_1 = require("../../models/systemLog.model");
const is_auth_1 = require("../../utils/is-auth");
const config_const_1 = require("../../../config.const");
const logAction_1 = require("../../utils/logAction");
const systemLogQueries = {
    /**
     *
     * @args logId
     * @return { Log } - a mongodb document
     */
    systemLog: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'systemLog';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let doc = await systemLog_model_1.SystemLog.findById(args.id, projections).exec();
            if (projections.causer) {
                doc = merge_1.tranformLog(doc);
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
     * @args SearchLogs{...}
     * @return { [SystemLog] } - mongodb documents
     */
    systemLogs: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'systemLogs';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
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
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            console.log(docs);
            return docs;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.systemLogQueries = systemLogQueries;
const systemLogMutations = {};
exports.systemLogMutations = systemLogMutations;
//# sourceMappingURL=systemLog.resolver.js.map