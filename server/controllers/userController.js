const JWT = require("jsonwebtoken");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const userModel = require("../models/userModel");
var {expressjwt:jwt} = require('express-jwt')

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


module.exports = { requireSignIn, registerController, loginController, updateUserController, searchController }