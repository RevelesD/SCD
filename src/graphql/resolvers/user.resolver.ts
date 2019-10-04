import {ApolloError} from "apollo-server";
import { User } from "../../models/user.model"
import { Permission } from "../../models/permission.model"
import { config } from  "../../../enviroments.dev"
import {getProjection, transformUser} from "./merge";
import {isAuth} from "../../middleware/is-auth";

const userQueries = {
  user: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      let doc = await User.findOne({_id: args.id}, projections).exec();
      if (projections.adscription) {
        // query.populate('adscription');
        doc = transformUser(doc);
      }
      return doc;
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  users: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      let docs = await User.find({}, projections).exec();
      if (projections.adscription) {
        // query.populate('adscription');
        docs = docs.map(transformUser);
      }
      return docs;
    }catch (e) {
      throw new ApolloError(e);
    }
  }
};

const userMutations = {
  createUser: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const permission = await Permission.findOne({ rank: config.permission.docente});

      const user = await User.create({
        clave: args.input.clave,
        status: args.input.status,
        name: args.input.name,
        adscription: args.input.adscription,
        permissions: [permission]
      });

      const res = await User
        .findOne({_id: user._id})
        .populate({path: 'adscription'}).exec();
      return res;
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updateUser: async(_, args, context, info) =>{
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      let doc = await
        User
          .findById(args.id, projections)
          .update(args.input, {new: true}).exec();
      if (projections.adscription) {
        // query.populate('adscription');
        doc = transformUser(doc);
      }
      return doc;
      //return await User.findByIdAndUpdate(args.id, args.input, {new:true});
    }catch (e) {
      throw new ApolloError(e)
    }
  },
  updateUserRole: async(_, args, context, info) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
    try {
      const projections = getProjection(info);
      const permission = await Permission.findOne({ _id: args.input.permissionId});
      console.log('permisos', permission);
      if(args.input.action === 1){
        let doc = await
          User
            .findOneAndUpdate(
            {
              $and: [
                { _id: args.input.userId},
                {permissions: {$nin: [permission]}}
              ]
            }, { $push: {permissions:  permission } }, projections);
            //.update().exec();

        if (projections.adscription) {
          // query.populate('adscription');
          doc = transformUser(doc);
        }
        return doc;
      } else if(args.input.action === 2) {
        let doc = await User.findOne(
          {
            $and: [
              {_id: args.input.userId},
              {permissions: {$in: [permission]}}
            ]
          }, projections).update({ $pull: {permissions:  permission } }).exec();

        if (projections.adscription) {
          // query.populate('adscription');
          doc = transformUser(doc);
        }
        return doc;
      }
    }catch (e) {
      throw new ApolloError(e);
    }
  },
  deleteUser: async(_, args, context) => {
    // if (!await isAuth(context, [config.permission.admin]))
    //   throw new ApolloError('Unauthenticated');
		try{
		  return await User.findByIdAndDelete(args.id).exec();
    }catch (e) {
      throw new ApolloError(e)
    }
  }
};

export { userQueries, userMutations }
