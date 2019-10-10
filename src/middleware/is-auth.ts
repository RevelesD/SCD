import {decode} from "jsonwebtoken";
import {User} from "../models/user.model";

const jwt = require('jsonwebtoken');

export const getUser = (token) => {
  if (token === '') {
    return {};
  }
  let decodeToken;
  let req = {};
  try {
    decodeToken = jwt.verify(token, 'key');
    console.log(decodeToken);
    if (!decodeToken) {
      // console.log("e4");
      req['isAuth'] = false;
    } else {
      req['userId'] = decodeToken.userId;
      req['isAuth'] = true;
    }
    return req
  } catch (e) {
    return {};
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
