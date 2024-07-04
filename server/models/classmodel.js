const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term',
    required: true
  },
});

classSchema.index({ grade: 1, day: 1, timeSlot: 1, term: 1 }, { unique: true });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
