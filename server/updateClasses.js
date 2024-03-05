require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const User = require('../server/models/userModel'); // Adjust the path according to your project structure
const Class = require('../server/models/classmodel'); // Ensure you have the correct path to your Class model

const updateClassesWithUsers = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Fetch all users
    const users = await User.find({});
    
    // Prepare a map of classIds to an array of user IDs
    const classIdToUsersMap = users.reduce((acc, user) => {
      // Initialize the array if this is the first user for this classId
      if (!acc[user.classId]) {
        acc[user.classId] = [];
      }
      // Add the user's ID to the classId entry
      acc[user.classId].push(user._id);
      return acc;
    }, {});

    // Update each class with its corresponding users
    for (const classId in classIdToUsersMap) {
      await Class.updateOne(
        { _id: classId },
        { $set: { users: classIdToUsersMap[classId] } }
      );
    }

    console.log("Update complete: All classes have been updated with their users");

  } catch (error) {
    console.error("Error updating classes with users:", error);
  } finally {
    // Ensure to disconnect from the database when done
    mongoose.disconnect();
  }
};

updateClassesWithUsers();
