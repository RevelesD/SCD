import { ApolloError } from "apollo-server";
import { Notice } from "../../models/notice.model";
import { getProjection, transformNotice } from "../../utils/merge";
import { isAuth } from "../../utils/is-auth";
import { config } from "../../../config.const";
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog
} from "../../utils/logAction";
const fs = require('fs');
import { storeOnS3 } from "../../utils/imageUploader";

const noticeQueries = {
  /**
   * Get a single document
   * @param {string} id - notice id
   * @return { Notice } - a mongodb document
   */
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
        doc = transformNotice(doc);
      }
      registerGoodLog(context, qType, qName, args.id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Get multiple notices
   * @param {number} page - page selection for pagination
   * @param {number} perPage - amount of items per page
   * @param {number} status - the kind of notices you want to retrieve based in it's status
   * @return { [Notice] } - a mongodb documents list
   */
  notices: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'notices';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);

      let conditions: any = {};
      if (args.status !== 3){
        conditions.status = args.status;
      }

      let docs = await Notice
        .find(conditions, projections)
        .skip(args.page*args.perPage)
        .limit(args.perPage).exec();

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
  /**
   * Creates a new notice and store it's attachments
   * @param {Upload} file - file attached to the notice
   * @param {InputNotice{...}} input - all the information of the notice
   * @return { Notice } - a mongodb document
   */
  createNotice: async(_: any, { file, input }, context: any, info: any) => {
    const qType = 'Mutation';
    const qName = 'createNotice';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const path = await storeOnS3(file, 'notices');
      if (path === 'FORMAT_ERROR') {
        registerErrorLog(context, qType, qName,
          'File format not supported. Only images are allowed');
        throw new ApolloError(`S5, Message: File format not supported. Only images are allowed`);
      }

      const notice = new Notice({
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
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   *
   * @param {string} id - id of the notice to update
   * @param {UpdateNotice} input - New data to replace in the notice, all parameter inside are optional
   * @param {Upload} file - Optional parameter, contains a new file to attach to the notice
   * @return { Notice } - a mongodb document
   */
  updateNotice: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateNotice';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      if (args.input.file !== undefined) {
        const doc = await Notice.findById(args.id, {imgLnk: true});
        fs.unlinkSync(doc.imgLnk)
        const path = await storeOnS3(args.input.file, 'notices');
        args.input.imgLnk = path;
        delete args.input.file;
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
  /**
   * Delete one notice and removes the attachments from the storage
   * @param {string} id - id of the notice to delete
   * @return {Notice} - The deleted document
   */
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
