```js
const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");

var {expressjwt:jwt} = require('express-jwt')
const Thread = require('../models/threadModel')
const Message = require('../models/messageModel')

//middleware

const requireSignIn = jwt({
  secret: process.env.JWT_SECRET, algorithms: ["HS256"],  
  
})

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
        .populate({
          path: 'messages',
          options: { sort: { 'createdAt': -1 }, limit: 1 },
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
  
      // Add the message to the thread
      await Thread.findByIdAndUpdate(threadId, { $push: { messages: newMessage._id } });
  
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
const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
  expiresIn: "27d",
});



// undeinfed password
user.password = undefined;
res.status(200).send({
  success: true,
  message: "login successfully",
  token,
  user: userData,
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


module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController, allUsersController, getAllThreads, userPress, getMessagesInThread, postMessageToThread }




//Token Check
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            const storedData = await AsyncStorage.getItem('@auth');
            if (storedData) {
                const { user, token } = JSON.parse(storedData);
                if (token && isTokenExpired(token)) {
                    console.log('Token has expired.');
                    setCurrentUser(null);
                    // Additional logic for expired token (e.g., navigate to login)
                } else {
                    setCurrentUser(user);
                }
            }
        };
        loadUserData();
    }, []);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);

const isTokenExpired = (token) => {
  try {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload); // Base64 decode
    const { exp } = JSON.parse(decodedPayload);

    const currentTime = Date.now() / 1000; // Convert to seconds
    return exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if there's an error
  }
};

// Example usage
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NTk1NmZjM2NjZjliOTJkYTA0OTNkODYiLCJpYXQiOjE3MDY3MTQ3MzUsImV4cCI6MTcwOTA0NzUzNX0.1VkhUsmrEkeCkYvDeJPfjeCbNvVPkTU_Cas600W1-JM';
const expired = isTokenExpired(token);
console.log(expired ? 'Token is expired' : 'Token is valid');



// Last message functionality 

const renderThread = ({ item }) => {
  
  console.log("Thread item:", item);
    if (!currentUser || !currentUser._id) {
        console.error('Current user data is not available');
        return null;
    }

    const otherUser = item.users.find(user => user._id !== currentUser._id) || {};
    const lastMessageText = item.messages[0]?.text || 'No messages';

    console.log("Other User in Thread:", otherUser.name);
    console.log("Last Message Text:", lastMessageText);

    return (
        <TouchableOpacity onPress={() => handleThreadPress(item)}>
            <View style={styles.threadContainer}>
                <Text style={styles.userName}>{otherUser.name || 'Unknown User'}</Text>
                <Text style={styles.lastMessage}>{lastMessageText}</Text>
            </View>
        </TouchableOpacity>
    );
};


 // Controller to get all message threads
  const getAllThreads = async (req, res) => {
    try {
      const userId = req.auth._id;

 // Assuming you have the user's ID from the request (e.g., from a JWT token)
  
      const threads = await Thread.find({ users: userId })
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

  const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
var {expressjwt:jwt} = require('express-jwt')
const Thread = require('../models/threadModel')
const Message = require('../models/messageModel')




//middleware

const requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: 'user'  // This should attach the decoded token payload to req.user
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

    // Assuming req.user is set by your authentication middleware and contains the current user's ID
    const userId = req.auth._id; 

    // Fetch the thread and populate both the messages and the sender of each message
    const thread = await Thread.findById(threadId)
      .populate({
        path: 'messages',
        populate: {
          path: 'sender', // Ensure this path matches your Message schema's reference to the User
          model: 'User' // Ensure this model name matches your User model
        }
      });

    if (!thread) {
      console.log("Thread not found:", threadId);
      return res.status(404).json({ success: false, message: 'Thread not found' });
    }

    // Iterate over thread.messages to add the 'sentByMe' property based on the sender's ID
    const messagesWithSenderInfo = thread.messages.map(message => {
      const senderId = message.sender?._id.toString(); // Using optional chaining for safety
      const isSentByMe = senderId === userId.toString();
      return {
        ...message.toObject(), // Convert the Mongoose document to a plain object
        sentByMe: isSentByMe,
      };
    });

    console.log("Processed messages with 'sentByMe':", messagesWithSenderInfo);
    res.status(200).json({ success: true, messages: messagesWithSenderInfo });
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

const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  
  if (!user) {
    return res.status(404).send({ message: 'User not found' });
  }
  
  // Generate a reset token
  const resetToken = crypto.randomBytes(20).toString('hex');
  // Token expiry time (e.g., 1 hour)
  const resetTokenExpire = Date.now() + 3600000; 

  await userModel.updateOne({ _id: user._id }, {
    resetPasswordToken: resetToken,
    resetPasswordExpires: resetTokenExpire
  });

  // Send the email
  const transporter = nodemailer.createTransport({  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }});
  const resetUrl = `http://localhost:8080/api/v1/reset-password/${resetToken}`;

  await transporter.sendMail({
    to: user.email,
    subject: 'Password Reset Request',
    text: `Please click on the following link to reset your password: ${resetUrl}`
  });

// txke auyf laok glpi


  res.send({ message: 'Password reset email sent.' });
};

const resetPassword = async(req, res) =>{
  const { token, newPassword } = req.body;
  const user = await userModel.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now ()}
  })
  if(!user){
    return res.status(400).send({message: 'Password reset token is invalid or has expired'})
  }
try {

  user.password = await hashPassword(newPassword)
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()
  res.send({ message: 'Your password has been updated'})
} catch (error){
  res.status(500).send({ message: 'Error updating password', error: error.message})
}
}

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



module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController, allUsersController, getAllThreads, userPress, getMessagesInThread, postMessageToThread, deleteConversation, muteConversation, resetPassword, requestPasswordReset }








  //added a timestamp in messageModel/schema


  

  // set up requestpasswordrest and resetPassword functionalities in userController
  //set up their routes in userRoutes



// setting up forgetpassword functionality and screen
// 1- set up forgetPassword functionality 
// 2- userRoute set up
// 3- forgetPassword button in login page
//4 - stack screen and stack navigator for forget password 



// have notifications on my main tab,



import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';


