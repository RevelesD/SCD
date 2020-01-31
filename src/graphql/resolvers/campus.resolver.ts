import {ApolloError, ForbiddenError, AuthenticationError} from "apollo-server";
import {Campus} from "../../models/campus.model";
import {getProjection} from "../../utils/merge";
import {Context, isAuth} from "../../utils/is-auth"
import {
  registerGoodLog,
  registerBadLog,
  registerErrorLog
} from "../../utils/logAction"
import {config} from "../../../config.const";

const campusQueries = {
  /**
   * Get an specific campus
   * @param {string} id - campus Id
   * @return { Campus } - a mongodb document
   */
  campus: async (_, {id}, context: Context, info) => {
    const qType = 'Query';
    const qName = 'campus';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin])
      if (err !== null){
        throw err;
      }

      const projections = getProjection(info);
      const doc = await Campus.findById(id, projections);
      registerGoodLog(context, qType, qName, id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Get multiple campus
   * @param {number} page - page selection for pagination
   * @param {number} perPage - amount of items per page
   * @return { [Campus] } - a list of mongodb documents
   */
  allCampus: async (_, {page, perPage}, context, info) => {
    const qType = 'Query';
    const qName = 'allCampus';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }

      const projections = getProjection(info);
      const docs = await Campus
        .find({}, projections)
        .skip(page * perPage)
        .limit(perPage).exec();
      registerGoodLog(context, qType, qName, 'Multiple documents')
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  }
};

const campusMutations = {
  /**
   * Campus creation
   * @param { InputCampus{ name, phone }} input
   * @return { Campus } - a mongodb document
   */
  createCampus: async (_, {input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'createCampus';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }

      const campus = new Campus({
        name: input.name,
        phone: input.phone
      });
      const doc = await campus.save();
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  },
  /**
   * Update campus
   * @param {string} id - Campus id
   * @param {UpdateCampus{ name, phone }} input
   * @return { Campus } - a mongodb document
   */
  updateCampus: async (_, {id, input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateCampus';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }

      const projections = getProjection(info);
      const doc = await Campus
        .findByIdAndUpdate(id, input, {new: true, fields: projections});
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Delete campus
   * @param {string} id - campus id
   * @return { Campus } - a mongodb document
   */
  deleteCampus: async (_, {id}, context) => {
    const qType = 'Mutation';
    const qName = 'deleteCampus';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }

      const doc = await Campus.findByIdAndDelete(id);
      registerGoodLog(context, qType, qName, doc._id)
      return doc
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

export {campusQueries, campusMutations};
