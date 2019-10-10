"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const rubroSchema = new Schema({
    clave: { Type: String, required: true },
    title: { Type: String, required: true },
    categorias: [
        { Type: Schema.Types.ObjectId, ref: 'Category', required: true }
    ]
});
exports.Rubro = mongoose.model('Rubro', rubroSchema, 'Rubro');
//# sourceMappingURL=rubro.model.js.map