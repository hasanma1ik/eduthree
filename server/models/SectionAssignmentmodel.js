// models/SectionAssignment.js
const mongoose = require('mongoose');

const SectionAssignmentSchema = new mongoose.Schema(
  {
    gradeLevel: { type: String, required: true, trim: true }, // e.g., "Grade 1"
    section: { type: String, required: true, trim: true },     // e.g., "B"
    term: { type: mongoose.Schema.Types.ObjectId, ref: 'Term', required: true },
  },
  { timestamps: true }
);

// One section letter per grade can belong to only one term
SectionAssignmentSchema.index({ gradeLevel: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('SectionAssignment', SectionAssignmentSchema);
