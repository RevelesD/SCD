"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const campusSchema = new Schema({
    name: { type: String, require: true },
    phone: { type: String, require: true }
});
exports.Campus = mongoose.model('Campus', campusSchema, 'Campus');
//# sourceMappingURL=campus.model.js.map