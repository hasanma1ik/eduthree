const express = require("express")
const { requireSignIn } = require("../controllers/userController");
const { createPostController, getAllPostsController, getUserPostsController, deletePostController, updatePostController, getAnnouncementsController, getTeacherDataController } = require("../controllers/postController");

//router object
const router = express.Router()

//Create Post || POST

router.post('/create-post', requireSignIn, createPostController)

//Get all Posts
router.get('/get-all-post', getAllPostsController)

//Get User Posts
router.get('/get-user-post', requireSignIn, getUserPostsController)

// Delete Post
router.delete('/delete-post/:id', requireSignIn, deletePostController)

//Update Post
router.put("/update-post/:id", requireSignIn, updatePostController)


router.get("/get-announcements", requireSignIn, getAnnouncementsController);

router.get("/teacher/:id/data", requireSignIn, getTeacherDataController);



//export

module.exports = router;