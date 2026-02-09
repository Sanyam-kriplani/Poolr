import mongoose from "mongoose";
import { waypointSchema } from "./rideWaypointSchema.js";
import { segmentSchema } from "./rideSegmentSchema.js";

const rideSchema = new mongoose.Schema({
    driverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true  
    },
    vehicleId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Vehicle",
        required: true
    },
    source: {
    name: String,
    location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }  
    }
    },
    destination: {
    name: String,
    location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
     }
    }
    },
    route: {
    type: {
        type: String,
        enum: ["LineString"],
        required: true
    },
    coordinates: {
        type: [[Number]], // [[lng, lat], [lng, lat], ...]
        required: true
    }
    },
    departureDateTime:{
        type: Date,
        required:true
    },
    totalAvailableSeats:{
        type: Number,
        required:true,
    },
    pricePerSeat:{
        type:Number,
        required:true
    },
    distance:{
        type:Number,
        required:true
    },
    duration:{
        type:Number,
        required:true
    },
    passengers:[{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }],
    status:{
       type:String,
       enum: ["upcoming", "cancelled"],
       default: "upcoming"
    },
    waypoints: {
      type: [waypointSchema],
      required: true,
      // validate: v => v.length >= 2 // source + destination minimum
    },
    segments: {
      type: [segmentSchema],
      required: true,
      // validate: v => v.length >= 1
    }
},{timestamps:true});

const Ride = mongoose.model('Ride', rideSchema);



// GeoSpatial Indexes
rideSchema.index({ "source.location": "2dsphere" });
rideSchema.index({ "destination.location": "2dsphere" });
rideSchema.index({ route: "2dsphere" });
rideSchema.index({ "waypoints.location": "2dsphere" });

export default Ride;




