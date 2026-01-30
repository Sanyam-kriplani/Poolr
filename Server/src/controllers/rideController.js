import Ride from "../models/rideModel.js";
import Booking from "../models/bookingModel.js";
import mongoose from "mongoose";
import Location from "../models/locationModel.js";
import {sendMail} from "../utils/composeMail.js"
import User from "../models/userModel.js"


export const ridePublisher= async(req,res)=>{
 try {

    const driverId=req.user_id;
    const {vehicleId,source,destination,departureDateTime,totalAvailableSeats,pricePerSeat}=req.body;


    console.log(req.body.vehicleId);
    console.log(req.body.departureDateTime);

    if (
        !driverId ||
        !vehicleId ||
        !source ||
        !destination ||
        !departureDateTime || 
        totalAvailableSeats === undefined ||
        pricePerSeat === undefined
        ) {
            return res.status(400).json({ message: "Required fields missing" });
        }
        if (new Date(departureDateTime).getTime() <= Date.now()) {
        return res.status(400).json({ message: "Departure time must be in the future" });
        }
        
        
        if (totalAvailableSeats < 1) {
        return res.status(400).json({ message: "Seats must be atleast 1" });
        }

        if (totalAvailableSeats > 6) {
        return res.status(400).json({ message: "Seats must be below or equal to 6" });
        }
        
        const requestedTime = new Date(departureDateTime);

        const oneHour = 60 * 60 * 1000;

        const startTime = new Date(requestedTime.getTime() - oneHour);
        const endTime   = new Date(requestedTime.getTime() + oneHour);
        
        const existingRide = await Ride.findOne({
                status: "upcoming",
                driverId,
                departureDateTime: {
                    $gte: startTime,
                    $lte: endTime
                }
                })
        if (existingRide) {
         if(existingRide.source===source && existingRide.destination===destination){
             return res.status(400).json({ message: "Ride already exists" });
         }
         else{
            return res.status(400).json({ message: "You already have an upcoming ride within ±1 hour for a different route" });
         }
        }

        // prevent publishing a ride if user already has a confirmed booking within ±1 hour
        const confirmedBooking = await Booking.findOne({
          passengerId: driverId,
          status: "confirmed",
        }).populate("rideId");

        if (
          confirmedBooking &&
          confirmedBooking.rideId &&
          confirmedBooking.rideId.departureDateTime >= startTime &&
          confirmedBooking.rideId.departureDateTime <= endTime
        ) {
          return res.status(400).json({
            message:
              "You already have a confirmed ride within ±1 hour and cannot publish another ride",
          });
        }
        
        const newRide = new Ride({
        driverId,
        vehicleId,
        source,
        destination,
        departureDateTime,
        totalAvailableSeats:Number(totalAvailableSeats),
        pricePerSeat:Number(pricePerSeat),        
        });


        const savedRide = await newRide.save();
        
        res.status(201).json({ message: "Ride created successfully",ride: savedRide });
    } catch (error) {
     res.status(500).json({ message: "Error creating ride", });
 }
}

