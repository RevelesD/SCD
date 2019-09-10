import {permissionSchema} from "./permission.model";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  parent: {type: Schema.Types.ObjectId, ref:'', required: true},
  clave: {type: String, required: true},
  title: {type: String, required: true},
  value: {type: Number, required: true},
  children: [
    {type: Schema.Types.ObjectId, ref: '', required: true}
  ]
});

export const Category = mongoose.model('Category', categorySchema, 'Category');