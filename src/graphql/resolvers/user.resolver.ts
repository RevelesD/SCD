import {ApolloError} from "apollo-server";
import {User} from "../../models/user.model"
import {Permission} from "../../models/permission.model"
import {config} from "../../../config.const"
import {getProjection, transformUser} from "./merge";
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog
} from "../../utils/logAction";
import {isAuth} from "../../utils/is-auth";
import { storeOnS3 } from "../../utils/imageUploader";

const userQueries = {
  /**
   *
   * @args userId
   * @return { User } - a mongodb document
   */
  user: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'user';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      const projections = getProjection(info);
      let doc = await User.findOne({_id: args.id}, projections).exec();
      if (projections.adscription) {
        // query.populate('adscription');
        doc = transformUser(doc);
      }
      registerGoodLog(context, qType, qName, doc.id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   *
   * @args page
   * @args perPage
   * @return { [User] } - mongodb documents
   */
  users: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'users';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      const projections = getProjection(info);
      let docs = await User.find({}, projections).exec();
      if (projections.adscription) {
        // query.populate('adscription');
        docs = docs.map(transformUser);
      }
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

const userMutations = {
  /**
   *
   * @args InputUser{...}
   * @return { User } - a mongodb document
   */
  createUser: async (_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'createUser';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const permission = await Permission.findOne({rank: config.permission.docente});

      const user = await User.create({
        clave: args.input.clave,
        status: args.input.status,
        name: args.input.name,
        adscription: args.input.adscription,
        photoURL: process.env.ANONYMOUS_URL,
        permissions: [permission]
      });

      const res = await User
        .findOne({_id: user._id})
        .populate({path: 'adscription'}).exec();
      registerGoodLog(context, qType, qName, res._id);
      return res;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  },
  /**
   *
   * @args userId
   * @args status
   * @return { User } - a mongodb document
   */
  updateUser: async (_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateUser';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      if (args.status !== 'Activo' && args.status !== 'Inactivo') {
        const error = registerErrorLog(context, qType, qName,
          `Status provided: ${args.status}. Status nos allowed`);
        throw new ApolloError(`S5, Message: Status provided: ${args.status}. Status not allowed`);
      }

      const projections = getProjection(info);
      let doc = await
        User
          .findByIdAndUpdate(
            args.id, {status: args.status},
            {new: true, fields: projections});
      if (projections.adscription) {
        // query.populate('adscription');
        doc = transformUser(doc);
      }
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
      //return await User.findByIdAndUpdate(args.id, args.input, {new:true});
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  },
  /**
   *
   * @args UpdateUserRole{...}
   * @return { User } - a mongodb document
   */
  updateUserRole: async (_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateUserRole';
    try {
      if (!await isAuth(context, [config.permission.admin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      const projections = getProjection(info);
      const permission = await Permission.findOne({rank: args.input.permissionRank});
      if (args.input.action === 1) {
        let doc = await
          User
            .findOneAndUpdate(
              {
                $and: [
                  {_id: args.input.userId},
                  {permissions: {$nin: [permission]}}
                ]
              },
              {$push: {permissions: permission}},
              {new: true, fields: projections});
        //.update().exec();

        if (projections.adscription) {
          // query.populate('adscription');
          doc = transformUser(doc);
        }
        //Revisar context
        registerGoodLog(context, qType, qName, doc._id);
        return doc;
      } else if (args.input.action === 2) {
        let doc = await User.findOneAndUpdate(
          {
            $and: [
              {_id: args.input.userId},
              {permissions: {$in: [permission]}}
            ]
          },
          {$pull: {permissions: permission}},
          {new: true, fields: projections});

        if (projections.adscription) {
          // query.populate('adscription');
          doc = transformUser(doc);
        }
        registerGoodLog(context, qType, qName, doc._id);
        return doc;
      }
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Change the profile picture of a user
   * @param {string} id - user id of the user that is updating his picture
   * @param {Upload} photo - new photo ready to be stored
   * @return {User} user document with updated photo path
   */
  updateProfilePic: async (_, {id, photo}, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateProfilePic';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      const path = await storeOnS3(photo, 'photo');

      const user = await User.findOneAndUpdate(
        {_id: id}, {photoURL: path},
        {new: true, fields: projections}
      );
      registerGoodLog(context, qType, qName, user._id);
      return user;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Remove the user from the db
   * @param {string} id - user id
   * @return { User } - a mongodb document
   */
  deleteUser: async (_, {id}, context) => {
    const qType = 'Mutation';
    const qName = 'deleteUser';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      registerGoodLog(context, qType, qName, id);
      return await User.findByIdAndDelete(id).exec();
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  }
};

export {userQueries, userMutations}
