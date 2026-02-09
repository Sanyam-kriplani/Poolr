import Booking from "./bookingModel.js";
import Ride from "../ride/rideModel.js";
import User from "../user/userModel.js";
import Location from "../location/locationModel.js";
import { sendMail } from "../utils/composeMail.js";
import mongoose from "mongoose";


export const createBooking= async(req,res)=>{
    try {
        const passengerId=req.session.userId;
        const {rideId,seatsBooked}=req.body;
         const ride=await Ride.findById(rideId);
         if(!ride){
          return res.status(404).json({
            message:"Ride not found"
          });
         }
        // prevent driver from booking their own ride
        if (ride.driverId.toString() === passengerId.toString()) {
          return res.status(403).json({
            message: "Driver cannot book their own ride",
          });
        }

        if(!ride){
         return res.status(404).json({
            message:"Ride does not exist"
         })
        }
          const oneHour = 60 * 60 * 1000;
          const startTime = new Date(ride.departureDateTime.getTime() - oneHour);
          const endTime   = new Date(ride.departureDateTime.getTime() + oneHour);


        const conflictingRide=await Ride.findOne({
          driverId:passengerId,
          status:"upcoming",
          _id: { $ne: rideId }, 
          departureDateTime:{
            $gte:startTime,
            $lte:endTime
          }
        })

        if(conflictingRide){
          return res.status(400).json({
              message: "You have an upcoming ride within ±1 hour"
            });
        }

        // prevent passenger from booking another ride if they already have a confirmed booking within ±1 hour
        const confirmedBooking = await Booking.findOne({
          passengerId,
          status: "confirmed",
        }).populate("rideId");

        if (
          confirmedBooking &&
          confirmedBooking.rideId &&
          confirmedBooking.rideId.departureDateTime >= startTime &&
          confirmedBooking.rideId.departureDateTime <= endTime
        ) {
          return res.status(400).json({
            message: "You already have a confirmed booking within ±1 hour of this ride",
          });
        }


    
        const existingBooking=await Booking.findOne({rideId,passengerId});
        if(existingBooking){
            return res.status(400).json({message:"Booking already exists"})
        }
    
        if(!seatsBooked){
            return res.status(400).json({
                message:"seatsBooked is required"
            })
        }
    
        const booking=new Booking({
            rideId,
            driverId:ride.driverId,
            passengerId,
            seatsBooked
        });
    
        const savedBooking=await booking.save();
        
        res.status(201).json({ message: "Booking created successfully",ride: savedBooking });
    } catch (error) {
        res.status(500).json({ message: "Error creating Booking", Error:error.message});
    }
}

export const bookingCancellar = async (req, res) => {
  try {
    const bookingId = req.body._id;

    if (!bookingId) {
      return res.status(400).json({
        message: "bookingId is required",
      });
    }

    const booking = await Booking.findById(bookingId);



    if (!booking) {
      return res.status(400).json({
        message: "Booking does not exist",
      });
    }

    if (
      booking.passengerId.toString() !== req.session.userId.toString() &&
      booking.driverId.toString() !== req.session.userId.toString()
    ) {
      return res.status(403).json({
        message: "You are not authorized to cancel this booking",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({
        message: "You cannot cancel a booking after confirmation",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error cancelling booking",
    });
  }
};

export const bookingConfirmation=async (req,res)=>{
   try {
     const bookingId=req.body._id;
     const driverId=req.session.userId;
     if(!bookingId){
         return res.status(400).json({
             message:"bookingId is required"
         });
     }
 
     const booking = await Booking.findById(bookingId);
 
     if(!booking){
          return res.status(400).json({
                 message:"Booking does not exist"
             })
     }
    
    if(booking.status=="confirmed"){
        return res.status(400).json({
            message:"Booking already confirmed"
        })
     }
 
     const ride= await Ride.findById(booking.rideId);

     if(!ride){
        return res.status(400).json({
            message:"Ride does not exist anymore"
        })
     }
 
     if(ride.driverId.toString() !=driverId){
         return res.status(403).json(
            { message:"you are not authorized to confirm this booking"}
         )
     }

     
 
     const driver=await User.findById(driverId);

     console.log(ride);
     
 
     const passenger=await User.findById(booking.passengerId);
 
     const pickup=await Location.findOne({city:ride.source.name});
     const drop= await Location.findOne({city:ride.destination.name});
     
 
     await sendMail({to: passenger.email,
    sub: "Poolr: Your Booking is Confirmed 🚗",
    msg: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hi ${passenger.name}, 👋</h2>

      <p><strong>Good news! 🎉</strong></p>

      <p>
        Your booking for the ride has been <strong>confirmed</strong> by
        <strong>${driver.name}</strong>.
      </p>

      <h3>🚘 Ride Details</h3>
      <ul>
        <li><strong>Pickup:</strong> ${pickup.city}, ${pickup.state}</li>
        <li><strong>Drop:</strong> ${drop.city}, ${drop.state}</li>
        <li><strong>Seats Booked:</strong> ${booking.seatsBooked}</li>
        <li><strong>Departure Time:</strong> ${ride.departureTime}</li>
      </ul>

      <p>
        📞 You can contact the driver at:
        <strong>${driver.phone_no}</strong>
      </p>

      <p>Have a safe and pleasant ride! 😊</p>

      <p style="margin-top:20px;">
        — <strong>Team Poolr</strong>
      </p>
    </div>
  `});
     
     ride.totalAvailableSeats -= booking.seatsBooked;

     if(ride.totalAvailableSeats===0){
        ride.isAvailable=false;
     }


     ride.passengers.push(passenger._id);
     await ride.save();
     booking.status="confirmed";
     await booking.save();
     return res.status(200).json({
        message:"Booking confirmed successfully"
     })
     
 
   } catch (error) {
       console.log(error);

    return res.status(500).json({
        message:"Error in booking confirmation",
        error:error.message
    })
   }
}

export const getMybookings = async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(400).json({
        message: "userId is required",
      });
    }

    const bookings = await Booking.find({ passengerId: userId })
      .populate({
        path: "rideId",
        select: "source destination departureDateTime pricePerSeat",
      })
      .populate({
        path: "driverId",
        select: "name phone_no rating age",
      });

    if (!bookings || bookings.length === 0) {
      return res.status(404).json({
        message: "No bookings found",
      });
    }

    return res.status(200).json(bookings);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching bookings",
    });
  }
};

export const getBookingById= async (req,res)=>{
    try {
        const userId=req.session.userId;
        const { id }=req.params;
        if(!id){
            return res.status(400).json({
                message:"bookingId is required"
            })
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
            message: "Invalid bookingId format"
            });
        }
        
        const booking= await Booking.findById(id);
    
        if(!booking){
            return res.status(404).json({
                message:"Booking not found"
            });
        }

        if (!booking.passengerId.equals(req.session.userId)) {
        return res.status(403).json({
         message: "You are not authorized to view this Booking"
        });
        }
        return res.status(200).json({booking});
    } catch (error) {
        console.log(error);   
        return res.status(500).json({
            message:"Error fetching booking",
        })
    }
}

export const getBookingRequests = async (req, res) => {
  try {
    const { rideId } = req.query;

    if (!rideId) {
      return res.status(400).json({ message: "rideId is required" });
    }

    const requests = await Booking.find({ rideId,status:"pending" })
      .populate("passengerId", "name email phone_no age");

    if (!requests || requests.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(requests);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Error fetching the requests",
    });
  }
};