import express from 'express';
import {createUser, loginUser, logoutUser, otpSender, otpVerifier, passUpdater, accDetailUpdater, profilePhotoUpdater, fetchUserDetails} from '../controllers/userController.js';
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { sessionMiddleware } from "../middlewares/sessionMiddleware.js";
import { uploadProfilePhoto } from '../middlewares/multerMiddleware.js';


const userRouter=express.Router();

userRouter.post('/login',loginUser);
userRouter.post('/signup',createUser);
userRouter.get("/auth-test", sessionMiddleware, authenticateUser, (req, res) =>
  {
   res.json({
     message: "You have accessed a protected route 🎉",
     userId: req.session.userId
   });
});

userRouter.get('/me',sessionMiddleware,authenticateUser, (req, res) => 
  {
res.json({ userId: req.session.userId });
});//to check if the user is logged in or not

userRouter.post('/forgotpass', otpSender);
userRouter.post('/verifyOtp', otpVerifier);


//Protected routes
userRouter.route('/').get(sessionMiddleware,authenticateUser,fetchUserDetails);
userRouter.route('/updateProfile').patch(sessionMiddleware,authenticateUser,accDetailUpdater);
userRouter.route('/updateProfilePhoto').patch(sessionMiddleware,authenticateUser,uploadProfilePhoto.single('profilePhoto'),profilePhotoUpdater);
userRouter.route('/resetPass').patch(sessionMiddleware,authenticateUser,passUpdater);
userRouter.route('/').delete(sessionMiddleware,authenticateUser,logoutUser);


export default userRouter;