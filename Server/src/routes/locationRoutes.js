import express from 'express'
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { searchLocation } from '../controllers/locationController.js';

const locationRoute= express.Router();

//protected location routes

locationRoute.route('/').get(sessionMiddleware,authenticateUser,searchLocation)

export default locationRoute;