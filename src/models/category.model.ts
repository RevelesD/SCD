const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  // parent: {type: Schema.Types.ObjectId, ref:'Category'},
  root: {type: Boolean, required: true },
  clave: {type: String, required: true},
  title: {type: String, required: true},
  path: {type: String, required: true},
  value: {type: Number},
  children: [
    {type: Schema.Types.ObjectId, ref: 'Category'}
  ]
});

export const Category = mongoose.model('Category', categorySchema, 'Categories');
