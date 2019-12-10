"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const permission_model_1 = require("../../models/permission.model");
const merge_1 = require("./merge");
const is_auth_1 = require("../../middleware/is-auth");
const config_const_1 = require("../../../config.const");
const logAction_1 = require("../../middleware/logAction");
const permissionQueries = {
    /**
     *
     * @args permissionId
     * @return { Permission } - a mongodb document
     */
    permission: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'permission';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const doc = await permission_model_1.Permission.findById(args.id, projections);
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
     * @page
     * @perPage
     * @return { [Permission] } - mongodb documents
     */
    permissions: async (_, { page, perPage }, context, info) => {
        const qType = 'Query';
        const qName = 'permissions';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const docs = await permission_model_1.Permission
                .find({}, projections)
                .skip(page * perPage)
                .limit(perPage).exec();
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return docs;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.permissionQueries = permissionQueries;
const permissionMutations = {
    /**
     *
     * @args InputPermission{ rank }
     * @return { Permission } - a mongodb document
     */
    createPermission: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'createPermission';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const permission = new permission_model_1.Permission({
                rank: args.input.rank
            });
            const doc = await permission.save();
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
     * @args permissionId
     * @args InputPermission{ rank }
     * @return { Permission } - a mongodb document
     */
    updatePermission: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'updatePermission';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const doc = await permission_model_1.Permission
                .findByIdAndUpdate(args.id, args.input, { new: true, fields: projections });
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
     * @args permissionId
     * @return { Permission } - a mongodb document
     */
    deletePermission: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'deletePermission';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const doc = await permission_model_1.Permission.findByIdAndDelete(args.id).exec();
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.permissionMutations = permissionMutations;
//# sourceMappingURL=permission.resolver.js.map