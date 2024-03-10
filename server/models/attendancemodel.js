const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AttendanceEntrySchema = new Schema({
   userId: {
    type: mongoose.Schema.Types.ObjectId, // Use ObjectId here
    ref: 'User', // Reference the 'User' model
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Present', 'Absent', 'Late'] // Enum to ensure status is one of these values
  }
});

const AttendanceRecordSchema = new Schema({
  date: {
    type: Date,
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  attendance: [AttendanceEntrySchema] // Embedding AttendanceEntrySchema
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);

module.exports = AttendanceRecord;
