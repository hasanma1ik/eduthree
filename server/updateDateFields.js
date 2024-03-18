require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where your connectDB is located
const AttendanceRecord = require('./models/attendancemodel'); // Adjust the path according to your project structure

const updateAttendanceRecordsWithDateString = async () => {
  try {
    await connectDB();

    const records = await AttendanceRecord.find({});

    for (const record of records) {
      // Check if record.date is already a string in the correct format or not a Date object
      if (typeof record.date === 'string' && record.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.log('Date is already in the correct format:', record.date);
        continue; // Skip this record
      } else if (record.date instanceof Date) {
        // Convert Date to string in "YYYY-MM-DD" format only if it's a Date object
        const newDateString = record.date.toISOString().substring(0, 10);

        await AttendanceRecord.updateOne(
          { _id: record._id },
          { $set: { date: newDateString } }
        );
      } else {
        console.log('Date field is not in an expected format:', record.date);
      }
    }

    console.log("All applicable attendance records have been updated with date strings.");
  } catch (error) {
    console.error("Error updating attendance records with date strings:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateAttendanceRecordsWithDateString();