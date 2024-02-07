// const mongoose = require('mongoose');

// const conversationSchema = new mongoose.Schema({
//   participants: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User' // Reference to User model
//   }],
//   messages: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Message' // Reference to Message model
//   }],
//   isMuted: {
//     type: Boolean,
//     default: false // Whether the conversation is muted
//   },
//   lastMessage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Message', // Reference to the last message sent in the conversation
//     default: null
//   },
// }, {
//   timestamps: true // Automatically manages createdAt and updatedAt fields
// });

// const Conversation = mongoose.model('Conversation', conversationSchema);

// module.exports = Conversation;
