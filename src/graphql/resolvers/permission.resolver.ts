import {ApolloError} from "apollo-server";
import { Permission } from "../../models/permission.model"
import {config} from "../../../enviroments.dev";

const permissionQueries = {
  permission: async(_, args:{id}, context, info) => {
        try {
          return await Permission.findById(args.id);
        }catch (e) {
          throw new ApolloError(e)
        }
  }
};

const permissionMutations = {
  createPermission: async(_, args , context, info) => {
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
  updatePermission: async(_, arg:{ id, input }, context, info) => {
    try {
      return await Permission.findByIdAndUpdate(arg.id, arg.input);
    }catch (e) {
      throw new ApolloError(e);
    }
    },
  deletePermission: async(_, args:{ id }, context, info) => {
        try {
          return Permission.findByIdAndDelete(args.id).exec();
        }catch (e) {
          throw new ApolloError(e)
        }
    }
};

export { permissionQueries, permissionMutations };