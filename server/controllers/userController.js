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
const moment = require('moment-timezone');
const { isValidObjectId } = require('mongoose');
const Marks = require('../models/marksmodel')
const GrowthReport = require('../models/growthreportmodel')
const SectionAssignment = require('../models/SectionAssignmentmodel')

const mongoose = require('mongoose');


const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// Helpers — put these near the top of the file, after your requires
// Uses: moment (moment-timezone), mongoose, Subject

function validateUtcTimeSlot(timeSlot) {
  if (typeof timeSlot !== 'string' || !timeSlot.includes(' - ')) return false;
  const [start, end] = timeSlot.split(' - ').map(s => s.trim());
  const s = moment.tz(start, 'HH:mm', true, 'UTC');
  const e = moment.tz(end,   'HH:mm', true, 'UTC');
  return s.isValid() && e.isValid() && s.isBefore(e);
}

function isHHmm(t) {
  return moment.tz(t, 'HH:mm', true, 'UTC').isValid();
}

/** sessions = [{ day, startUtc, endUtc }] */
function validateSessionsArray(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return false;
  for (const s of sessions) {
    if (!s || typeof s !== 'object') return false;
    const { day, startUtc, endUtc } = s;
    if (!DAYS.includes(String(day))) return false;
    if (!isHHmm(String(startUtc)) || !isHHmm(String(endUtc))) return false;
    if (!moment.utc(startUtc, 'HH:mm', true).isBefore(moment.utc(endUtc, 'HH:mm', true))) return false;
  }
  return true;
}

/** Accepts ObjectId or subject name; creates subject if needed; returns _id */
async function resolveSubjectId(input) {
  // object input: { _id, name }
  if (input && typeof input === 'object') {
    const { _id, name } = input || {};
    if (_id && mongoose.isValidObjectId(_id)) {
      const found = await Subject.findById(_id);
      return found ? found._id : null;
    }
    if (typeof name === 'string' && name.trim()) {
      const normalized = name.trim();
      const existing = await Subject.findOne({ name: normalized });
      if (existing) return existing._id;
      const created = await Subject.create({ name: normalized });
      return created._id;
    }
    return null;
  }

  // string input: could be id or name
  if (typeof input === 'string') {
    const str = input.trim();
    if (mongoose.isValidObjectId(str)) {
      const found = await Subject.findById(str);
      return found ? found._id : null;
    }
    if (str) {
      const existing = await Subject.findOne({ name: str });
      if (existing) return existing._id;
      const created = await Subject.create({ name: str });
      return created._id;
    }
  }
  return null;
}

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

    // Validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // Find user by email and include password and role
    const user = await userModel.findOne({ email }).select('+password +role');
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "User not found.",
      });
    }

    // Match password
    const match = await comparePassword(password, user.password);
    if (!match) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token
    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "27d",
    });

    // Exclude sensitive fields before sending the response
    user.password = undefined;

    res.status(200).send({
      success: true,
      message: "Login successful.",
      token,
      user, // Includes the `role` and other fields
    });
  } catch (error) {
    console.error("Error in loginController:", error);
    return res.status(500).send({
      success: false,
      message: "Error in login API.",
      error,
    });
  }
};


//Update User
// controllers/userController.js

