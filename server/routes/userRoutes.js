const express = require('express');
const { 
    registerController,
     loginController
     } = require('../controllers/userController');

//router object
const router = express.Router();

//routes
router.post("/register", registerController);

// LOGIN || POST
router.post("/login", loginController);

//export 
module.exports = router;