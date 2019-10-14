import {ApolloError} from "apollo-server";
import { Permission } from "../../models/permission.model"
import {getProjection} from "./merge";
import {isAuth} from "../../middleware/is-auth";
import {config} from "../../../enviroments.dev";
import {registerBadLog, registerErrorLog, registerGoodLog} from "../../middleware/logAction";
import {privateKEY} from "../../../enviroment.prod";

const permissionQueries = {
  permission: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'permission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }
      const projections = getProjection(info);
      const doc = await Permission.findById(args.id, projections);
      registerGoodLog(context, qType, qName, args.id)
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  },
  permissions: async(_, {page, perPage}, context, info) => {
    console.log(context);
    const qType = 'Query';
    const qName = 'permissions';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      const docs = await Permission
        .find({}, projections)
        .skip(page*perPage)
        .limit(perPage).exec();
      registerGoodLog(context, qType, qName, 'Multiple documents')
      return docs;
    }  catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  }
};

const permissionMutations = {
  createPermission: async(_, args , context, info) => {
    const qType = 'Mutation';
    const qName = 'createPermission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const permission = new Permission({
        rank: args.input.rank
      });
      const doc = await permission.save();
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  },
  updatePermission: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updatePermission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }

      const projections = getProjection(info);
      const doc = await Permission
        .findById(args.id, projections)
        .update(args.input, {new: true}).exec();
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  deletePermission: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'deletePermission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        registerBadLog(context, qType, qName);
        throw new ApolloError('Error: S5');
      }
      const doc =await Permission.findByIdAndDelete(args.id).exec();
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  }
};

export { permissionQueries, permissionMutations };
