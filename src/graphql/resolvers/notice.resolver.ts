import {ApolloError} from "apollo-server";
const Notice = require('../../models/notice.model');

const noticeQueries = {
    notice: async(_, args: {id}, context, info) => {
      try {
        return await Notice.findById(args.id);
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    notices: async(_, args: {offset,  limit, }, context, info) => {
      try {
        return await Notice.find();
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  const noticeMutations = {
    createNotice: async(_: any, args: { InputNotice }, context: any, info: any) => {
      try {
        const notice = new Notice({
          title: args.InputNotice.title,
          body: args.InputNotice.body,
          status: args.InputNotice.status,
          link: args.InputNotice.link,
          imgLnk: args.InputNotice.imgLnk,
          fromDate: args.InputNotice.fromDate,
          toDate: args.InputNotice.toDate
        });
        const res =  await notice.save();
      }catch (e) {
        throw new ApolloError(e);
      }
    },
    updateNotice: async(_, args: {id, UpdateNotice}, context, info) => {
      try {
        return await Notice.findByIdAndUpdate(args.id, args.UpdateNotice);
      }catch (e) {
        throw new ApolloError(e);
      }
    },
    deleteNotice: async(_, args: {id}, context, info) => {
      try {
        return await Notice.findByIdAndDelete(args.id).exec();
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  export { noticeQueries, noticeMutations };
  