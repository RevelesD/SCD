const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noticeSchema = new Schema({
  title: {type: String, required: true},
  body: {type: String, required: true},
  status: {type: String, required: true},
  link: {type: String, required: true},
  imgLnk: {type: String, required: true},
  createdBy: {type: Schema.Types.ObjectId, ref: '', required: true},
  fromDate: {type: Number, required: true},
  toDate: {type: Number, required: true},
  createdAt: {type: Number, required: true},
  updatedAt: {type: Number, required: true}
});
export const Notice = mongoose.model('Notice', noticeSchema, 'Notice');
