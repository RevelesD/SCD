import {ApolloError} from "apollo-server";
import { Permission } from "../../models/permission.model"

const permissionQueries = {
  permission: async(_, args, context, info) => {
        try {
          return await Permission.findById(args.id);
        }catch (e) {
          throw new ApolloError(e)
        }
  },
  permissions: async(_, {page, perPage}, contex, info) => {
    try {
      return await Permission.find()
        .skip(page*perPage)
        .limit(perPage).exec();
    }  catch (e) {
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
  updatePermission: async(_, args, context, info) => {
    try {
      return await Permission.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
    }catch (e) {
      throw new ApolloError(e);
    }
    },
  deletePermission: async(_, args, context, info) => {
        try {
          return
        }catch (e) {
          throw new ApolloError(e)
        }
    }
};

export { permissionQueries, permissionMutations };
