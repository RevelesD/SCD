import {ApolloError} from "apollo-server";
import {getProjection, tranformLog} from "./merge";
import {SystemLog} from "../../models/systemLog.model";
import {isAuth} from "../../middleware/is-auth";
import {config} from "../../../enviroments.dev";
import {registerBadLog, registerErrorLog, registerGoodLog} from "../../middleware/logAction";

const systemLogQueries = {
  systemLog: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'systemLog';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      let doc = await SystemLog.findById(args.id, projections).exec();
      if (projections.causer) {
        doc = tranformLog(doc);
      }
      registerGoodLog(context, qType, qName, args.id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  systemLogs: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'systemLogs';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }
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
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};
  
const systemLogMutations = {};
  
export { systemLogQueries, systemLogMutations };
