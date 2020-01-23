"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const merge_1 = require("../../utils/merge");
const systemLog_model_1 = require("../../models/systemLog.model");
const is_auth_1 = require("../../utils/is-auth");
const config_const_1 = require("../../../config.const");
const logAction_1 = require("../../utils/logAction");
const systemLogQueries = {
    /**
     * Get a single log
     * @param {string} id - log id
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
     * @param {number} from - Start of the range of dates to consider in the search
     * @param {number} to - End of the range of dates to consider in the search
     * @param {number} page - page selection for pagination
     * @param {number} perPage - amount of items per page
     * @param {string} user - Optional parameter if want to look at the logs of a specific user
     * @param {string} type - the kind of logs you want to look up, Authentication, Success, Error, Generic
     * @return { [SystemLog] } - a logs list
     */
    systemLogs: async (_, { input }, context, info) => {
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
                    { createdAt: { $gte: input.from } },
                    { createdAt: { $lte: input.to } },
                ]
            };
            if (input.user) {
                // @ts-ignore
                query.$and.push({ causer: args.input.user });
            }
            let docs = await systemLog_model_1.SystemLog
                .find(query, projections)
                .skip(input.page * input.perPage)
                .limit(input.perPage).exec();
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