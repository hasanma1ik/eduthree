require('dotenv').config();
const mongoose = require("mongoose");
const connectDB = require('./config/db');
const Subject = require('../server/models/subjectmodel'); 
const Class = require('../server/models/classmodel');

const updateSubjects = async () => {
  try {
    await connectDB();

    const subjects = await Subject.find({});
    
    for (const subject of subjects) {
      console.log(`Processing Subject: ${subject.name}`);
      
      // Attempt to match Classes based on subject name
      const relatedClasses = await Class.find({ subject: subject.name }).select('_id');
      console.log(`Found ${relatedClasses.length} related classes for Subject: ${subject.name}`);

      if (relatedClasses.length > 0) {
        const classIds = relatedClasses.map(c => c._id);
        await Subject.updateOne({ _id: subject._id }, { $set: { classes: classIds } });
        console.log(`Updated Subject: ${subject.name} with ${classIds.length} classes.`);
      } else {
        console.log(`No related classes found for Subject: ${subject.name}`);
      }
    }

    console.log("All subjects have been processed.");
  } catch (error) {
    console.error("Error updating subjects:", error);
  } finally {
    mongoose.disconnect();
  }
};

updateSubjects();
