const express = require('express');

const upload = require('../config/uploadConfig')
const { 
    registerController,
     loginController,
     updateUserController,
     requireSignIn,
     getSubmissions,
     getUserProfile,
     searchController,
     getStudentAttendance,
     allUsersController,
     userPress,
     getAllThreads,
    //  getCurrentUser,
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
     addOrUpdateStudent,
     getStudentsByClass,
     createSubject,
     createGrade,
     getAllTeachers,
     submitAttendance,
     registerSubjectForStudent,
     unenrollUserFromSubject,
     setGradeForUser,
     getClassSchedulesForLoggedInUser,
     createTerms,
     getTerms,
     deleteAssignment,
     getTeacherData,
     logUser,
     fetchUsersByGradeAndSubject,
     submitGrades,
     submitMarks,
     updateMarks,
     fetchMarks,
     getProgressReports,
     submitGrowthReport,
     getTranscriptReports,
     showSubmissions
   
    
    
    
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
// router.get('/current-user', requireSignIn, getCurrentUser);

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
router.get('/attendance/student-attendance', getStudentAttendance);

// router to fetch timetable

// router.get('/timetable/:userId', getTimetableForUser);



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

// routes/assignmentRoutes.js
router.post('/submit-assignment', submitAssignment);

router.get('/submissions', getSubmissions);
router.get('/submission', showSubmissions);



// Route for creating a new assignment
router.post('/create-assignments',  requireSignIn, logUser, createAssignment);

// In your routes file
router.get('/assignments/:id', getAssignmentById)

router.get('/assignments', requireSignIn, logUser, getAssignmentsForLoggedInUser)


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
router.post( "/users/unenrollSubject", requireSignIn, logUser, unenrollUserFromSubject
);

router.post('/users/setGrade', setGradeForUser);
router.get('/class/grade/:grade/users', getClassUsersByGrade);

// fetches users from grade and that are enrolled in a particular subject
router.get('/class/grade/:grade/subject/:subjectId/users', getUsersByGradeAndSubject);

router.post('/attendance', submitAttendance);

router.get('/notifications', requireSignIn, getNotifications);
router.post('/notifications/:notificationId/mark-read', requireSignIn, markNotificationAsRead);
router.get('/notifications/unread-count', requireSignIn, getUnreadNotificationsCount);


router.get('/subjects', requireSignIn, logUser, getSubjects);
router.get('/attendance/:grade/:subject/dates', getAttendanceDates);
router.get('/attendance/:grade/:subject/:date', getAttendanceData);


router.get('/class-schedules/logged-in-user', requireSignIn, getClassSchedulesForLoggedInUser);


router.get('/teachers', getAllTeachers);


router.post('/terms', createTerms)
router.get('/terms', getTerms)
// Add this new route to userRoutes.js
router.get('/teacher/:id/data', requireSignIn, getTeacherData);



router.delete('/assignments/:assignmentId', requireSignIn, deleteAssignment);

router.get('/profile', requireSignIn, getUserProfile);



router.post('/marks', requireSignIn, submitMarks);

// Update marks
router.put('/marks', requireSignIn, updateMarks);

// Fetch marks
router.get('/marks', requireSignIn, fetchMarks);

// Route for fetching users by grade and subject
// Example URL: /class/grade/10/subject/60f1234567890abc12345678/users
router.get('/class/grade/:grade/subject/:subjectId/users', requireSignIn, fetchUsersByGradeAndSubject);
router.post('/growthreports', requireSignIn, submitGrowthReport);

router.get('/transcripts', requireSignIn, getTranscriptReports);

//export p
module.exports = router;