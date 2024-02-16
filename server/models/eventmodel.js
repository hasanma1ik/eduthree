// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  description: String,
  location: String,
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;