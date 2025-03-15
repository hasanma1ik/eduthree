const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // These fields are conditionally required if scannedImages is not provided
  filePath: {
    type: String,
    required: function() {
      return !(this.scannedImages && this.scannedImages.length > 0);
    },
  },
  fileName: {
    type: String,
    required: function() {
      return !(this.scannedImages && this.scannedImages.length > 0);
    },
  },
  fileType: {
    type: String,
    required: function() {
      return !(this.scannedImages && this.scannedImages.length > 0);
    },
  },
  // Optional array for scanned images (each with its own uri, name, and type)
  scannedImages: [
    {
      uri: { type: String },
      name: { type: String },
      type: { type: String },
    }
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const Submission = mongoose.model('Submission', submissionSchema);

module.exports = Submission;
