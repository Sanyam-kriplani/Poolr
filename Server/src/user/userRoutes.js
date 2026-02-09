import express from 'express';
import {  accDetailUpdater, profilePhotoUpdater, fetchUserDetails} from './userController.js';
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { sessionMiddleware } from "../middlewares/sessionMiddleware.js";

import { uploadProfilePhoto } from '../middlewares/multerMiddleware.js';


const userRouter=express.Router();




//Protected routes
userRouter.route('/').get(sessionMiddleware,authenticateUser,fetchUserDetails);
userRouter.route('/updateProfile').patch(sessionMiddleware,authenticateUser,accDetailUpdater);
userRouter.route('/updateProfilePhoto').patch(sessionMiddleware,authenticateUser,uploadProfilePhoto.single('profilePhoto'),profilePhotoUpdater);



export default userRouter;