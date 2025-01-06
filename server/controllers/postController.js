const Post = require("../models/postModel")
const Class = require('../models/classmodel')
const User = require("../models/userModel");

// Create Post
const createPostController = async (req, res) => {
  try {
    console.log("Request Body Received:", req.body); // Debug log

    const { description, grade, subject } = req.body;

    // Ensure description exists
    if (!description) {
      return res.status(400).json({ success: false, message: "Post description is required." });
    }

    // Fetch user role from the database
    const user = await User.findById(req.auth._id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    const isAdmin = user.role === "admin";

    // Validation for teacher posts
    if (!isAdmin && (!grade || !subject)) {
      return res.status(400).json({
        success: false,
        message: "Grade and Subject are required for teacher posts.",
      });
    }

    // Create the post
    const post = new Post({
      description,
      postedBy: req.auth._id,
      isAdminPost: isAdmin,
      grade: isAdmin ? undefined : grade,
      subject: isAdmin ? undefined : subject,
    });

    await post.save();
    console.log("Post Created:", post); // Debug log

    res.status(201).json({ success: true, message: "Post created successfully", post });
  } catch (error) {
    console.error("Error in createPostController:", error);
    res.status(500).json({ success: false, message: "Error creating post", error });
  }
};



//get all posts
const getAllPostsController = async (req, res) => {
  try {
    const posts = await Post
      .find()
      .populate("postedBy", "_id name profilePicture")
      .sort({ createdAt: -1 });
    res.status(200).send({
      success: true,
      message: "All Posts Data",
      posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error In GETALLPOSTS API",
      error,
    });
  }
};
  //get user posts
  const getUserPostsController = async (req, res) => {
    try {
      const userPosts = await Post.find({ postedBy: req.auth._id })
      .populate('postedBy', '_id name profilePicture');
      res.status(200).send({
        success: true,
        message: "user posts",
        userPosts,
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send({
        success: false,
        message: "Error in User POST API",
        error,
      });
    }
  };

  //delete post
  const deletePostController = async (req, res) =>{
try {
  const {id} = req.params
  await Post.findByIdAndDelete({ _id: id})
  res.status(200).send({
    success: true,
    message: "Your post has been deleted!"
  })
} catch (error) {
  console.log(error)
  res.status(500).send({
    success: false,
    message: "error in delete post api",
    error
  })
}
  }

// Update Post
const updatePostController = async (req, res) => {
  try {
    const { description } = req.body;
    //post find
    const post = await Post.findById({ _id: req.params.id });
    //validation
    if (!description) {
      return res.status(500).send({
        success: false,
        message: "Please Provide post title or description",
      });
    }
    const updatedPost = await Post.findByIdAndUpdate(
      { _id: req.params.id },
      {
       
        description: description || post?.description,
      },
      { new: true }
    );
    res.status(200).send({
      success: true,
      message: "Post Updated Successfully",
      updatedPost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in update post api",
      error,
    });
  }
};

const getAnnouncementsController = async (req, res) => {
  const { role, userId, grade, subjects } = req.query;

  try {
    const adminPosts = await Post.find({ isAdminPost: true })
      .populate("postedBy", "name profilePicture")
      .sort({ createdAt: -1 });

    let teacherPosts = [];
    if (role === "teacher") {
      teacherPosts = await Post.find({ postedBy: userId, isAdminPost: false })
        .populate("postedBy", "name profilePicture")
        .populate("subject", "name")
        .sort({ createdAt: -1 });
    } else if (role === "student") {
      teacherPosts = await Post.find({
        grade,
        subject: { $in: subjects },
        isAdminPost: false,
      })
        .populate("postedBy", "name profilePicture")
        .populate("subject", "name")
        .sort({ createdAt: -1 });
    }

    res.status(200).json({ adminPosts, teacherPosts });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    res.status(500).json({ message: "Error fetching announcements", error });
  }
};


const getTeacherDataController = async (req, res) => {
  try {
    const teacherId = req.params.id;
    const classes = await Class.find({ teacher: teacherId }).populate("subject");

    const grades = [...new Set(classes.map((cls) => cls.grade))];
    const gradeSubjectMap = {};

    classes.forEach((cls) => {
      if (!gradeSubjectMap[cls.grade]) {
        gradeSubjectMap[cls.grade] = [];
      }
      // Avoid duplicate subjects
      if (!gradeSubjectMap[cls.grade].some((subj) => subj._id.equals(cls.subject._id))) {
        gradeSubjectMap[cls.grade].push({
          _id: cls.subject._id,
          name: cls.subject.name,
        });
      }
    });

    res.json({ grades, gradeSubjectMap });
  } catch (error) {
    console.error("Error fetching teacher data:", error);
    res.status(500).send({ message: "Error fetching teacher data", error });
  }
};


module.exports = { createPostController, getAllPostsController, getUserPostsController, deletePostController, updatePostController, getAnnouncementsController, getTeacherDataController}