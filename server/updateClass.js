require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Class = require('../server/models/classmodel');
const Subject = require('../server/models/subjectmodel');

const updateClassSubjects = async () => {
  try {
    await connectDB();

    // Fetch all classes
    const classes = await Class.find();

    for (const cls of classes) {
      // Log the current class being processed
      console.log(`Processing class: ${cls.grade}, Subject: ${cls.subject}`);

      // Find the subject document that matches the subject name
      const subject = await Subject.findOne({ name: cls.subject });

      if (subject) {
        // Update the subject field to be the ObjectId reference
        cls.subject = subject._id;
        await cls.save();
        console.log(`Updated class with grade ${cls.grade} and subject ${subject.name}`);
      } else {
        console.log(`Subject not found for class with grade ${cls.grade} and subject ${cls.subject}`);
      }
    }

    console.log('Class subject update complete.');
  } catch (error) {
    console.error('Error updating class subjects:', error);
  } finally {
    await mongoose.disconnect();
  }
};

updateClassSubjects();
