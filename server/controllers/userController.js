const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var {expressjwt:jwt} = require('express-jwt')
const Thread = require('../models/threadModel')
const Message = require('../models/messageModel')
const AttendanceRecord = require('../models/attendancemodel');
const Timetable = require('../models/timetablemodel')
const Event = require('../models/eventmodel')
const Assignment = require('../models/assignmentmodel')
const Submission = require('../models/submissionmodel')
const Notification = require('../models/notificationmodel')
const User = require('../models/userModel')
const Class = require('../models/classmodel')
const Subject = require('../models/subjectmodel')
const ClassSchedule = require('../models/ClassScheduleModel')
const Term = require('../models/termmodel')
const moment = require('moment');

const mongoose = require("mongoose");
//middleware

const requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: 'auth'  // Now attaches decoded token payload to req.auth
});

const logUser = (req, res, next) => {
  console.log('Authenticated user:', req.auth);
  next();
};


// Middleware to log the user object after JWT middleware

const registerController = async (req, res) => {
  try {
    const { name, email, password, role, verificationCode } = req.body;

    // Validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "Name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "Email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password is required and should be at least 6 characters long",
      });
    }
    if (!role || !['student', 'teacher', 'admin'].includes(role)) { // Include 'admin' in the validation
      return res.status(400).send({
        success: false,
        message: "Valid role is required ('student', 'teacher', or 'admin')",
      });
    }

    // Check for verification code if role is 'teacher' or 'admin'
    const validTeacherCode = "TEACH2023"; // Hardcoded verification code for teachers
    const validAdminCode = "ADMIN2023"; // Hardcoded verification code for admins

    if (role === 'teacher' && verificationCode !== validTeacherCode) {
      return res.status(400).send({
        success: false,
        message: "Invalid verification code for teacher registration.",
      });
    }

    if (role === 'admin' && verificationCode !== validAdminCode) {
      return res.status(400).send({
        success: false,
        message: "Invalid verification code for admin registration.",
      });
    }

    // Existing user check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(500).send({
        success: false,
        message: "User already registered with this email",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Save user with role
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role, // Add the role to the user document
    });

    await user.save();

    return res.status(201).send({
      success: true,
      message: "Registration successful, please login",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};


// Search Controller
const searchController = async (req, res) => {
  try {
    const { query } = req.params;
    const users = await User.find({
      $or: [
        { name: { $regex: new RegExp(query, 'i') } },
        { email: { $regex: new RegExp(query, 'i') } }
      ]
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error searching users', error });
  }
};

// All Users
const allUsersController = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Error fetching all users', error });
  }
};

  // Controller to get all message threads
  const getAllThreads = async (req, res) => {
    try {
      const userId = req.auth._id;

 // Assuming you have the user's ID from the request (e.g., from a JWT token)
  
      const threads = await Thread.find({ users: userId })
      .sort('-updatedAt')
        .populate({
          path: 'messages',
          options: { sort: { 'createdAt': -1 }},
          populate: { path: 'sender', model: 'User', select: 'name' }
        })
        .populate({
          path: 'users',
          match: { _id: { $ne: userId } },
          select: 'name'
        });
  
      res.status(200).json({ success: true, threads });
    } catch (error) {
      console.error('Error fetching threads:', error);
      res.status(500).json({ success: false, message: 'Error fetching threads', error });
    }
  };

  // Controller to create a new message thread
  const userPress = async(req, res) => {
    try {
      const { userId, otherUserId } = req.body; 

      // Check if a thread already exists between these two users
      let thread = await Thread.findOne({
        users: { $all: [userId, otherUserId] }
      });

      // If a thread does not exist, create a new one
      if (!thread) {
        thread = await Thread.create({ users: [userId, otherUserId] });
      }

      res.status(201).json({ success: true, thread });
    } catch (error){
      console.error('Error creating or fetching thread:', error);
      res.status(500).json({ success: false, error });
    }
}



const getMessagesInThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    console.log("Fetching messages for thread:", threadId);

    // Assuming req.user is set by your authentication middleware and contains the current user's ID
    const userId = req.auth._id; 

    // Fetch the thread and populate both the messages and the sender of each message
    const thread = await Thread.findById(threadId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender', // Ensure this path matches your Message schema's reference to the User
          model: 'User' // Ensure this model name matches your User model
        }
      });

    if (!thread) {
      console.log("Thread not found:", threadId);
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Iterate over thread.messages to add the 'sentByMe' property based on the sender's ID
    const messagesWithSenderInfo = thread.messages.map(message => {
      const senderId = message.sender?._id.toString(); // Using optional chaining for safety
      const isSentByMe = senderId === userId.toString();
      return {
        ...message.toObject(), // Convert the Mongoose document to a plain object
        sentByMe: isSentByMe,
      };
    });

    console.log("Processed messages with 'sentByMe':", messagesWithSenderInfo);
    res.status(200).json({ success: true, messages: messagesWithSenderInfo });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error });
  }
};

