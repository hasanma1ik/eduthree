




// require('dotenv').config();

// const mongoose = require("mongoose");
// const connectDB = require('./config/db');
// const Notification = require('../server/models/notificationmodel');

// const removeClassScheduleFrom = async () => {
//   try {
//     await connectDB();

//     // Use an empty filter {} to match all documents if you want to remove classSchedule from all ,
//     // or adjust the filter to match specific conditions as needed.
//     await Notification.updateMany({}, {
//       $unset: { classSchedule: "" }, // The value does not matter when using $unset
//     });

//     console.log("Update complete: classSchedule references removed from ");

//   } catch (error) {
//     console.error("Error removing classSchedule from :", error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// removeClassScheduleFrom();





// require('dotenv').config();

// const mongoose = require("mongoose");
// const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
// const Notification = require('../server/models/notificationmodel'); // Adjust the path according to your project structure
// const ClassSchedule = require('../server/models/ClassScheduleModel'); // Ensure you have the correct path to your ClassSchedule model

// const updateWithClassSchedule = async () => {
//   try {
//     // Connect to the database
//     await connectDB();

//     // Example: Fetch all class schedules. Adjust the criteria as needed.
//     const classSchedules = await ClassSchedule.find({});

//     // Assuming you want to update  based on some logic, for example, subject and day
//     for (const schedule of classSchedules) {
//       // Example criteria: match  of a specific type that don't already have a classSchedule
//       const criteria = {
//         message: /Your .* class is about to start in 15 minutes./, // Adjust this regex based on your actual message format
//         classSchedule: { $exists: false }, // Target  without a classSchedule
//         // Add any additional criteria here, e.g., based on `schedule.dayOfWeek` or `schedule.subject`
//       };

//       // Update  matching the criteria with the current classSchedule's ID
//       await Notification.updateMany(criteria, {
//         $set: { classSchedule: schedule._id },
//       });
//     }

//     console.log("Update complete:  updated with classSchedule references");

//   } catch (error) {
//     console.error("Error updating :", error);
//   } finally {
//     // Disconnect from the database whether an error occurred or not
//     mongoose.disconnect();
//   }
// };

// updateWithClassSchedule();
require('dotenv').config();
const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Ensure this path is correct and the function properly connects to MongoDB

const Notification = require('../server/models/notificationmodel'); // Correct path to your Notification model

// Function to update 'type' field in all existing Notification documents
const updateNotificationType = async () => {
  try {
    // Connect to the MongoDB database
    await connectDB();

    // Set a default 'type' for all existing notifications if not present or not valid
    const notifications = await Notification.find({ 
      type: { $exists: true, $nin: ['classReminder', 'assignment', 'general'] } 
    });

    // Update notifications with invalid or missing 'type' to 'general' as a fallback
    for (let notification of notifications) {
      notification.type = 'general'; // Default to 'general' if the type was invalid
      await notification.save();
    }

    console.log(`Update complete: Notifications have been updated to include valid 'type' fields.`);

  } catch (error) {
    console.error("Error updating Notifications to comply with new model schema:", error);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
  }
};

updateNotificationType();
