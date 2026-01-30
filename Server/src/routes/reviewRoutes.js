import express from 'express';
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { postReview } from '../controllers/reviewController.js';

const reviewRoute=express.Router();

//protected review routes
reviewRoute.route('/').post(sessionMiddleware,authenticateUser,postReview);


export default reviewRoute;