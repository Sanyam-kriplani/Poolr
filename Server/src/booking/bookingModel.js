import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    rideId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ride",
        required: true  
    },
    passengerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    driverId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    seatsBooked:{
        type: Number,
        required: true,
        min: 1   
    },
    status:{
        type: String ,
        enum: ["pending", "confirmed","cancelled"],
        default: "pending",   
    }
},{ timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;


// Booking[icon: book-open]{
//   id integer pk
//   ride_id string fk
//   passenger_id string fk
//   seats_booked integer
//   status string
//   created_at date
//}