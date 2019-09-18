import {getProjection} from "./merge";
import { Document } from "../../models/documents.model";
import { ApolloError } from "apollo-server";

const documentQueries = {
  document: async(_, args, context, info) => {
    try {
      const projections = getProjection(info);
      const doc = await Document.findById(args.id, projections);
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
      const docs = await Document
        .find(conditions, projections)
        .skip(args.search.page * args.search.perPage)
        .limit(args.search.perPage).exec();
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
      const query =
        Document
          .findById(args.id, projections)
          .update(args.input);

      if (projections.category) {
        query.populate('category');
      }
      if (projections.owner) {
        query.populate('owner');
      }
      return await query.exec();
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
