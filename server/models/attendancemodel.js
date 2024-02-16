const mongoose = require('mongoose')

const AttendanceRecordSchema = new mongoose.Schema({
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    classId: String,
    date: Date,
    status: String,
  });

const AttendanceRecord = mongoose.model('AttendanceRecord', AttendanceRecordSchema);

module.exports = AttendanceRecord;