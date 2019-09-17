import {ApolloError} from "apollo-server";
import { User } from "../../models/user.model"
import { Permission } from "../../models/permission.model"
import { Campus } from '../../models/campus.model';
import { config } from  "../../../enviroments.dev"

const userQueries = {
  user: async(_, args, context, info) => {
    try {
      return await User.findOne({_id: args.id})
        .populate('adscription').exec();
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  users: async(_, args, context, info) => {
    try {
      return await User
        .find()
        .populate('adscription').exec();
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
        adscription: args.input.adscription,
        permissions: [permission]
      });

      let res = await User
        .findOne({_id: user._id})
        .populate({path: 'adscription'}).exec();
      return res;
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updateUser: async(_, args, context, info) =>{
    try {
      return await User.findByIdAndUpdate(args.id, args.input, {new:true});
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updateUserRole: async(_, args, context, info) => {
    try {
      const permission = await Permission.findOne({ _id: args.input.permissionId});
      const user = await User.findById(args.input.userId);
      //const currentPermisions = user.permissions;

      if(args.input.action === 1){
        const cur = await User.findOneAndUpdate(
          {
            $and: [
              {_id: args.input.userId},
              {permissions: {$nin: [permission]}}
            ]
          },
          { $push: {permissions:  permission } }
        );
        return cur;

      }else if(args.input.action === 2){
        const cur = await User.findOneAndUpdate(
          {
            $and: [
              {_id: args.input.userId},
              {permissions: {$in: [permission]}}
            ]
          },
          { $pull: {permissions:  permission } }
        );
        return cur;
      }

      /*
      //console.log(currentPermisions);
      let found = false;

      if(args.input.action === 1) {
        for (let i = 0; i < currentPermisions.length; i++){
          console.log("for entro");
          if(permission.rank == currentPermisions[i].rank){
            found = true;
            console.log("flag cambio")
          }
        }
        if(found) {
          console.log("Ya tiene permiso");
        }else {
          return  await User.findByIdAndUpdate(
            args.input.userId,
            { $push: {permissions: permission}}
          );
        }
      }else if (args.input.action === 2){
        for (let i = 0; i < currentPermisions.length; i++){
          if(permission.rank == currentPermisions[i].rank){
            return await User.findByIdAndUpdate(
              args.input.userId,
              { $pull: {permissions: permission}}
            );
          }
        }
      }
     */

    }catch (e) {
      throw new ApolloError(e);
    }
},
  deleteUser: async(_, args, context, info) => {
		try{
		  return await User.findByIdAndDelete(args.id).exec();
    }catch (e) {
      throw new ApolloError(e)
    }
  }
};

export { userQueries, userMutations }