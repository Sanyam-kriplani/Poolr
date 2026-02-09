import { createBooking, bookingCancellar,bookingConfirmation, getMybookings, getBookingById, getBookingRequests } from "../booking/bookingController.js";
import express from 'express';
import { sessionMiddleware } from "../middlewares/sessionMiddleware.js";
import { authenticateUser } from "../middlewares/authMiddleware.js";


const bookingRoute= express.Router();

//protected booking routes
bookingRoute.route('/').post(sessionMiddleware,authenticateUser,createBooking);
bookingRoute.route('/cancelBooking').patch(sessionMiddleware,authenticateUser,bookingCancellar);
bookingRoute.route('/confirmBooking').patch(sessionMiddleware,authenticateUser, bookingConfirmation);
bookingRoute.route('/myBookings').get(sessionMiddleware,authenticateUser,getMybookings);
bookingRoute.route('/bookingRequests').get(sessionMiddleware,authenticateUser,getBookingRequests);
bookingRoute.route('/:id').get(sessionMiddleware,authenticateUser,getBookingById);


export default bookingRoute;