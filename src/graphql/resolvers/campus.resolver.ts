import {ApolloError} from "apollo-server";
import {Campus} from "../../models/campus.model";
import {getProjection} from "./merge";
import {Context, isAuth} from "../../middleware/is-auth"
import {logAction} from "../../middleware/logAction"
import {config} from "../../../enviroments.dev";
import {Notice} from "../../models/notice.model";

const campusQueries = {
  campus: async (_, args, context: Context, info) => {
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        if (!context.user) {
          logAction('Unauthenticated', 'Requested the query campus', context.user.ip)
        } else {
          logAction(
            context.user.userId,
            'Requested the query campus without permissions to access this query',
            context.user.ip)
        }
        throw new ApolloError('Unauthenticated');
      }
      const projections = getProjection(info);
      return await Campus.findById(args.id), projections;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  allCampus: async (_, {page, perPage}, context, info) => {
    try {
      // if (!await isAuth(context, [config.permission.superAdmin]))
      //   throw new ApolloError('Unauthenticated');
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
      // if (!await isAuth(context, [config.permission.superAdmin]))
      //     throw new ApolloError('Unauthenticated');
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
      // if (!await isAuth(context, [config.permission.superAdmin]))
      //   throw new ApolloError('Unauthenticated');
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
      // if (!await isAuth(context, [config.permission.superAdmin]))
      //   throw new ApolloError('Unauthenticated');
      const res = await Campus.findByIdAndDelete(args.id);
      return res
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};

export {campusQueries, campusMutations};
