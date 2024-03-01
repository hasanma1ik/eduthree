const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Assuming you store users in a 'User' collection
    ref: 'User',
    required: true,
  },
  filePath: {
    type: String, // Physical path or URL to the uploaded file
    required: true,
  },
  fileName: {
    type: String, // Original name of the uploaded file
    required: true,
  },
  fileType: {
    type: String, // MIME type of the uploaded file
    required: true,
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
