const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const campusSchema = new Schema({
    name: {type: String, require: true},
    phone: {type: String, require: true}
});

export const Campus = mongoose.model('Campus', campusSchema, 'Campus');