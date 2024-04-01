require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db');
const Class = require('../server/models/classmodel');

const updateClassIndexes = async () => {
  try {
    await connectDB();

    // Dropping the old index if it exists. Replace 'grade_1' with the actual index name if different.
    // This is a manual operation and should be used with caution.
    console.log("Dropping old indexes if they exist...");
    await Class.collection.dropIndex('grade_1').catch(e => console.log("Index grade_1 not found, skipping..."));

    // Explicitly ensuring new indexes based on the schema
    // This is typically not necessary as Mongoose does this automatically on application start.
    // However, it's included here for completeness.
    console.log("Ensuring new indexes based on the updated schema...");
    await Class.ensureIndexes();

    console.log("Index update complete.");
  } catch (error) {
    console.error("Error updating class indexes:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateClassIndexes();
