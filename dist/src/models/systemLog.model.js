"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const systemLogSchema = new Schema({
    description: { type: String, required: true },
    // causer: {type: Schema.Types.ObjectId, ref:'', required: true},
    causer: { type: String, required: true },
    from: { type: String, required: true },
    createAt: { type: Number, default: Date.now }
});
exports.SystemLog = mongoose.model('SystemLog', systemLogSchema, 'logs');
//# sourceMappingURL=systemLog.model.js.map