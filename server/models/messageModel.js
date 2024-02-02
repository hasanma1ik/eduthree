const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  text: String,
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  thread: { type: mongoose.Schema.Types.ObjectId, ref: 'Thread' },
  // Add other fields as necessary
}, {
  timestamps: true // This line enables automatic creation of createdAt and updatedAt fields
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
