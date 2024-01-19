// threadModel.js
const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;
