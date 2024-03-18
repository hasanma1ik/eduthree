// models/Assignment.js
const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  grade: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject', // Assuming you have a Subject model
    required: true,
  },
  
  submissions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Submission',
  }],
  files: [String] // Array of file URLs
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
