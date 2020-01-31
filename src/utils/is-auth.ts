import {ForbiddenError, AuthenticationError, ApolloError} from "apollo-server";
import {User} from "../models/user.model";
import {registerBadLog} from "./logAction";
const jwt = require('jsonwebtoken');

export const getUser = (token) => {
  if (token === '') {
    return {
      userId: 'Unauthenticated'
    };
  }
  let decodeToken;
  let req = {};
  try {
    decodeToken = jwt.verify(token, process.env.PRIVATE_KEY);
    if (!decodeToken) {
      req['isAuth'] = false;
    } else {
      req['userId'] = decodeToken.userId;
      req['isAuth'] = true;
    }
    return req
  } catch (e) {
    return {
      userId: 'Unauthenticated'
    };
  }
};
/**
 *
 * @param contex
 * @param permissions
 * @return {number} - 0=unauthenticated, 1= authenticated, 2=insufficient permissions
 */
export const isAuth = async (context: any, qType: string, qName: string, permissions: number[]) => {
  try {
    if (context.user.userId == 'Unauthenticated') {
      const error = registerBadLog(context, qType, qName);
      return new AuthenticationError(`S5, Message: ${error}`);
    }

    const conditions = {
      _id: context.user.userId,
      'permissions.rank': {$all: permissions}
    };

    const found = await User.countDocuments(conditions);
    if (found === 0) {
      const error = registerBadLog(context, qType, qName);
      return new ForbiddenError(`S5, Message: ${error}`);
    }
    return null;
  } catch (e) {
    return new ApolloError('Internal Server Error 5000000000');
  }
};

export interface Context {
  user: {
    isAuth: boolean;
    ip: string;
    userId?: string;
  }
}
