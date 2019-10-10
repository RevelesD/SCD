"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const permissionDefinition = {
    rank: { type: Number, require: true }
};
exports.permissionSchema = new Schema(permissionDefinition);
exports.Permission = mongoose.model('Permission', exports.permissionSchema, 'Permissions');
//# sourceMappingURL=permission.model.js.map