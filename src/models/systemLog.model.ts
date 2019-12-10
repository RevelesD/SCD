const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const systemLogSchema = new Schema({
  description: {type: String, required: true},
  causer: {type: String, required: true},
  type: { type: String, required: true },
  from: {type: String, required: true},
  requestType: { type: String, required: true },
  requestName: { type: String, required: true },
  createdAt: {type: Number, default: Date.now}
});

export const SystemLog = mongoose.model('SystemLog', systemLogSchema, 'logs');
