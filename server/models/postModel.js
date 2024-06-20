const mongoose = require("mongoose");

//schema
const postSchema = new mongoose.Schema(
  {
   
    description: {
      type: String,
      required: [true, "please add post description"],
    },
    postedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);