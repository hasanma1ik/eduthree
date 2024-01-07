const express = require("express")
const { requireSignIn } = require("../controllers/userController");
const { createPostController, getAllPostsController } = require("../controllers/postController");

//router object
const router = express.Router()

//Create Post || POST

router.post('/create-post', requireSignIn, createPostController)

//Get all Posts
router.get('/get-all-post', getAllPostsController)

//export

module.exports = router;