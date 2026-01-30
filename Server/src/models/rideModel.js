import mongoose from "mongoose";

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
    source:{
        type: String,
        required: true,   
    },
    destination:{
        type: String,
        required: true,   
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
    passengers:[{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    }],
    status:{
       type:String,
       enum: ["upcoming","expired", "cancelled"],
       default: "upcoming"
    }
},{timestamps:true});

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;


// Ride [icon: wind]{
//   id integer pk
//   driver_id string fk
//   vehicle_id string fk
//   source_location_id string fk
//   destination_location_id string fk
//   departure_time string
//   total_seats integer
//   price_per_seat integer 
//   available_seats integer
//   status integer
//   created_at date
// }


