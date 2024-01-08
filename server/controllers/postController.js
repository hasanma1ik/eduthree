const postModel = require("../models/postModel")

const createPostController = async (req, res) =>{
    try{
        const {title, description} = req.body;
        //validate
        if(!title || !description){
            return res.status(500).send({
                success: false,
                message:'Please Provide All fields',
            })
        }
            const post = await postModel({
                title,
                description,
                postedBy: req.auth._id,
            }).save()

            res.status(201).send({
                success: true,
                message: 'Post created Successfully',
                post,
            })

            console.log(req)
    } catch (error){
        console.log(error)
        res.status(500).send({
            success: true,
            message:'Error in Create Post API',
            error
        })
    }
}
//get all posts
const getAllPostsController = async (req, res) => {
    try {
      const posts = await postModel
        .find()
        .populate("postedBy", "_id name")
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
  const getUserPostsController = async (req, res)=>{
    try {
      const userPosts = await postModel.find({ postedBy: req.auth._id})
      res.status(200).send({
        success: true,
        message: "user posts",
        userPosts,
      })
      
    } catch (error) {
      console.log(error)
      return res.status(500).send({
        success: false,
        message: "Error in User POST API",
        error,
      })
    }

  }


module.exports = { createPostController, getAllPostsController, getUserPostsController}