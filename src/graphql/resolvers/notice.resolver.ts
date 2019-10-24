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
const fs = require('fs');

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
  createNotice: async(_: any, { file, input }, context: any, info: any) => {
    console.log(input);
    console.log(file);
    const qType = 'Mutation';
    const qName = 'createNotice';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const path = await processPhoto(file);

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
        const path = await processPhoto(args.input.file);
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

const processPhoto = async(upload) => {
  try {
    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    const extensionFile = filename.split('.');
    const fn  = '/public/aviso_' + Date.now() + '.' + extensionFile[extensionFile.length - 1];
    const path = __dirname + '/../..' + fn;
    const hddStream = fs.createWriteStream(path);
    console.log(path);
    // 2.3 upload the file to mongo
    await new Promise((resolve, reject) => {
      stream
        .pipe(hddStream)
        .on("error", reject)
        .on("finish", resolve);
    });

    return fn;
  } catch (e) {
    throw new ApolloError(e);
  }
}
  
export { noticeQueries, noticeMutations };