const updateUserController = async (req, res) => {
  try {
      const { name, password, email, profilePicture, country } = req.body;

      const user = await userModel.findById(req.auth._id);
      if (!user) {
          return res.status(404).send({ success: false, message: "User not found" });
      }

      if (password && password.length < 6) {
          return res.status(400).send({ success: false, message: "Password must be at least 6 characters" });
      }

      const hashedPassword = password ? await hashPassword(password) : undefined;

      user.name = name || user.name;
      user.country = country || user.country; // Save the updated country
      if (hashedPassword) user.password = hashedPassword;
      user.profilePicture = profilePicture || user.profilePicture;
      user.email = email || user.email;

      await user.save();

      console.log("Updated user:", user); // Debug log to verify the updated user object

      user.password = undefined;

      res.status(200).send({
          success: true,
          message: 'Profile updated',
          updatedUser: user,
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
  try {
    let {
      grade, gradeLevel, section,
      subject,           // id or name
      timeSlot,          // "HH:mm - HH:mm" (legacy single)
      day,               // "Monday"        (legacy single)
      teacher,           // ObjectId
      term,              // ObjectId
      sessions,          // NEW: [{ day, startUtc, endUtc }]
    } = req.body;

    if (!grade && gradeLevel && section) {
      grade = `${String(gradeLevel).trim()} - ${String(section).trim()}`;
    }

    if (!grade || !subject || !teacher || !term) {
      return res.status(400).json({ message: 'Please fill all fields including grade, subject, teacher, term.' });
    }

    const termExists = await Term.findById(term);
    if (!termExists) return res.status(404).json({ message: 'Selected term does not exist.' });

    const subjectId = await resolveSubjectId(subject);
    if (!subjectId) return res.status(404).json({ message: 'Selected subject does not exist or could not be created.' });

    // Decide input mode: sessions[] or legacy single day/timeSlot
    let normalizedSessions = [];
    if (validateSessionsArray(sessions)) {
      normalizedSessions = sessions.map(s => ({ day: s.day, startUtc: s.startUtc, endUtc: s.endUtc }));
    } else {
      // fallback to single
      if (!day || !timeSlot || !validateUtcTimeSlot(timeSlot)) {
        return res.status(400).json({
          message: 'Provide either sessions[] (preferred) or valid legacy day + timeSlot (UTC "HH:mm - HH:mm").',
        });
      }
      const [startUtc, endUtc] = timeSlot.split(' - ').map(x => x.trim());
      normalizedSessions = [{ day, startUtc, endUtc }];
    }

    // Create the Class shell (one document per grade/subject/teacher/term)
    const newClass = await Class.create({
      grade,
      gradeLevel: gradeLevel || undefined,
      section: section || undefined,
      subject: subjectId,
      // keep the first slot in class doc for backward compatibility
      timeSlot: `${normalizedSessions[0].startUtc} - ${normalizedSessions[0].endUtc}`,
      day: normalizedSessions[0].day,
      teacher,
      term,
    });

    await User.findByIdAndUpdate(teacher, { $addToSet: { subjects: subjectId } });

    // Enroll current students in the grade
    const studentsInGrade = await User.find({ grade }).select('_id');

    // Create ClassSchedule rows — one per session
    const scheduleDocs = normalizedSessions.map(s => ({
      classId: newClass._id,
      dayOfWeek: s.day,
      startTime: s.startUtc, // "HH:mm" UTC
      endTime: s.endUtc,     // "HH:mm" UTC
      subject: subjectId,
      teacher,
      users: studentsInGrade,
      term,
    }));

    await ClassSchedule.insertMany(scheduleDocs);

    // Optional: light notification setup for first session of *today* (kept simple)
    try {
      const nowUtc = moment.utc();
      for (const s of normalizedSessions) {
        const todayWeekday = nowUtc.format('dddd');
        if (todayWeekday !== s.day) continue;
        const notifyAt = moment.utc(`${nowUtc.format('YYYY-MM-DD')}T${s.startUtc}:00Z`).subtract(15, 'minutes');
        const delay = notifyAt.diff(nowUtc, 'milliseconds');
        if (delay > 0 && delay < 2 * 60 * 60 * 1000) {
          setTimeout(async () => {
            for (const user of studentsInGrade) {
              await Notification.create({
                user: user._id,
                message: `Reminder: Your ${grade} ${s.day} class starts in 15 minutes.`,
                type: 'classReminder',
              });
            }
          }, delay);
        }
      }
    } catch (e) {
      console.warn('Notification scheduling skipped:', e?.message || e);
    }

    return res.status(201).json({
      message: 'Class created with multiple sessions successfully.',
      class: newClass,
      sessions: normalizedSessions,
    });
  } catch (error) {
    if (error?.code === 11000) {
      const keys = Object.keys(error.keyPattern || {});
      const duplicateTeacher = keys.includes('teacher');
      return res.status(409).json({
        message: duplicateTeacher
          ? 'This teacher is already booked for this term/day/time slot.'
          : 'A class for this grade/day/time/term already exists.',
      });
    }
    console.error('Failed to create grade/class due to error:', error);
    return res.status(500).json({ message: 'Failed to create grade/class', error: error.toString() });
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
  const { title, description, dueDate, grade, subject } = req.body;

  console.log("Inside createAssignment controller");
  console.log("Request Body:", req.body);

  if (!title || !description || !dueDate || !grade || !subject) {
    console.log("Validation failed");
    return res.status(400).json({ message: 'Please fill all fields.' });
  }

  try {
    // Check if subject is an ID or name
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(subject);
    const subjectObj = isObjectId
      ? await Subject.findById(subject) // If it's an ObjectId
      : await Subject.findOne({ name: subject }); // If it's a name

    console.log("Subject Found:", subjectObj);

    if (!subjectObj) {
      console.log("Subject not found");
      return res.status(404).json({ message: 'Subject not found.' });
    }

    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      grade,
      subject: subjectObj._id,
      createdBy: req.auth._id,
    });

    await newAssignment.save();

    console.log("Assignment Created:", newAssignment);

    res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
  } catch (error) {
    console.error("Failed to create assignment:", error);
    res.status(500).json({ message: 'Failed to create assignment', error: error.toString() });
  }
};





// controllers/assignmentController.js

const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, userId, filePath, fileName, fileType, scannedImages } = req.body;
    
    // Either traditional file fields must be provided OR scannedImages array must be provided with at least one element
    if (
      !assignmentId ||
      !userId ||
      (
        (!filePath || !fileName || !fileType) &&
        (!scannedImages || scannedImages.length === 0)
      )
    ) {
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

    // Build submission data: if scannedImages array is provided and non-empty, use that.
    const submissionData = (scannedImages && scannedImages.length > 0)
      ? { assignmentId, userId, scannedImages }
      : { assignmentId, userId, filePath, fileName, fileType };

    // Create and save the submission
    const submission = new Submission(submissionData);
    await submission.save();

    return res.status(201).json({
      message: 'Assignment submitted successfully',
      data: submission,
    });
  } catch (error) {
    console.error("Error in submitAssignment:", error);
    return res.status(500).json({
      message: 'Failed to submit assignment',
      error: error.message,
    });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const { userId, subject } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    // Populate the assignment details (assuming assignmentId is a reference)
    let submissions = await Submission.find({ userId }).populate({
      path: 'assignmentId',
      select: 'subject',
      match: subject ? { subject } : {}
    });
    // If subject filtering is applied, filter out submissions where assignmentId is null.
    if (subject) {
      submissions = submissions.filter(sub => sub.assignmentId);
    }
    res.status(200).json({ submissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
};
const showSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.query;
    if (!assignmentId) {
      return res.status(400).json({ message: 'Assignment ID is required' });
    }
    // Find all submissions for the given assignmentId and populate the student's name
    const submissions = await Submission.find({ assignmentId }).populate({
      path: 'userId',
      select: 'name'
    });
    res.status(200).json({ submissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
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



// controllers/userController.js (or wherever it lives)
const setGradeForUser = async (req, res) => {
  try {
    const { userId, grade, gradeLevel, section, term } = req.body;

    const combinedGrade =
      grade ||
      (gradeLevel && section ? `${String(gradeLevel).trim()} - ${String(section).trim()}` : null);

    if (!userId || !combinedGrade || !term) {
      return res.status(400).json({
        message: 'userId and (grade OR gradeLevel+section) and term are required.',
      });
    }

    // Validate term
    const termDoc = await Term.findById(term);
    if (!termDoc) {
      return res.status(404).json({ message: 'Selected term (batch) not found.' });
    }

    // IMPORTANT: Do NOT auto-create classes here.
    // Only attach to an existing class that matches the Grade/Section + Term.
    const classForGrade = await Class.findOne({ grade: combinedGrade, term: termDoc._id });

    if (!classForGrade) {
      return res.status(400).json({
        message:
          'No course exists for this Grade/Section in the selected term. ' +
          'Please create it first in Course Creation (pick teacher, day(s), and time).',
      });
    }

    // Update the student
    const updateObj = {
      grade: combinedGrade,
      classId: classForGrade._id,
      term: termDoc._id,
    };
    if (gradeLevel) updateObj.gradeLevel = gradeLevel;
    if (section) updateObj.section = section;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateObj },
      { new: true }
    )
      .populate('classId')
      .populate('term', 'name startDate endDate');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure class.users contains this student
    await Class.findByIdAndUpdate(classForGrade._id, { $addToSet: { users: updatedUser._id } });

    return res.json({
      message: 'Grade, section, and term updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error setting grade/section/term for user:', error);
    return res.status(500).json({
      message: 'Failed to set grade/section/term for user',
      error: error.message,
    });
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
      subjects = [...new Set(classes.map((cls) => cls.subject))];
    } else if (user.role === 'student') {
      subjects = user.subjects;
    } else {
      subjects = await Subject.find({});
    }

    res.json({ subjects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};




const getAssignmentsForLoggedInUser = async (req, res) => {
  try {
    const { grade, subject } = req.query; // Destructure grade and subject from query

    const user = await User.findById(req.auth._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const query = user.role === 'teacher' 
      ? { createdBy: req.auth._id } // Filter by teacher's ID
      : { grade: user.grade }; // Filter by student's grade

    // Add grade and subject filters if present
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;

    const assignments = await Assignment.find(query)
      .populate('subject', 'name') // Populate subject details
      .populate('createdBy', 'name') // Populate teacher details
      .sort({ createdAt: -1 });

    res.json(assignments); // Send the filtered assignments
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server Error' });
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

// controllers/userController.js (excerpt)
const getClassSchedulesForLoggedInUser = async (req, res) => {
  const userId = req.auth._id;
  const { date } = req.query; // 'YYYY-MM-DD'

  try {
    // Find the term that covers the selected date
    const term = await Term.findOne({
      startDate: { $lte: date },
      endDate: { $gte: date },
    });

    if (!term) {
      return res.status(404).json({ message: 'No term found for the selected date.' });
    }

    // Day name like "Monday"
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    // Load the requesting user to check their role
    const currentUser = await User.findById(userId).select('role');
    const role = currentUser?.role;

    // Base filter
    const filter = { term: term._id, dayOfWeek };

    // Add role-specific criteria
    if (role === 'teacher') {
      filter.teacher = userId;
    } else if (role === 'student') {
      filter.users = userId;
    } else {
      // optionally: return empty for admins, or show all for the day/term
      // filter remains as-is for "all on that day"
      // For safety, return empty here:
      return res.json({ success: true, classSchedules: [] });
    }

    let classSchedules = await ClassSchedule.find(filter)
      .populate('classId')                 // to access `grade` like "Grade 1 - B"
      .populate('teacher', 'name')
      .populate('subject', 'name');

    // Normalize to HH:mm (UTC) → your client converts to local
    classSchedules = classSchedules.map((s) => ({
      ...s.toObject(),
      startTime: moment(s.startTime, ['h:mm A', 'HH:mm']).format('HH:mm'),
      endTime: moment(s.endTime, ['h:mm A', 'HH:mm']).format('HH:mm'),
    }));

    return res.json({ success: true, classSchedules });
  } catch (error) {
    console.error('Failed to fetch class schedules:', error);
    return res.status(500).json({ message: 'Failed to fetch class schedules', error });
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

// Controller to get grades and subjects taught by a teacher
const getTeacherData = async (req, res) => {
  try {
    const teacherId = req.params.id;

    const classes = await Class.find({ teacher: teacherId }).populate('subject');

    const grades = [...new Set(classes.map((cls) => cls.grade))];
    const gradeSubjectMap = {};

    classes.forEach((cls) => {
      if (!gradeSubjectMap[cls.grade]) {
        gradeSubjectMap[cls.grade] = [];
      }
      gradeSubjectMap[cls.grade].push({
        _id: cls.subject._id,
        name: cls.subject.name,
      });
    });

    res.json({ grades, gradeSubjectMap });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch teacher data' });
  }
};

const getTermById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid term id' });
    const term = await Term.findById(id);
    if (!term) return res.status(404).json({ message: 'Term not found' });
    res.json({ success: true, term });
  } catch (err) {
    console.error('getTermById error:', err);
    res.status(500).json({ message: 'Failed to fetch term' });
  }
};

// PATCH /auth/terms/:id
const updateTerm = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate } = req.body;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid term id' });
    if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: 'End date cannot be earlier than start date.' });
    }
    const term = await Term.findByIdAndUpdate(
      id,
      {
        ...(name != null ? { name: String(name).trim() } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      },
      { new: true }
    );
    if (!term) return res.status(404).json({ message: 'Term not found' });
    res.json({ success: true, message: 'Term updated successfully', term });
  } catch (err) {
    console.error('updateTerm error:', err);
    res.status(500).json({ message: 'Failed to update term' });
  }
};

// DELETE /auth/terms/:id
const deleteTerm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid term id' });

    // Block delete if linked
    const [classCount, scheduleCount] = await Promise.all([
      Class.countDocuments({ term: id }),
      ClassSchedule.countDocuments({ term: id }),
    ]);
    if (classCount > 0 || scheduleCount > 0) {
      return res.status(409).json({
        message: `Cannot delete term: ${classCount} class(es) and ${scheduleCount} schedule(s) linked.`,
      });
    }

    const deleted = await Term.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Term not found' });
    res.json({ success: true, message: 'Term deleted successfully' });
  } catch (err) {
    console.error('deleteTerm error:', err);
    res.status(500).json({ message: 'Failed to delete term' });
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



const getStudentAttendance = async (req, res) => {
  const { studentId, subjectId, grade } = req.query;

  try {
    const attendanceRecords = await AttendanceRecord.find({
      grade,
      subject: subjectId,
      'attendance.userId': studentId, // Check if studentId is in attendance array
    }).sort('date');

    // Filter attendance for the specific student
    const filteredRecords = attendanceRecords.map((record) => {
      const studentAttendance = record.attendance.find((entry) => entry.userId.toString() === studentId);
      return {
        date: record.date,
        status: studentAttendance?.status || 'Absent',
      };
    });

    res.json({ attendance: filteredRecords });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ message: 'Failed to fetch attendance.', error: error.message });
  }
};


const unenrollUserFromSubject = async (req, res) => {
  const { userId, subjectId } = req.body;

  try {
    // Find the user and subject
    const user = await User.findById(userId);
    const subject = await Subject.findById(subjectId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    // Remove subject from user's subjects array
    if (user.subjects.includes(subjectId)) {
      user.subjects = user.subjects.filter(
        (subject) => subject.toString() !== subjectId
      );
      await user.save();
    } else {
      return res
        .status(400)
        .json({ message: "User is not enrolled in this subject." });
    }

    // Update Class document to remove user
    const classToUpdate = await Class.findOne({ grade: user.grade, subject: subjectId });
    if (classToUpdate && classToUpdate.users.includes(userId)) {
      classToUpdate.users = classToUpdate.users.filter(
        (user) => user.toString() !== userId
      );
      await classToUpdate.save();
    }

    res.json({ message: "User unenrolled from subject successfully." });
  } catch (error) {
    console.error(`Failed to unenroll user ${userId} from subject ${subjectId}:`, error);
    res.status(500).json({ message: "Error unenrolling user from subject", error: error.message });
  }
};



const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id)
      .populate('term', 'name startDate endDate'); // <— populate batch info

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.password = undefined; // strip password
    res.json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Failed to fetch user profile" });
  }
};

