require('dotenv').config();

const mongoose = require("mongoose");
const connectDB = require('./config/db'); // Adjust the path to where connectDB is located
const Assignment = require('../server/models/assignmentmodel'); // Adjust the path according to your project structure
// You may also need Subject model if you plan to map subjects by some criteria

const updateAssignmentsWithGradeAndSubject = async () => {
    try {
      await connectDB();
  
      const defaultGrade = '10th Grade';
      const defaultSubjectId = '65e125f02cbcc03c5c558e61'; // Replace with your actual ObjectId
  
      // Validate the ObjectId
      if (!mongoose.Types.ObjectId.isValid(defaultSubjectId)) {
        throw new Error('The defaultSubjectId is not a valid ObjectId');
      }
  
      const updateResult = await Assignment.updateMany({}, { 
        $set: { grade: defaultGrade, subject: defaultSubjectId } 
      });
  
      console.log(`${updateResult.nModified} assignments have been updated.`);
    } catch (error) {
      console.error("Error updating assignments:", error);
    } finally {
      mongoose.disconnect();
    }
  };
  
  updateAssignmentsWithGradeAndSubject();