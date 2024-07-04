const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['classReminder', 'assignment', 'general'], // Example types
  },
  read: {
    type: Boolean,
    default: false,
  },
  // New field to reference an assignment
  assignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: false, // Not all notifications might be about assignments
  },
  classSchedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClassSchedule', // Referencing ClassSchedule
    required: false, // Set based on your application's needs
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);

