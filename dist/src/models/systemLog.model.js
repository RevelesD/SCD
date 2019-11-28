"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const systemLogSchema = new Schema({
    description: { type: String, required: true },
    causer: { type: String, required: true },
    from: { type: String, required: true },
    requestType: { type: String, required: true },
    requestName: { type: String, required: true },
    createdAt: { type: Number, default: Date.now }
});
exports.SystemLog = mongoose.model('SystemLog', systemLogSchema, 'logs');
//# sourceMappingURL=systemLog.model.js.map