import {ApolloError} from "apollo-server";
import { Notice } from "../../models/notice.model";
import {getProjection, transformNotice} from "./merge";
import {isAuth} from "../../middleware/is-auth";
import {config} from "../../../enviroments.dev";
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog
} from "../../middleware/logAction";

const noticeQueries = {
  notice: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'notice';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      let doc = await Notice.findById(args.id, projections).exec();
      if (projections.createdBy) {
        // query.populate('createdBy');
        doc = transformNotice(doc);
      }
      registerGoodLog(context, qType, qName, args.id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  notices: async(_, {page, perPage}, context, info) => {
    const qType = 'Query';
    const qName = 'notices';

    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      let docs = await Notice
        .find({}, projections)
        .skip(page*perPage)
        .limit(perPage).exec();

      if (projections.createdBy) {
        docs = docs.map(transformNotice);
      }
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

const noticeMutations = {
  createNotice: async(_: any, { input }, context: any, info: any) => {
    const qType = 'Mutation';
    const qName = 'createNotice';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const notice = new Notice({
        title: input.title,
        body: input.body,
        status: input.status,
        link: input.link,
        imgLnk: input.imgLnk,
        fromDate: input.fromDate,
        toDate: input.toDate,
        createdBy: input.createdBy
      });
      const doc = await notice.save();
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  updateNotice: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateNotice';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      let doc = await Notice
        .findByIdAndUpdate(
          args.id, args.input,
          {new: true, fields: projections});
      if (projections.createdBy) {
        // query.populate('createdBy');
        doc = transformNotice(doc);
      }
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  deleteNotice: async(_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteNotice';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const doc = await Notice.findByIdAndDelete(args.id);
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};
  
export { noticeQueries, noticeMutations };
