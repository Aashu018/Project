const asyncHandler = require("express-async-Handler")
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
// const { use } = require("../routes/userRoute");

const generateToken = (id) => {
     return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn: "1d"})
};

 //Register User


const registerUser = asyncHandler( async (req, res) => {
  
    const {name, email, password} = req.body

    // Validation 
    if(!name || !email || !password){
        res.status(400)
        throw new Error("Please fill in all required fields")
    }
    if(password.length < 6){
        res.status(400)
        throw new Error("Password must be upto 6 characters")  
    }

    //check if user mail already exists
    const userExists =  await User.findOne({email})

    if(userExists){
        res.status(400)
        throw new Error("Email has already been registered")
    }
    
   
    // Create new user
    const user = await User.create({
        name,
        email,
        password , 
    })

     // Genrate Token
     const token = generateToken(user._id);

     // Send HTTP - only cookie
     res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires : new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite : "none",
        secure: true
     });

    if(user) {
        const{_id, name , email,photo, phone, bio} = user
        res.status(201).json({
            _id, name , email,photo, phone, bio,token,
        })
    }else{
        res.status(400)
        throw new Error("Invalid user data")
    }



});

// Login User
const loginUser = asyncHandler(async(req, res) => {
      const {email, password} = req.body

      // Validate Request
      if(!email || !password){
        res.status(400);
        throw new Error("Please add email and password");
      }

      // Check if user exists
      const user = await User.findOne({email})

      if(!user){
        res.status(400);
        throw new Error("User not found , please signup")
      }

      // User exist , check if password is correct
      const passwordIsCorrect = await bcrypt.compare(password,user.password)

      if(user && passwordIsCorrect){
        const{_id, name , email,photo, phone, bio} = user
        res.status(200).json({
            _id,
            name ,
            email,
            photo,
            phone,
            bio,
            token,
        })
      }
      else{
        res.status(400);
        throw new Error("Invalid email or password")
      }

});

module.exports = {
    registerUser,
    loginUser,  
}
// anurag