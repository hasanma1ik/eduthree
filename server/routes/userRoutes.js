const express = require('express');
const { 
    registerController,
     loginController,
     updateUserController,
     requireSignIn,
     } = require('../controllers/userController');

//router object
const router = express.Router();

//routes
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

//UPDATE || PUT

router.put("/update-user", requireSignIn, updateUserController)

//export 
module.exports = router;