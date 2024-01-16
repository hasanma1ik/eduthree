const express = require('express');
const { 
    registerController,
     loginController,
     updateUserController,
     requireSignIn,
     searchController,
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
  

//export 
module.exports = router;