const submitMarks = async (req, res) => {
  try {
    const {
      studentId,
      grade,
      subject,
      term,
      midTermMarks,
      finalTermMarks,
      comment = '' // optional
    } = req.body;

    // Optional: enforce 10-word limit in backend as well
    if (comment) {
      const wordCount = comment.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 10) {
        return res.status(400).json({
          success: false,
          message: 'Comment cannot exceed 10 words'
        });
      }
    }

    const newMarks = await Marks.create({
      student: new mongoose.Types.ObjectId(studentId),
      teacher: req.auth?._id, // or however you handle teacher
      grade,
      subject: new mongoose.Types.ObjectId(subject),
      term,
      midTermMarks,
      finalTermMarks,
      comment,
      createdAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: 'Marks submitted successfully',
      marks: newMarks
    });
  } catch (error) {
    console.error('Error in submitMarks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit marks',
      error: error.message
    });
  }
};

// PUT /auth/marks - Update existing marks record
const updateMarks = async (req, res) => {
  try {
    const {
      studentId,
      grade,
      subject,
      term,
      midTermMarks,
      finalTermMarks,
      comment = ''
    } = req.body;

    // Optional: enforce 10-word limit in backend as well
    if (comment) {
      const wordCount = comment.trim().split(/\s+/).filter(Boolean).length;
      if (wordCount > 10) {
        return res.status(400).json({
          success: false,
          message: 'Comment cannot exceed 10 words'
        });
      }
    }

    const filter = {
      student: new mongoose.Types.ObjectId(studentId),
      grade,
      subject: new mongoose.Types.ObjectId(subject),
      term
    };

    // Build update object conditionally (so we don't overwrite comment with empty string if not provided)
    const updateObj = {};
    if (typeof midTermMarks !== 'undefined') updateObj.midTermMarks = midTermMarks;
    if (typeof finalTermMarks !== 'undefined') updateObj.finalTermMarks = finalTermMarks;
    if (comment !== '') updateObj.comment = comment;

    const updated = await Marks.findOneAndUpdate(filter, updateObj, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Marks record not found.' });
    }

    return res.status(200).json({
      success: true,
      message: 'Marks updated successfully',
      marks: updated
    });
  } catch (error) {
    console.error('Error in updateMarks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update marks',
      error: error.message
    });
  }
};

