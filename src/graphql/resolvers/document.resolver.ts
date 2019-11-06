import { getProjection, transCatInDocument, transOwnerInDocument } from "./merge";
import { Document } from "../../models/documents.model";
import { Category as CatModel } from "../../models/category.model";
import { Category, Document as DocType } from "../../generated/graphql.types";
import { ApolloError } from "apollo-server";
import { config } from '../../../config.const'
import { Context, isAuth } from "../../middleware/is-auth";
const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog,
  registerGenericLog
} from "../../middleware/logAction";
import { MongoError } from "mongodb";

const documentQueries = {
  document: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'document';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      let doc = await Document.findById(args.id, projections);
      if (projections.category) {
        doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        doc = transOwnerInDocument(doc);
      }
       registerGoodLog(context, qType, qName, args.id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  documents: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'documents';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      const conditions = {
        $and: [
          {owner: args.search.user}
        ]
      }
      if (args.search.category) {
        const auxCat = await CatModel.findOne({clave: args.search.category}, {_id: true});
        // @ts-ignore
        conditions.$and.push({category: auxCat._id});
      }
      if (args.search.fileName) {
        // @ts-ignore
        conditions.$and.push({fileName: /args.search.fileName/});
      }
      let docs = await Document
        .find(conditions, projections)
        .skip(args.search.page * args.search.perPage)
        .limit(args.search.perPage).exec();
      if (projections.category) {
        docs = docs.map(transCatInDocument);
        // doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        docs = docs.map(transOwnerInDocument);
        // doc = transOwnerInDocument(doc);
      }
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

const documentMutations = {
  updateDocument: async(_, args, context: Context, info) => {
    const qType = 'Mutation';
    const qName = 'updateDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      args.input.updatedAt = Date.now();
      let doc = await Document.findById(args.id, projections);
      if (doc.owner !== context.user.userId) {
        registerGenericLog(
          context, qType, qName,
          'User can\'t update documents that are not his own');
        throw new ApolloError('User can\'t update documents that are not his own')
      }

      doc = await Document.updateOne(doc._id, args.input, {new: true});
      if (projections.category) {
        doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        doc = transOwnerInDocument(doc);
      }
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  deleteDocument: async(_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      // check if the document belong to the user trying to modify it
      let doc = await Document.findById(args.id);
      if (doc.owner !== context.user.userId) {
        registerGenericLog(
          context, qType, qName,
          'User can\'t update documents that are not his own');
        throw new ApolloError('User can\'t update documents that are not his own')
      }
      // delete the document
      doc = await Document.deleteOne(args.id);
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  moveDocument: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'moveDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);

      const cat: Category =
        await CatModel.findById(args.cat, {_id: true, path: true});
      let doc: DocType =
        await Document.findById(args.doc, {_id: true, path: true, category: true, fileName: true});

      // const path = doc.path.split('/');
      const updates = {
        // path: cat.path + '/' + path[path.length - 1],
        path: cat.path + '/' + doc.fileName,
        category: cat._id
      };

      doc = await Document.findByIdAndUpdate(args.doc, updates, {
        new: true,
        fields: projections
      });

      return doc;

    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  deleteDocuments: async (_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteDocuments';
    try {
      const docs: DocType[] = await Document.find({_id: {$in: args.ids}});

      const con = await MongoClient.connect(
        process.env.DB_PATH,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      );
      const db = con.db(process.env.DB_NAME);
      // ===================== GridFS ========================
      // pending to check uploads of smaller sizes
      let bucket = new mongodb.GridFSBucket(db, {
        bucketName: 'archivos',
      });

      const errors: MongoError[] = [];

      for (const d of docs) {
        bucket.delete(d.fileId, (err) => {
          if (err) {
            errors.push(err);
          }
        });
      }

      const idd = await Document.deleteMany({_id: {$in: args.ids}});
      return {
        deletedCount: idd.deletedCount,
        errors: errors
      };
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

export { documentQueries, documentMutations };
