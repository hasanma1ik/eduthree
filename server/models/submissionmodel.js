const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment', 
    required: true,
  },
  studentId: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  fileUrl: {
    type: String, // URL or path to the uploaded file
    default: '',
  },
  fileName: {
    type: String, // Original file name
    default: '',
  },
  fileType: {
    type: String, // MIME type of the file
    default: '',
  }
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
