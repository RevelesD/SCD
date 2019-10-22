const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noticeSchema = new Schema({
  title: {type: String, required: true},
  body: {type: String, required: true},
  status: {type: Number, required: true},
  link: {type: String, required: true},
  imgLnk: {type: String, required: true},
  fromDate: {type: Number, required: true},
  toDate: {type: Number, required: true},
  createdBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  createdAt: {type: Number, default: Date.now},
  updatedAt: {type: Number, default: Date.now}
});
export const Notice = mongoose.model('Notice', noticeSchema, 'Notices');
