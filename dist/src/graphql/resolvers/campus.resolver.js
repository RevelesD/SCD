"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const campus_model_1 = require("../../models/campus.model");
const merge_1 = require("./merge");
const is_auth_1 = require("../../middleware/is-auth");
const logAction_1 = require("../../middleware/logAction");
const config_const_1 = require("../../../config.const");
const campusQueries = {
    /**
     * get an specific campus
     * @args campusId
     * @return { Campus } - a mongodb document
     */
    campus: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'campus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const doc = await campus_model_1.Campus.findById(args.id, projections);
            logAction_1.registerGoodLog(context, qType, qName, args.id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * get all campus
     * @page first
     * @perPage offset
     * @return { [Campus] } - a mongodb document
     */
    allCampus: async (_, { page, perPage }, context, info) => {
        const qType = 'Query';
        const qName = 'allCampus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const docs = await campus_model_1.Campus
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
exports.campusQueries = campusQueries;
const campusMutations = {
    /**
     * Campus creation
     * @input InputCampus{ name, phone }
     * @return { Campus } - a mongodb document
     */
    createCampus: async (_, { input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'createCampus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const campus = new campus_model_1.Campus({
                name: input.name,
                phone: input.phone
            });
            const doc = await campus.save();
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * update campus
     * @args idCampus
     * @args UpdateCampus{ name, phone }
     * @return { Campus } - a mongodb document
     */
    updateCampus: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateCampus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const doc = await campus_model_1.Campus
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
     * Delete campus
     * @args campusId
     * @return { Campus } - a mongodb document
     */
    deleteCampus: async (_, args, context) => {
        const qType = 'Mutation';
        const qName = 'deleteCampus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const doc = await campus_model_1.Campus.findByIdAndDelete(args.id);
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.campusMutations = campusMutations;
//# sourceMappingURL=campus.resolver.js.map