const connectDB = require('./connectDB'); // Adjust the path to where connectDB is located
const User = require('./models/User'); // Adjust the path to your User model
const Class = require('./models/Class'); // Adjust the path to your Class model
const Subject = require('./models/Subject'); // Adjust the path to your Subject model
require('dotenv').config(); // Ensure this is called if your DB connection relies on environment variables

// Connect to the database
connectDB();

async function assignUserToClassAndSubjects(userName, className, subjectNames) {
  try {
    const user = await User.findOne({ name: userName });
    const classObj = await Class.findOne({ name: className }); // Assuming class has a name field
    const subjectObjs = await Subject.find({ name: { $in: subjectNames } });

    if (!user || !classObj || subjectObjs.length !== subjectNames.length) {
      console.log('User, class, or subjects not found');
      return;
    }

    // Assign classId to user
    user.classId = classObj._id;

    // Assuming your User model has a field to store multiple subjectIds (you need to add this to your User model if not already there)
    user.subjectIds = subjectObjs.map(subject => subject._id);

    await user.save();

    console.log(`User ${userName} assigned to class ${className} and subjects ${subjectNames.join(", ")}`);
  } catch (error) {
    console.error('Failed to assign user to class and subjects', error);
  }
}

// Example usage - replace 'John Doe', 'Grade 1', and ['Math', 'Science'] with actual data
assignUserToClassAndSubjects('John Doe', 'Grade 1', ['Math', 'Science'])
  .then(() => mongoose.disconnect()) // Disconnect from DB once operation is complete
  .catch((error) => console.error(error));