const Assignments = ({ route }) => {
  const { assignmentId } = route.params;
  const [assignment, setAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState('');


  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const response = await axios.get(`auth/assignments/${assignmentId}`);
        setAssignment(response.data);
      } catch (error) {
        console.error(error.response ? error.response.data : error.message);
        Alert.alert("Error", error.response ? error.response.data.message : "Failed to fetch assignment details");
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const selectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*', // or specific MIME type
      });
  
      if (result.canceled) {
        console.log('Document selection was cancelled.');
        Alert.alert('Cancelled', 'Document selection was cancelled.');
        return;
      }
  
      console.log('Selected file', result);
      // Assuming you're interested in the first selected file
      const selectedFile = result.assets ? result.assets[0] : null;
      if (selectedFile) {
        setFile(selectedFile);
      } else {
        Alert.alert('Error', 'No file selected');
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'An error occurred while picking the document.');
    }
  };
  

  const uploadFile = async () => {
    if (!file) {
      Alert.alert("Error", "Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name,
      type: '*/*', // or the actual type of the file
    });

    setUploading(true);

    try {
      const response = await axios.post('auth/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploading(false);
      setFileUrl(response.data.filePath); 
      Alert.alert("Upload Successful", `File uploaded successfully: ${response.data.filePath}`);
      // You can now use response.data.filePath in your assignment submission
    } catch (err) {
      setUploading(false);
      Alert.alert("Upload Failed", "The file upload failed.");
      console.error(err);
    }
  };

  // This function now just alerts the user to upload a file
  const handleSubmit = async () => {
    if (!file) {
      Alert.alert("Error", "Please upload a file first");
      return;
    }

    // Upload the file first
  await uploadFile(); // Make sure this function sets the fileUrl state upon success

  // Check if the file URL is set
  if (!fileUrl) {
    Alert.alert("Error", "File upload failed or no file URL available");
    return;
  }
  
    // Assuming studentId is obtained from your auth context or passed in some way
    const userId = req.auth._id; ; // Replace this with actual logic to obtain studentId
  
    try {
      // Prepare the submission data
      const submissionData = {
        assignmentId: assignmentId,
      userId: userId,
      fileUrl: fileUrl, // Use the file URL obtained from the upload process
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      };
  
      // Send a POST request to your backend endpoint
      const response = await axios.post('/auth/submission', submissionData);
  
      // Check the response status and act accordingly
      if (response.status === 201) {
        Alert.alert("Success", "Assignment submitted successfully.");
      } else {
        // Handle any other status codes as needed
        Alert.alert("Error", "Failed to submit assignment.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to submit assignment: " + error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{assignment ? assignment.name : 'Loading...'}</Text>
      <Button title="Select File" onPress={selectFile} />
      {file && <Text>File selected: {file.name}</Text>}
      <Button title={uploading ? "Uploading..." : "Upload File"} onPress={uploadFile} disabled={uploading} />
      <Button title="Submit Assignment" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default Assignments;





const express = require('express');

const upload = require('../config/uploadConfig')
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
     requestPasswordReset,
     resetPassword,
     markStudentAttendance,
     listStudentsInClass,
     getTimetableForUser,
     addEvent,
     getEvents,
     submitAssignment,
     createAssignment,
     getAssignmentById
    
    
     } = require('../controllers/userController');
     


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

router.get('/threads/:threadId', requireSignIn, getMessagesInThread);
router.post('/threads/:threadId/messages', postMessageToThread);

router.delete('/threads/:threadId', deleteConversation);
router.patch('/threads/:threadId/mute', muteConversation);

//password reset Routes
router.post('/request-password-reset', requestPasswordReset)
router.post('/reset-password', resetPassword)

// Route to list students in a class

router.get('/students/:classId', listStudentsInClass)
router.post('/attendance/mark', markStudentAttendance)

// router to fetch timetable

router.get('/timetable/:userId', getTimetableForUser);



// Route for fetching all events
router.get('/events', getEvents);
router.post('/events', addEvent);

// In your routes file
router.post('/upload', upload.single('file'), (req, res) => {
  if (req.file) {
    // Assuming the file's URL or path is accessible via req.file.path
    // You may need to adjust based on your storage setup
    res.status(200).json({ message: 'File uploaded successfully', filePath: req.file.path });
  } else {
    res.status(400).json({ message: 'No file uploaded' });
  }
});

router.post('/submission', submitAssignment);





import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Picker, StyleSheet, Alert } from 'react-native';
import axios from 'axios';


const CreateClasses = ({ navigation }) => {
  const [className, setClassName] = useState('');
  const [grade, setGrade] = useState('');
  const [subjectName, setSubjectName] = useState('')
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/auth/classes');
      setClasses(response.data);
      if (response.data.length > 0) {
        setSelectedClass(response.data[0]._id);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch classes");
    }
  };

  const createClass = async () => {
    try {
      const response = await axios.post('/auth/classes', { name: className, grade });
      setClasses([...classes, response.data]);
      setClassName('');
      setGrade('');
      Alert.alert("Success", "Class created successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to create class");
    }
  };
  const createSubject = async () => {
    try {
      await axios.post('/auth/subjects', { name: subjectName, classId: selectedClass });
      setSubjectName('');
      Alert.alert("Success", "Subject created successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to create subject");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Class Name"
        value={className}
        onChangeText={setClassName}
        style={styles.input}
      />
      <TextInput
        placeholder="Grade"
        value={grade}
        onChangeText={setGrade}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Create Class" onPress={createClass} />

      <TextInput
        placeholder="Subject Name"
        value={subjectName}
        onChangeText={setSubjectName}
        style={styles.input}
      />
      <Picker
        selectedValue={selectedClass}
        onValueChange={(itemValue) => setSelectedClass(itemValue)}
        style={styles.picker}>
        {classes.map((cls) => (
          <Picker.Item label={cls.name} value={cls._id} key={cls._id} />
        ))}
      </Picker>
      <Button title="Create Subject" onPress={createSubject} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  picker: {
    marginBottom: 20,
  },
});

export default CreateClasses




const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { marginBottom: 10, borderWidth: 1, borderColor: 'gray', borderRadius: 5, padding: 10 },
  picker: { marginBottom: 20, borderWidth: 1, borderColor: 'gray', borderRadius: 5 },
});
const result = await User.updateMany({}, { $set: { subjects: [] } });






import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const StudentForm = ({}) => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [users, setUsers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState(['English Literature', 'History']);

  useEffect(() => {
   const fetchSubjects = async () => {
  try {
    const response = await axios.get(`/auth/subjects/byGrade/${selectedGrade}`);
    // Assuming the response directly contains an array of subjects
    // Adjust this line based on your actual response structure
    setSubjects(response.data || []); // Fallback to an empty array if undefined
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    setSubjects([]); // Ensure subjects is set to an empty array on error
  }
};

    fetchStudents();
  }, [selectedGrade]);

  const handleSubmit = async () => {
    try {
      await axios.post('/auth/users/registerSubject', {
        userId: selectedStudent,
        subject: selectedSubject, // Ensure this matches backend expectation (name vs. ID)
      });
      alert('Subject registered successfully!');
    } catch (error) {
      alert(`Failed to register subject: ${error.response ? error.response.data.error : 'Unknown error'}`);
    }
  };

  // Moved inside the component for clarity
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={(itemValue, itemIndex) => setSelectedGrade(itemValue)}
        style={styles.picker}>
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedStudent}
        onValueChange={(itemValue, itemIndex) => setSelectedStudent(itemValue)}
        style={styles.picker}>
        {users.map((user, index) => (
          <Picker.Item key={index} label={user.name} value={user._id} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue, itemIndex) => setSelectedSubject(itemValue)}
        style={styles.picker}>
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>

      <Button title="Register for Subject" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  picker: { marginBottom: 20, borderWidth: 1, borderColor: 'gray', borderRadius: 5 },
});

export default StudentForm;















import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';


const CreateClasses = ({ navigation }) => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [selectedSubject, setSelectedSubject] = useState('Math');
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await axios.get('/auth/classes');
      setClasses(response.data);
      // Assuming response.data is an array of classes
      // No setSelectedClass here since it's not defined in your component
    } catch (error) {
      console.error(error); // Log the error for debugging
      Alert.alert("Error", "Failed to fetch classes");
    }
  };
  


  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']; // Extend this list as needed
  const subjects = ['Math', 'Science', 'Islamiat', 'History', 'English Language', 'English Literature', 'Urdu']; // Extend this list as needed


  const createClassAndSubject = async () => {
    if (selectedGrade === "Please select a grade" || selectedSubject === "Please select a subject") {
      Alert.alert("Validation Error", "Please select both a grade and a subject");
      return;
    }
    try {
      // Assuming your backend can handle these parameters directly
      // You might need to adjust the payload structure according to your backend implementation
      await axios.post('/auth/classesAndSubjects', {
        grade: selectedGrade,
        subject: selectedSubject
      });
      Alert.alert("Success", "Class and Subject created successfully");
      // Optionally, fetch classes again to refresh the list
    } catch (error) {
      console.log(error); // Log the error for debugging
      Alert.alert("Error", "Failed to create class and subject");
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={(itemValue, itemIndex) => setSelectedGrade(itemValue)}
        style={styles.picker}>
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>
      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue, itemIndex) => setSelectedSubject(itemValue)}
        style={styles.picker}>
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>
      <Button title="Create Class and Subject" onPress={createClassAndSubject} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});

export default CreateClasses;



const createClassAndSubject = async (req, res) => {
  const { grade, subject } = req.body;

  try {
    // Check if the class for the selected grade already exists
    let classForGrade = await Class.findOne({ grade });

    if (!classForGrade) {
      // If not, create a new class with the selected grade
      classForGrade = new Class({ grade });
      await classForGrade.save();
    }

    // Check if the subject already exists for the class
    const subjectExists = await Subject.findOne({ name: subject, classId: classForGrade._id });

    if (subjectExists) {
      // If the subject already exists, respond indicating no new subject was created
      return res.status(200).json({
        message: 'Subject already exists for this class',
        class: classForGrade,
        subject: subjectExists,
        subjectCreated: false,
        subjectExists: true,
      });
    }

    // Since subjectExists check passed, create a new subject
    const newSubject = new Subject({ name: subject, classId: classForGrade._id });
    await newSubject.save();

    // Add the subject's ObjectId to the class's subjects array
    classForGrade.subjects.push(newSubject._id);
    await classForGrade.save();

    res.status(201).json({
      message: 'New class and subject created/updated successfully',
      class: classForGrade,
      subject: newSubject, // Include the newly created subject in the response
      subjectCreated: true,
      subjectExists: false,
    });
  } catch (error) {
    console.error('Failed to create or update class and subject:', error);
    res.status(500).json({ message: 'Failed to create or update class and subject', error: error.message });
  }
};






