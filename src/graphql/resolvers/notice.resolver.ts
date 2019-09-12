import {ApolloError} from "apollo-server";
import { Notice } from "../../models/notice.model";

const noticeQueries = {
    notice: async(_, args, context, info) => {
      try {
        return await Notice.findById(args.id);
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    notices: async(_, {page, perPage}, context, info) => {
      try {
        return await Notice
          .find()
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
          toDate: input.toDate
        });
        return  await notice.save();
      }catch (e) {
        throw new ApolloError(e);
      }
    },
    updateNotice: async(_, args, context, info) => {
      try {
        return await Notice.findByIdAndUpdate(args.id, args.input);
      }catch (e) {
        throw new ApolloError(e);
      }
    },
    deleteNotice: async(_, args, context, info) => {
      try {
        return await Notice.findByIdAndDelete(args.id).exec();
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  export { noticeQueries, noticeMutations };
  