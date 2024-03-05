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







```





My Current Set Up 

Grades and Subjects together

Grades fetching users and then we further registering the user with a subject



How about ?

Grades and Subjects seperate of each other, we create Grade 1, Grade 2, Grade 3, all the way to Grade 8.
We Create Subjects

and now we associate Grades with Users and then enroll them Subjects

So now Users already have a Grade, now they will have all the subject ids 

see how setGrade button in grade setter was created
