import {ApolloError} from "apollo-server";
import { Permission } from "../../models/permission.model"
import {getProjection} from "./merge";
import {isAuth} from "../../middleware/is-auth";
import {config} from "../../../enviroments.dev";

const permissionQueries = {
  permission: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.superAdmin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      return await Permission.findById(args.id, projections);
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  permissions: async(_, {page, perPage}, context, info) => {
    // if (!await isAuth(context, [config.permission.superAdmin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      return await Permission
        .find({}, projections)
        .skip(page*perPage)
        .limit(perPage).exec();
    }  catch (e) {
      throw new ApolloError(e)
    }
  }
};

const permissionMutations = {
  createPermission: async(_, args , context, info) => {
    // if (!await isAuth(context, [config.permission.superAdmin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      console.log(args.input.rank);
      const permission = new Permission({
        rank: args.input.rank
      });
      return await permission.save();
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updatePermission: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.superAdmin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      return await Permission.findById(args.id, projections).update(args.input, {new: true}).exec();
      //return await Permission.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  deletePermission: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.superAdmin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      return await Permission.findByIdAndDelete(args.id).exec();
    }catch (e) {
      throw new ApolloError(e)
    }
  }
};

export { permissionQueries, permissionMutations };
