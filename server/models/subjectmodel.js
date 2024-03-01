// models/Subject.js
const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  // Additional fields as needed
});
subjectSchema.index({ name: 1 });

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