import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const StudentForm = ({}) => {
  const [selectedGrade, setSelectedGrade] = useState('Grade 1');
  const [users, setUsers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState(['English Literature', 'History']);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await axios.get(`/auth/users/grade/${selectedGrade}`);
        setUsers(response.data);
        setSelectedStudent(response.data[0]?._id || '');
      } catch (error) {
        console.error("Failed to fetch students:", error.response ? error.response.data : error.message);
      }
    };

    fetchStudents();
  }, [selectedGrade]);

  const handleSubmit = async () => {
    try {
      await axios.post('/auth/users/registerSubject', {
        userId: selectedStudent,
        subject: selectedSubject, // Ensure this matches backend expectation (name vs. ID)
      });
      alert('Subject registered successfully!');
    } catch (error) {
      alert(`Failed to register subject: ${error.response ? error.response.data.error : 'Unknown error'}`);
    }
  };

  // Moved inside the component for clarity
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={(itemValue, itemIndex) => setSelectedGrade(itemValue)}
        style={styles.picker}>
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedStudent}
        onValueChange={(itemValue, itemIndex) => setSelectedStudent(itemValue)}
        style={styles.picker}>
        {users.map((user, index) => (
          <Picker.Item key={index} label={user.name} value={user._id} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue, itemIndex) => setSelectedSubject(itemValue)}
        style={styles.picker}>
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>

      <Button title="Register for Subject" onPress={handleSubmit} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  picker: { marginBottom: 20, borderWidth: 1, borderColor: 'gray', borderRadius: 5 },
});

export default StudentForm;


// see how in messages users were fetched






import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert} from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';


