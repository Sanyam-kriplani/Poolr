import express from 'express';
import {ridePublisher, rideCancellar, rideUpdater, searchRides, getRideById, getMyPublishedRides,  getPassengers, getRideRoute } from "./rideController.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { sessionMiddleware } from "../middlewares/sessionMiddleware.js";
import { refreshSession } from '../middlewares/refreshSessionMiddleware.js';
import { getRouteWaypoints } from './rideController.js';

const rideRoute=express.Router();

//Protected Ride Routes

rideRoute.route('/').post(sessionMiddleware,authenticateUser,refreshSession,ridePublisher);
rideRoute.route('/cancelRide').patch(sessionMiddleware,authenticateUser,refreshSession,rideCancellar);
rideRoute.route('/').patch(sessionMiddleware,authenticateUser,refreshSession,rideUpdater);
rideRoute.route('/getPassengers').get(sessionMiddleware,authenticateUser,getPassengers);
rideRoute.route('/search').post(sessionMiddleware,authenticateUser,refreshSession,searchRides);
rideRoute.route('/getRideRoute').post(sessionMiddleware,authenticateUser,getRideRoute);
rideRoute.route('/getRideWayPoints').post(sessionMiddleware,authenticateUser,getRouteWaypoints);
rideRoute.route('/myRides').get(sessionMiddleware,authenticateUser,getMyPublishedRides);
rideRoute.route('/:id').get(sessionMiddleware,authenticateUser,getRideById);

export default rideRoute;

