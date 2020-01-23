import { ApolloError } from "apollo-server";
import { Permission } from "../../models/permission.model"
import { getProjection } from "../../utils/merge";
import { isAuth } from "../../utils/is-auth";
import { config } from "../../../config.const";
import { registerBadLog, registerErrorLog, registerGoodLog } from "../../utils/logAction";

const permissionQueries = {
  /**
   * Get a single permission
   * @param {string} id - permission id
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
   * Get multiple permissions
   * @param {number} page - page selection for pagination
   * @param {number} perPage - amount of items per page
   * @return { [Permission] } - mongodb permissions documents list
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
   * Creates a new permission
   * @param {InputPermission{rank}} input - Info of the new permission-
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
   * Updates one document
   * @param {string} id - permission id
   * @param {InputPermission{ rank }} input - new info to update the document
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
   * Deletes one permission
   * @param {string} id - permission id
   * @return { Permission } - the document deleted
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
