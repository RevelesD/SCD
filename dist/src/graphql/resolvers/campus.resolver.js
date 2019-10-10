"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const campus_model_1 = require("../../models/campus.model");
const merge_1 = require("./merge");
const is_auth_1 = require("../../middleware/is-auth");
const logAction_1 = require("../../middleware/logAction");
const enviroments_dev_1 = require("../../../enviroments.dev");
const campusQueries = {
    campus: async (_, args, context, info) => {
        try {
            if (!await is_auth_1.isAuth(context, [enviroments_dev_1.config.permission.superAdmin])) {
                if (!context.user) {
                    logAction_1.logAction('Unauthenticated', 'Requested the query campus', context.user.ip);
                }
                else {
                    logAction_1.logAction(context.user.userId, 'Requested the query campus without permissions to access this query', context.user.ip);
                }
                throw new apollo_server_1.ApolloError('Unauthenticated');
            }
            const projections = merge_1.getProjection(info);
            return await campus_model_1.Campus.findById(args.id), projections;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    allCampus: async (_, { page, perPage }, context, info) => {
        try {
            // if (!await isAuth(context, [config.permission.superAdmin]))
            //   throw new ApolloError('Unauthenticated');
            const projections = merge_1.getProjection(info);
            return await campus_model_1.Campus
                .find({}, projections)
                .skip(page * perPage)
                .limit(perPage).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.campusQueries = campusQueries;
const campusMutations = {
    createCampus: async (_, { input }, context, info) => {
        try {
            // if (!await isAuth(context, [config.permission.superAdmin]))
            //     throw new ApolloError('Unauthenticated');
            const campus = new campus_model_1.Campus({
                name: input.name,
                phone: input.phone
            });
            return await campus.save();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    updateCampus: async (_, args, context, info) => {
        try {
            // if (!await isAuth(context, [config.permission.superAdmin]))
            //   throw new ApolloError('Unauthenticated');
            const projections = merge_1.getProjection(info);
            return await campus_model_1.Campus
                .findById(args.id, projections)
                .update(args.input, { new: true }).exec();
            //return await Campus.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    deleteCampus: async (_, args, context) => {
        try {
            // if (!await isAuth(context, [config.permission.superAdmin]))
            //   throw new ApolloError('Unauthenticated');
            const res = await campus_model_1.Campus.findByIdAndDelete(args.id);
            return res;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.campusMutations = campusMutations;
//# sourceMappingURL=campus.resolver.js.map