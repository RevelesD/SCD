import {ApolloError} from "apollo-server";
import {getProjection, tranformLog} from "./merge";
import {SystemLog} from "../../models/systemLog.model";

const systemLogQueries = {
  systemLog: async(_, args, context, info) => {
    try {
      const projections = getProjection(info);
      let doc = await SystemLog.findById(args.id, projections).exec();
      if (projections.causer) {
        doc = tranformLog(doc);
      }
      return doc;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  systemLogs: async(_, args, context, info) => {
    // from: Float!
    // to: Float!
    // page: Int!
    // perPage: Int!
    // user: ID
    try {
      const projections = getProjection(info);
      const query = {
        $and: [
          {createdAt: {$gte: args.input.from}},
          {createdAt: {$lte: args.input.to}},
        ]
      };
      if (args.input.user) {
        // @ts-ignore
        query.$and.push({causer: args.input.user});
      }
      let docs = await SystemLog
        .find(query, projections)
        .skip(args.input.page * args.input.perPage)
        .limit(args.input.perPage).exec();

      if (projections.causer) {
        docs = docs.map(tranformLog);
      }
      return docs;
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};
  
const systemLogMutations = {};
  
export { systemLogQueries, systemLogMutations };
