import express from 'express';
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { postReview } from '../review/reviewController.js';
import { refreshSession } from '../middlewares/refreshSessionMiddleware.js';

const reviewRoute=express.Router();

//protected review routes
reviewRoute.route('/').post(sessionMiddleware,authenticateUser,refreshSession,postReview);


export default reviewRoute;