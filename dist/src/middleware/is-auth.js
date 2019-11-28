"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
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
exports.isAuth = async (contex, permissions) => {
    try {
        // console.log(permissions);
        const conditions = {
            _id: contex.user.userId,
            'permissions.rank': { $all: permissions }
        };
        const found = await user_model_1.User.find(conditions);
        return found.length > 0;
    }
    catch (e) {
        return false;
    }
};
//# sourceMappingURL=is-auth.js.map