const StudentForm = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3']); // Example grades
  const [subjects, setSubjects] = useState([]); // Subjects will be fetched from the backend
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchStudentsByGrade(selectedGrade);
    }
  }, [selectedGrade]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch subjects");
    }
  };

  const fetchStudentsByGrade = async (grade) => {
    try {
      const response = await axios.get(`/auth/users/grade/${grade}`);
      setStudents(response.data.users);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch students");
    }
  };

  const registerStudentForSubject = async (userId) => {
    try {
      await axios.post('/auth/users/registerSubject', { userId, subjectId: selectedSubject });
      Alert.alert("Success", "Student registered for subject successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to register student for subject");
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={(itemValue) => setSelectedGrade(itemValue)}>
        {grades.map((grade) => 
        <Picker.Item label={grade} value={grade} key={grade} style={styles.pickerItem} />)}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={(itemValue) => setSelectedSubject(itemValue)}>
        {subjects.map((subject) => 
        <Picker.Item label={subject.name} value={subject._id} key={subject._id} style={styles.pickerItem} />)}
      </Picker>

      {students.map((student) => (
        <View key={student._id}>
          <Button title={`Register ${student.name} for Selected Subject`} onPress={() => registerStudentForSubject(student._id)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  pickerItem: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default StudentForm;





import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const StudentForm = () => {
  const [grades, setGrades] = useState(['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8']);
  const [subjects, setSubjects] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedGrade) {
      fetchUsersByGrade(selectedGrade);
    }
  }, [selectedGrade]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/auth/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch subjects: " + error.message);
    }
  };

  const fetchUsersByGrade = async (grade) => {
    try {
      const response = await axios.get(`/auth/users/grade/${grade}`);
      setUsers(response.data); // Assuming the backend sends the users array directly
    } catch (error) {
      Alert.alert("Error", "Failed to fetch users: " + error.message);
    }
  };

  const registerUserForSubject = async (userId) => {
    try {
      await axios.post('/auth/users/registerSubject', { userId, subjectId: selectedSubject });
      Alert.alert("Success", "User registered for subject successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to register user for subject: " + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={setSelectedGrade}>
        {grades.map((grade, index) => (
          <Picker.Item label={grade} value={grade} key={index} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}>
        {subjects.map((subject, index) => (
          <Picker.Item label={subject.name} value={subject._id} key={index} />
        ))}
      </Picker>

      {users.map((user) => (
        <View key={user._id} style={styles.userContainer}>
          <Button title={`Register ${user.name} for Selected Subject`} onPress={() => registerUserForSubject(user._id)} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  userContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default StudentForm



import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

const GradeSetter = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [grade, setGrade] = useState('');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get('/auth/all-users');
        setUsers(response.data.users);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async () => {
    try {
      await axios.post('/auth/users/setGrade', { userId: selectedUserId, grade });
      Alert.alert('Success', 'Grade updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to set grade');
    }
  };

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedUserId}
        onValueChange={(itemValue) => setSelectedUserId(itemValue)}
      >
        <Picker.Item label="Select a user" value="" style={styles.picker} />
        {users.map((user) => (
          <Picker.Item key={user._id} label={user.name} value={user._id} style={styles.picker} />
        ))}
      </Picker>
      <Picker
        selectedValue={grade}
        onValueChange={(itemValue) => setGrade(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a grade" value="" style={styles.picker} />
        {grades.map((g) => (
          <Picker.Item key={g} label={g} value={g} style={styles.picker} />
        ))}
      </Picker>
      <Button title="Set Grade" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    height: 150,
    width: 150,
    fontSize: 20,

   

  },
});

export default GradeSetter;



const getAttendanceData = async (req, res) => {
  try {
    const { date, grade, subject } = req.params;
    const attendanceRecords = await AttendanceRecord.find({ date, grade, subject });

    // Extract userIds and fetch corresponding user names
    const userIds = attendanceRecords.map(record => record.attendance.map(a => a.userId)).flat();
    const users = await User.find({ '_id': { $in: userIds } }, 'name');
    const userNameMap = users.reduce((acc, user) => ({ ...acc, [user._id]: user.name }), {});

    // Enrich attendance records with user names
    const enrichedAttendance = attendanceRecords.map(record => ({
      ...record._doc,
      attendance: record.attendance.map(entry => ({
        ...entry._doc,
        userName: userNameMap[entry.userId]
      }))
    }));

    res.json(enrichedAttendance);
  } catch (error) {
    console.error('Error fetching enriched attendance data:', error);
    res.status(500).json({ message: 'Failed to fetch enriched attendance data', error });
  }
};




  <ScrollView style={styles.attendanceContainer}>
  {attendanceData.map((record, index) => (
    record.attendance.map((entry, subIndex) => (
      <View key={`${index}-${subIndex}`} style={styles.attendanceItem}>
       {/* Now accessing 'entry.userId.name' to get the student's name */}
        <Text>{entry.userId.name}: {entry.status}</Text>
      </View>
    ))
  ))}
</ScrollView>

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, files } = req.body;

   
    // Create a new assignment document
    const newAssignment = new Assignment({
      title,
      description,
      dueDate,
      files
    });
  // Save the assignment to the database
  await newAssignment.save();

  // Respond with the created assignment
  res.status(201).json({
    message: 'Assignment created successfully',
    assignment: newAssignment
  });
} catch (error) {
  res.status(500).json({
    message: 'Failed to create assignment',
    error: error.message
  });
}
};

app.post('/auth/create-assignments', async (req, res) => {
  const { title, description, dueDate, grade, subject } = req.body;
  
  try {
    // Logic to save the assignment in the database

    // Find users registered in the specified grade and subject
    const usersToNotify = await User.find({ grade, subjects: subject });

    // Send notification to these users (pseudo-code, adapt based on your setup)
    usersToNotify.forEach(user => {
      sendNotification(user, `New assignment: ${title} due on ${dueDate}`);
    });

    res.json({ success: true, message: 'Assignment created and notifications sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to create assignment' });
  }
});

import React,{createContext, useState, useEffect} from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';


import axios from 'axios';
//context
const AuthContext = createContext()

//provider
const AuthProvider = ({ children })=> {
    //global state
        const [state, setState] = useState({
            user:null,
            token: "",
        })

        // initial local storage data
        useEffect(()=>{
            const loadLocalStorageData = async () =>{
                    let data = await AsyncStorage.getItem('@auth')
                    let loginData = JSON.parse(data)
                    setState({...state, user:loginData?.user, token : loginData?.token})  //loginData - it will redirect us to homepage
            }
            loadLocalStorageData()
        }, [])

        

let token = state && state.token
       
 //default axios setting
 axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
 axios.defaults.baseURL = 'http://192.168.0.104:8080/api/v1/';


        return (
            <AuthContext.Provider value={[state, setState]}>
                {children}
              
            </AuthContext.Provider>
        )
}
export { AuthContext, AuthProvider}







import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/auth/notifications');
      // Assuming notifications are sorted from the server; otherwise, sort them here
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post(`/auth/notifications/${notificationId}/mark-read`);
      const updatedNotifications = notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read ? styles.unreadNotification : {},
            ]}
            onPress={() => markNotificationAsRead(item._id)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              {!item.read && <View style={styles.unreadIndicator} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5', // Light gray background for the whole screen
  },
  notificationItem: {
    backgroundColor: '#ffffff', // White background for each item
    padding: 15,
    borderRadius: 10, // Rounded corners for each notification
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#eef2ff', // Slightly different background for unread notifications
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1, // Ensure text does not push other elements out of view
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6347', // Tomate color for a noticeable indicator
    marginLeft: 10,
  },
});

export default NotificationsScreen;



const MainTab = () => {
    // global state

    const [state, setState] = useContext(AuthContext)
    const authenticatedUser = state?.user && state?.token

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login" headerShown="false">
        {authenticatedUser ?
    (
    <>
       <Stack.Screen name="Home" component={Home} options={{title: "Learn Academy",
     headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="About" component={About} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />

    <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="TakeAttendance" component={TakeAttendance} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 

    <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="Assignments" component={Assignments} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateAssignment" component={CreateAssignment} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      {/* <Stack.Screen name="ClassesScreen" component={ClassesScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="StudentForm" component={StudentForm} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />



        

      
      


   
    </>) : (
        <> 
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login1" component={Login} />
        <Stack.Screen name="ForgetPassword" component={handleForgetPassword } />
       
        </>
    )    
    }

      </Stack.Navigator>      
  )
return (
  <>
  {authenticatedUser ?(
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
    <Drawer.Screen name="Main" component={MainStackNavigator} />
  </Drawer.Navigator>
  ) : (
    <Stack.Navigator initialRouteName="Login" headerShown={false}>
    <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Login1" component={Login} options={{ headerShown: false }} />
    <Stack.Screen name="ForgetPassword" component={handleForgetPassword } options={{ headerShown: false }} />

  </Stack.Navigator>
  )}
  
  </>
)
}

export default MainTab

import { View, Text, TextInput, StyleSheet, Alert, Button, Modal } from 'react-native'
import React, { useState,useContext } from "react";
import { AuthContext } from './context/authContext';
import InputBox from '../InputBox'
import LoginButton from '../LoginButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useUser } from './context/userContext';
import { TouchableOpacity } from 'react-native-gesture-handler';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Use UserContext to set the current user
  const { setCurrentUser } = useUser();

  // Global state from AuthContext
  const [state, setState] = useContext(AuthContext);



  const handleSubmit = async () => {
      try {
          setLoading(true);
          if (!email || !password) {
              Alert.alert("Please Fill All Fields");
              setLoading(false);
              return;
          }

          const { data } = await axios.post('/auth/login', { email, password });

          if (data && data.user) {
              // Update context
              setCurrentUser(data.user);
              setState({ ...state, user: data.user, token: data.token });

              // Save to AsyncStorage
              await AsyncStorage.setItem('@auth', JSON.stringify(data));
              

              // Navigate to Home
            //   navigation.navigate('Home');
          } else {
              Alert.alert("Login failed", "Invalid response from server");
          }

          setLoading(false);
      } catch (error) {
          Alert.alert("Login Error", error.response.data.message);
          setLoading(false);
      }
  };

  //  temporary function to check local storage data
   const getLocalStorageData = async () => {
    let data = await AsyncStorage.getItem("@auth");
    console.log("Local Storage ==> ", data);
  };
  getLocalStorageData();

    return (
     
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Login</Text>
        <View style={styles.inputContainer}>
        <InputBox inputTitle={"Email"} keyboardType="email-address" autoComplete="email" value={email} setValue={setEmail} icon="envelope"/>
        <InputBox inputTitle={"Password"} secureTextEntry={true} autoComplete="password" value={password} setValue={setPassword} icon="lock"/>
  
        </View>
        {/* <Text>{JSON.stringify({ name, email, password }, null, 4)}</Text> */}

        
        <LoginButton btnTitle="Submit" loading={loading} handleSubmit={handleSubmit} textStyle={styles.loginButtonText}  />
        

        <TouchableOpacity onPress={()=> navigation.navigate("Register")}>
            <Text style={styles.linkText}>
                Not a user please <Text style={styles.link}>Register</Text>
            </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={()=> navigation.navigate("ForgetPassword")}>
            <Text style={styles.forgetPasswordLink}>Forget Password</Text>
        </TouchableOpacity>


      </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: '#F5F5F5',
        padding: 20,
    },
    loginButtonText: {
        fontFamily: 'outfit-bold',
      },

   
    pageTitle:{
        fontSize: 24,
        fontFamily: 'outfit-bold',
        textAlign: 'center',
        color: "#1e2225",
        marginBottom: 20,
        
    },
    inputContainer: {
        marginHorizontal: 20,
      },
      logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
        alignSelf: 'center',
      },

   
    logo: {
        width: 100,
        height: 100,
        marginBottom: 20,
        alignSelf: 'center',
      },
      link: {
        color: "#007BFF",
        fontWeight: 'bold',
      },
      

      link: {
        color: "#007BFF",
        fontWeight: 'bold',
      },
      forgetPasswordLink:{
        textAlign: "center",
        color: "#007BFF",
        marginTop: 20,
        fontWeight: 'bold',
      }
})


export default Login






import { View, Text } from 'react-native'
import React,{useContext} from 'react'
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screen/Home';
import LoginPage from '../LoginPage';
import RegisterScreen from '../screen/RegisterScreen';
import handleForgetPassword  from '../screen/forgetpasswordscreen';
import Login from '../screen/Login';
import { AuthContext } from '../screen/context/authContext';
import TopTab from './TopTab';
import Post from '../screen/Post';
import About from '../screen/About';
import Account from '../screen/Account';
import MyPosts from '../screen/MyPosts';
import { DrawerContent } from '../DrawerContent';
import Messages from '../screen/Messages';
import ChatScreen from '../screen/ChatScreen';
import AttendanceScreen from '../AttendanceScreen';
import CalendarScreen from '../CalenderScreen';
import TimetableScreen from '../Timetable';
import Assignments from '../Assignments';
import CreateAssignment from '../createAssignment';
import CreateClasses from '../CreateClasses';
import ClassesScreen from '../AttendanceScreen';
import StudentForm from '../studentform';
import GradeSetter from '../gradesetter';
import TakeAttendance from '../TakeAttendance';
import SeeAttendanceScreen from '../SeeAttendance';
import NotificationsScreen from '../screen/Notifications';
import TeacherStackNavigator from '../TeacherStackNavigator';
import StudentStackNavigator from '../StudentStackNavigator';



const MainTab = () => {
    // global state

    const [state, setState] = useContext(AuthContext)
    const authenticatedUser = state?.user && state?.token

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

const MainStackNavigator = () => (
      <Stack.Navigator initialRouteName="Login" headerShown="false">
        {authenticatedUser ?
    (
    <>
       <Stack.Screen name="Home" component={Home} options={{title: "Learn Academy",
     headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Post" component={Post} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Messages" component={Messages} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="About" component={About} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Account" component={Account} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />

    <Stack.Screen name="MyPosts" component={MyPosts} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="TakeAttendance" component={TakeAttendance} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 
    <Stack.Screen name="SeeAttendance" component={SeeAttendanceScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> 

    <Stack.Screen name="TimetableScreen" component={TimetableScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
    {/* <Stack.Screen name="CalendarScreen" component={CalendarScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="ChatScreen" component={ChatScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="Assignments" component={Assignments} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateAssignment" component={CreateAssignment} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="CreateClasses" component={CreateClasses} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      {/* <Stack.Screen name="ClassesScreen" component={ClassesScreen} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} /> */}
      <Stack.Screen name="StudentForm" component={StudentForm} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />
      <Stack.Screen name="GradeSetter" component={GradeSetter} options={{headerBackTitle: 'Back', headerRight:()=> <TopTab />}} />

   
    </>) : (
        <> 
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Login1" component={Login} />
        <Stack.Screen name="ForgetPassword" component={handleForgetPassword } />
       
        </>
    )    
    }

      </Stack.Navigator>      
  )
return (
  <>
  {authenticatedUser ?(
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
    <Drawer.Screen name="Main" component={MainStackNavigator} />
  </Drawer.Navigator>
  ) : (
    <Stack.Navigator initialRouteName="Login" headerShown={false}>
    <Stack.Screen name="Login" component={LoginPage} options={{ headerShown: false }} />
    <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Login1" component={Login} options={{ headerShown: false }} />
    <Stack.Screen name="ForgetPassword" component={handleForgetPassword } options={{ headerShown: false }} />

  </Stack.Navigator>
  )}
  
  </>
)
}

export default MainTab


import React, { useState } from 'react';
import { View, Button, StyleSheet, Alert, Text } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const CreateClasses = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8'];
  const subjects = ['Math', 'Science', 'Islamiat', 'History', 'English Language', 'English Literature', 'Urdu'];

  const createGrade = async () => {
    if (selectedGrade === "") {
      Alert.alert("Validation Error", "Please select a grade");
      return;
    }
    try {
      await axios.post('/auth/grades', { grade: selectedGrade });
      Alert.alert("Success", "Grade created successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create grade");
    }
  };

  const createSubject = async () => {
    if (selectedSubject === "") {
      Alert.alert("Validation Error", "Please select a subject");
      return;
    }
    try {
      await axios.post('/auth/subjects', { name: selectedSubject });
      Alert.alert("Success", "Subject created successfully");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to create subject");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Grade</Text>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={setSelectedGrade}
        >
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} style={styles.pickerItem} />
        ))}
      </Picker>
      <Button title="Create Grade" onPress={createGrade} />

      <Text style={styles.title}>Create Subject</Text>
      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        >
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} style={styles.pickerItem} />
        ))}
      </Picker>
      <Button title="Create Subject" onPress={createSubject} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  pickerItem: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default CreateClasses;


