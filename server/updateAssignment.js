require('dotenv').config();
const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const Assignment = require('../server/models/assignmentmodel'); // Adjust the path according to your project structure
const User = require('../server/models/userModel'); // Assuming you have a User model

const updateAssignmentsWithCreatedBy = async () => {
  try {
    await connectDB();

    const defaultTeacherId = '60e125f02cbcc03c5c558e61'; // Replace with your actual ObjectId of a teacher

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(defaultTeacherId)) {
      throw new Error('The defaultTeacherId is not a valid ObjectId');
    }

    const updateResult = await Assignment.updateMany({}, { 
      $set: { createdBy: defaultTeacherId } 
    });

    console.log(`${updateResult.nModified} assignments have been updated.`);
  } catch (error) {
    console.error("Error updating assignments:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateAssignmentsWithCreatedBy();
