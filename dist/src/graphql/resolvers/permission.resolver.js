"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const permission_model_1 = require("../../models/permission.model");
const merge_1 = require("../../utils/merge");
const is_auth_1 = require("../../utils/is-auth");
const config_const_1 = require("../../../config.const");
const logAction_1 = require("../../utils/logAction");
const permissionQueries = {
    /**
     * Get a single permission
     * @param {string} id - permission id
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
     * Get multiple permissions
     * @param {number} page - page selection for pagination
     * @param {number} perPage - amount of items per page
     * @return { [Permission] } - mongodb permissions documents list
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
     * Creates a new permission
     * @param {InputPermission{rank}} input - Info of the new permission-
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
     * Updates one document
     * @param {string} id - permission id
     * @param {InputPermission{ rank }} input - new info to update the document
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
     * Deletes one permission
     * @param {string} id - permission id
     * @return { Permission } - the document deleted
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