// GET /auth/marks - Fetch marks for a specific student, grade, subject, term
const fetchMarks = async (req, res) => {
  try {
    const { studentId, grade, subject, term } = req.query;
    const filter = {};

    if (studentId) filter.student = new mongoose.Types.ObjectId(studentId);
    if (grade) filter.grade = grade;
    if (subject) filter.subject = new mongoose.Types.ObjectId(subject);
    if (term) filter.term = term;

    const marks = await Marks.find(filter)
      .populate('student', 'name')
      .populate('subject', 'name')
      .populate('teacher', 'name');

    return res.status(200).json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch marks',
      error: error.message
    });
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


const fetchUsersByGradeAndSubject = async (req, res) => {
  const { grade, subjectId } = req.params;
  try {
    // 1) Find the class object for this grade
    const classObj = await Class.findOne({ grade: grade });
    if (!classObj) {
      return res.status(404).json({ message: "No class found for this grade." });
    }

    // 2) Find users in that class who have subjectId in their "subjects" array
    const users = await User.find({
      classId: classObj._id,
      subjects: mongoose.Types.ObjectId(subjectId)
    }).populate('classId', 'grade');

    res.json(users);
  } catch (error) {
    console.error("Error in fetchUsersByGradeAndSubject:", error);
    res.status(500).json({
      message: "Failed to fetch users for the specified grade and subject.",
      error: error.message
    });
  }
};

