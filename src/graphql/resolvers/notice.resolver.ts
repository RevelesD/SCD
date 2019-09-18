import {ApolloError} from "apollo-server";
import { Notice } from "../../models/notice.model";
import {getProjection} from "./merge";

const noticeQueries = {
    notice: async(_, args, context, info) => {
      try {
        const projections = getProjection(info);
        return await Notice.findById(args.id, projections);
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    notices: async(_, {page, perPage}, context, info) => {
      try {
        const projections = getProjection(info);
        return await Notice
          .find({}, projections)
          .skip(page*perPage)
          .limit(perPage).exec();
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  const noticeMutations = {
    createNotice: async(_: any, { input }, context: any, info: any) => {
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
        return  await notice.save();
      }catch (e) {
        throw new ApolloError(e);
      }
    },
    updateNotice: async(_, args, context, info) => {
      try {
        const projections = getProjection(info);
        return await Notice.findById(args.id, projections).update(args.input, {new: true}).exec();
        // return await Notice.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
      }catch (e) {
        throw new ApolloError(e);
      }
    },
    deleteNotice: async(_, args, context, info) => {
      try {
        const projections = getProjection(info);
        return await Notice.findById(args.id, projections).delete().exec();
        //return await Notice.findByIdAndDelete(args.id).exec();
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  export { noticeQueries, noticeMutations };
  