const User = require("../models/User");
const Otp = require("../models/Otp");

const bcrypt = require("bcryptjs");

const generateToken =
require("../utils/generateToken");

const sendOTPEmail =
require("../services/emailService");


// REGISTER

const register = async (req,res)=>{

 try{

  const {
   name,
   email,
   mobile,
   password
  } = req.body;

  const userExists =
  await User.findOne({
   $or:[
    {email},
    {mobile}
   ]
  });

  if(userExists){
   return res.status(400).json({
    success:false,
    message:"User already exists"
   });
  }

  const otp =
  Math.floor(
   100000 + Math.random()*900000
  ).toString();

  const hashedPassword =
  await bcrypt.hash(password,10);

  await Otp.deleteMany({email});

  await Otp.create({

   name,

   email,

   mobile,

   password:hashedPassword,

   otp,

   expiresAt:new Date(
    Date.now()+5*60*1000
   )

  });

  await sendOTPEmail(
   email,
   otp
  );

  res.json({
   success:true,
   message:"OTP Sent"
  });

 }catch(error){

  console.log(error);

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};


// VERIFY OTP

const verifyOTP = async(req,res)=>{

 try{

  const {
   email,
   otp
  } = req.body;

  const otpDoc =
  await Otp.findOne({
   email,
   otp
  });

  if(!otpDoc){

   return res.status(400).json({
    success:false,
    message:"Invalid OTP"
   });

  }

  const user =
  await User.create({

   name:otpDoc.name,

   email:otpDoc.email,

   mobile:otpDoc.mobile,

   password:otpDoc.password,

   isVerified:true

  });

  await Otp.deleteMany({
   email
  });

  const token =
  generateToken(user._id);

  res.json({

   success:true,

   message:"Registration Successful",

   token

  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};


// LOGIN

const login = async(req,res)=>{

 try{

  const {
   email,
   password
  } = req.body;

  const user =
  await User.findOne({email});

  if(!user){

   return res.status(400).json({
    success:false,
    message:"Invalid Credentials"
   });

  }

  const isMatch =
  await bcrypt.compare(
   password,
   user.password
  );

  if(!isMatch){

   return res.status(400).json({
    success:false,
    message:"Invalid Credentials"
   });

  }

  const token =
  generateToken(user._id);

  res.json({
   success:true,
   token
  });

 }catch(error){

  res.status(500).json({
   success:false,
   message:error.message
  });

 }

};

module.exports = {
 register,
 verifyOTP,
 login
};