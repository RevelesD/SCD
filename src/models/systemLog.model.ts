const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const systemLogSchema = new Schema({
  description: {type: String, required: true},
  causer: {type: Schema.Types.ObjectId, ref:'', required: true},
  createAt: {type: Number, required: true}
});

export const SystemLog = mongoose.model('SystemLog', systemLogSchema, 'SystemLog');