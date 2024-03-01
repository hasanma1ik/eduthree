// require('dotenv').config();

// const mongoose = require("mongoose");
// const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
// const User = require('../server/models/userModel'); // Adjust the path according to your project structure

// const updateUsersAddSubjects = async () => {
//   try {
//     // Connect to the database
//     await connectDB();

//     // ObjectIds to add to each user's subjects field, corrected with 'new' keyword
//     const subjectIdsToAdd = [
//       new mongoose.Types.ObjectId("65e0a8078cc12055a8e5c433"),
//       new mongoose.Types.ObjectId("65e0a80c8cc12055a8e5c43a")
//     ];

//     // Update all users to add specified subject ObjectIds to the subjects field
//     const result = await User.updateMany({}, { $set: { subjects: subjectIdsToAdd } });
   


//     console.log("Update complete:", result);

//   } catch (error) {
//     console.error("Error updating users:", error);
//   } finally {
//     // Disconnect from the database whether an error occurred or not
//     mongoose.disconnect();
//   }
// };

// updateUsersAddSubjects();



