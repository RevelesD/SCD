"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const documentSchema = new Schema({
    fileName: { type: String, required: true },
    fileId: { type: Schema.Types.ObjectId, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
    path: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Number, default: Date.now },
    updatedAt: { type: Number }
});
exports.Document = mongoose.model('Document', documentSchema, 'documents');
//# sourceMappingURL=documents.model.js.map