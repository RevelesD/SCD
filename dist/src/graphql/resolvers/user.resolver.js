"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_model_1 = require("../../models/user.model");
const permission_model_1 = require("../../models/permission.model");
const config_const_1 = require("../../../config.const");
const merge_1 = require("../../utils/merge");
const logAction_1 = require("../../utils/logAction");
const is_auth_1 = require("../../utils/is-auth");
const imageUploader_1 = require("../../utils/imageUploader");
const userQueries = {
    /**
     * Get a single user
     * @param {string} id - user id
     * @return {User} - a mongodb document
     */
    user: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'user';
        try {
            // if (!await isAuth(context, [config.permission.docente])) {
            //   const error = registerBadLog(context, qType, qName);
            //   throw new ApolloError(`S5, Message: ${error}`);
            // }
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
     * Get multiple users
     * @param {number} page - page selection for pagination
     * @param {number} perPage - amount of items per page
     * @return { [User] } - a list of users
     */
    users: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'users';
        try {
            // if (!await isAuth(context, [config.permission.admin])) {
            //   const error = registerBadLog(context, qType, qName);
            //   throw new ApolloError(`S5, Message: ${error}`);
            // }
            const projections = merge_1.getProjection(info);
            let docs = await user_model_1.User.find({}, projections).exec();
            if (projections.adscription) {
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
     * Create a new user, this mutations should not be used as the users are automatically created on login
     * @param {string} clave - Personal identifier, provided by the login PI
     * @param {string} status - Status of activity "Activo" || "Inactivo"
     * @param {string} name
     * @param {string} lastName
     * @param {string} adscription - id of the campus where the user belongs
     * @return { User } - a mongodb document
     */
    createUser: async (_, { input }, context) => {
        const qType = 'Mutation';
        const qName = 'createUser';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const permission = await permission_model_1.Permission.findOne({ rank: config_const_1.config.permission.docente });
            const user = await user_model_1.User.create({
                clave: input.clave,
                status: input.status,
                name: input.name,
                lastName: input.lastName,
                adscription: input.adscription,
                photoURL: process.env.ANONYMOUS_URL,
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
     * Update the status of the user, the rest of the fields should not be updated.
     * @args {string} id - user id
     * @args {string} status - "Activo" || "Inactivo"
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
                doc = merge_1.transformUser(doc);
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
     * Updates the permissions of one user
     * @param {string} userId - user id
     * @param {number} permissionRank - rank of the permission that wants to be manipulated
     * @param {number} action - 1.- Add, 2.- Remove
     * @return { User } - a mongodb document
     */
    updateUserRole: async (_, { input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateUserRole';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const permission = await permission_model_1.Permission.findOne({ rank: input.permissionRank });
            if (input.action === 1) {
                let doc = await user_model_1.User
                    .findOneAndUpdate({
                    $and: [
                        { _id: input.userId },
                        { permissions: { $nin: [permission] } }
                    ]
                }, { $push: { permissions: permission } }, { new: true, fields: projections });
                if (projections.adscription) {
                    doc = merge_1.transformUser(doc);
                }
                logAction_1.registerGoodLog(context, qType, qName, doc._id);
                return doc;
            }
            else if (input.action === 2) {
                let doc = await user_model_1.User.findOneAndUpdate({
                    $and: [
                        { _id: input.userId },
                        { permissions: { $in: [permission] } }
                    ]
                }, { $pull: { permissions: permission } }, { new: true, fields: projections });
                if (projections.adscription) {
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
     * Change the profile picture of a user
     * @param {string} id - user id of the user that is updating his picture
     * @param {Upload} photo - new photo ready to be stored
     * @return {User} user document with updated photo path
     */
    updateProfilePic: async (_, { id, photo }, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateProfilePic';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const path = await imageUploader_1.storeOnS3(photo, 'photo');
            const user = await user_model_1.User.findOneAndUpdate({ _id: id }, { photoURL: path }, { new: true, fields: projections });
            logAction_1.registerGoodLog(context, qType, qName, user._id);
            return user;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Remove the user from the db
     * @param {string} id - user id
     * @return { User } - a mongodb document
     */
    deleteUser: async (_, { id }, context) => {
        const qType = 'Mutation';
        const qName = 'deleteUser';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            logAction_1.registerGoodLog(context, qType, qName, id);
            return await user_model_1.User.findByIdAndDelete(id).exec();
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.userMutations = userMutations;
//# sourceMappingURL=user.resolver.js.map