const mongoose = require('mongoose');

const termSchema = new mongoose.Schema({
  name: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true }
});

const Term = mongoose.model('Term', termSchema);
module.exports = Term;
