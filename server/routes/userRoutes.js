const express = require('express');
const multer = require('multer');
const upload = require('../config/uploadConfig')
const { 
    registerController,
     loginController,
     updateUserController,
     requireSignIn,
     searchController,
     allUsersController,
     userPress,
     getAllThreads,
     postMessageToThread,
     getMessagesInThread,
     deleteConversation,
     muteConversation,
     requestPasswordReset,
     resetPassword,
     markStudentAttendance,
     listStudentsInClass,
     getTimetableForUser,
     addEvent,
     getEvents,
     submitAssignment,
     createAssignment,
     getAssignmentById
    
    
     } = require('../controllers/userController');
     const path = require('path')
    //  const User = require('../models/userModel')
    const User = require('../models/userModel')
    const message = require('../models/messageModel')
    // const Event = require('../models/eventmodel')


const router = express.Router();

//routes
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

//UPDATE || PUT

router.put("/update-user", requireSignIn, updateUserController)

// Search users
router.get("/search", searchController)

// All Users
router.get("/all-users", allUsersController)
  
router.get('/threads', requireSignIn, getAllThreads); // Add this route
router.post('/threads', userPress);

router.get('/threads/:threadId', requireSignIn, getMessagesInThread);
router.post('/threads/:threadId/messages', postMessageToThread);

router.delete('/threads/:threadId', deleteConversation);
router.patch('/threads/:threadId/mute', muteConversation);

//password reset Routes
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)

// Route to list students in a class

router.get('/students/:classId', listStudentsInClass)
router.post('/attendance/mark', markStudentAttendance)

// router to fetch timetable

router.get('/timetable/:userId', getTimetableForUser);



// Route for fetching all events
router.get('/events', getEvents);
router.post('/events', addEvent);

// In your routes file
router.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    // Assuming the file's URL or path is accessible via req.file.path
    // You may need to adjust based on your storage setup
    res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

router.post('/submission', submitAssignment);



// Route for creating a new assignment
router.post('/create-assignments', createAssignment);

// In your routes file
router.get('/assignments/:id', getAssignmentById)

//export 
module.exports = router;