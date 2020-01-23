"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const campus_model_1 = require("../../models/campus.model");
const merge_1 = require("./merge");
const is_auth_1 = require("../../utils/is-auth");
const logAction_1 = require("../../utils/logAction");
const config_const_1 = require("../../../config.const");
const campusQueries = {
    /**
     * Get an specific campus
     * @param {string} id - campus Id
     * @return { Campus } - a mongodb document
     */
    campus: async (_, { id }, context, info) => {
        const qType = 'Query';
        const qName = 'campus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const doc = await campus_model_1.Campus.findById(id, projections);
            logAction_1.registerGoodLog(context, qType, qName, id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * Get multiple campus
     * @param {number} page - page selection for pagination
     * @param {number} perPage - amount of items per page
     * @return { [Campus] } - a list of mongodb documents
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
     * @param { InputCampus{ name, phone }} input
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
     * Update campus
     * @param {string} id - Campus id
     * @param {UpdateCampus{ name, phone }} input
     * @return { Campus } - a mongodb document
     */
    updateCampus: async (_, { id, input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateCampus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            const doc = await campus_model_1.Campus
                .findByIdAndUpdate(id, input, { new: true, fields: projections });
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
     * @param {string} id - campus id
     * @return { Campus } - a mongodb document
     */
    deleteCampus: async (_, { id }, context) => {
        const qType = 'Mutation';
        const qName = 'deleteCampus';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const doc = await campus_model_1.Campus.findByIdAndDelete(id);
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