const postMessageToThread = async (req, res) => {
  try {
      const { threadId } = req.params;
      const { text, senderId } = req.body; // Assuming you send text and sender's ID

      // Create a new message
      const newMessage = new Message({ text, sender: senderId, thread: threadId });
      await newMessage.save();

      // Add the message to the thread and update updatedAt
      await Thread.findByIdAndUpdate(threadId, 
          { 
              $push: { messages: newMessage._id },
              $set: { updatedAt: new Date() } // Update the updatedAt field to the current time
          },
          { new: true } // Return the updated document
      );

      res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
      console.error('Error posting message:', error);
      res.status(500).json({ success: false, message: 'Error posting message', error });
  }
};

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }
  
  // Generate a reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  // Token expiry time (e.g., 1 hour)
  const resetTokenExpire = Date.now() + 3600000; 

  await userModel.updateOne({ _id: user._id }, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: resetTokenExpire
  });

  // Send the email
  const transporter = nodemailer.createTransport({  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }});
  const resetUrl = `http://localhost:8080/api/v1/reset-password/${resetToken}`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Please click on the following link to reset your password: ${resetUrl}`
  });

// txke auyf laok glpi


  res.send({ message: 'Password reset email sent.' });
};

const resetPassword = async(req, res) =>{
  const { token, newPassword } = req.body;
  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now ()}
  })
  if(!user){
    return res.status(400).send({message: 'Password reset token is invalid or has expired'})
  }
try {

  user.password = await hashPassword(newPassword)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()
  res.send({ message: 'Your password has been updated'})
} catch (error){
  res.status(500).send({ message: 'Error updating password', error: error.message})
}
}

//Login

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Email Or Password",
      });
    }
    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User Not Found",
      });
    }
   //match password
   const match = await comparePassword(password, user.password);
   if (!match) {
     return res.status(500).send({
       success: false,
       message: "Invalid username or password",
     });
   }


//TOKEN JWT
const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "27d",
});



// undeinfed password
user.password = undefined;
res.status(200).send({
  success: true,
  message: "login successfully",
  token,
  user,
});
} catch (error) {
console.log(error);
return res.status(500).send({
  success: false,
  message: "error in login api",
  error,
});
}
};


//Update User
const updateUserController = async (req, res) => {
  try {
    const { name, password, email, profilePicture } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found",
      });
    }

    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const hashedPassword = password ? await hashPassword(password) : undefined;

    const updatedUser = await userModel.findOneAndUpdate(
      { email },
      {
        name: name || user.name,
        password: hashedPassword || user.password,
        profilePicture: profilePicture || user.profilePicture,
      },
      { new: true }
    );

    updatedUser.password = undefined;

    res.status(200).send({
      success: true,
      message: 'Profile updated',
      updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in User Update API',
      error,
    });
  }
};


const deleteConversation = async (req, res) => {
  try {
    const { threadId } = req.params;
    
    // Delete the conversation
    await Thread.findByIdAndDelete(threadId);

    // Also delete all messages associated with this conversation
    await Message.deleteMany({ thread: threadId });


    res.status(200).json({ message: 'Conversation and all related messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
  }
};

const muteConversation = async (req, res) => {
  try {
      const { threadId } = req.params;
      // Update conversation to set it as muted
      await Thread.findByIdAndUpdate(threadId, { isMuted: true });
      res.status(200).json({ message: 'Conversation muted successfully' });
  } catch (error) {
      console.error('Error muting conversation:', error);
      res.status(500).json({ message: 'Failed to mute conversation' });
  }
};

// Subject creation controller
const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    const subjectExists = await Subject.findOne({ name });
    if (subjectExists) {
      return res.status(400).json({ message: 'Subject already exists' });
    }
    const newSubject = new Subject({ name });
    await newSubject.save();
    res.status(201).json({ message: 'Subject created successfully', subject: newSubject });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create subject', error: error.message });
  }
};


const createGrade = async (req, res) => {
  const { grade, subject, timeSlot, day, teacher, term } = req.body;

  if (!grade || !subject || !timeSlot || !day || !teacher || !term) {
      return res.status(400).json({ message: 'Please fill all fields including term.' });
  }

  try {
      const termExists = await Term.findById(term);
      if (!termExists) {
          return res.status(404).json({ message: "Selected term does not exist." });
      }

      const subjectObj = await Subject.findOne({ name: subject });
      if (!subjectObj) {
          return res.status(404).json({ message: "Selected subject does not exist." });
      }

      const [startTime, endTime] = timeSlot.split(' - ');
      const startTimeUTC = moment.tz(startTime, 'h:mm A', 'UTC');
      const endTimeUTC = moment.tz(endTime, 'h:mm A', 'UTC');
      let utcDayOfWeek = day;
      if (startTimeUTC.day() !== moment(startTime, 'h:mm A').day()) {
          utcDayOfWeek = moment().day(startTimeUTC.day()).format('dddd');
      }

      const newClass = new Class({
          grade,
          subject: subjectObj._id,
          timeSlot: `${startTimeUTC.format('HH:mm')} - ${endTimeUTC.format('HH:mm')}`,
          day: utcDayOfWeek,
          teacher,
          term
      });

      await newClass.save();

      const studentsInGrade = await User.find({ grade }).select('_id');

      await new ClassSchedule({
          classId: newClass._id,
          dayOfWeek: utcDayOfWeek,
          startTime: startTimeUTC.format('HH:mm'),
          endTime: endTimeUTC.format('HH:mm'),
          subject: subjectObj._id,
          teacher,
          users: studentsInGrade,
          term
      }).save();

      // Delay notification creation to 15 minutes before class
      const delay = moment(startTimeUTC).subtract(15, 'minutes').diff(moment.utc(), 'milliseconds');
      setTimeout(async () => {
          studentsInGrade.forEach(async (user) => {
              await Notification.create({
                  user: user._id,
                  message: `Reminder: Your ${subject} class starts in 15 minutes!`,
                  type: 'classReminder'
              });
          });
          console.log("Notifications scheduled for class starting soon.");
      }, delay);

      res.status(201).json({
          message: 'Grade, class, and class schedule created successfully',
          class: newClass
      });
  } catch (error) {
      console.error("Failed to create grade/class due to error:", error);
      res.status(500).json({ message: 'Failed to create grade/class', error: error.toString() });
  }
};



const getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (error) {
    res.status(500).send({ message: 'Failed to fetch classes', error: error.message });
  }
};

const getSubjectsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const subjects = await Subject.find({ classId });
    res.json({ success: true, subjects });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error fetching subjects', error: error.message });
  }
};



// Example controller method to fetch users by grade
const getClassIdByGrade = async (req, res) => {
  try {
    const classObj = await Class.findOne({ grade: req.params.grade });
    if (!classObj) {
      return res.status(404).json({ message: "Class for the specified grade not found." });
    }
    res.json({ classId: classObj._id });
  } catch (error) {
    console.error(`Failed to fetch classId for grade ${req.params.grade}:`, error);
    res.status(500).json({ message: "Error fetching classId for the specified grade", error: error.message });
  }
};


const registerUserForSubject = async (req, res) => {
  const { userId, subjectId } = req.body;

  try {
    const user = await User.findById(userId);
    const subject = await Subject.findById(subjectId);

    if (!user) {
      console.error(`User not found: ${userId}`);
      return res.status(404).json({ message: "User not found." });
    }
    if (!subject) {
      console.error(`Subject not found: ${subjectId}`);
      return res.status(404).json({ message: "Subject not found." });
    }

    // Add subject to user's subjects array if not already present
    if (!user.subjects.includes(subjectId)) {
      user.subjects.push(subjectId);
      await user.save();
    } else {
      console.error(`User already registered for this subject: ${userId}, ${subjectId}`);
      return res.status(400).json({ message: "User already registered for this subject." });
    }

    // Update Class document
    const classToUpdate = await Class.findOne({ grade: user.grade, subject: subjectId });
    if (classToUpdate && !classToUpdate.users.includes(userId)) {
      classToUpdate.users.push(userId);
      await classToUpdate.save();
    } else {
      console.error(`Class not found or user already in class: ${user.grade}, ${subjectId}`);
    }

    console.log(`User registered for subject successfully: ${userId}, ${subjectId}`);
    res.json({ message: "User registered for subject successfully." });
  } catch (error) {
    console.error(`Failed to register user ${userId} for subject ${subjectId}:`, error);
    res.status(500).json({ message: "Error registering user for subject", error: error.message });
  }
};


const getClassUsersByGrade = async (req, res) => {
  const { grade } = req.params; // Assuming grade is passed as a URL parameter

  try {
    // Find the class ID(s) associated with the specified grade
    const classObj = await Class.findOne({ grade: grade });

    if (!classObj) {
      return res.status(404).json({ message: "No class found for this grade." });
    }

    // Fetch users associated with the class ID
    const users = await User.find({ classId: classObj._id }).populate('classId', 'grade');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users for the specified grade.", error: error.message });
  }
};

const getUsersByGradeAndSubject = async (req, res) => {
  try{
    const {grade, subjectId} = req.params
        // Query the database for users in the given grade and registered for the given subject
    // This query assumes that your User schema has fields for grade and subjects that are arrays or references
    const users = await User.find({
      grade: grade,
      subjects: subjectId
    })
    res.status(200).json(users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    res.status(500).send('Server error');
  }
};

const getStudentsByClassAndSubject = async (req, res) => {
  try {
    const { grade, subject } = req.params;
    const assignments = await Assignment.find({ grade, subject });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch assignments", error: error.message });
  }}


const addOrUpdateStudent = async (req, res) => {
  const { name, email, classId, subjects } = req.body;

  try {
    let student = await User.findOne({ email: email });

    if (student) {
      // Update existing student
      student.name = name; // Assuming you want to update the name as well
      student.classId = classId;
      student.subjects = subjects;
      await student.save();
    } else {
      // Create a new student
      student = new User({
        name,
        email,
        classId,
        subjects,
        // Add other fields as necessary
      });
      await student.save();
    }

    res.status(200).json({ message: "Student added/updated successfully", student });
  } catch (error) {
    console.error("Error adding/updating student:", error);
    res.status(500).send({ message: "Failed to add/update student", error: error.message });
  }
};

// Get a user's timetable

const getTimetableForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const timetableEntries = await Timetable.find({ userId }).sort('startTime');
    res.json({ success: true, timetableEntries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch timetable", error });
  }
};

const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 }); // Sort by date ascending
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch events", error: error.message });
  }
};

const addEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();
    res.status(201).json({ success: true, event: newEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add event", error: error.message });
  }
}

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, files, grade, subject } = req.body;

    // Debug: Log the received request body
    console.log('Received request body:', req.body);

    // Validate that the subject is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(subject)) {
      return res.status(400).json({ message: "Invalid subject ID" });
    }

    // Find the subject document using the ObjectId
    const subjectDoc = await Subject.findById(subject);

    // Debug: Log the found subject document
    console.log('Found subjectDoc:', subjectDoc);

    if (!subjectDoc) {
      return res.status(404).json({ message: "Subject not found" });
    }

    // Create a new assignment document
    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      files,
      grade,
      subject: subjectDoc._id, // Save ObjectId
      createdBy: req.auth._id, // Ensure this is correctly set
    });

    // Debug: Log the new assignment before saving
    console.log('New Assignment to be saved:', newAssignment);

    // Save the assignment to the database
    await newAssignment.save();

    // Debug: Log after saving the assignment
    console.log('Assignment saved successfully');

    // Find users in the specified grade and enrolled in the specified subject
    const users = await User.find({
      $or: [
        { grade: grade, subjects: subjectDoc._id }, // Match students
        { _id: req.auth._id } // Include the teacher who created the assignment
      ]
    });

    // Debug: Log the found users
    console.log('Found users for notifications:', users);

    // For each user, create a new notification about the assignment
    users.forEach(async (user) => {
      await Notification.create({
        user: user._id,
        message: `Subject: ${subjectDoc.name}
        
