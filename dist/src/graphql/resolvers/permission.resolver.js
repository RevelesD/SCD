"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const permission_model_1 = require("../../models/permission.model");
const merge_1 = require("./merge");
const permissionQueries = {
    permission: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            return await permission_model_1.Permission.findById(args.id, projections);
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    permissions: async (_, { page, perPage }, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            return await permission_model_1.Permission
                .find({}, projections)
                .skip(page * perPage)
                .limit(perPage).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.permissionQueries = permissionQueries;
const permissionMutations = {
    createPermission: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            console.log(args.input.rank);
            const permission = new permission_model_1.Permission({
                rank: args.input.rank
            });
            return await permission.save();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    updatePermission: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            return await permission_model_1.Permission.findById(args.id, projections).update(args.input, { new: true }).exec();
            //return await Permission.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    deletePermission: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            return await permission_model_1.Permission.findByIdAndDelete(args.id).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.permissionMutations = permissionMutations;
//# sourceMappingURL=permission.resolver.js.map