import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';
import { AuthContext } from './screen/context/authContext';

const ClassSchedule = () => {
    const [classSchedules, setClassSchedules] = useState([]);
    const [state] = useContext(AuthContext);

   
    useEffect(() => {
        fetchClassSchedules();
    }, []);

    const fetchClassSchedules = async () => {
        if (state.user && state.user._id) {
            console.log("Fetching class schedules for user ID:", state.user._id); // Log the user ID being used
            try {
                const response = await axios.get(`/auth/class-schedules/user/${state.user._id}`);
                console.log("Class schedules fetched successfully:", response.data.classSchedules); // Log fetched schedules
                setClassSchedules(response.data.classSchedules);
            } catch (error) {
                console.error("Failed to fetch class schedules for the user:", error);
            }
        } else {
            console.log("User ID not available for fetching class schedules.");
        }
    };

    return (
        <ScrollView style={styles.container}>
            {classSchedules.length > 0 ? classSchedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleItem}>
                    <Text style={styles.subject}>{schedule.subject}</Text>
                    <Text>Day: {schedule.dayOfWeek}</Text>
                    <Text>Time: {schedule.startTime} - {schedule.endTime}</Text>
                    <Text>Teacher: {schedule.teacher ? schedule.teacher.name : 'No teacher info'}</Text>
                </View>
            )) : <Text>No class schedules found.</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    scheduleItem: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Add more styles as needed
});

export default ClassSchedule;




const getAssignmentsForLoggedInUser = async (req, res) => {
  try {
    // Fetch user details from the database using the ID from req.auth
    const user = await User.findById(req.auth._id).populate('subjects');

    // Check if the user was found
    if (!user) {
      return res.status(404).send('User not found');
    }

    // Fetch assignments that match the user's grade and subjects
    const assignments = await Assignment.find({
      grade: user.grade,
      subject: { $in: user.subjects.map(subject => subject._id) }, // Assuming subjects is populated
    }).populate('subject'); // Populate subject details for each assignment

    // Send the fetched assignments as the response
    res.json(assignments);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};



const getClassSchedulesForUser = async (req, res) => {
  try {
      // Assuming user's ID is passed as a parameter or you get it from the user session
      const { userId } = req.params; // or req.user._id if you're using authentication middleware

      // Find all class schedules for this user
      const classSchedules = await ClassSchedule.find({ user: userId })
          .populate('classId') // Assuming you want to get details about the class
          .populate('teacher', 'name') // Populating only the name of the teacher
          .populate('subject', 'name'); // Populating only the name of the subject

      res.json({ classSchedules });
  } catch (error) {
      console.error("Failed to fetch class schedules for the user:", error);
      res.status(500).json({ message: "Failed to fetch class schedules", error: error.message });
  }
};


import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import axios from 'axios';


const ClassSchedule = () => {
    const [classSchedules, setClassSchedules] = useState([]);
  

    useEffect(() => {
        const fetchClassSchedules = async () => {
          try {
            // If the backend uses the auth token to identify the user, no need to append userId in the URL.
            const response = await axios.get('/auth/class-schedules/logged-in-user');
            setClassSchedules(response.data);
          } catch (error) {
            console.error('Failed to fetch class schedules:', error);
            Alert.alert("Error", "Failed to fetch class schedules");
          }
        };
      
        fetchClassSchedules();
      }, []);
      

    return (
        <ScrollView style={styles.container}>
            {classSchedules.length > 0 ? classSchedules.map((schedule, index) => (
                <View key={index} style={styles.scheduleItem}>
                    <Text style={styles.subject}>{schedule.subject}</Text>
                    <Text>Day: {schedule.dayOfWeek}</Text>
                    <Text>Time: {schedule.startTime} - {schedule.endTime}</Text>
                    <Text>Teacher: {schedule.teacher ? schedule.teacher.name : 'No teacher info'}</Text>
                </View>
            )) : <Text>No class schedules found.</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    scheduleItem: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Add more styles as needed
});

export default ClassSchedule;


const getClassSchedulesForLoggedInUser = async (req, res) => {
  try {
    const user = await User.findById(req.auth._id);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    // Assuming each ClassSchedule is associated with a grade directly or through the classId.
    const classSchedules = await ClassSchedule.find()
      .populate({
        path: 'classId',
        match: { grade: user.grade }, // Ensure the Class model has a 'grade' field.
        populate: {
          path: 'teacher', // Assuming the teacher is stored within the Class model.
          select: 'name' // Adjust according to your schema.
        }
      })
      .populate('teacher', 'name') 
      .lean();

    // Filter out schedules not matching the user's grade. This step is necessary if 'match' in populate does not filter out non-matching documents.
    const filteredSchedules = classSchedules.filter(schedule => schedule.classId && schedule.classId.grade === user.grade);

    res.json(filteredSchedules);
  } catch (error) {
    console.error('Failed to fetch class schedules:', error);
    res.status(500).send({ message: 'Server Error', error });
  }
};

import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert, Platform } from 'react-native';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker'; // Import the component

const ClassSchedule = () => {
    const [classSchedules, setClassSchedules] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fetch class schedules for the selected date
    const fetchClassSchedules = async (date) => {
        const formattedDate = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
        try {
            // Adjust the endpoint as necessary
            const response = await axios.get(`/auth/class-schedules/logged-in-user?date=${formattedDate}`);

            setClassSchedules(response.data.classSchedules || []);
        } catch (error) {
            console.error('Failed to fetch class schedules:', error);
            Alert.alert("Error", "Failed to fetch class schedules");
        }
    };

    // Handler for date change
    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(Platform.OS === 'ios'); // Hide picker on Android after selection
        const currentDate = selectedDate || selectedDate;
        setSelectedDate(currentDate);
        fetchClassSchedules(currentDate); // Fetch schedules for the new date
    };

    // Toggle the date picker visibility
    const toggleDatePicker = () => {
        setShowDatePicker(!showDatePicker);
    };

    useEffect(() => {
        fetchClassSchedules(selectedDate); // Initial fetch for today's schedules
    }, []);

    return (
        <View style={styles.container}>
            <Button title="Select Date" onPress={toggleDatePicker} />
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={selectedDate}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}
            <ScrollView style={styles.scheduleList}>
                {classSchedules.length > 0 ? classSchedules.map((schedule, index) => (
                    <View key={index} style={styles.scheduleItem}>
                        <Text style={styles.subject}>{schedule.subject}</Text>
                        <Text>Day: {schedule.dayOfWeek}</Text>
                        <Text>Time: {schedule.startTime} - {schedule.endTime}</Text>
                        <Text>Teacher: {schedule.teacher.name}</Text>
                    </View>
                )) : <Text>No class schedules found for the selected date.</Text>}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scheduleList: {
        marginTop: 15,
    },
    scheduleItem: {
        backgroundColor: '#f0f0f0',
        padding: 15,
        marginBottom: 10,
        borderRadius: 5,
        marginHorizontal: 10,
    },
    subject: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Add more styles as needed
});

