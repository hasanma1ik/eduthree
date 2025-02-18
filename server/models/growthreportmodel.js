const mongoose = require('mongoose');

const growthReportSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  grade: {
    type: String, 
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject', 
    required: true
  },
  term: {
    type: String,
    required: true
  },
  personalDevelopment: [
    {
      objective: { type: String, required: true },
      midTermRating: { type: String, enum: ['', 'Often', 'Sometimes', 'Rarely'], default: '' },
      finalTermRating: { type: String, enum: ['', 'Often', 'Sometimes', 'Rarely'], default: '' }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GrowthReport = mongoose.model('GrowthReport', growthReportSchema);

module.exports = GrowthReport;
