const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
  // Add other fields as necessary
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
