require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db');
const Class = require('../server/models/classmodel');

const updateClassIndexes = async () => {
  try {
    await connectDB();

    // Optionally, list current indexes to identify the one you want to drop
    const currentIndexes = await Class.listIndexes();
    console.log("Current Indexes:", currentIndexes);

    // Dropping the old index if it exists
    console.log("Dropping old indexes if they exist...");
    await Class.collection.dropIndex('grade_1_day_1_timeSlot_1').catch(e => console.log("Index not found, skipping..."));

    // MongoDB should automatically create the new indexes based on your schema
    // when the application starts. But if you want to explicitly ensure indexes:
    console.log("Ensuring new indexes based on the updated schema...");
    await Class.ensureIndexes();

    console.log("Index update complete.");
  } catch (error) {
    console.error("Error updating indexes:", error);
  } finally {
    await mongoose.disconnect();
  }
};

updateClassIndexes();

