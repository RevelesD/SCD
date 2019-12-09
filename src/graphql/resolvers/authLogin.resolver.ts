import {ApolloError, AuthenticationError} from "apollo-server";
import { User } from "../../models/user.model";
import { Permission } from "../../models/permission.model";
import { config } from "../../../config.const";
import {registerGenericLog, registerGoodLog} from "../../middleware/logAction";

const jwt = require('jsonwebtoken');
const rp = require('request-promise');

export const loginQueries = {
  /**
   * LogIn process
   * @args clave
   * @args password
   * @return AuthData{ userId, token, tokenExpiration }
   */
  login: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'login';
    try {
      let res = await rp({
        uri: process.env.API_LOGIN,
        method: "POST",
        form: {
          expediente: args.clave,
          password: args.password
        }
      });

      //login end
      //Parse to res from API
      const user = JSON.parse(res);

      if (user.response === 401) {
        context.user.userId = 'Unauthenticated';
        registerGenericLog(
          context, qType, qName,
          'Access denied');
        throw new AuthenticationError("Acceso denegado!");
      }

      //search the user in our DB
      const userFound = await User
        .findOne({
          clave: user.alumno['expediente'] // change to docent's key
          }
        ).exec();

      //User not found
      if (!userFound) {
        context.user.userId = 'Unauthenticated';
        registerGenericLog(
          context, qType, qName,
          'Creating a user with no previous login');

        //Creation of user in DB
        //set default permissions of "docente" for every user just created
        const permission = await Permission.findOne({rank: config.permission.docente});

        //User Creation
        const newUser = await User.create({
          clave: user.alumno['expediente'], //Change to clave in final version
          status: "Activo", //set active by default, REVISAR
          name: `${concat(user.alumno.nombre)}`,
          lastName: `${concat(user.alumno.apellidoPaterno + ' ' + user.alumno.apellidoMaterno)}`,
          adscription: "5d9672d6e068fa0a76f96d15", //change to adcription (ID of the Campus) that need to be find in our DB
          permissions: [permission] //set 'docente' by default
        });

        //Find the user just created and connect their adscription filed
        // with the objectID from Campus(adscription).
        const res = await User
          .findOne({_id: newUser._id})
          .populate({path: 'adscription'}).exec();

        //Token creation, We add the userId to token's data
        // in order to used as the authentication
        const token = jwt.sign(
          {userId: newUser._id, clave: newUser.clave},
          process.env.PRIVATE_KEY,
          {expiresIn: '1h', algorithm: 'HS256'});
        registerGoodLog(context, 'Mutation', 'Usuario creado', res._id);
        return {
          userId: newUser._id,
          token: token,
          tokenExpiration: 1
        }
      }

      //The user was found
      //Token creation, We add the userId and the token's data
      // in order to use it as authentication
      const token = jwt.sign(
        {userId: userFound._id, clave: userFound.clave},
        process.env.PRIVATE_KEY,
        {expiresIn: '1h', algorithm: 'HS256'});
      registerGoodLog(context, qType, qName, userFound._id);
      return {
        userId: userFound._id,
        token: token,
        tokenExpiration: 1
      }
    }catch (e) {
       throw new ApolloError(e);
     }
  }
};

//Reformat name
function concat(str) {
  let arrayName = str.split(' ');
  let arrayNameCamel = [];

  let fullName = '';

  arrayName.forEach((element) => {
    if (element !== ''){
      arrayNameCamel.push(camelize(element.trim()));
    }
  });

  for (let i = 0; i < arrayNameCamel.length; i++) {
    if (i === 0) {
      fullName = fullName + arrayNameCamel[i];
    }else{
      fullName = fullName + ' ' + arrayNameCamel[i];
    }
  }
  return fullName;
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toUpperCase() : match.toLowerCase();
  });
}
