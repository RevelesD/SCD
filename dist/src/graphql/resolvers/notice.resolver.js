"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const notice_model_1 = require("../../models/notice.model");
const merge_1 = require("./merge");
const noticeQueries = {
    notice: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.docente]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let doc = await notice_model_1.Notice.findById(args.id, projections).exec();
            if (projections.createdBy) {
                // query.populate('createdBy');
                doc = merge_1.transformNotice(doc);
            }
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    notices: async (_, { page, perPage }, context, info) => {
        // if (!await isAuth(context, [config.permission.docente]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let docs = await notice_model_1.Notice
                .find({}, projections)
                .skip(page * perPage)
                .limit(perPage).exec();
            if (projections.createdBy) {
                // query.populate('createdBy');
                docs = docs.map(merge_1.transformNotice);
            }
            return docs;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.noticeQueries = noticeQueries;
const noticeMutations = {
    createNotice: async (_, { input }, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const notice = new notice_model_1.Notice({
                title: input.title,
                body: input.body,
                status: input.status,
                link: input.link,
                imgLnk: input.imgLnk,
                fromDate: input.fromDate,
                toDate: input.toDate,
                createdBy: input.createdBy
            });
            return await notice.save();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    updateNotice: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            let doc = await notice_model_1.Notice
                .findById(args.id, projections)
                .update(args.input, { new: true }).exec();
            if (projections.createdBy) {
                // query.populate('createdBy');
                doc = merge_1.transformNotice(doc);
            }
            return doc;
            // return await Notice.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    deleteNotice: async (_, args, context) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const res = await notice_model_1.Notice.findByIdAndDelete(args.id);
            return res;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.noticeMutations = noticeMutations;
//# sourceMappingURL=notice.resolver.js.map