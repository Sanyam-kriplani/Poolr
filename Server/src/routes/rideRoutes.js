import express from 'express';
import {ridePublisher, rideCancellar, rideUpdater, searchRides, getRideById, getMyPublishedRides,  getPassengers } from "../controllers/rideController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { sessionMiddleware } from "../middlewares/sessionMiddleware.js";

const rideRoute=express.Router();

//Protected Ride Routes

rideRoute.route('/').post(sessionMiddleware,authenticateUser,ridePublisher);
rideRoute.route('/cancelRide').patch(sessionMiddleware,authenticateUser,rideCancellar);
rideRoute.route('/').patch(sessionMiddleware,authenticateUser,rideUpdater);
rideRoute.route('/getPassengers').get(sessionMiddleware,authenticateUser,getPassengers);
rideRoute.route('/search').get(sessionMiddleware,authenticateUser,searchRides);

rideRoute.route('/myRides').get(sessionMiddleware,authenticateUser,getMyPublishedRides);
rideRoute.route('/:id').get(sessionMiddleware,authenticateUser,getRideById);

export default rideRoute;

