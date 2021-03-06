const mongoose = require('mongoose');
const Schema = mongoose.Schema;
import { permissionSchema } from "./permission.model";

const userSchema = new Schema({
    clave: {type: String, require: true},
    status: {type: String, require: true},
    name: {type: String, require: true},
    lastName: {type: String, required: true},
    adscription: {type: Schema.Types.ObjectId, ref: 'Campus', require: true},
    photoURL: {type: String, required: true},
    permissions: [
      permissionSchema
    ]
});

export const User = mongoose.model('User', userSchema, 'Users');
