"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_model_1 = require("../../models/user.model");
const permission_model_1 = require("../../models/permission.model");
const config_const_1 = require("../../../config.const");
const merge_1 = require("./merge");
const logAction_1 = require("../../middleware/logAction");
const is_auth_1 = require("../../middleware/is-auth");
const userQueries = {
    /**
     *
     * @args userId
     * @return { User } - a mongodb document
     */
    user: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'user';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let doc = await user_model_1.User.findOne({ _id: args.id }, projections).exec();
            if (projections.adscription) {
                // query.populate('adscription');
                doc = merge_1.transformUser(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, doc.id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args page
     * @args perPage
     * @return { [User] } - mongodb documents
     */
    users: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'users';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let docs = await user_model_1.User.find({}, projections).exec();
            if (projections.adscription) {
                // query.populate('adscription');
                docs = docs.map(merge_1.transformUser);
            }
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return docs;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.userQueries = userQueries;
const userMutations = {
    /**
     *
     * @args InputUser{...}
     * @return { User } - a mongodb document
     */
    createUser: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'createUser';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const permission = await permission_model_1.Permission.findOne({ rank: config_const_1.config.permission.docente });
            const user = await user_model_1.User.create({
                clave: args.input.clave,
                status: args.input.status,
                name: args.input.name,
                adscription: args.input.adscription,
                permissions: [permission]
            });
            const res = await user_model_1.User
                .findOne({ _id: user._id })
                .populate({ path: 'adscription' }).exec();
            logAction_1.registerGoodLog(context, qType, qName, res._id);
            return res;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args userId
     * @args status
     * @return { User } - a mongodb document
     */
    updateUser: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateUser';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            if (args.status !== 'Activo' && args.status !== 'Inactivo') {
                const error = logAction_1.registerErrorLog(context, qType, qName, `Status provided: ${args.status}. Status nos allowed`);
                throw new apollo_server_1.ApolloError(`S5, Message: Status provided: ${args.status}. Status not allowed`);
            }
            const projections = merge_1.getProjection(info);
            let doc = await user_model_1.User
                .findByIdAndUpdate(args.id, { status: args.status }, { new: true, fields: projections });
            if (projections.adscription) {
                // query.populate('adscription');
                doc = merge_1.transformUser(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
            //return await User.findByIdAndUpdate(args.id, args.input, {new:true});
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args UpdateUserRole{...}
     * @return { User } - a mongodb document
     */
    updateUserRole: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateUserRole';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const permission = await permission_model_1.Permission.findOne({ rank: args.input.permissionRank });
            if (args.input.action === 1) {
                let doc = await user_model_1.User
                    .findOneAndUpdate({
                    $and: [
                        { _id: args.input.userId },
                        { permissions: { $nin: [permission] } }
                    ]
                }, { $push: { permissions: permission } }, { new: true, fields: projections });
                //.update().exec();
                if (projections.adscription) {
                    // query.populate('adscription');
                    doc = merge_1.transformUser(doc);
                }
                //Revisar context
                logAction_1.registerGoodLog(context, qType, qName, doc._id);
                return doc;
            }
            else if (args.input.action === 2) {
                let doc = await user_model_1.User.findOneAndUpdate({
                    $and: [
                        { _id: args.input.userId },
                        { permissions: { $in: [permission] } }
                    ]
                }, { $pull: { permissions: permission } }, { new: true, fields: projections });
                if (projections.adscription) {
                    // query.populate('adscription');
                    doc = merge_1.transformUser(doc);
                }
                logAction_1.registerGoodLog(context, qType, qName, doc._id);
                return doc;
            }
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args userId
     * @return { User } - a mongodb document
     */
    deleteUser: async (_, args, context) => {
        const qType = 'Mutation';
        const qName = 'deleteUser';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            logAction_1.registerGoodLog(context, qType, qName, args.id);
            return await user_model_1.User.findByIdAndDelete(args.id).exec();
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.userMutations = userMutations;
//# sourceMappingURL=user.resolver.js.map