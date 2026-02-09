import User from "../user/userModel.js";
import Session from "../session/sessionModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { sendMail } from "../utils/composeMail.js";


const M = 1000 * 60 * 60 * 24;


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
         
        // Check for any existing active session for this user
        const activeSession = await Session.findOne({
          userId: user._id,
          expiresAt: { $gt: new Date() }
        });

        if (activeSession) {
          activeSession.expiresAt = new Date(Date.now() + M);
          await activeSession.save();

          res.cookie("sid", activeSession.sid, {
            httpOnly: true,
            sameSite: "lax",
            secure: false,
            maxAge: M,
          });

          return res.status(200).json({
            message: "Login successful",
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
            },
          });
        }

        
        const sid = crypto.randomUUID();
        
       await Session.create({
        sid,
        type:"LOGIN",
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

const createUser = async (req, res) => {
  try{
      const { name, age, email, phone_no, password} = req.body;
      
      console.log(req.body);

      if (!name || !email || !password) {
        return res.status(400).json({ message: "Required fields missing" });
      }
      const existingUser = await User.findOne({
        $or: [{ email }, { phone_no }]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(409).json({ message: "Email already registered" });
        }
        if (existingUser.phone_no === phone_no) {
          return res.status(409).json({ message: "Phone number already registered" });
        }
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

        console.error("CREATE USER ERROR:", error);
        res.status(500).json({ message: "Error creating user"});
    }
}

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
            const user_id = req.session.userId;
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

 export  {loginUser,logoutUser,createUser, otpSender, otpVerifier, passUpdater}