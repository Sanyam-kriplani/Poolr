import { authenticateUser } from "../middlewares/authMiddleware.js";
import { sessionMiddleware } from "../middlewares/sessionMiddleware.js";
import {loginUser, createUser, otpSender, otpVerifier, passUpdater, logoutUser } from './auth.controller.js'
import express from 'express';


const authRoute=express.Router();

authRoute.post('/login',loginUser);
authRoute.post('/signup',createUser);
authRoute.get("/auth-test", sessionMiddleware, authenticateUser, (req, res) =>
  {
    
   res.json({
     message: "You have accessed a protected route 🎉",
     userId: req.session.userId
   });
});

authRoute.get('/me',sessionMiddleware,authenticateUser, (req, res) => 
{
res.json({ userId: req.session.userId });
});//to check if the user is logged in or not

authRoute.post('/forgotpass', otpSender);
authRoute.post('/verifyOtp', otpVerifier);
authRoute.route('/resetPass').patch(sessionMiddleware,authenticateUser,passUpdater);
authRoute.route('/').delete(sessionMiddleware,authenticateUser,logoutUser);

export default authRoute;