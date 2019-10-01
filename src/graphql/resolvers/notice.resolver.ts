import {ApolloError} from "apollo-server";
import { Notice } from "../../models/notice.model";
import { Campus } from "../../models/campus.model";
import {getProjection, transformNotice} from "./merge";
import {isAuth} from "../../middleware/is-auth";
import {config} from "../../../enviroments.dev";

const noticeQueries = {
  notice: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.docente]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      let doc = await Notice.findById(args.id, projections).exec();
      if (projections.createdBy) {
        // query.populate('createdBy');
        doc = transformNotice(doc);
      }
      return doc;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  notices: async(_, {page, perPage}, context, info) => {
    // if (!await isAuth(context, [config.permission.docente]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      let docs = await Notice
        .find({}, projections)
        .skip(page*perPage)
        .limit(perPage).exec();

      if (projections.createdBy) {
        // query.populate('createdBy');
        docs = docs.map(transformNotice);
      }
      return docs;
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};

const noticeMutations = {
  createNotice: async(_: any, { input }, context: any, info: any) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
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
      return await notice.save();
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  updateNotice: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      let doc = await Notice
        .findById(args.id, projections)
        .update(args.input, {new: true}).exec();
      if (projections.createdBy) {
        // query.populate('createdBy');
        doc = transformNotice(doc);
      }
      return doc;
      // return await Notice.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  deleteNotice: async(_, args, context) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const res = await Notice.findByIdAndDelete(args.id);
      return res;
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};
  
export { noticeQueries, noticeMutations };
