import {ApolloError} from "apollo-server";
import {getProjection, tranformLog} from "./merge";
import {SystemLog} from "../../models/systemLog.model";
import {isAuth} from "../../utils/is-auth";
import {config} from "../../../config.const";
import {registerBadLog, registerErrorLog, registerGoodLog} from "../../utils/logAction";

const systemLogQueries = {
  /**
   *
   * @args logId
   * @return { Log } - a mongodb document
   */
  systemLog: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'systemLog';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
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
  /**
   *
   * @args SearchLogs{...}
   * @return { [SystemLog] } - mongodb documents
   */
  systemLogs: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'systemLogs';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
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

      registerGoodLog(context, qType, qName, 'Multiple documents');
      console.log(docs);
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};
  
const systemLogMutations = {};
  
export { systemLogQueries, systemLogMutations };
