import {getProjection, transCatInDocument, transOwnerInDocument} from "./merge";
import { Document } from "../../models/documents.model";
import { ApolloError } from "apollo-server";
import { config } from '../../../enviroments.dev'
import {Context, isAuth} from "../../middleware/is-auth";
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog,
  registerGenericLog
} from "../../middleware/logAction";

const documentQueries = {
  document: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'document';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
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
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e);
    }
  },
  documents: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'documents';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      const conditions = {
        $and: [
          {owner: args.search.user}
        ]
      }
      if (args.search.category) {
        // @ts-ignore
        conditions.$and.push({category: args.search.category});
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
      registerErrorLog(context, qType, qName);
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
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
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
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e);
    }
  },
  deleteDocument: async(_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
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
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e);
    }
  }
};

export { documentQueries, documentMutations };
