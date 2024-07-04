require('dotenv').config();
const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const Assignment = require('../server/models/assignmentmodel'); // Adjust the path according to your project structure

const updateAssignmentsWithCreatedByAndTimestamps = async () => {
  try {
    await connectDB();

    const defaultTeacherId = '60e125f02cbcc03c5c558e61'; // Replace with your actual ObjectId of a teacher

    // Validate the ObjectId
    if (!mongoose.Types.ObjectId.isValid(defaultTeacherId)) {
      throw new Error('The defaultTeacherId is not a valid ObjectId');
    }

    const now = new Date();
    const updateResult = await Assignment.updateMany(
      { 
        createdAt: { $exists: false } // Target documents without a createdAt field
      }, 
      { 
        $set: { 
          createdBy: defaultTeacherId,
          createdAt: now,
          updatedAt: now
        }
      }
    );

    console.log(`${updateResult.nModified} assignments have been updated with createdBy and timestamps.`);
  } catch (error) {
    console.error("Error updating assignments:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateAssignmentsWithCreatedByAndTimestamps();
