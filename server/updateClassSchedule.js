require('dotenv').config();
const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path as needed
const ClassSchedule = require('../server/models/ClassScheduleModel'); // Adjust the path as needed

const addUsersFieldToClassSchedules = async () => {
  try {
    await connectDB(); // Connect to MongoDB

    // Update all ClassSchedule documents to include the 'users' field if it doesn't exist
    const updateResult = await ClassSchedule.updateMany(
      { users: { $exists: false } }, // Filter documents where 'users' field doesn't exist
      { $set: { users: [] } }, // Set 'users' field to an empty array
      { multi: true } // Apply update to all documents matching the filter
    );

    console.log(`Updated ${updateResult.nModified} documents to include the 'users' field.`);
  } catch (error) {
    console.error("Failed to update ClassSchedule documents:", error);
  } finally {
    mongoose.disconnect(); // Ensure you disconnect from MongoDB
  }
};

addUsersFieldToClassSchedules();
