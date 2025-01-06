const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    maxlength: 64,
  },
  grade: {
    type: String,
    required: false,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  subjects: [{
    type: Schema.Types.ObjectId,
    ref: 'Subject',
  }],
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'], // Added 'admin' to the list of valid roles
    required: true
  },
  country: { type: String, default: 'Pakistan' }, // Add this field
  profilePicture: { type: String, default: '' },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
