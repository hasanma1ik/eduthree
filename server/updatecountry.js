require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const User = require('../server/models/userModel'); // Adjust the path according to your project structure

const addCountryFieldToUsers = async () => {
  try {
    // Connect to the database
    await connectDB();

    // Update all users without a 'country' field, setting it to a default value
    const result = await User.updateMany(
      { country: { $exists: false } }, // Only update users where 'country' does not exist
      { $set: { country: 'Pakistan' } } // Set default country
    );

    console.log(`Update complete: ${result.nModified} users updated with default country field`);

  } catch (error) {
    console.error("Error updating users:", error);
  } finally {
    // Disconnect from the database whether an error occurred or not
    mongoose.disconnect();
  }
};

addCountryFieldToUsers();
