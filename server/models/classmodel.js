const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  grade: {
    type: String,
    required: true,
    unique: true // Ensure there are no duplicate classes for the same grade
  },
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});


classSchema.index({ grade: 1 });

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
