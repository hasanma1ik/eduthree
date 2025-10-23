// models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    // Legacy combined string: e.g. "Grade 3 - B"
    grade: { type: String, required: true },

    // New (optional for now, recommended long-term):
    gradeLevel: { type: String }, // e.g. "Grade 3"
    section: { type: String },    // e.g. "B"

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },

    // Stored as UTC "HH:mm - HH:mm"
    timeSlot: { type: String, required: true },

    day: { type: String, required: true }, // Keep as the school’s logical day label

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    term: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Term',
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate class entries at the same slot
classSchema.index({ grade: 1, day: 1, timeSlot: 1, term: 1 }, { unique: true });

// Optional (recommended): prevent teacher double-booking at same slot
classSchema.index(
  { teacher: 1, term: 1, day: 1, timeSlot: 1 },
  { unique: true, name: 'unique_teacher_slot' }
);

module.exports = mongoose.model('Class', classSchema);
