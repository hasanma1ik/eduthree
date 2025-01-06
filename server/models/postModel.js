const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "Please add post description"],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    isAdminPost: {
      type: Boolean,
      default: false, // Differentiates between Admin and Teacher posts
    },
    grade: {
      type: String, // e.g., "Grade 1", "Grade 2"
      required: function () {
        return !this.isAdminPost;
      },
    },
    subject: {
      type: mongoose.Schema.ObjectId,
      ref: "Subject",
      required: function () {
        return !this.isAdminPost;
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
