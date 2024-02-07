const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  isMuted: { type: Boolean, default: false },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

const Thread = mongoose.model('Thread', threadSchema);

module.exports = Thread;