const submitGrowthReport = async (req, res) => {
  try {
    // Expected payload: { studentId, grade, subject, term, personalDevelopment }
    const { studentId, grade, subject, term, personalDevelopment } = req.body;

    const newGrowthReport = await GrowthReport.create({
      student: studentId,
      teacher: req.auth._id,
      grade,
      subject: new mongoose.Types.ObjectId(subject),
      term,
      personalDevelopment,
      createdAt: new Date()
    });

    return res.status(200).json({
      success: true,
      message: "Growth report submitted successfully",
      growthReport: newGrowthReport
    });
  } catch (error) {
    console.error("Error in submitGrowthReport:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit growth report",
      error: error.message
    });
  }
};

// GET /auth/transcripts - Fetch marks & growth reports for transcript
const getTranscriptReports = async (req, res) => {
  try {
    const { term, grade, subject, studentName, studentId } = req.query;
    let marksFilter = {};
    let growthFilter = {};

    if (term) {
      marksFilter.term = term;
      growthFilter.term = term;
    }
    if (grade) {
      marksFilter.grade = grade;
      growthFilter.grade = grade;
    }
    if (subject) {
      marksFilter.subject = subject;
      growthFilter.subject = subject;
    }
    if (studentId) {
      marksFilter.student = studentId;
      growthFilter.student = studentId;
    }

    // Fetch marks and growth reports
    const marksReports = await Marks.find(marksFilter)
      .populate('student', 'name')
      .populate('subject', 'name')
      .populate('teacher', 'name');

    const growthReports = await GrowthReport.find(growthFilter)
      .populate('student', 'name')
      .populate('subject', 'name')
      .populate('teacher', 'name');

    // Optionally filter by studentName
    const filteredMarks = studentName
      ? marksReports.filter(report =>
          report.student &&
          report.student.name.toLowerCase().includes(studentName.toLowerCase())
        )
      : marksReports;

    const filteredGrowth = studentName
      ? growthReports.filter(report =>
          report.student &&
          report.student.name.toLowerCase().includes(studentName.toLowerCase())
        )
      : growthReports;

    return res.status(200).json({
      success: true,
      marksReports: filteredMarks,
      growthReports: filteredGrowth
    });
  } catch (error) {
    console.error('Error in getTranscriptReports:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transcript reports',
      error: error.message
    });
  }
};

const createUserByAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(password); // ✅ use helper

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      role: role.toLowerCase()
    });

    await user.save();

    user.password = undefined; // Hide password in response

    res.status(201).json({
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    console.error('Admin user creation failed:', error);
    res.status(500).json({
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

const getAllUsersAdmin = async (req, res) => {
  try {
    const {
      q,                // search by name or email
      role,             // 'student' | 'teacher' | 'admin'
      gradeLevel,       // e.g. 'Grade 1'
      section,          // e.g. 'B'
      term,             // term _id
      page = 1,
      limit = 25,
    } = req.query;

    const filter = {};

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    if (role && ['student', 'teacher', 'admin'].includes(role)) {
      filter.role = role;
    }

    if (gradeLevel) filter.gradeLevel = gradeLevel;
    if (section) filter.section = section;
    if (term) filter.term = term;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('name email role grade gradeLevel section term')
        .populate('term', 'name startDate endDate')
        .sort({ role: 1, name: 1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    return res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit) || 1),
    });
  } catch (err) {
    console.error('getAllUsersAdmin error:', err);
    return res.status(500).json({ message: 'Failed to load users' });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id?.trim();
    if (!userId) return res.status(400).json({ message: 'User id is required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 1) Pull this user from any Class.users
    await Class.updateMany(
      { users: user._id },
      { $pull: { users: user._id } }
    );

    // 2) Pull this user from any ClassSchedule.users
    await ClassSchedule.updateMany(
      { users: user._id },
      { $pull: { users: user._id } }
    );

    // 3) If user is a teacher, null out teacher fields in Class and ClassSchedule
    if (user.role === 'teacher') {
      await Class.updateMany(
        { teacher: user._id },
        { $set: { teacher: null } }
      );
      await ClassSchedule.updateMany(
        { teacher: user._id },
        { $set: { teacher: null } }
      );
    }

    // 4) Clean up notifications for that user (optional but tidy)
    await Notification.deleteMany({ user: user._id });

    // 5) Finally, delete the user
    await User.findByIdAndDelete(user._id);

    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('deleteUserById error:', err);
    return res.status(500).json({ message: 'Failed to delete user' });
  }
};

const createSectionAssignment = async (req, res) => {
  try {
    const { gradeLevel, section, term } = req.body;
    if (!gradeLevel || !section || !term) {
      return res.status(400).json({ message: 'gradeLevel, section, and term are required' });
    }

    const termExists = await Term.findById(term);
    if (!termExists) return res.status(404).json({ message: 'Selected term not found' });

    const doc = await SectionAssignment.create({ gradeLevel, section, term });
    const populated = await doc.populate('term', 'name startDate endDate');
    return res.status(201).json({ message: 'Section assigned to term', assignment: populated });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ message: 'This grade/section is already assigned to a term' });
    }
    console.error('createSectionAssignment error:', err);
    return res.status(500).json({ message: 'Failed to create section assignment' });
  }
};

// List assignments (optional filters: gradeLevel, term)
const getSectionAssignments = async (req, res) => {
  try {
    const { gradeLevel, term } = req.query;
    const q = {};
    if (gradeLevel) q.gradeLevel = gradeLevel;
    if (term) q.term = term;

    const assignments = await SectionAssignment
      .find(q)
      .sort({ gradeLevel: 1, section: 1 })
      .populate('term', 'name startDate endDate');

    res.json({ assignments });
  } catch (err) {
    console.error('getSectionAssignments error:', err);
    res.status(500).json({ message: 'Failed to fetch section assignments' });
  }
};

// Update assignment (usually change term)
const updateSectionAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { term } = req.body;
    if (!term) return res.status(400).json({ message: 'term is required' });

    const termExists = await Term.findById(term);
    if (!termExists) return res.status(404).json({ message: 'Selected term not found' });

    const updated = await SectionAssignment
      .findByIdAndUpdate(id, { $set: { term } }, { new: true })
      .populate('term', 'name startDate endDate');

    if (!updated) return res.status(404).json({ message: 'Section assignment not found' });

    res.json({ message: 'Assignment updated', assignment: updated });
  } catch (err) {
    console.error('updateSectionAssignment error:', err);
    res.status(500).json({ message: 'Failed to update assignment' });
  }
};

