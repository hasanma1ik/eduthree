const express = require('express');
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
     
     } = require('../controllers/userController');

    //  const User = require('../models/userModel')
    const User = require('../models/userModel')
    const message = require('../models/messageModel')


//router object
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

router.get('/threads/:threadId', getMessagesInThread);
router.post('/threads/:threadId/messages', postMessageToThread);

router.delete('/threads/:threadId', deleteConversation);
router.patch('/threads/:threadId/mute', muteConversation);

//export 
module.exports = router;