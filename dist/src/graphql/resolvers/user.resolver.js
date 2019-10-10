"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_model_1 = require("../../models/user.model");
const permission_model_1 = require("../../models/permission.model");
const enviroments_dev_1 = require("../../../enviroments.dev");
const merge_1 = require("./merge");
const userQueries = {
    user: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let doc = await user_model_1.User.findOne({ _id: args.id }, projections).exec();
            if (projections.adscription) {
                // query.populate('adscription');
                doc = merge_1.transformUser(doc);
            }
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    users: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let docs = await user_model_1.User.find({}, projections).exec();
            if (projections.adscription) {
                // query.populate('adscription');
                docs = docs.map(merge_1.transformUser);
            }
            return docs;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.userQueries = userQueries;
const userMutations = {
    createUser: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const permission = await permission_model_1.Permission.findOne({ rank: enviroments_dev_1.config.permission.docente });
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
            return res;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    updateUser: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let doc = await user_model_1.User
                .findById(args.id, projections)
                .update(args.input, { new: true }).exec();
            if (projections.adscription) {
                // query.populate('adscription');
                doc = merge_1.transformUser(doc);
            }
            return doc;
            //return await User.findByIdAndUpdate(args.id, args.input, {new:true});
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    updateUserRole: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            const permission = await permission_model_1.Permission.findOne({ _id: args.input.permissionId }, projections);
            if (args.input.action === 1) {
                let doc = await user_model_1.User
                    .findOne({
                    $and: [
                        { _id: args.input.userId },
                        { permissions: { $nin: [permission] } }
                    ]
                }, projections)
                    .update({ $push: { permissions: permission } }).exec();
                if (projections.adscription) {
                    // query.populate('adscription');
                    doc = merge_1.transformUser(doc);
                }
                return doc;
            }
            else if (args.input.action === 2) {
                let doc = await user_model_1.User.findOne({
                    $and: [
                        { _id: args.input.userId },
                        { permissions: { $in: [permission] } }
                    ]
                }, projections).update({ $pull: { permissions: permission } }).exec();
                if (projections.adscription) {
                    // query.populate('adscription');
                    doc = merge_1.transformUser(doc);
                }
                return doc;
            }
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    deleteUser: async (_, args, context) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            return await user_model_1.User.findByIdAndDelete(args.id).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.userMutations = userMutations;
//# sourceMappingURL=user.resolver.js.map