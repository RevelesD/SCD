import {ApolloError, ForbiddenError, UserInputError} from "apollo-server";
import {User} from "../../models/user.model"
import {Permission} from "../../models/permission.model"
import {config} from "../../../config.const"
import {getProjection, transformUser} from "../../utils/merge";
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog
} from "../../utils/logAction";
import {isAuth} from "../../utils/is-auth";
import { storeOnS3 } from "../../utils/imageUploader";

const userQueries = {
  /**
   * Get a single user
   * @param {string} id - user id
   * @return {User} - a mongodb document
   */
  user: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'user';
    try {
      // const err = await isAuth(context, qType, qName, [config.permission.docente]);
      // if (err !== null){
      //   throw err;
      // }
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
   * Get multiple users
   * @param {number} page - page selection for pagination
   * @param {number} perPage - amount of items per page
   * @return { [User] } - a list of users
   */
  users: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'users';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.admin]);
      if (err !== null){
        throw err;
      }
      const projections = getProjection(info);
      let docs = await User.find({}, projections).exec();
      if (projections.adscription) {
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
   * Create a new user, this mutations should not be used as the users are automatically created on login
   * @param {string} clave - Personal identifier, provided by the login PI
   * @param {string} status - Status of activity "Activo" || "Inactivo"
   * @param {string} name
   * @param {string} lastName
   * @param {string} adscription - id of the campus where the user belongs
   * @return { User } - a mongodb document
   */
  createUser: async (_, {input}, context) => {
    const qType = 'Mutation';
    const qName = 'createUser';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }

      const permission = await Permission.findOne({rank: config.permission.docente});

      const user = await User.create({
        clave: input.clave,
        status: input.status,
        name: input.name,
        lastName: input.lastName,
        adscription: input.adscription,
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
   * Update the status of the user, the rest of the fields should not be updated.
   * @args {string} id - user id
   * @args {string} status - "Activo" || "Inactivo"
   * @return { User } - a mongodb document
   */
  updateUser: async (_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateUser';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.admin]);
      if (err !== null){
        throw err;
      }

      if (args.status !== 'Activo' && args.status !== 'Inactivo') {
        const error = registerErrorLog(context, qType, qName,
          `Status provided: ${args.status}. Status nos allowed`);
        throw new UserInputError(`S5, Message: Status provided: ${args.status}. Status not allowed`);
      }

      const projections = getProjection(info);
      let doc = await
        User
          .findByIdAndUpdate(
            args.id, {status: args.status},
            {new: true, fields: projections});
      if (projections.adscription) {
        doc = transformUser(doc);
      }
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e)
    }
  },
  /**
   * Updates the permissions of one user
   * @param {string} userId - user id
   * @param {number} permissionRank - rank of the permission that wants to be manipulated
   * @param {number} action - 1.- Add, 2.- Remove
   * @return { User } - a mongodb document
   */
  updateUserRole: async (_, {input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateUserRole';
    try {
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
      }
      const projections = getProjection(info);
      const permission = await Permission.findOne({rank: input.permissionRank});
      if (input.action === 1) {
        let doc = await
          User
            .findOneAndUpdate(
              {
                $and: [
                  {_id: input.userId},
                  {permissions: {$nin: [permission]}}
                ]
              },
              {$push: {permissions: permission}},
              {new: true, fields: projections});

        if (projections.adscription) {
          doc = transformUser(doc);
        }

        registerGoodLog(context, qType, qName, doc._id);
        return doc;
      } else if (input.action === 2) {
        let doc = await User.findOneAndUpdate(
          {
            $and: [
              {_id: input.userId},
              {permissions: {$in: [permission]}}
            ]
          },
          {$pull: {permissions: permission}},
          {new: true, fields: projections});

        if (projections.adscription) {
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
      const err = await isAuth(context, qType, qName, [config.permission.docente]);
      if (err !== null){
        throw err;
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
      const err = await isAuth(context, qType, qName, [config.permission.superAdmin]);
      if (err !== null){
        throw err;
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