// Delete assignment (block if linked classes exist)
const deleteSectionAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await SectionAssignment.findById(id);
    if (!doc) return res.status(404).json({ message: 'Section assignment not found' });

    // If classes exist for this grade/section+term, block deletion
    const combinedGrade = `${doc.gradeLevel} - ${doc.section}`;
    const classExists = await Class.exists({ grade: combinedGrade, term: doc.term });
    if (classExists) {
      return res.status(400).json({
        message:
          'Cannot delete: classes exist for this section in this term. Remove classes first.',
      });
    }

    await SectionAssignment.findByIdAndDelete(id);
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error('deleteSectionAssignment error:', err);
    res.status(500).json({ message: 'Failed to delete assignment' });
  }
};

// Resolve the term for a given grade+section (helper API)
const resolveTermForSection = async (req, res) => {
  try {
    const { gradeLevel, section } = req.query;
    if (!gradeLevel || !section) {
      return res.status(400).json({ message: 'gradeLevel and section are required' });
    }
    const doc = await SectionAssignment
      .findOne({ gradeLevel, section })
      .populate('term', 'name startDate endDate');
    if (!doc) return res.status(404).json({ message: 'No term assigned for this section' });
    res.json({ assignment: doc });
  } catch (err) {
    console.error('resolveTermForSection error:', err);
    res.status(500).json({ message: 'Failed to resolve term for section' });
  }
};

const DEFAULT_SECTIONS_BY_GRADE = {
  'KG-1': ['A','B','C'],
  'KG-2': ['A','B','C'],
  'Grade 1': ['A','B','C','D','E'],
  'Grade 2': ['A','B','C','D','E'],
  'Grade 3': ['A','B','C','D','E'],
  'Grade 4': ['A','B','C','D','E'],
  'Grade 5': ['A','B','C','D','E'],
  'Grade 6': ['A','B','C','D','E'],
  'Grade 7': ['A','B','C'],
  'Grade 8': ['A','B','C'],
};

// Helper: if a grade isn’t in the map, fall back to a sensible default set
const getDefaultSectionsFor = (gradeLevel) =>
  DEFAULT_SECTIONS_BY_GRADE[gradeLevel] || ['A','B','C'];

const getSectionOptions = async (req, res) => {
  try {
    const { gradeLevel, term } = req.query;
    if (!gradeLevel || !term) {
      return res.status(400).json({ message: 'gradeLevel and term are required as query params' });
    }

    // Fetch all current assignments for this grade
    const assignments = await SectionAssignment.find({ gradeLevel }).lean();

    // Build a map: section -> termId that currently owns it
    const takenBy = {};
    for (const a of assignments) takenBy[a.section] = String(a.term);

    // Gather all term names for nicer display
    const uniqueTermIds = [...new Set(Object.values(takenBy))];
    const termDocs = uniqueTermIds.length
      ? await Term.find({ _id: { $in: uniqueTermIds } }, 'name').lean()
      : [];
    const termNameById = Object.fromEntries(termDocs.map(t => [String(t._id), t.name]));

    // Base set: defaults for this grade
    const baseSections = new Set(getDefaultSectionsFor(gradeLevel));

    // Also include any already-assigned section letters (even if not in defaults),
    // so the UI can show them as taken/owned.
    Object.keys(takenBy).forEach(sec => baseSections.add(sec));

    const sections = Array.from(baseSections).sort().map((name) => {
      const assignedTo = takenBy[name];              // term id or undefined
      if (!assignedTo) return { name, available: true };

      const isSameTerm = assignedTo === String(term);
      return {
        name,
        available: isSameTerm,                       // only available if already owned by THIS term
        assignedTermName: termNameById[assignedTo],  // e.g., "Jan 2025 - Dec 2025"
      };
    });

    return res.json({ sections });
  } catch (err) {
    console.error('getSectionOptions error:', err);
    return res.status(500).json({ message: 'Failed to load section options' });
  }
};

