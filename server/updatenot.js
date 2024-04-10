




// require('dotenv').config();

// const mongoose = require("mongoose");
// const connectDB = require('./config/db');
// const Notification = require('../server/models/notificationmodel');

// const removeClassScheduleFromNotifications = async () => {
//   try {
//     await connectDB();

//     // Use an empty filter {} to match all documents if you want to remove classSchedule from all notifications,
//     // or adjust the filter to match specific conditions as needed.
//     await Notification.updateMany({}, {
//       $unset: { classSchedule: "" }, // The value does not matter when using $unset
//     });

//     console.log("Update complete: classSchedule references removed from notifications");

//   } catch (error) {
//     console.error("Error removing classSchedule from notifications:", error);
//   } finally {
//     mongoose.disconnect();
//   }
// };

// removeClassScheduleFromNotifications();





// require('dotenv').config();

// const mongoose = require("mongoose");
// const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
// const Notification = require('../server/models/notificationmodel'); // Adjust the path according to your project structure
// const ClassSchedule = require('../server/models/ClassScheduleModel'); // Ensure you have the correct path to your ClassSchedule model

// const updateNotificationsWithClassSchedule = async () => {
//   try {
//     // Connect to the database
//     await connectDB();

//     // Example: Fetch all class schedules. Adjust the criteria as needed.
//     const classSchedules = await ClassSchedule.find({});

//     // Assuming you want to update notifications based on some logic, for example, subject and day
//     for (const schedule of classSchedules) {
//       // Example criteria: match notifications of a specific type that don't already have a classSchedule
//       const criteria = {
//         message: /Your .* class is about to start in 15 minutes./, // Adjust this regex based on your actual message format
//         classSchedule: { $exists: false }, // Target notifications without a classSchedule
//         // Add any additional criteria here, e.g., based on `schedule.dayOfWeek` or `schedule.subject`
//       };

//       // Update notifications matching the criteria with the current classSchedule's ID
//       await Notification.updateMany(criteria, {
//         $set: { classSchedule: schedule._id },
//       });
//     }

//     console.log("Update complete: Notifications updated with classSchedule references");

//   } catch (error) {
//     console.error("Error updating notifications:", error);
//   } finally {
//     // Disconnect from the database whether an error occurred or not
//     mongoose.disconnect();
//   }
// };

// updateNotificationsWithClassSchedule();
require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const ClassSchedule = require('../server/models/ClassScheduleModel'); // Ensure you have the correct path to your ClassSchedule model

const addNotificationSentFieldToClassSchedules = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Update all ClassSchedule documents to include the notificationSent field, set to false
    await ClassSchedule.updateMany(
      {}, // Match all documents
      { $set: { notificationSent: false } } // Set notificationSent to false
    );

    console.log("Update complete: All ClassSchedules now have a 'notificationSent' field set to false.");

  } catch (error) {
    console.error("Error adding 'notificationSent' field to ClassSchedules:", error);
  } finally {
    // Disconnect from the database whether an error occurred or not
    await mongoose.disconnect();
  }
};

addNotificationSentFieldToClassSchedules();
