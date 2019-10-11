import {ApolloError} from "apollo-server";
import {Campus} from "../../models/campus.model";
import {getProjection} from "./merge";
import {Context, isAuth} from "../../middleware/is-auth"
import {registerLog} from "../../middleware/logAction"
import {config} from "../../../enviroments.dev";

const campusQueries = {
  campus: async (_, args, context: Context, info) => {
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerLog(context, 'query campus');
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      return await Campus.findById(args.id), projections;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  allCampus: async (_, {page, perPage}, context, info) => {
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerLog(context, 'query "allCampus');
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      return await Campus
        .find({}, projections)
        .skip(page * perPage)
        .limit(perPage).exec();
    } catch (e) {
      throw new ApolloError(e)
    }
  }
};

const campusMutations = {
  createCampus: async (_, {input}, context, info) => {
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerLog(context, 'mutation "createCampus');
        throw new ApolloError('Error: S5');
      }

      const campus = new Campus({
        name: input.name,
        phone: input.phone
      });
      return await campus.save();
    } catch (e) {
      throw new ApolloError(e)
    }
  },
  updateCampus: async (_, args, context, info) => {
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerLog(context, 'mutation updateCampus');
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      return await Campus
        .findById(args.id, projections)
        .update(args.input, {new: true}).exec();
      //return await Campus.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  deleteCampus: async (_, args, context) => {
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerLog(context, 'mutation deleteCampus');
        throw new ApolloError('Error: S5');
      }

      const res = await Campus.findByIdAndDelete(args.id);
      return res
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};

export {campusQueries, campusMutations};
