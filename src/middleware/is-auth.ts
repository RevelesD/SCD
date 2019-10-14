import {decode} from "jsonwebtoken";
import {User} from "../models/user.model";
import {privateKEY, publicKEY} from '../../enviroment.prod';

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
    decodeToken = jwt.verify(token, 'hola');
    if (!decodeToken) {
      // console.log("e4");
      console.log('DECODE NOT FOUND');
      req['isAuth'] = false;
    } else {
      console.log('DECODE FOUND');
      req['userId'] = decodeToken.userId;
      req['isAuth'] = true;
    }
    return req
  } catch (e) {
    // console.log(e);
    return {
      userId: 'Unauthenticated'
    };
  }
};

export const isAuth = async (contex: any, permissions: number[]): Promise<boolean> => {
  try {
    // console.log(permissions);
    const conditions = {
      _id: contex.user.userId,
      'permissions.rank': {$all: permissions}
    };
    const found = await User.find(conditions);
    return found.length > 0;
  } catch (e) {
    return false;
  }
};

export interface Context {
  user: {
    isAuth: boolean;
    ip: string;
    userId?: string;
  }
}
