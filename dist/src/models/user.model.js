"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const permission_model_1 = require("./permission.model");
const userSchema = new Schema({
    clave: { type: String, require: true },
    status: { type: String, require: true },
    name: { type: String, require: true },
    lastName: { type: String, required: true },
    adscription: { type: Schema.Types.ObjectId, ref: 'Campus', require: true },
    photoURL: { type: String, required: true },
    permissions: [
        permission_model_1.permissionSchema
    ]
});
exports.User = mongoose.model('User', userSchema, 'Users');
//# sourceMappingURL=user.model.js.map