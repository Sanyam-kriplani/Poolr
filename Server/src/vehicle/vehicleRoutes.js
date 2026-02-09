import express from 'express';
import { addVehicle, deleteVehicle, getVehicleByDriverId } from '../vehicle/vehicleController.js';
import { sessionMiddleware } from '../middlewares/sessionMiddleware.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const vehicleRoute= express.Router();

//protected vehicle routes
vehicleRoute.route('/').post(sessionMiddleware,authenticateUser,addVehicle);
vehicleRoute.route('/').get(sessionMiddleware,authenticateUser,getVehicleByDriverId);



export default vehicleRoute;