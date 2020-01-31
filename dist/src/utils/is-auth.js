"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const user_model_1 = require("../models/user.model");
const logAction_1 = require("./logAction");
const jwt = require('jsonwebtoken');
exports.getUser = (token) => {
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
        }
        else {
            req['userId'] = decodeToken.userId;
            req['isAuth'] = true;
        }
        return req;
    }
    catch (e) {
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
exports.isAuth = async (context, qType, qName, permissions) => {
    try {
        if (context.user.userId == 'Unauthenticated') {
            const error = logAction_1.registerBadLog(context, qType, qName);
            return new apollo_server_1.AuthenticationError(`S5, Message: ${error}`);
        }
        const conditions = {
            _id: context.user.userId,
            'permissions.rank': { $all: permissions }
        };
        const found = await user_model_1.User.countDocuments(conditions);
        if (found === 0) {
            const error = logAction_1.registerBadLog(context, qType, qName);
            return new apollo_server_1.ForbiddenError(`S5, Message: ${error}`);
        }
        return null;
    }
    catch (e) {
        return new apollo_server_1.ApolloError('Internal Server Error 5000000000');
    }
};
//# sourceMappingURL=is-auth.js.map