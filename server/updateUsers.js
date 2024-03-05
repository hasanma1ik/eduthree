require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const User = require('../server/models/userModel'); // Adjust the path according to your project structure
const Class = require('../server/models/classmodel'); // Ensure you have the correct path to your Class model

const updateUsersClassIdAndEmptySubjects = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Fetch all classes
    const classes = await Class.find({});
    const gradeToClassIdMap = classes.reduce((acc, curr) => {
      acc[curr.grade] = curr._id;
      return acc;
    }, {});

    // Update each user with their classId based on grade and set subjects to an empty array
    for (const grade in gradeToClassIdMap) {
      await User.updateMany(
        { grade: grade },
        { 
          $set: { 
            subjects: [],
            classId: gradeToClassIdMap[grade] // Update classId based on the grade to classId mapping
          } 
        }
      );
    }

    console.log("Update complete: All users' classId and subjects updated");

  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    // Disconnect from the database whether an error occurred or not
    mongoose.disconnect();
  }
};

updateUsersClassIdAndEmptySubjects();
