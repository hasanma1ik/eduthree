const express = require('express');

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
     getAttendanceDates,
     getAttendanceData,
     getAssignmentsForLoggedInUser,
     getStudentsByClassAndSubject,
     getTimetableForUser,
     addEvent,
     getEvents,
     submitAssignment,
     createAssignment,
     getAssignmentById,
     getSubjects,
     getClassIdByGrade,
     getClassUsersByGrade,
     getUsersByGradeAndSubject,
     registerUserForSubject,
     getNotifications,
     markNotificationAsRead,
     getUnreadNotificationsCount,
     getAllClasses,
     getUsersByClass,
     getSubjectsByClass,
    
     createClassAndSubject,
     addOrUpdateStudent,
     getStudentsByClass,
     createSubject,
     createGrade,
     getAllTeachers,
     submitAttendance,
     registerSubjectForStudent,
     setGradeForUser,
     getClassSchedules,
    
    
    
     } = require('../controllers/userController');
     


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

router.get('/users/:classId/:subjectId', getStudentsByClassAndSubject)

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

router.post('/submission', (req, res) => {
  console.log("Received submission:", req.body);
  submitAssignment(req, res);
});


// Route for creating a new assignment
router.post('/create-assignments', createAssignment);

// In your routes file
router.get('/assignments/:id', getAssignmentById)

router.get('/assignments',  requireSignIn, getAssignmentsForLoggedInUser)


// router.get('/users/class/:classId', getStudentsByClass);

// Inside your routes file
// router.get('/classes', getAllClasses);

router.get('/subjects/class/:classId', getSubjectsByClass);

// router.post('/classes', createClass)
// router.post('/subjects', createSubject)

router.post('/grades', createGrade);
router.post('/subjects', createSubject);

// Route to add or update a student
// router.post('/students/addOrUpdate', addOrUpdateStudent);

// router.get('/users/grade/:grade', getUsersByClass);

// router.post('/users/registerSubject', registerSubjectForStudent);


// Route to fetch students by grade
router.get('/class/grade/:grade', getClassIdByGrade);
// router.get('/users/class/:classId', getUsersByClassId);



// Route to register a student for a subject
router.post('/users/registerSubject', registerUserForSubject);
router.post('/users/setGrade', setGradeForUser);
router.get('/class/grade/:grade/users', getClassUsersByGrade);

// fetches users from grade and that are enrolled in a particular subject
router.get('/class/grade/:grade/subject/:subjectId/users', getUsersByGradeAndSubject);

router.post('/attendance', submitAttendance);

router.get('/notifications', requireSignIn, getNotifications);
router.post('/notifications/:notificationId/mark-read', requireSignIn, markNotificationAsRead);
router.get('/notifications/unread-count', requireSignIn, getUnreadNotificationsCount);


router.get('/subjects', getSubjects);
router.get('/attendance/:grade/:subject/dates', getAttendanceDates);
router.get('/attendance/:grade/:subject/:date', getAttendanceData);

router.get('/class-schedules', getClassSchedules);


router.get('/teachers', getAllTeachers);

//export p
module.exports = router;