export const rideUpdater= async(req,res)=>{
    try {
        const rideId=req.body._id;
        if (!rideId) {
        return res.status(400).json({ message: "rideId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ message: "Invalid rideId" });
        }
        const userId=req.user_id;
    
        const ride = await Ride.findOne({
        _id: rideId,
        driverId: userId
        });
    
        if(!ride){
           return res.status(404).json({message:"Ride not found"});
        }
        const { pricePerSeat, departureTime, totalAvailableSeats, source, destination } = req.body;

        if(ride.passengers.length!==0){
            return res.status(400).json({
                message:"You cannot update the ride once passengers have joined"
            })
        }
        if (pricePerSeat !== undefined) {
          ride.pricePerSeat = Number(pricePerSeat);
        }     
        if (departureTime) {
          const parsedDepartureTime = new Date(departureTime);

          if (isNaN(parsedDepartureTime.getTime())) {
            return res.status(400).json({ message: "Invalid departure time format" });
          }

          if (parsedDepartureTime <= new Date()) {
            return res.status(400).json({
              message: "Departure time must be in the future",
            });
          }

          const oneHour = 60 * 60 * 1000;
          const startTime = new Date(parsedDepartureTime.getTime() - oneHour);
          const endTime   = new Date(parsedDepartureTime.getTime() + oneHour);

          const conflictingRide = await Ride.findOne({
            _id: { $ne: ride._id },
            driverId: userId,
            status: "upcoming",
            departureDateTime: {
              $gte: startTime,
              $lte: endTime
            }
          });

          if (conflictingRide) {
            return res.status(400).json({
              message: "You already have another upcoming ride within ±1 hour"
            });
          }

          ride.departureDateTime = parsedDepartureTime;
        }
        if(source){
            ride.source=source;
        }
        if (destination) {
          ride.destination = destination;
        }  
        if (totalAvailableSeats !== undefined && totalAvailableSeats < 1) {
        return res.status(400).json({ message: "Seats must be atleast 1" });
        }
        if (totalAvailableSeats !== undefined && totalAvailableSeats > 6) {
        return res.status(400).json({ message: "Seats must be below or equal to 6" });
        }
        if (totalAvailableSeats !== undefined) {
          ride.totalAvailableSeats = Number(totalAvailableSeats);
        }
    
       await ride.save();
       return res.status(200).json({message:"Ride updated Sucessfully"})
    } catch (error) {
        return res.status(500).json({ message: "Error updating Ride"
    })
  }
}

export const rideCancellar=async (req,res)=>{
    try {
        const rideId=req.body._id;
        const userId=req.user_id;
    
        if (!rideId) {
            return res.status(400).json({ message: "rideId is required" });
        }
    
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ message: "Invalid rideId" });
       }
    
        
        const ride = await Ride.findOne({
            _id:rideId,
            driverId:userId
        });
        if(!ride){
            return res.status(404).json({ message: "Ride not Found" });
        }

        
        

        const pickup=await Location.findOne({city:ride.source});
        const drop=await Location.findOne({city:ride.destination});

        const passengers=ride.passengers;

        if (passengers.length === 0) {
        ride.status="cancelled";
        await ride.save();
        return res.status(200).json({
            message:"Ride has been cancelled successfully"
        })
        }

        const passengersObjArray = await User.find({ _id: { $in: passengers } });
 

        for(const passenger of passengersObjArray){
            await sendMail({
                to:passenger.email,
                sub:"Poolr:Driver has cancelled the Ride 🙁",
                msg: `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <h2>Hi ${passenger.name}, 👋</h2>
    <p>
    We’re really sorry to inform you that the <strong>driver has cancelled the ride</strong> you booked.
  </p>
    <h3>🚗 Ride Details</h3>
  <ul>
    <li><strong>Pickup:</strong> ${pickup.city}, ${pickup.state}</li>
    <li><strong>Drop:</strong> ${drop.city}, ${drop.state}</li>
    <li><strong>Scheduled Departure:</strong> ${new Date(ride.departureDateTime).toLocaleString()}</li>
  </ul>
  <p>
    You can search for other available rides on Poolr, and we’ll do our best to help you reach your destination smoothly.
  </p>
  <p style="margin-top: 20px;">
    Once again, we are truly sorry for the inconvenience.
  </p>
  <p style="margin-top: 20px;">
    — <strong>Team Poolr</strong>
  </p>
</div>
`
            })
        }
ride.status = "cancelled";
await ride.save();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Error cancelling ride"
        });
    }
}

export const searchRides=async(req,res)=>{
    try {
        const { source, destination, seatsRequired, departureDate } = req.query;
        const userId=req.user_id;
        if(!source || !destination || !seatsRequired || !departureDate){
            return res.status(400).json({
                message:"Required fields are missing"
            })
        }
    
      const searchDate = new Date(departureDate);
      searchDate.setHours(0, 0, 0, 0);

      const rides = await Ride.find({
        source,
        destination,
        status: "upcoming",
        driverId: { $ne: userId },
        totalAvailableSeats: { $gte: Number(seatsRequired) },
        departureDateTime: { $gte: searchDate }
      })
      .populate({
        path: "driverId",
        select: "name age email phone_no rating profile_photo"
      });

       if(rides.length===0){
        return res.status(200).json([])
       }
    
       return res.status(200).json(rides)

    } catch (error) {
        return res.status(500).json({
            "message":"Error fetching rides"
        })
    }}

export const getRideById=async(req,res)=>{
try {
         const { rideId } = req.query; 
    
        if(!rideId){
            return res.status(400).json({
                message:"rideId is required"
            })
        }
        
        if(!mongoose.Types.ObjectId.isValid(rideId)){
            return res.status(400).json({
                message:"Invalid rideId"
            })
        }

        const ride= await Ride.findById(rideId);
    
        if(!ride){
            return res.status(404).json({
                message:"Ride not found"
            })
        }
    
        return res.status(200).json(ride);
    
} catch (error) {

    return res.status(500).json({
        message:"Error fetching ride"
    })  
 }
}

export const getMyPublishedRides=async(req,res)=>{
    try {
        const userId=req.user_id;
        
        if(!userId){
            return res.status(400).json({
               message:"userId is  required"
            })
        }
    
        const myRides=await Ride.find({driverId:userId});
    
        if(!myRides || myRides.length === 0){
            return res.status(404).json({
                message:"No rides found"
            })
        }
    
        return res.status(200).json({myRides});
    } catch (error) {
        return res.status(500).json({
            message:"Error fetching the rides"
        })
    }
}


export const getPassengers = async (req, res) => {
  try {
    const { rideId } = req.query;

    if (!rideId) {
      return res.status(400).json({ message: "rideId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(rideId)) {
      return res.status(400).json({ message: "Invalid rideId" });
    }

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    if (ride.passengers.length === 0) {
      return res.status(200).json([]);
    }

    const passengers = await User.find({
      _id: { $in: ride.passengers }
    });

    return res.status(200).json(passengers);

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching passengers",
      error: error.message
    });
    console.log(error);
  }
};