export default ClassSchedule;


import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const CreateClasses = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const [terms, setTerms] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
  const subjects = ['Math', 'Science', 'Islamiat', 'History', 'English Language', 'English Literature', 'Urdu'];
  const timeSlots = ['8:00 AM - 9:00 AM', '9:00 AM - 10:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    // Fetch teachers from the backend when the component mounts
    fetchTeachers();
    fetchTerms();
  }, []);

 const fetchTeachers = async () => {
  try {
    const response = await axios.get('/auth/teachers');
    console.log(response.data); // Log to see the actual structure
    setTeachers(response.data.teachers); // Make sure this matches the logged structure
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch teachers");
  }
};

const fetchTerms = async () => {
  try {
    const response = await axios.get('/auth/terms');
    setTerms(response.data.terms);
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch terms");
  }
};

const createGrade = async () => {
  if (selectedGrade === "" || selectedSubject === "" || selectedTimeSlot === "" || selectedDay === "" || selectedTeacher === "") {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
  }

 

  const postData = {
      grade: selectedGrade,
      subject: selectedSubject,
      timeSlot: selectedTimeSlot,
      day: selectedDay,
      teacher: selectedTeacher,
      term: selectedTerm
      
  };

  try {
      const response = await axios.post('/auth/grades', postData);
      Alert.alert("Success", "Class created successfully");
  } catch (error) {
      // Display the custom error message from the backend
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Class</Text>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={setSelectedGrade}
        style={styles.picker}
      >
        <Picker.Item label="Select Grade" value="" />
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        style={styles.picker}
      >
        <Picker.Item label="Select Subject" value="" />
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedTimeSlot}
        onValueChange={setSelectedTimeSlot}
        style={styles.picker}
      >
        <Picker.Item label="Select Time Slot" value="" />
        {timeSlots.map((slot, index) => (
          <Picker.Item key={index} label={slot} value={slot} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedDay}
        onValueChange={setSelectedDay}
        style={styles.picker}
      >
        <Picker.Item label="Select Day" value="" />
        {days.map((day, index) => (
          <Picker.Item key={index} label={day} value={day} />
        ))}
      </Picker>

      <Picker
  selectedValue={selectedTeacher}
  onValueChange={setSelectedTeacher}
  style={styles.picker}
>
  <Picker.Item label="Select Teacher" value="" />
  {teachers.map((teacher, index) => (
    <Picker.Item key={index} label={teacher.name} value={teacher._id} /> // Use teacher._id
  ))}
</Picker>

<Picker
        selectedValue={selectedTerm}
        onValueChange={setSelectedTerm}
        style={styles.picker}
      >
        <Picker.Item label="Select Term" value="" />
        {terms.map((term, index) => (
          <Picker.Item key={index} label={term.name} value={term._id} />
        ))}
      </Picker>

      <Button title="Create Class" onPress={createGrade} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});

export default CreateClasses;


const cron = require('node-cron');

const mongoose = require('mongoose');
const Notification = require('../server/models/notificationmodel'); // Adjust with your actual path
const ClassSchedule = require('../server/models/ClassScheduleModel'); // Adjust with your actual path

// Function to send notifications
async function checkAndNotifyForUpcomingClasses() {
  // Assume current day and time are fetched correctly
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.getHours() + ':' + now.getMinutes();

  // Find classes starting in the next 15 minutes
  const upcomingClasses = await ClassSchedule.find({
    dayOfWeek: dayOfWeek,
    startTime: { $gte: currentTime }, // Adjust this logic to compare times accurately
    // Add more conditions if needed
  });

  // For each class, create a notification
  upcomingClasses.forEach(async (cls) => {
    const message = `Your ${cls.subject} class is about to start in 15 minutes.`;

    // Create a notification for each user in the class
    cls.users.forEach(async (userId) => {
      const newNotification = new Notification({
        user: userId,
        message: message,
        // Add other relevant fields
      });

      await newNotification.save();
    });
  });
}

// Schedule the task to run every minute (adjust as needed)
cron.schedule('* * * * *', checkAndNotifyForUpcomingClasses);



import React, { useState, useEffect } from 'react';
import { View, Button, StyleSheet, Alert, Text, ScrollView } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import moment from 'moment-timezone'; // Import moment-timezone


const CreateClasses = () => {


  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const [terms, setTerms] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [teachers, setTeachers] = useState([]);

  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9'];
  const subjects = ['Math', 'Science', 'Islamiat', 'History', 'English Language', 'English Literature', 'Urdu'];
 const timeSlots = ['6:45 AM - 7:45 AM', '8:00 AM - 9:00 AM', '10:00 AM - 11:00 AM', '11:00 AM - 12:00 PM', '12:00 PM - 1:00 PM', '9:00 PM - 10:00 PM' ];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    // Fetch teachers from the backend when the component mounts
    fetchTeachers();
    fetchTerms();
  }, []);

 const fetchTeachers = async () => {
  try {
    const response = await axios.get('/auth/teachers');
    console.log(response.data); // Log to see the actual structure
    setTeachers(response.data.teachers); // Make sure this matches the logged structure
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch teachers");
  }
};

const fetchTerms = async () => {
  try {
    const response = await axios.get('/auth/terms');
    setTerms(response.data.terms);
  } catch (error) {
    console.error(error);
    Alert.alert("Error", "Failed to fetch terms");
  }
};

// This function looks correct for converting UTC times back to the user's local time for display
const displayLocalTimeSlot = (utcTimeSlot) => {
  const [startTime, endTime] = utcTimeSlot.split(' - ');
  const format = 'h:mm A';
  const localStartTime = moment.utc(startTime, 'HH:mm').local().format(format);
  const localEndTime = moment.utc(endTime, 'HH:mm').local().format(format);
  return `${localStartTime} - ${localEndTime}`;
};


