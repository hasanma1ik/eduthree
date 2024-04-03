// require('dotenv').config();

// const mongoose = require("mongoose");
// const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
// const User = require('../server/models/userModel'); // Adjust the path according to your project structure
// const Class = require('../server/models/classmodel'); // Ensure you have the correct path to your Class model

// const updateClassesWithUsers = async () => {
//   try {
//     // Connect to the database
//     await connectDB();

//     // Fetch all users
//     const users = await User.find({});
    
//     // Prepare a map of classIds to an array of user IDs
//     const classIdToUsersMap = users.reduce((acc, user) => {
//       // Initialize the array if this is the first user for this classId
//       if (!acc[user.classId]) {
//         acc[user.classId] = [];
//       }
//       // Add the user's ID to the classId entry
//       acc[user.classId].push(user._id);
//       return acc;
//     }, {});

//     // Update each class with its corresponding users
//     for (const classId in classIdToUsersMap) {
//       await Class.updateOne(
//         { _id: classId },
//         { $set: { users: classIdToUsersMap[classId] } }
//       );
//     }

//     console.log("Update complete: All classes have been updated with their users");

//   } catch (error) {
//     console.error("Error updating classes with users:", error);
//   } finally {
//     // Ensure to disconnect from the database when done
//     mongoose.disconnect();
//   }
// };

// updateClassesWithUsers();



// require('dotenv').config();
// const mongoose = require("mongoose");
// const connectDB = require('./config/db');
// const Class = require('../server/models/classmodel'); // Adjust the path as necessary
// const Term = require('../server/models/termmodel'); // Adjust the path as necessary

// const updateClassesWithTerm = async () => {
//   try {
//     await connectDB();

//     // Example: Finding a default term to use for classes without a term set.
//     // This is a placeholder and should be adjusted according to your actual requirements.
//     const defaultTerm = await Term.findOne({ name: "Spring 2024" }); // Adjust query as needed
//     if (!defaultTerm) {
//       throw new Error("Default term not found. Please ensure the Term collection has the default term.");
//     }

//     // Update classes without a term set to the default term
//     const result = await Class.updateMany({ term: { $exists: false } }, { $set: { term: defaultTerm._id } });

//     console.log(`Updated ${result.nModified} classes with the default term (${defaultTerm.name}).`);
//   } catch (error) {
//     console.error("Error updating classes with default term:", error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// updateClassesWithTerm();
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db'); // Your DB connection logic
const ClassSchedule = require('../server/models/ClassScheduleModel'); // Adjust the path as necessary
const Term = require('../server/models/termmodel'); // Adjust the path as necessary

const updateClassSchedulesWithTerm = async () => {
  await connectDB();

  try {
    // Assuming you want to set a specific term for all existing class schedules
    const defaultTerm = await Term.findOne(); // Find one term to use as the default
    
    if (!defaultTerm) {
      throw new Error("No term found. Please add a term first.");
    }

    const result = await ClassSchedule.updateMany(
      { term: { $exists: false } }, // Filter for documents without a term
      { $set: { term: defaultTerm._id } } // Set the default term ID
    );

    console.log(`Updated ${result.nModified} class schedules with the default term ID.`);
  } catch (error) {
    console.error("Failed to update class schedules with the default term:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateClassSchedulesWithTerm();
