import express from 'express'; 
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";




dotenv.config();

const  app= express();


app.use(cors({
  origin: "http://localhost:5173",
   methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

 app.options("", cors({
   origin: "http://localhost:5173",
   credentials: true,
 }));

// Basic Middlewarews
app.use(express.json());
app.use(cookieParser());

//Session Middleware
import { sessionMiddleware } from "./middlewares/sessionMiddleware.js";
app.use(sessionMiddleware);



//Importing Routes
import userRoute from './user/userRoutes.js';
import rideRoute from './ride/rideRoutes.js';
import bookingRoute from './booking/bookingRoutes.js'
import vehicleRoute from './vehicle/vehicleRoutes.js';
import locationRoute from './location/locationRoutes.js'
import reviewRoute from './review/reviewRoutes.js';
import authRoute from './auth/auth.routes.js';

//Routes

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use('/api/auth', authRoute)
app.use("/api/users", userRoute);
app.use('/api/rides', rideRoute);
app.use('/api/bookings', bookingRoute);
app.use('/api/vehicles', vehicleRoute);
app.use('/api/locations', locationRoute);
app.use('/api/reviews', reviewRoute);




export default app;



