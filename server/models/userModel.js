// models/user.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
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

    // ---- Enrollment (backward compatible) ----
    // Legacy combined string (e.g., "Grade 1 - B")
    grade: {
      type: String,
      required: false,
    },
    // New normalized fields (optional but recommended to use going forward)
    gradeLevel: {
      type: String, // e.g., "Grade 1", "KG-1"
      required: false,
      trim: true,
    },
    section: {
      type: String, // e.g., "A", "B", "C"
      required: false,
      trim: true,
    },
    term: {
      type: Schema.Types.ObjectId, // batch association
      ref: "Term",
      required: false, // only students need it; teachers/admins may not have one
    },

    classId: {
      type: Schema.Types.ObjectId,
      ref: "Class",
    },

    subjects: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],

    role: {
      type: String,
      enum: ["student", "teacher", "admin"],
      required: true,
    },

    country: { type: String, default: "Pakistan" },
    profilePicture: { type: String, default: "" },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// Optional: helpful composite index for student lookups by batch/grade/section
// Not required, but speeds up admin filters.
// userSchema.index({ role: 1, term: 1, gradeLevel: 1, section: 1 });

module.exports = mongoose.model("User", userSchema);

