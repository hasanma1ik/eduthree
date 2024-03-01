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

 const User = require('../models/userModel')
const Class = require('../models/classmodel')
const Subject = require('../models/subjectmodel')



//middleware

const requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: 'auth'  // Now attaches decoded token payload to req.auth
});


// Middleware to log the user object after JWT middleware


const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "password is required and 6 character long",
      });
    }
     //exisiting user
    const exisitingUser = await User.findOne({ email });
    if (exisitingUser) {
      return res.status(500).send({
        success: false,
        message: "User Already Register With This EMail",
      });
    }
     //hashed pasword
    const hashedPassword = await hashPassword(password);

    //save user
    const user = await User({
      name,
      email,
      password: hashedPassword,
    }).save();

  
    return res.status(201).send({
      success: true,
      message: "Registeration Successfull please login",
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
const updateUserController = async (req, res) =>{
            try {
              const {name, password, email} = req.body
              
              //User Find
              const user = await userModel.findOne({email})

              //password validatation
              if(password && password.length < 6){
                return res.status(400).send({
                  success: false,
                  message: "Password required and must be atleast 6 characters"
                })
              }

             const hashedPassword = password ? await hashPassword(password): undefined;

             // updated user
             const updatedUser = await userModel.findOneAndUpdate({email}, {
              name : name || user.name,
              password: hashedPassword || user.password,
             }, {new: true})

             updatedUser.password = undefined;

             res.status(200).send({
              success: true,
              message: 'Profile updated, Please Login',
              updatedUser,
             })

            } catch (error) {
              console.log(error)
              res.status(500).send({
                success: false,
                message: 'Error in User Update API'
              })
            }
}

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
  const { grade } = req.body;

  try {
    const existingGrade = await Class.findOne({ grade });
    if (existingGrade) {
      return res.status(400).json({ message: 'Grade already exists' });
    }

    const newGrade = new Class({ grade });
    await newGrade.save();
    res.status(201).json({ message: 'Grade created successfully', grade: newGrade });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create grade', error: error.message });
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

// Assuming you have a route like "/auth/users/grade/:grade"
// const getUsersByClass = async (req, res) => {
//   try {
//     const users = await User.find({ grade: req.params.grade });
//     res.json(users);
// } catch (error) {
//     res.status(500).send("Server error");
// }
// }

// const registerSubjectForStudent = async (req, res) => {
//   try {
//     const { email, subjectId } = req.body; // Assuming you're passing the subject's ID
//     const subject = await Subject.findById(subjectId);
//     if (!subject) {
//         return res.status(404).send("Subject not found");
//     }
//     const user = await User.findOneAndUpdate(
//         { email: email },
//         { $addToSet: { subjects: subjectId } }, // Prevents adding duplicate subject IDs
//         { new: true }
//     );
//     res.json(user);
// } catch (error) {
//     res.status(500).send("Server error");
// }
// }

const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({});
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects', error: error.message });
  }
};
const getUsersByGrade = async (req, res) => {
  try {
    const users = await User.find({ grade: req.params.grade });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch students', error: error.message });
  }
};

const registerStudentForSubject = async (req, res) => {
  const { userId, subjectId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user.subjects.includes(subjectId)) {
      user.subjects.push(subjectId);
      await user.save();
      res.json({ message: "Student registered for subject successfully" });
    } else {
      res.status(400).json({ message: "Student already registered for this subject" });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to register student for subject', error: error.message });
  }
};



const markStudentAttendance = async (req, res) => {
  try {
    const { userId, classId, status } = req.body;
    const newAttendanceRecord = new AttendanceRecord({
      userId,
      classId,
      date: new Date(),
      status,
    });

    await newAttendanceRecord.save();
    res.status(201).json({ message: 'Attendance marked successfully', data: newAttendanceRecord });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
};

const getStudentsByClassAndSubject = async (req, res) => {
  const { classId, subjectId } = req.params;

  try {
    const students = await User.find({
      classId: classId,
      subjects: { $in: [subjectId] }, // This line is crucial
    }).populate('subjects'); // Optional, if you want to return subject details

    res.json(students);
  } catch (error) {
    console.error("Failed to fetch students:", error);
    res.status(500).send({ message: "Failed to fetch students", error: error.message });
  }
};

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
    const { title, description, dueDate, files } = req.body;

   
    // Create a new assignment document
    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      files
    });
  // Save the assignment to the database
  await newAssignment.save();

  // Respond with the created assignment
  res.status(201).json({
    message: 'Assignment created successfully',
    assignment: newAssignment
  });
} catch (error) {
  res.status(500).json({
    message: 'Failed to create assignment',
    error: error.message
  });
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
      .exec();
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignment', error: error.message });
  }
};

// const getStudentsByGrade = async (req, res) => {
//   try {
//     const { grade } = req.query;
//     const students = await User.find({ classId: grade });
//     res.json(students);
//   } catch (error) {
//     res.status(500).send({ message: "Failed to fetch students", error: error.message });
//   }
// };


module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController, allUsersController, getAllThreads, userPress, getMessagesInThread, postMessageToThread, deleteConversation, muteConversation, resetPassword, requestPasswordReset, getStudentsByClassAndSubject, getTimetableForUser, getEvents, addEvent, submitAssignment, getAssignmentById, createAssignment, markStudentAttendance, getSubjects, getUsersByGrade, registerStudentForSubject, getAllClasses, getSubjectsByClass, addOrUpdateStudent, createGrade, createSubject }






