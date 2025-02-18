const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  grade: {
    type: String,
    required: true
  },
  term: {
    type: String,
    required: true
  },
  midTermMarks: {
    type: Number,
    default: 0
  },
  finalTermMarks: {
    type: Number,
    default: 0
  },
  // New comment field
  comment: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Marks', marksSchema);
