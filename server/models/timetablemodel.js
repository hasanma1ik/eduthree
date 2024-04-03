// const mongoose = require('mongoose');

// const timetableSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User', // Assuming you have a User model for students and teachers
//     required: true
//   },
//   subject: { type: String, required: true },
//   startTime: { type: String, required: true }, // Consider using Date types for more flexibility
//   endTime: { type: String, required: true },
//   location: String,
//   days: [{ type: String, required: true }] // E.g., ["Monday", "Wednesday"]
// }, { timestamps: true });

    
//     const Timetable = mongoose.model('Timetable', timetableSchema);

//     module.exports = Timetable;