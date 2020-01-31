import {ApolloError, ForbiddenError} from "apollo-server";
import {getProjection, tranformLog} from "../../utils/merge";
import {SystemLog} from "../../models/systemLog.model";
import {isAuth} from "../../utils/is-auth";
import {config} from "../../../config.const";
import {registerBadLog, registerErrorLog, registerGoodLog} from "../../utils/logAction";

const systemLogQueries = {
  /**
   * Get a single log
   * @param {string} id - log id
   * @return { Log } - a mongodb document
   */
  systemLog: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'systemLog';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
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
   * @param {number} from - Start of the range of dates to consider in the search
   * @param {number} to - End of the range of dates to consider in the search
   * @param {number} page - page selection for pagination
   * @param {number} perPage - amount of items per page
   * @param {string} user - Optional parameter if want to look at the logs of a specific user
   * @param {string} type - the kind of logs you want to look up, Authentication, Success, Error, Generic
   * @return { [SystemLog] } - a logs list
   */
  systemLogs: async(_, {input}, context, info) => {
    const qType = 'Query';
    const qName = 'systemLogs';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }
      const projections = getProjection(info);
      const query = {
        $and: [
          {createdAt: {$gte: input.from}},
          {createdAt: {$lte: input.to}},
        ]
      };
      if (input.user) {
        // @ts-ignore
        query.$and.push({causer: args.input.user});
      }
      let docs = await SystemLog
        .find(query, projections)
        .skip(input.page * input.perPage)
        .limit(input.perPage).exec();

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
