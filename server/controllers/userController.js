const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");

var {expressjwt:jwt} = require('express-jwt')
const Thread = require('../models/threadModel')
const Message = require('../models/messageModel')


//middleware

const requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: 'user'
}).unless({
  path: [
    // paths that don't require authentication
  ]
});

// Middleware to log the user object after JWT middleware


const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validation
    if (!name) {
      return res.status(400).send({
        success: false,
        message: "name is required",
      });
    }
    if (!email) {
      return res.status(400).send({
        success: false,
        message: "email is required",
      });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "password is required and 6 character long",
      });
    }
     //exisiting user
    const exisitingUser = await userModel.findOne({ email });
    if (exisitingUser) {
      return res.status(500).send({
        success: false,
        message: "User Already Register With This EMail",
      });
    }
     //hashed pasword
    const hashedPassword = await hashPassword(password);

    //save user
    const user = await userModel({
      name,
      email,
      password: hashedPassword,
    }).save();

  
    return res.status(201).send({
      success: true,
      message: "Registeration Successfull please login",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in Register API",
      error,
    });
  }
};

// Search Controller
const searchController = async (req, res) => {
  try {
    const { query } = req.params;
    const users = await userModel.find({
      $or: [
        { name: { $regex: new RegExp(query, 'i') } },
        { email: { $regex: new RegExp(query, 'i') } }
      ]
    });
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error searching users', error });
  }
};

// All Users
const allUsersController = async (req, res) => {
  try {
    const users = await userModel.find();
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Error fetching all users', error });
  }
};

  // Controller to get all message threads
  const getAllThreads = async (req, res) => {
    try {
      const userId = req.auth._id;

 // Assuming you have the user's ID from the request (e.g., from a JWT token)
  
      const threads = await Thread.find({ users: userId })
      .sort('-updatedAt')
        .populate({
          path: 'messages',
          options: { sort: { 'createdAt': -1 }},
          populate: { path: 'sender', model: 'User', select: 'name' }
        })
        .populate({
          path: 'users',
          match: { _id: { $ne: userId } },
          select: 'name'
        });
  
      res.status(200).json({ success: true, threads });
    } catch (error) {
      console.error('Error fetching threads:', error);
      res.status(500).json({ success: false, message: 'Error fetching threads', error });
    }
  };

  // Controller to create a new message thread
  const userPress = async(req, res) => {
    try {
      const { userId, otherUserId } = req.body; 

      // Check if a thread already exists between these two users
      let thread = await Thread.findOne({
        users: { $all: [userId, otherUserId] }
      });

      // If a thread does not exist, create a new one
      if (!thread) {
        thread = await Thread.create({ users: [userId, otherUserId] });
      }

      res.status(201).json({ success: true, thread });
    } catch (error){
      console.error('Error creating or fetching thread:', error);
      res.status(500).json({ success: false, error });
    }
}



const getMessagesInThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    console.log("Fetching messages for thread:", threadId);
    
    const thread = await Thread.findById(threadId).populate('messages');
    if (!thread) {
      console.log("Thread not found:", threadId);
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }
    console.log("Found messages:", thread.messages);
    res.status(200).json({ success: true, messages: thread.messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, message: 'Error fetching messages', error });
  }
};

const postMessageToThread = async (req, res) => {
  try {
      const { threadId } = req.params;
      const { text, senderId } = req.body; // Assuming you send text and sender's ID

      // Create a new message
      const newMessage = new Message({ text, sender: senderId, thread: threadId });
      await newMessage.save();

      // Add the message to the thread and update updatedAt
      await Thread.findByIdAndUpdate(threadId, 
          { 
              $push: { messages: newMessage._id },
              $set: { updatedAt: new Date() } // Update the updatedAt field to the current time
          },
          { new: true } // Return the updated document
      );

      res.status(201).json({ success: true, message: newMessage });
  } catch (error) {
      console.error('Error posting message:', error);
      res.status(500).json({ success: false, message: 'Error posting message', error });
  }
};

//Login

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(500).send({
        success: false,
        message: "Please Provide Email Or Password",
      });
    }
    // find user
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(500).send({
        success: false,
        message: "User Not Found",
      });
    }
   //match password
   const match = await comparePassword(password, user.password);
   if (!match) {
     return res.status(500).send({
       success: false,
       message: "Invalid username or password",
     });
   }


//TOKEN JWT
const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "27d",
});



// undeinfed password
user.password = undefined;
res.status(200).send({
  success: true,
  message: "login successfully",
  token,
  user,
});
} catch (error) {
console.log(error);
return res.status(500).send({
  success: false,
  message: "error in login api",
  error,
});
}
};


//Update User
const updateUserController = async (req, res) =>{
            try {
              const {name, password, email} = req.body
              
              //User Find
              const user = await userModel.findOne({email})

              //password validatation
              if(password && password.length < 6){
                return res.status(400).send({
                  success: false,
                  message: "Password required and must be atleast 6 characters"
                })
              }

             const hashedPassword = password ? await hashPassword(password): undefined;

             // updated user
             const updatedUser = await userModel.findOneAndUpdate({email}, {
              name : name || user.name,
              password: hashedPassword || user.password,
             }, {new: true})

             updatedUser.password = undefined;

             res.status(200).send({
              success: true,
              message: 'Profile updated, Please Login',
              updatedUser,
             })

            } catch (error) {
              console.log(error)
              res.status(500).send({
                success: false,
                message: 'Error in User Update API'
              })
            }
}

const deleteConversation = async (req, res) => {
  try {
    const { threadId } = req.params;
    
    // Delete the conversation
    await Thread.findByIdAndDelete(threadId);

    // Also delete all messages associated with this conversation
    await Message.deleteMany({ thread: threadId });


    res.status(200).json({ message: 'Conversation and all related messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ message: 'Failed to delete conversation', error: error.message });
  }
};

const muteConversation = async (req, res) => {
  try {
      const { threadId } = req.params;
      // Update conversation to set it as muted
      await Thread.findByIdAndUpdate(threadId, { isMuted: true });
      res.status(200).json({ message: 'Conversation muted successfully' });
  } catch (error) {
      console.error('Error muting conversation:', error);
      res.status(500).json({ message: 'Failed to mute conversation' });
  }
};



module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController, allUsersController, getAllThreads, userPress, getMessagesInThread, postMessageToThread, deleteConversation, muteConversation }






