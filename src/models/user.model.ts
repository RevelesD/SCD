const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { permissionSchema } from "./permission.model";

const userSchema = new Schema({
    clave: {type: String, require: true},
    status: {type: String, require: true},
    name: {type: String, require: true},
    adscription: {type: Schema.Types.ObjectId, ref: 'Campus', require: true},
    permissions: [
      permissionSchema
    ]
});

export const User = mongoose.model('User', userSchema, 'Users');
