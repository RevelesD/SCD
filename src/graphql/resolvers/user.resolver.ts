import {ApolloError} from "apollo-server";
import { User } from "../../models/user.model"
import { Permission } from "../../models/permission.model"
import { config } from  "../../../enviroments.dev"

const userQueries = {
  user: async(_, args: { id }, context, info) => {
    try {
      return await User.findById(args.id);
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  users: async(_, args, context, info) => {
    try {
      return User.find();
    }catch (e) {
      throw new ApolloError(e);
    }
  }
};

const userMutations = {
  createUser: async(_, args, context, info) => {
    try {
      const permission = await Permission.findOne({ rank: config.docente});

      let user = await User.create({
        clave: args.input.clave,
        status: args.input.status,
        name: args.input.name,
        adscription: args.adscription,
        permissions: [permission]
      });
      const user2 = await User.find({_id: user.id}).populate({path: 'adscription'}).exec();
      console.log(user2);
      return user;
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updateUser: async(_, args: { id, input }, context, info) =>{
    try {
      return await User.findByIdAndUpdate(args.id, args.input);
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updateUserRole: async(_, args, context, info) => {
    try {
      const permission = await Permission.findOne({ rank: args.input.permissionId});
      if (args.input.action === 1) {
        return await User.findByIdAndUpdate(
          args.input.userId,
          { $push: {permissions: permission}}
        );
      }
      if (args.input.action === 2) {
        return await User.findByIdAndUpdate(
          args.input.userId,
          { $pull: {permissions: permission}}
        );
      }
    }catch (e) {
      throw new ApolloError(e);
    }
},
  deleteUser: async(_, args: { id }, context, info) => {
		try{
		  return await User.findByIdAndDelete(args.id).exec();
    }catch (e) {
      throw new ApolloError(e)
    }
  }
};

export { userQueries, userMutations }