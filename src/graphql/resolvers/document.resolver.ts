import {getProjection, transCatInDocument, transOwnerInDocument} from "./merge";
import { Document } from "../../models/documents.model";
import { ApolloError } from "apollo-server";
import { config } from '../../../enviroments.dev'

const documentQueries = {
  document: async(_, args, context, info) => {
    try {
      // if (!authorize(context, [config.docente, config.admin])) {
      //   throw new ApolloError('Unauthenticated!')
      // }
      const projections = getProjection(info);
      let doc = await Document.findById(args.id, projections);
      if (projections.category) {
        doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        doc = transOwnerInDocument(doc);
      }
      return doc;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  documents: async(_, args, context, info) => {
    try {
      const user = context.user;
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
      return docs;
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};

const documentMutations = {
  updateDocument: async(_, args, context, info) => {
    try {
      const projections = getProjection(info);
      args.input.updatedAt = Date.now();
      let doc = await
        Document
          .findById(args.id, projections)
          .update(args.input).exec();

      if (projections.category) {
        doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        doc = transOwnerInDocument(doc);
      }
      return doc;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  deleteDocument: async(_, args) => {
    try {
      const res = await Document.findByIdAndDelete(args.id);
      return res;
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};

export { documentQueries, documentMutations };
