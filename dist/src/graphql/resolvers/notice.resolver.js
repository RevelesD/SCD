"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const notice_model_1 = require("../../models/notice.model");
const merge_1 = require("../../utils/merge");
const is_auth_1 = require("../../utils/is-auth");
const config_const_1 = require("../../../config.const");
const logAction_1 = require("../../utils/logAction");
const fs = require('fs');
const imageUploader_1 = require("../../utils/imageUploader");
const noticeQueries = {
    /**
     * Get a single document
     * @param {string} id - notice id
     * @return { Notice } - a mongodb document
     */
    notice: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'notice';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let doc = await notice_model_1.Notice.findById(args.id, projections).exec();
            if (projections.createdBy) {
                doc = merge_1.transformNotice(doc);
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
     * Get multiple notices
     * @param {number} page - page selection for pagination
     * @param {number} perPage - amount of items per page
     * @param {number} status - the kind of notices you want to retrieve based in it's status
     * @return { [Notice] } - a mongodb documents list
     */
    notices: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'notices';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let conditions = {};
            if (args.status !== 3) {
                conditions.status = args.status;
            }
            let docs = await notice_model_1.Notice
                .find(conditions, projections)
                .skip(args.page * args.perPage)
                .limit(args.perPage).exec();
            if (projections.createdBy) {
                docs = docs.map(merge_1.transformNotice);
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
exports.noticeQueries = noticeQueries;
const noticeMutations = {
    /**
     * Creates a new notice and store it's attachments
     * @param {Upload} file - file attached to the notice
     * @param {InputNotice{...}} input - all the information of the notice
     * @return { Notice } - a mongodb document
     */
    createNotice: async (_, { file, input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'createNotice';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const path = await imageUploader_1.storeOnS3(file, 'notices');
            if (path === 'FORMAT_ERROR') {
                logAction_1.registerErrorLog(context, qType, qName, 'File format not supported. Only images are allowed');
                throw new apollo_server_1.ApolloError(`S5, Message: File format not supported. Only images are allowed`);
            }
            const notice = new notice_model_1.Notice({
                title: input.title,
                body: input.body,
                status: input.status,
                link: input.link,
                imgLnk: path,
                fromDate: input.fromDate,
                toDate: input.toDate,
                createdBy: input.createdBy
            });
            const doc = await notice.save();
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
     * @param {string} id - id of the notice to update
     * @param {UpdateNotice} input - New data to replace in the notice, all parameter inside are optional
     * @param {Upload} file - Optional parameter, contains a new file to attach to the notice
     * @return { Notice } - a mongodb document
     */
    updateNotice: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateNotice';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            if (args.input.file !== undefined) {
                const doc = await notice_model_1.Notice.findById(args.id, { imgLnk: true });
                fs.unlinkSync(doc.imgLnk);
                const path = await imageUploader_1.storeOnS3(args.input.file, 'notices');
                args.input.imgLnk = path;
                delete args.input.file;
            }
            const projections = merge_1.getProjection(info);
            let doc = await notice_model_1.Notice
                .findByIdAndUpdate(args.id, args.input, { new: true, fields: projections });
            if (projections.createdBy) {
                // query.populate('createdBy');
                doc = merge_1.transformNotice(doc);
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
     * Delete one notice and removes the attachments from the storage
     * @param {string} id - id of the notice to delete
     * @return {Notice} - The deleted document
     */
    deleteNotice: async (_, args, context) => {
        const qType = 'Mutation';
        const qName = 'deleteNotice';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.admin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const doc = await notice_model_1.Notice.findByIdAndDelete(args.id);
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.noticeMutations = noticeMutations;
//# sourceMappingURL=notice.resolver.js.map