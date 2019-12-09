import { ApolloError } from "apollo-server";
import { Permission } from "../../models/permission.model"
import { getProjection } from "./merge";
import { isAuth } from "../../middleware/is-auth";
import { config } from "../../../config.const";
import { registerBadLog, registerErrorLog, registerGoodLog } from "../../middleware/logAction";

const permissionQueries = {
  /**
   *
   * @args permissionId
   * @return { Permission } - a mongodb document
   */
  permission: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'permission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
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
  /**
   *
   * @page
   * @perPage
   * @return { [Permission] } - mongodb documents
   */
  permissions: async(_, {page, perPage}, context, info) => {
    const qType = 'Query';
    const qName = 'permissions';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
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
  /**
   *
   * @args InputPermission{ rank }
   * @return { Permission } - a mongodb document
   */
  createPermission: async(_, args , context, info) => {
    const qType = 'Mutation';
    const qName = 'createPermission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
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
  /**
   *
   * @args permissionId
   * @args InputPermission{ rank }
   * @return { Permission } - a mongodb document
   */
  updatePermission: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updatePermission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      const doc = await Permission
        .findByIdAndUpdate(
          args.id, args.input,{new: true, fields: projections});
      registerGoodLog(context, qType, qName, doc._id)
      return doc;
    }catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   *
   * @args permissionId
   * @return { Permission } - a mongodb document
   */
  deletePermission: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'deletePermission';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
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
