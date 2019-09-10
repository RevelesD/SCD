import {permissionSchema} from "./permission.model";

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rubroSchema = new Schema({
  clave: {Type: String, required: true},
  title: {Type: String, required: true},
  categorias: [
    {Type: Schema.Types.ObjectId, ref:'', required: true}
  ]
});

export const Rubro = mongoose.model('Rubro', rubroSchema, 'Rubro');