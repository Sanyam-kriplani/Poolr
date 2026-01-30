import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import Session from "../models/sessionModel.js";
import crypto from "crypto";
import { sendMail } from "../utils/composeMail.js";
import fs from "fs";



const createUser = async (req, res) => {
  try{
      const { name, age, email, phone_no, password} = req.body;
        
        console.log(req.body);

        if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }
    const existinguser= await User.findOne({email});
    if(existinguser){
        return res.status(400).json({message:"User already exists"});
    }

    const password_hash = await bcrypt.hash(password, 10);
    const newUser = new User({
            name,
            age,
            email,
            phone_no,
            password_hash
        });

    const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully", user: savedUser });
        
    
    }catch(error){
        res.status(500).json({ message: "Error creating user", error });
    }
}


const M = 1000 * 60 * 60 * 24; // 1 day in milliseconds


const loginUser = async (req, res) => {
  try{
      const { email, password } = req.body;
        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({message:"User Not Found"});
        }
        console.log("USER FOUND:", user._id);
        if (!password || !user.password_hash) {
        return res.status(400).
        json({ 
            message: "Invalid login data"
         });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if(!isMatch){
            return res.status(401).json({message:"Invalid Credentials"});
        }
        const sid = crypto.randomUUID();
        
       await Session.create({
        sid,
        userId: user._id,
        expiresAt: new Date(Date.now() + M)
        });

        res.cookie("sid", sid, {
            httpOnly: true,
            sameSite:"lax",
            secure:false,
            maxAge:M,          
        });
        return res.status(200).json({
        message: "Login successful",
        user: {
        id: user._id,
        name: user.name,
        email: user.email
    }
  });
  }
  catch (error) {
  console.error("LOGIN ERROR:", error);
  res.status(500).json({ message: "Error logging in" });
  }
}

 const logoutUser = async (req, res) => {
  if (req.cookies?.sid) {
    await Session.deleteOne({ sid: req.cookies.sid });
  }
  res.clearCookie("sid");
  res.json({ message: "Logged out" });
};

const  otpSender= async (req,res)=>{
 try {
    const email=req.body.email;
    const user=await User.findOne({ email });
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendMail({
    to: user.email,
    sub: "Poolr: Code for Reset Password",
    msg: `Your OTP for resetting your password is ${otp}. 
    This OTP is valid for 5 minutes. Do not share it with anyone.`
    });
   
      user.otp=otp;  
      user.otpExpiredTime=new Date(Date.now() + 5 * 60 * 1000);
      await user.save();
      res.status(200).json({
        message:"Otp Saved Sucessful",
    });
 } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Error sending otp" });
 }

}

const otpVerifier= async(req,res)=>{
    try {
        const {otp,email}=req.body;
        if(!otp || !email){
          return res.status(400).json({ message: "OTP and email are required" });      
        }
        
        const user=await User.findOne({otp,email});
        if(!user){
            return res.status(400).json({message:"Invalid Otp Enterred"})
        }
        if(user.otpExpiredTime && user.otpExpiredTime < new Date(Date.now())){
             user.otp=null;
             user.otpExpiredTime=null;
             await user.save();
             return res.status(410).json({message: "OTP has expired"});
        }  
          user.otp=null;
          user.otpExpiredTime=null;
          await user.save();
          const sid = crypto.randomUUID();
          await Session.create({
          sid,
          userId: user._id,
          type: "PASSWORD_RESET",
          expiresAt: new Date(Date.now() + (5 * 60 * 1000)) // 5 min
         });
          res.cookie("sid", sid, {
            httpOnly: true,
            sameSite:"lax",
            secure:false,
            maxAge: 5 * 60 * 1000,          
          });
          return res.status(200).json({ message: "OTP verified successfully",user_id:user._id }); 
    
    } catch (error) {
        return res.status(500).json({message:"Error validating the Otp"})
    }}

const passUpdater= async (req,res)=>{
        try {
            const user_id = req.user_id;
            const { newPass } = req.body;
            const user=await User.findById(user_id);
    
            if(!user){
                return res.status(400).json({message:"Invalid User"})
            }
    
            const updatedPass= await bcrypt.hash(newPass,10);
            user.password_hash=updatedPass;
            await user.save();
            await Session.deleteOne({ sid: req.cookies.sid });
            res.clearCookie("sid");
            return res.status(200).json({message:"Password Updated Successfully"})
            } catch (error) {
            return res.status(500).json({message:"Error updating the password"})
            }
    }

const accDetailUpdater=async (req,res)=>{ 
    try {
    
       const{email,phone_no}=req.body;
       const user_id=req.user_id
       const  user=await  User.findById(user_id);
       
       if(!user){
        return res.status(404).json({ message: "User not found" });
       }

       if(email){
        user.email=email;
       }
    
       if(phone_no){
        user.phone_no=phone_no;
       }
    
       await user.save();
       res.status(200).json({message:"Details updated Successfully"});
       } catch (error) {
       return res.status(500).json({message:"Error updating the details"})
     }

 }

const profilePhotoUpdater = async (req, res) => {
  try {
    const user_id = req.user_id;
    const profilePhotoPath = req.file?.path;

    if (!profilePhotoPath) {
      return res.status(400).json({ message: "Avatar file is missing" });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Deleting old avatar from disk (if exists)
    if (user.profile_photo) {
      const oldPath = user.profile_photo.startsWith("/uploads")
        ? user.profile_photo.slice(1) // remove leading slash
        : user.profile_photo;

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save relative path in DB
    user.profile_photo = "/" + profilePhotoPath.replace(/\\/g, "/");
    await user.save();

    return res.status(200).json({
      message: "Profile photo updated successfully",
      avatar: user.profile_photo
    });
  } catch (error) {
    console.error("PROFILE PHOTO UPDATE ERROR:", error);
    return res.status(500).json({ message: "Error updating profile photo",
      error:error.message
     });
  }
};

const fetchUserDetails=async (req,res)=>{
try {
  const userId=req.user_id;
  
  const user=await User.findById(userId);
  
  if(!user){
    return res.status(404).json({
      message:"User not found"
    });
  }
  return res.status(200).json(user);
  
} catch (error) {
 return res.status(500).json({
  message:"Error fetching user details",
  Error:error
})
}
}



export { createUser, loginUser, logoutUser, otpSender, otpVerifier, passUpdater, accDetailUpdater, profilePhotoUpdater,fetchUserDetails};
