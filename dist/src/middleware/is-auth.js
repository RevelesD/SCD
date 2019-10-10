"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../models/user.model");
const jwt = require('jsonwebtoken');
exports.getUser = (token) => {
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
        }
        else {
            req['userId'] = decodeToken.userId;
            req['isAuth'] = true;
        }
        return req;
    }
    catch (e) {
        return {};
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