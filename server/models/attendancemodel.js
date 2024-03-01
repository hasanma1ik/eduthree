const mongoose = require('mongoose');

const AttendanceRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent'],
  },
});

const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);
module.exports = AttendanceRecord
