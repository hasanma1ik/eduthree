const express = require('express');
const { 
    registerController,
     loginController,
     updateUserController,
     requireSignIn,
     searchController,
     allUsersController,
     createThread,
     getAllThreads
     } = require('../controllers/userController');

    //  const User = require('../models/userModel')
    const User = require('../models/userModel')

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
  
router.get('/threads', getAllThreads); // Add this route
router.post('/threads', createThread);

//export 
module.exports = router;