const listClasses = async (req, res) => {
  try {
    const {
      q, term, gradeLevel, section, subject, teacher, day,
      page = 1, limit = 25,
    } = req.query;

    const filter = { isArchived: { $ne: true } };

    if (term)   filter.term = new mongoose.Types.ObjectId(term);
    if (subject) filter.subject = new mongoose.Types.ObjectId(subject);
    if (teacher) filter.teacher = new mongoose.Types.ObjectId(teacher);
    if (gradeLevel && section) filter.grade = `${gradeLevel} - ${section}`;
    else if (gradeLevel) filter.grade = new RegExp(`^${gradeLevel}\\s*-`, 'i');

    if (day) filter.$or = [{ day }, { 'sessions.day': day }];

    if (q) {
      // search in grade or subject/teacher names
      filter.$and = [
        ...(filter.$and || []),
        {
          $or: [
            { grade: new RegExp(q, 'i') },
          ],
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [classes, total] = await Promise.all([
      Class.find(filter)
        .populate('term', 'name startDate endDate')
        .populate('subject', 'name')
        .populate('teacher', 'name')
        .populate('users', '_id') // so we can count
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Class.countDocuments(filter),
    ]);

    // if q also needs to match subject/teacher name, filter post-populate
    const filtered = q
      ? classes.filter(c =>
          (c.subject?.name || '').toLowerCase().includes(q.toLowerCase()) ||
          (c.teacher?.name || '').toLowerCase().includes(q.toLowerCase()) ||
          (c.grade || '').toLowerCase().includes(q.toLowerCase())
        )
      : classes;

    res.json({
      success: true,
      classes: filtered,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
    });
  } catch (err) {
    console.error('listClasses error:', err);
    res.status(500).json({ message: 'Failed to list classes' });
  }
};

const archiveClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { isArchived = true } = req.body;

    const cls = await Class.findByIdAndUpdate(
      id,
      { $set: { isArchived: !!isArchived } },
      { new: true }
    );

    if (!cls) return res.status(404).json({ message: 'Class not found' });

    res.json({ success: true, message: 'Class archived state updated', class: cls });
  } catch (e) {
    console.error('archiveClass error:', e);
    res.status(500).json({ message: 'Failed to update class archive state' });
  }
};

/**
 * DELETE /auth/admin/classes/:id
 * - Pull from users.classId if it matches
 * - Remove from ClassSchedule.users
 * - Delete the class
 */
const deleteClass = async (req, res) => {
  try {
    const { id } = req.params;

    const cls = await Class.findById(id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });

    // 1) Unset classId for users linked to this exact class
    await User.updateMany(
      { classId: cls._id },
      { $unset: { classId: '' } }
    );

    // 2) Pull from ClassSchedule.users (if you track per-class schedule users)
    if (ClassSchedule) {
      await ClassSchedule.updateMany(
        { classId: cls._id },
        { $pull: { users: { $in: cls.users || [] } } }
      );
    }

    // 3) Finally delete the class
    await Class.findByIdAndDelete(cls._id);

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (e) {
    console.error('deleteClass error:', e);
    res.status(500).json({ message: 'Failed to delete class' });
  }
};


module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController, getAllUsersAdmin, allUsersController, getAllThreads, userPress, getMessagesInThread, postMessageToThread, deleteConversation, muteConversation, resetPassword, requestPasswordReset, getStudentsByClassAndSubject, getTimetableForUser, getEvents, addEvent, submitAssignment, getAssignmentById, createAssignment, getClassIdByGrade, registerUserForSubject, getSubjects, getAllClasses, getSubjectsByClass, addOrUpdateStudent, createGrade, createSubject, setGradeForUser, getClassUsersByGrade, getUsersByGradeAndSubject, submitAttendance, getAttendanceData, getAttendanceDates, getAssignmentsForLoggedInUser, getNotifications, markNotificationAsRead, getUnreadNotificationsCount, getClassSchedulesForLoggedInUser, getAllTeachers, createTerms, getTerms, getTeacherData, logUser, deleteAssignment, getStudentAttendance, unenrollUserFromSubject, getUserProfile, submitMarks, getSubmissions, fetchUsersByGradeAndSubject, submitGrowthReport, showSubmissions, getTranscriptReports, fetchMarks, updateMarks, createUserByAdmin, deleteUserById, getTermById, updateTerm, deleteTerm, createSectionAssignment, getSectionAssignments, updateSectionAssignment, deleteSectionAssignment, resolveTermForSection, getSectionOptions, listClasses, archiveClass, deleteClass }




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





