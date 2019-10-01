import {decode} from "jsonwebtoken";
import { User } from "../models/user.model";

const jwt = require('jsonwebtoken');

export const getUser = (token) => {
  if(token === ''){
    return null;
  }
  let decodeToken;
  let req = {};
  try {
    decodeToken = jwt.verify(token, 'key');
  }catch (e) {
    console.log("e3");
    return null
  }
  if(!decodeToken){
    console.log("e4");
    req['isAuth'] = false;
  } else {
    req['userId'] = decodeToken.userId;
    req['isAuth'] = true;
  }
  // console.log('token: ', req);
  return req
};
export const isAuth = async (contex: any, permissions: number[]) => {
};
