import {ApolloError} from "apollo-server";
import {Campus} from "../../models/campus.model";
import {getProjection} from "./merge";
import {Context, isAuth} from "../../middleware/is-auth"
import {
  registerGoodLog,
  registerBadLog,
  registerErrorLog
} from "../../middleware/logAction"
import {config} from "../../../enviroments.dev";

const campusQueries = {
  campus: async (_, args, context: Context, info) => {
    const qType = 'Query';
    const qName = 'campus';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      const doc = await Campus.findById(args.id, projections);
      registerGoodLog(context, qType, qName, args.id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e);
    }
  },
  allCampus: async (_, {page, perPage}, context, info) => {
    const qType = 'Query';
    const qName = 'allCampus';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      const docs = await Campus
        .find({}, projections)
        .skip(page * perPage)
        .limit(perPage).exec();
      registerGoodLog(context, qType, qName, 'Multiple documents')
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e)
    }
  }
};

const campusMutations = {
  createCampus: async (_, {input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'createCampus';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const campus = new Campus({
        name: input.name,
        phone: input.phone
      });
      const doc = await campus.save();
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e)
    }
  },
  updateCampus: async (_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateCampus';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      const doc = await Campus
        .findById(args.id, projections)
        .update(args.input, {new: true}).exec();
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e);
    }
  },
  deleteCampus: async (_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteCampus';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const doc = await Campus.findByIdAndDelete(args.id);
      registerGoodLog(context, qType, qName, doc._id)
      return doc
    } catch (e) {
      registerErrorLog(context, qType, qName);
      throw new ApolloError(e);
    }
  }
};

export {campusQueries, campusMutations};
