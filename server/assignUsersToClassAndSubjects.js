// const mongoose = require('mongoose'); 
// const connectDB = require('./config/db');; // Adjust the path to where connectDB is located
// const User = require('../server/models/userModel')
// const Class = require('../server/models/classmodel')
// const Subject = require('../server/models/subjectmodel')



// require('dotenv').config(); // Ensure this is called if your DB connection relies on environment variables

// // Connect to the database
// connectDB();

// async function assignClassAndSubjectsToUser(userName, className, subjectNames) {
//   // Assuming you have already connected to your database

//   // Find the class by name
//   const classObj = await Class.findOne({ grade: className });
//   if (!classObj) {
//     console.error('Class not found');
//     return;
//   }

//   // Find the subjects by name within the found class
//   const subjects = await Subject.find({ name: { $in: subjectNames }, classId: classObj._id });
//   if (subjects.length !== subjectNames.length) {
//     console.error('Some subjects not found');
//     return;
//   }

//   // Find the user by name and update their classId and subjects
//   const updatedUser = await User.findOneAndUpdate(
//     { name: userName },
//     {
//       classId: classObj._id,
//       subjects: subjects.map(subject => subject._id)
//     },
//     { new: true } // Returns the updated document
//   );

//   if (updatedUser) {
//     console.log('User successfully updated with class and subjects');
//   } else {
//     console.error('User not found');
//   }
// }

// assignClassAndSubjectsToUser('John Doe', 'Grade 1', ['Math', 'Science']);

// // Example usage
// // findUsersInClassAndSubject('Grade 1', 'Sports');