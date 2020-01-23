"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const categorySchema = new Schema({
    root: { type: Boolean, required: true },
    clave: { type: String, required: true },
    title: { type: String, required: true },
    path: { type: String, required: true },
    value: { type: Number },
    children: [
        { type: Schema.Types.ObjectId, ref: 'Category' }
    ]
});
exports.Category = mongoose.model('Category', categorySchema, 'Categories');
//# sourceMappingURL=category.model.js.map