New Assignment: ${title}, ${description} 

Due: ${dueDate}`,
        assignmentId: newAssignment._id,
          type: 'assignment'
      });

      // Debug: Log notification creation
      console.log(`Notification created for user: ${user._id}`);
    });

    res.status(201).json({
      message: 'Assignment created successfully',
      assignment: newAssignment
    });
  } catch (error) {
    console.error('Failed to create assignment:', error);
    res.status(500).json({ message: 'Failed to create assignment', error: error.message });
  }
};





const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, userId, filePath } = req.body;

    if (!assignmentId || !userId || !filePath) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if the assignment exists
    const assignmentExists = await Assignment.findById(assignmentId);
    if (!assignmentExists) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if the user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create and save the submission
    const submission = new Submission({ assignmentId, userId, filePath });
    await submission.save();

    res.status(201).json({ message: 'Assignment submitted successfully', data: submission });
  } catch (error) {
    console.error(error); // Better error handling for debugging
    res.status(500).json({ message: 'Failed to submit assignment', error: error.message });
  }
};
const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('submissions') // Assuming a relation to submissions
      .exec()
      
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment', error: error.message });
  }
};



const setGradeForUser = async (req, res) => {
  const { userId, grade } = req.body;

  try {
    // Look for an existing class for this grade
    let classForGrade = await Class.findOne({ grade });

    // If no class exists for this grade, create one
    if (!classForGrade) {
      classForGrade = new Class({ grade });
      await classForGrade.save();
    }

    // Update the user with the grade and classId
    const updatedUser = await User.findByIdAndUpdate(
      userId, 
      { $set: { grade: grade, classId: classForGrade._id } }, 
      { new: true }
    ).populate('classId'); // Optionally populate the classId to return the class details

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Grade and classId updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error setting grade for user:', error);
    res.status(500).json({ message: 'Failed to set grade and classId for user', error: error.message });
  }
};


const submitAttendance = async (req, res) => {
  const { date, grade, subject, attendance } = req.body;

  try {
    const record = await AttendanceRecord.findOneAndUpdate(
      { date, grade, subject },
      { $set: { attendance } },
      { new: true, upsert: true }
    );
    res.status(200).json(record);
  } catch (error) {
    console.error(`Failed to save attendance: ${error}`);
    res.status(500).json({ message: "Failed to save attendance", error });
  }
};

const getSubjects = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id).populate('subjects');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let subjects;
    if (user.role === 'teacher') {
      const classes = await Class.find({ teacher: user._id }).populate('subject');
      subjects = [...new Set(classes.map(cls => cls.subject))];  // Ensure unique subjects
    } else if (user.role === 'student') {
      subjects = user.subjects;
    } else {
      subjects = await Subject.find({});
    }

    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};




const getAssignmentsForLoggedInUser = async (req, res) => {
  try {
    const subjectId = req.query.subject;

    const user = await User.findById(req.auth._id).populate('subjects');

    if (!user) {
      return res.status(404).send('User not found');
    }

    let query = { subject: subjectId };

    if (user.role === 'teacher') {
      query.createdBy = req.auth._id;
    } else if (user.role === 'student') {
      query.grade = user.grade;
      query.subject = subjectId; // Ensure we only fetch assignments for the selected subject
    }

    const assignments = await Assignment.find(query)
      .populate('subject', 'name')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });  // Sort by createdAt in descending order
        // Sort by createdAt in descending order

    // Ensure that assignments with null createdBy are filtered out or handled
    const validAssignments = assignments.filter(assignment => assignment.createdBy && assignment.subject);

    res.json(validAssignments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};


const getAttendanceDates = async (req, res) => {
  try {
    const { grade, subject } = req.params;
    const dates = await AttendanceRecord.find({ grade, subject }).distinct('date');
    res.json({ dates });
  } catch (error) {
    console.error('Error fetching attendance dates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getAttendanceData = async (req, res) => {
  try {
    const { grade, subject, date } = req.params;
    // Ensure dates in the DB are stored in "YYYY-MM-DD" format to match the query exactly
    const attendance = await AttendanceRecord.find({ grade, subject, date })
                            .populate('attendance.userId', 'name');
    res.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getNotifications = async (req, res) => {
  try {
    const userId = req.auth._id; // Assuming req.auth contains the authenticated user's ID
    const notifications = await Notification.find({ user: userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).send('Error fetching notifications');
  }
};

 const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.auth._id; // Ensure the notification belongs to the user

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).send('Notification not found or does not belong to the user');
    }

    res.json({ success: true, message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).send('Error marking notification as read');
  }
};

const getUnreadNotificationsCount = async (req, res) => {
  try {
    const userId = req.auth._id; // Assuming you have middleware to set req.user from the token
    const count = await Notification.countDocuments({
      user: userId,
      read: false, // Assuming 'read' is a boolean field in your Notification model
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Failed to fetch unread notifications count:', error);
    res.status(500).json({ message: 'Failed to fetch unread notifications count', error: error.message });
  }
};

const getClassSchedulesForLoggedInUser = async (req, res) => {
  const userId = req.auth._id; // Adjust based on how you access the logged-in user's ID
  const { date } = req.query; // Expected format: 'YYYY-MM-DD'

  try {
    const term = await Term.findOne({ 
      startDate: { $lte: date }, 
      endDate: { $gte: date }
    });

    if (!term) {
      return res.status(404).json({ message: 'No term found for the selected date.' });
    }

    const parsedDate = new Date(date);
    const dayOfWeek = parsedDate.toLocaleDateString('en-US', { weekday: 'long' });

    let classSchedules = await ClassSchedule.find({
      term: term._id,
      users: userId,
      dayOfWeek
    })
    .populate('classId')
    .populate('teacher', 'name')
    .populate('subject', 'name'); // Populate subject name

    // Convert startTime and endTime to 24-hour format
    classSchedules = classSchedules.map(schedule => ({
      ...schedule.toObject(), // Convert Mongoose document to plain JavaScript object
      startTime: moment(schedule.startTime, 'h:mm A').format('HH:mm'),
      endTime: moment(schedule.endTime, 'h:mm A').format('HH:mm'),
    }));

    res.json({ success: true, classSchedules });
  } catch (error) {
    console.error("Failed to fetch class schedules:", error);
    res.status(500).json({ message: "Failed to fetch class schedules", error });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('name'); // Filter by role and select name
    res.json({ teachers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createTerms = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;
    const term = new Term({ name, startDate, endDate });
    await term.save();
    res.status(201).json({ message: 'Term created successfully', term });
  } catch (error) {
    console.error('Error adding term:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}

const getTerms = async (req, res) => {
  try {
      const terms = await Term.find({}); // Fetch all terms from the database
      res.json({ success: true, terms });
  } catch (error) {
      console.error("Failed to fetch terms:", error);
      res.status(500).json({ success: false, message: "Failed to fetch terms", error: error.message });
  }
};

const getTeacherData = async (req, res) => {
  try {
    const teacherId = req.params.id;

    // Fetch the classes and subjects assigned to the teacher
    const classes = await Class.find({ teacher: teacherId }).populate('subject');
    
    // Extract unique grades and subjects from the classes
    const grades = [...new Set(classes.map(cls => cls.grade))];
    const subjects = [...new Set(classes.map(cls => JSON.stringify(cls.subject)))].map(JSON.parse);

    res.json({ grades, subjects });
  } catch (error) {
    console.error('Failed to fetch teacher data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // Retrieve the assignment to check if it exists and who created it
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if the current user is the creator of the assignment or an admin
    if (req.auth._id.toString() !== assignment.createdBy.toString() && req.auth.role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this assignment' });
    }

    // Delete the assignment
    await Assignment.deleteOne({ _id: assignmentId });
    res.status(200).json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    res.status(500).json({ message: 'Failed to delete assignment', error: error.message });
  }
};








module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController, allUsersController, getAllThreads, userPress, getMessagesInThread, postMessageToThread, deleteConversation, muteConversation, resetPassword, requestPasswordReset, getStudentsByClassAndSubject, getTimetableForUser, getEvents, addEvent, submitAssignment, getAssignmentById, createAssignment, getClassIdByGrade, registerUserForSubject, getSubjects, getAllClasses, getSubjectsByClass, addOrUpdateStudent, createGrade, createSubject, setGradeForUser, getClassUsersByGrade, getUsersByGradeAndSubject, submitAttendance, getAttendanceData, getAttendanceDates, getAssignmentsForLoggedInUser, getNotifications, markNotificationAsRead, getUnreadNotificationsCount, getClassSchedulesForLoggedInUser, getAllTeachers, createTerms, getTerms, getTeacherData, logUser, deleteAssignment  }




// const createClass = async (req, res) => {
//   const { grade, subject, timeSlot, day, teacher } = req.body;

//   try {
//     // Validation
//     if (!grade || !subject || !timeSlot || !day || !teacher) {
//       return res.status(400).json({ message: 'Please fill all fields' });
//     }

//     // Check for existing class with the same grade, subject, time slot, and day
//     const existingClass = await Class.findOne({ grade, subject, timeSlot, day });
//     if (existingClass) {
//       // If such a class exists, return an error
//       return res.status(400).json({ message: 'A class with these exact details already exists.' });
//     }

//     // Attempt to create and save the new class
//     const newClass = new Class({ grade, subject, timeSlot, day, teacher });
//     await newClass.save();

//     // Successfully created
//     res.status(201).json({ message: 'Class created successfully', class: newClass });
//   } catch (error) {
//     console.error(error);
//     // General error response
//     res.status(500).json({ message: 'Failed to create class', error: error.toString() });
//   }
// };





