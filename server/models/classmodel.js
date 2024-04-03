const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,

  },
  subject: {
    type: String,
    required: true,
  },
  timeSlot: {
    type: String,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  teacher: {
    // Assuming a class has one teacher. Adjust according to your needs.
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  term: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Term', // Ensure you have a Term model defined somewhere
    required: true
  },
  
})


classSchema.index({ grade: 1, day: 1, timeSlot: 1, term: 1 }, { unique: true });


const Class = mongoose.model('Class', classSchema);

module.exports = Class;