const createGrade = async () => {
  if (selectedGrade === "" || selectedSubject === "" || selectedTimeSlot === "" || selectedDay === "" || selectedTeacher === "") {
      Alert.alert("Validation Error", "Please fill all fields");
      return;

      
  }
  const [startTime, endTime] = selectedTimeSlot.split(' - ');
  const format = 'h:mm A';
  const utcStartTime = moment.tz(startTime, format, moment.tz.guess()).utc().format(format);
  const utcEndTime = moment.tz(endTime, format, moment.tz.guess()).utc().format(format);
  const utcTimeSlot = `${utcStartTime} - ${utcEndTime}`;

  const postData = {
    grade: selectedGrade,
    subject: selectedSubject,
    timeSlot: utcTimeSlot,
    day: selectedDay,
    teacher: selectedTeacher,
    term: selectedTerm,
  };

 
  
  // Utility function to convert UTC time slots to local timezone
 

  try {
      const response = await axios.post('/auth/grades', postData);
      Alert.alert("Success", "Class created successfully");
  } catch (error) {
      // Display the custom error message from the backend
      const errorMessage = error.response?.data?.message || "An unexpected error occurred";
      Alert.alert("Error", errorMessage);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
     
      <Text style={styles.title}>Create Class</Text>
      <Picker
        selectedValue={selectedGrade}
        onValueChange={setSelectedGrade}
        style={styles.picker}
      >
        <Picker.Item label="Select Grade" value="" />
        {grades.map((grade, index) => (
          <Picker.Item key={index} label={grade} value={grade} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedSubject}
        onValueChange={setSelectedSubject}
        style={styles.picker}
      >
        <Picker.Item label="Select Subject" value="" />
        {subjects.map((subject, index) => (
          <Picker.Item key={index} label={subject} value={subject} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedTimeSlot}
        onValueChange={setSelectedTimeSlot}
        style={styles.picker}
      >
        <Picker.Item label="Select Time Slot" value="" />
        {timeSlots.map((slot, index) => (
          <Picker.Item key={index} label={slot} value={slot} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedDay}
        onValueChange={setSelectedDay}
        style={styles.picker}
      >
        <Picker.Item label="Select Day" value="" />
        {days.map((day, index) => (
          <Picker.Item key={index} label={day} value={day} />
        ))}
      </Picker>

      <Picker
  selectedValue={selectedTeacher}
  onValueChange={setSelectedTeacher}
  style={styles.picker}
>
  <Picker.Item label="Select Teacher" value="" />
  {teachers.map((teacher, index) => (
    <Picker.Item key={index} label={teacher.name} value={teacher._id} /> // Use teacher._id
  ))}
</Picker>

<Picker
        selectedValue={selectedTerm}
        onValueChange={setSelectedTerm}
        style={styles.picker}
      >
        <Picker.Item label="Select Term" value="" />
        {terms.map((term, index) => (
          <Picker.Item key={index} label={term.name} value={term._id} />
        ))}
      </Picker>

      <Button title="Create Class" onPress={createGrade} />
      {selectedTimeSlot && (
  <Text>{displayLocalTimeSlot(selectedTimeSlot)}</Text>
)}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  picker: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  currentDateTime: {
    fontSize: 16,
    textAlign: 'center',
    margin: 10,
},
});

export default CreateClasses;
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    color: '#2C3E50',
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#BDC3C7',
    borderRadius: 8,
    backgroundColor: '#ECF0F1',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 10,
    paddingTop: 5,
    color: '#34495E',
  },
  picker: {
    color: '#2C3E50',
  },
  button: {
    backgroundColor: '#3498DB',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  localTimeText: {
    fontSize: 16,
    color: '#34495E',
    textAlign: 'center',
    marginTop: 10,
  },
});


const cron = require('node-cron');
const moment = require('moment-timezone');
const Notification = require('./models/notificationmodel'); // Ensure path is correct
const ClassSchedule = require('./models/ClassScheduleModel'); // Ensure path is correct

async function sendClassStartNotification(io, userId, message, classScheduleId) {
    const notification = new Notification({
        user: userId,
        message,
        classSchedule: classScheduleId, // Associate notification with a class schedule
    });
    await notification.save();

    // Emitting a real-time notification to the specific user
    // Replace 'notification-channel' with your actual channel name
    // Use userId or a specific socket id if you want to target a specific user
    io.emit('notification-channel', { message: message, notificationId: notification._id });
}

function resetNotificationSentFlags(ClassSchedule) {
    // This task resets the notificationSent flag for all ClassSchedule documents daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Resetting notificationSent flags...');
        await ClassSchedule.updateMany({}, { $set: { notificationSent: false } });
        console.log('notificationSent flags reset.');
    });
}

function startScheduledTasks(io) {
    // This task checks for classes starting in the next 15 minutes and sends notifications
    cron.schedule('* * * * *', async () => {
        console.log('Checking for classes starting in the next 15 minutes...');
        const now = moment.utc();
        const fifteenMinutesLater = now.clone().add(15, 'minutes');
        const dayOfWeek = now.format('dddd');

        const upcomingClasses = await ClassSchedule.find({
            dayOfWeek: dayOfWeek,
            notificationSent: false, // Only select classes that haven't had notifications sent
        }).populate('users');

        upcomingClasses.forEach(async (schedule) => {
            const classStartTimeMoment = moment.utc(schedule.startTime, 'HH:mm');
            if (now.isBefore(classStartTimeMoment) && fifteenMinutesLater.isSameOrAfter(classStartTimeMoment)) {
                const message = `Reminder: Your ${schedule.subject} class starts in 15 minutes.`;
                schedule.users.forEach(async (user) => {
                    await sendClassStartNotification(io, user._id, message, schedule._id);
                });

                // Mark the notification as sent for this class schedule
                await ClassSchedule.findByIdAndUpdate(schedule._id, { $set: { notificationSent: true } });
            }
        });
    });

    resetNotificationSentFlags(ClassSchedule);
}

module.exports = startScheduledTasks;




import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Alert } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from '@react-navigation/native';
import io from 'socket.io-client';
import TabNavigation from './src/navigations/TabNavigation';
import RootNavigation from './Navigation';
import { NotificationProvider } from './NotificationContext';
import { UserProvider } from './src/screen/context/userContext';

const App = () => {
  const [fontsLoaded] = useFonts({
    'outfit': require('./assets/fonts/Outfit-Regular.ttf'),
    'outfit-medium': require('./assets/fonts/Outfit-SemiBold.ttf'),
    'outfit-bold': require('./assets/fonts/Outfit-Bold.ttf'),
  });

  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const socket = io("http://192.168.0.101:8080", { transports: ['websocket'] });

    socket.on('notification-channel', (notification) => {
      // Handling the notification
      Alert.alert("New Notification", notification.message);
    });

    return () => {
      socket.off('notification-channel');
      socket.disconnect();
    };
  }, []); // Dependency array is empty to ensure this effect runs only once on mount

  if (!fontsLoaded) {
    return null;
  }

  return (
    <NotificationProvider>
      <UserProvider>
      <ClerkProvider
       
        publishableKey={'pk_test_bWVldC1jbGFtLTQ4LmNsZXJrLmFjY291bnRzLmRldiQ'}
      >
          <NavigationContainer>
            <View style={styles.container}>
              <SignedIn>
                <TabNavigation />
              </SignedIn>
              <SignedOut>
                <RootNavigation />
              </SignedOut>
              <StatusBar style="auto" />
            </View>
          </NavigationContainer>
        </ClerkProvider>
      </UserProvider>
    </NotificationProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;




import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Ionicons } from '@expo/vector-icons'; // Or wherever you import Ionicons from

const NotificationIcon = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get('/auth/notifications/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.log('Error fetching unread notifications count:', error);
    }
  }, []);

  // Use useFocusEffect to refetch unread count when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  return (
    <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconContainer}>
      <Ionicons name="notifications" size={24} color="black" />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{unreadCount}</Text>
        </View>
      )}
      <Text>Notifications</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#AA0000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    padding: 1,
    textAlign: 'center',
  },
});

export default NotificationIcon;


const cron = require('node-cron');
const moment = require('moment-timezone');
const Notification = require('./models/notificationmodel'); // Ensure path is correct
const ClassSchedule = require('./models/ClassScheduleModel'); // Ensure path is correct

async function sendClassStartNotification(io, userId, message, classScheduleId) {
    const notification = new Notification({
        user: userId,
        message,
        classSchedule: classScheduleId, // Associate notification with a class schedule
    });
    await notification.save();

    // Emitting a real-time notification to the specific user
    // Replace 'notification-channel' with your actual channel name
    // Use userId or a specific socket id if you want to target a specific user
    io.emit('notification-channel', { message: message, notificationId: notification._id });
}

function resetNotificationSentFlags(ClassSchedule) {
    // This task resets the notificationSent flag for all ClassSchedule documents daily at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Resetting notificationSent flags...');
        await ClassSchedule.updateMany({}, { $set: { notificationSent: false } });
        console.log('notificationSent flags reset.');
    });
}

function startScheduledTasks(io) {
    // This task checks for classes starting in the next 15 minutes and sends notifications
    cron.schedule('* * * * *', async () => {
        console.log('Checking for classes starting in the next 15 minutes...');
        const now = moment.utc();
        const fifteenMinutesLater = now.clone().add(15, 'minutes');
        const dayOfWeek = now.format('dddd');

        const upcomingClasses = await ClassSchedule.find({
            dayOfWeek: dayOfWeek,
            notificationSent: false, // Only select classes that haven't had notifications sent
        }).populate('users');

        upcomingClasses.forEach(async (schedule) => {
            const classStartTimeMoment = moment.utc(schedule.startTime, 'HH:mm');
            if (now.isBefore(classStartTimeMoment) && fifteenMinutesLater.isSameOrAfter(classStartTimeMoment)) {
                const message = `Reminder: Your ${schedule.subject} class starts in 15 minutes.`;
                schedule.users.forEach(async (user) => {
                    await sendClassStartNotification(io, user._id, message, schedule._id);
                });

                // Mark the notification as sent for this class schedule
                await ClassSchedule.findByIdAndUpdate(schedule._id, { $set: { notificationSent: true } });
            }
        });
    });

    resetNotificationSentFlags(ClassSchedule);
}

