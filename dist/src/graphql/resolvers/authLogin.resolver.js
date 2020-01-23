"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_model_1 = require("../../models/user.model");
const permission_model_1 = require("../../models/permission.model");
const config_const_1 = require("../../../config.const");
const logAction_1 = require("../../utils/logAction");
const jwt = require('jsonwebtoken');
const rp = require('request-promise');
exports.loginQueries = {
    /**
     * LogIn process
     * @param {string} clave
     * @param {string} password
     * @return AuthData{ userId, token, tokenExpiration }
     */
    login: async (_, { clave, password }, context) => {
        const qType = 'Query';
        const qName = 'login';
        try {
            const userAPI = await consumeExternalAPI(clave, password);
            // Error log when the authentication attempt failed
            if (userAPI.response === 401) {
                context.user.userId = 'Unauthenticated';
                logAction_1.registerGenericLog(context, qType, qName, 'Access denied');
                throw new apollo_server_1.AuthenticationError("Acceso denegado!");
            }
            //search the user in our DB
            /* **********
      
              change the property "Alumno" for whatever come with workers
      
             ******* */
            let userDB = await user_model_1.User
                .findOne({ clave: userAPI.alumno['expediente'] }).exec();
            if (!userDB) {
                context.user.userId = 'Unauthenticated';
                logAction_1.registerGenericLog(context, qType, qName, 'Creating a user with no previous login');
                userDB = userNotFound(userAPI);
                logAction_1.registerGoodLog(context, 'Mutation', 'Usuario creado', userDB._id);
            }
            const token = createAuthToken(userDB);
            logAction_1.registerGoodLog(context, qType, qName, userDB._id);
            return {
                userId: userDB._id,
                token: token,
                tokenExpiration: 1
            };
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
/**
 * send the necessary fields to login.
 * Modify this method if the login API changes
 * @param clave
 * @param password
 * @return user - user information retrieved from a successful login
 */
async function consumeExternalAPI(clave, password) {
    try {
        let res = await rp({
            uri: process.env.API_LOGIN,
            method: "POST",
            form: {
                expediente: clave,
                password: password
            }
        });
        const user = JSON.parse(res);
        return user;
    }
    catch (e) {
        throw e;
    }
}
/**
 * flow of action for new users
 * @param user - user retrieved from the login API
 * @return
 */
async function userNotFound(userAPI) {
    try {
        //set default permissions of "docente" for every user just created
        const permission = await permission_model_1.Permission.findOne({ rank: config_const_1.config.permission.docente });
        //Creation of user in DB
        const newUser = await user_model_1.User.create({
            clave: userAPI.alumno['expediente'],
            status: "Activo",
            name: concat(userAPI.alumno.nombre),
            lastName: concat(userAPI.alumno.apellidoPaterno + ' ' + userAPI.alumno.apellidoMaterno),
            adscription: "5d9672d6e068fa0a76f96d15",
            permissions: [permission]
        });
        return newUser;
    }
    catch (e) {
        throw e;
    }
}
function createAuthToken(user) {
    const token = jwt.sign({ userId: user._id, clave: user.clave }, process.env.PRIVATE_KEY, { expiresIn: '1h', algorithm: 'HS256' });
    return token;
}
//Reformat name
function concat(str) {
    let arrayName = str.split(' ');
    let arrayNameCamel = [];
    let fullName = '';
    arrayName.forEach((element) => {
        if (element !== '') {
            arrayNameCamel.push(camelize(element.trim()));
        }
    });
    for (let i = 0; i < arrayNameCamel.length; i++) {
        if (i === 0) {
            fullName = fullName + arrayNameCamel[i];
        }
        else {
            fullName = fullName + ' ' + arrayNameCamel[i];
        }
    }
    return fullName;
}
function camelize(str) {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
        if (+match === 0)
            return ""; // or if (/\s+/.test(match)) for white spaces
        return index == 0 ? match.toUpperCase() : match.toLowerCase();
    });
}
//# sourceMappingURL=authLogin.resolver.js.map