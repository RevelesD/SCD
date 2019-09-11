const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionDefinition = {
    rank: {type: Number, require: true}
};
export const permissionSchema = new Schema(permissionDefinition);

export const Permission = mongoose.model('Permission', permissionSchema, 'Permission');