module.exports = startScheduledTasks;





import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Ionicons } from '@expo/vector-icons'; // Or wherever you import Ionicons from
import { useNotifications } from '../NotificationContext';

const NotificationIcon = ({ navigation }) => {
  
  const { notificationCount, updateNotificationCount } = useNotifications();
  

  const fetchNotificationCount = useCallback(async () => {
    try {
      const response = await axios.get('/auth/notifications/unread-count');
      updateNotificationCount(response.data.unreadCount);
    } catch (error) {
      console.log('Error fetching unread notifications count:', error);
    }
  }, []);

  // Use useFocusEffect to refetch unread count when the screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchNotificationCount();
    }, [fetchNotificationCount])
  );

  return (
    <TouchableOpacity onPress={() => {
      navigation.navigate('Notifications');
      // resetNotificationCount(); // Optionally reset the count when navigating to notifications
    }} style={styles.iconContainer}>
      <Ionicons name="notifications" size={24} color="black" />
      {notificationCount > 0 && (
        <View style={styles.badge}>
        <Text style={styles.badgeText}>{notificationCount}</Text>
      </View>
      )}
      <Text>Notifications</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    right: 20,
    top: 0,
    backgroundColor: '#AA0000',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    padding: 1,
    textAlign: 'center',
  },
});

export default NotificationIcon;



import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/auth/notifications');
      // Assuming notifications are sorted from the server; otherwise, sort them here
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post(`/auth/notifications/${notificationId}/mark-read`);
      const updatedNotifications = notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read ? styles.unreadNotification : {},
            ]}
            onPress={() => markNotificationAsRead(item._id)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              {!item.read && <View style={styles.unreadIndicator} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5', // Light gray background for the whole screen
  },
  notificationItem: {
    backgroundColor: '#ffffff', // White background for each item
    padding: 15,
    borderRadius: 10, // Rounded corners for each notification
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000', // Shadow for depth
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#eef2ff', // Slightly different background for unread notifications
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1, // Ensure text does not push other elements out of view
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6347', // Tomate color for a noticeable indicator
    marginLeft: 10,
  },
});

export default NotificationsScreen;



import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import axios from 'axios';
import { useNotifications } from '../../NotificationContext';

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const { resetNotificationCount } = useNotifications();

  useEffect(() => {
  fetchNotifications();
}, []);

const fetchNotifications = async () => {
  try {
    const response = await axios.get('/auth/notifications');
    console.log("Fetched notifications:", response.data.notifications);  // Log fetched data
    setNotifications(response.data.notifications);
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
  }
};


  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.post(`/auth/notifications/${notificationId}/mark-read`);
      const updatedNotifications = notifications.map(notification =>
        notification._id === notificationId ? { ...notification, read: true } : notification
      );
      setNotifications(updatedNotifications);
      resetNotificationCount(); // Reset the notification count here after reading
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.notificationItem,
              !item.read ? styles.unreadNotification : {},
            ]}
            onPress={() => markNotificationAsRead(item._id)}
          >
            <View style={styles.notificationContent}>
              <Text style={styles.notificationMessage}>{item.message}</Text>
              {!item.read && <View style={styles.unreadIndicator} />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
  },
  notificationItem: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    backgroundColor: '#eef2ff',
    borderColor: 'red', // Temporary for debugging
    borderWidth: 2, // Temporary for debugging
  },
  notificationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationMessage: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6347',
    marginLeft: 10,
  },
});

export default NotificationsScreen;


```

select a grade displays users in that particular grade
select subject and then enroll in that subject

fetchUsersbyGrade
await axios.get(`/auth/class/grade/${grade}/users`);



const getClassUsersByGrade = async (req, res) => {
  const { grade } = req.params; // Assuming grade is passed as a URL parameter

  try {
    // Find the class ID(s) associated with the specified grade
    const classObj = await Class.findOne({ grade: grade });

    if (!classObj) {
      return res.status(404).json({ message: "No class found for this grade." });
    }

    // Fetch users associated with the class ID
    const users = await User.find({ classId: classObj._id }).populate('classId', 'grade');

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch users for the specified grade.", error: error.message });
  }
};














404 is url error
500 is major backend issue (like wo usermodel wala, where we had to then set up users field in class)



My Current Set Up 

Grades and Subjects together

Grades fetching users and then we further registering the user with a subject



How about ?

Grades and Subjects seperate of each other, we create Grade 1, Grade 2, Grade 3, all the way to Grade 8.
We Create Subjects

and now we associate Grades with Users and then enroll them Subjects

So now Users already have a Grade, now they will have all the subject ids 

see how setGrade button in grade setter was created

GRADE SETTER

Select User, Select grade - Assigns user a grade and its classId

STUDENT FORM

Select a grade, Select a subject - displays users via grade and allows to enroll for a subject.

ATTENDANCE

Select a grade, select a subject, Select a date - Displays users via grade and those enrolled for subjects.


TAKE ATTENDANCE

SEE ATTENDANCE - where all the attendance results are displayed when date, grade and subject is selected

submit attendance for certain date, do u want to update attendance for this date? Student status refreshed when i select new date

2 buttons on Attendance Screen, See attendance and take attendance

Basically in my attendance screen, i select date and mark all students attendance and then select submit button -> Attendance submitted successfully, the see attendance page will have options select grade, select subject, select date input(only those dates should show up for those subjects and grades that attendance has been taken, for instance, if Grade 3's Math Class attendance was only taken on 2 days 5th March and 7th, then after selecting grade 3 and Math, only dates of 5th March and 7th March should be available for selection), once selected show all users attendance status.


attendance already marked for this date, would you like to update status






The whole app hierarchy

- Course Creation

1- Create Grade (in classes section, it creates a grade and assigns it an objectId)
2- Create Subject (in subjects section, it creates a subject and assigns it an objectId)

- Grade Setter

1- Select user, Select grade and set grade ( this basically adds users in users field array in the classes section of the grade selected)


Student Form
1- Select Grade displays all users registered in that particular grade, Select Subject and then enrolling student to the subject adds 


functionalities to add
Take attendance - cannot submit attendance unless we have selected attendance status, show message of plz mark all users attendance
Retaking attendance for same day again will update status of attendance, do u want to update these submissions.


// ensure all routes that require authentication have the requireSignIn middleware properly applied. 


What the App contains
1- Login Logout functionality
2- Post functionality allows users to post and posts will appear on news feed
3- Attendance tracking, Real time Attendance- (when u click the student, should display whole attendance record for that subject)
4- Create Grades and Create Courses
5- Grade Setter -> Assign student to his particular class (grade)
6- Student Form - allows enrollment of students in subjects
7- Chat, in app messaging functionality
8- Create Assignments. select grade and select subject



ok so in my create assigment what i want is that I select grade, select subject and then create the assignment, once assignment is created the user which is registered in that particular class and subject should get a notificatation, that this assignment is due on that date,  also all created assignments should be displayed on Assignment section of the user belonging to that grade and subject

When assignment is created that user should get a red notification thingy on the notification icon, 

1- latest notification should be shown in a darker background color
2- once notifications icon have been clicked on, then the notification badge of 1 or 2 or however many notifications should not show up, right now only when i refresh app is when the notification badge dissappears.
3- Page Refresh when assignment is created




make 100 users and test the app, 90 students and 8 teachers
Role based login, different features available for students and teachers
Teachers - all bottom tab features
Students - no Posting allowed, Drawer- Only assignments and Timetable

notifications 15 mins prior to class, how did i achieve it
- there was a timezone issue, used moment and then UTC, converted utc to local time for front end, used utc and moment like classchedule and creategrade controllers, createclasses & classschedule component and also in scheduledTasks.js



1- When teacher creates class, it should also select days and times, so when the student is registered in that class, it shows up in his schedule. 
2- Also times should not overlap with other classes. 
3- Teacher should also have option to cancel class which will send notification to himself and student that class has been cancelled.



Schedule
todays date

i want classes to be displayed by date, like for instance
 Jan 22nd Monday 2024, shows the class schedule for the day and then i can select another date and it can show me class Schedule for that particular date


 Semester Jan 15th - May 17th 2024


 once these terms are created i want them to show there in createClass option, when i select term class is created


 ClassSchedule

 Display the current day and date as heading