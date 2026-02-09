import Ride from "./rideModel.js";
import Booking from "../booking/bookingModel.js";
import mongoose from "mongoose";
import Location from "../location/locationModel.js";
import {sendMail} from "../utils/composeMail.js"
import User from "../user/userModel.js"
import { getOptimizedRoute } from "../services/orsService.js";
import polyline from "@mapbox/polyline";
import { createCircle } from "../utils/createDraw.js";
import { sampleRoutePoints } from "../utils/geo/sampleRoutePoints.js";
import { detectStops } from "../utils/geo/detectStops.js";
import { raw } from "express";
import { waypointSchema } from "./rideWaypointSchema.js";
import { createSegmentsFromWaypoints } from "../utils/geo/createSegments.js";
import { findNearestWpRouteIndex } from "./findNearestWpIndex.js";
import { reverseGeocode } from "../utils/geo/reverseGeocode.js";

export const ridePublisher= async(req,res)=>{
 try {

    const driverId=req.session.userId;
    const {vehicleId,source,destination,departureDateTime,totalAvailableSeats,pricePerSeat,routePolyline,duration,distance,waypoints}=req.body;


    if (
        !driverId ||
        !vehicleId ||
        !source ||
        !destination ||
        !departureDateTime || 
        !routePolyline ||
        !waypoints ||
        !duration ||
        !distance ||
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
         if(existingRide.source.name ===source.name && existingRide.destination.name === destination.name){
             return res.status(400).json({ message: "Ride already exists" });
         }
         else{
            return res.status(400).json({ message: "You already have an upcoming ride within ±1 hour for a different route" });
         }
        }

        // prevent publishing a ride if user already has a confirmed booking within +-1 hour
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
        
        if (!routePolyline) {
          return res.status(400).json({
            message: "routePolyline is required",
          });
        }
        
        

        // Decode polyline → [[lat, lng], [lat, lng], ...]
        const decoded = polyline.decode(routePolyline);
        
      
        // Convert to GeoJSON format → [[lng, lat], ...]
        const coordinates = decoded.map(([lat, lng]) => [lng, lat]);

        if(coordinates.length===0){
          return res.status(400).json({
            message:"route not found"
          })
        }

        const route = {
          type: "LineString",
          coordinates,
        };
        
        const normalizedWaypoints = waypoints.map((wp, i) => ({
            index: i, // ✅ ordinal position
            name: wp.name,
            location: wp.location,
            routePointIndex: wp.routePointIndex,
        }));
       
        console.log(normalizedWaypoints);
        
        const segments = createSegmentsFromWaypoints(normalizedWaypoints,route.coordinates,totalAvailableSeats);


        
        const newRide = new Ride({
        driverId,
        vehicleId,
        source,
        route,
        waypoints:normalizedWaypoints,
        segments,
        duration,
        distance,
        destination,
        departureDateTime,
        totalAvailableSeats:Number(totalAvailableSeats),
        pricePerSeat:Number(pricePerSeat),        
        });     
        
        const savedRide = await newRide.save();
        
        res.status(201).json({ message: "Ride created successfully",ride: savedRide });
    } catch (error) {
     res.status(500).json({ message: "Error creating ride",Error:error.message });
 }
}

export const getRideRoute = async (req, res) => {
  try {
    const { source, destination } = req.body;

    if (
      !source ||
      !destination ||
      !source.location?.coordinates ||
      !destination.location?.coordinates
    ) {
      return res.status(400).json({
        message: "source and destination coordinates are required",
      });
    }

    const sourceCoords = source.location.coordinates;       // [lng, lat]
    const destinationCoords = destination.location.coordinates;

    const routeData = await getOptimizedRoute(
      sourceCoords,
      destinationCoords
    );

    const coordinates = routeData.geometry.coordinates; // [[lng,lat],...]

    // polyline needs [lat, lng]
    const latLngArray = coordinates.map(([lng, lat]) => [
      lat,
      lng,
    ]);

    const encodedPolyline = polyline.encode(latLngArray);

    return res.status(200).json({
      polyline: encodedPolyline,
      distance: routeData.properties.summary.distance, // meters
      duration: routeData.properties.summary.duration, // seconds
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error generating route",
      error: error.message,
    });
  }
};

export const getRouteWaypoints = async (req , res) => {

  try {
    
   const {source, destination, routePolyline}=req.body;

   
   const nonGeoJSONRoute = polyline.decode(routePolyline) ;

   const GeoJSONRoute = (polyline) => ({
   coordinates: polyline.map(([lat, lng]) => [lng, lat]),
   });
 
   const route = GeoJSONRoute(nonGeoJSONRoute);

   const sampledPoints = sampleRoutePoints(route.coordinates);

   
   const detectedStops= await detectStops(sampledPoints,5)
   
   console.log(detectedStops);

   const rawWayPoints = [
    {
      name:source.name,
      location:source.location,
      routePointIndex:0
    },
    ...detectedStops,
    {
      name:destination.name,
      location:destination.location,
      routePointIndex:route.coordinates.length - 1
    }
   ];

   rawWayPoints.sort((a,b) => a.routePointIndex - b.routePointIndex );


   return res.status(200).json({
    waypoints:rawWayPoints
   })
  } catch (error) {
    return res.status(500).json({
      message:"Error fetching waypoints",
      Error:error.message
    })
  }  
};

export const rideUpdater= async(req,res)=>{
    try {
        const rideId=req.body._id;
        if (!rideId) {
        return res.status(400).json({ message: "rideId is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(rideId)) {
        return res.status(400).json({ message: "Invalid rideId" });
        }
        const userId=req.session.userId;
    
        const ride = await Ride.findOne({
        _id: rideId,
        driverId: userId
        });
    
        if(!ride){
           return res.status(404).json({message:"Ride not found"});
        }
        const { pricePerSeat, departureDateTime, totalAvailableSeats } = req.body;

        if(ride.passengers.length!==0){
            return res.status(400).json({
                message:"You cannot update the ride once passengers have joined"
            })
        }
        if (pricePerSeat !== undefined) {
          ride.pricePerSeat = Number(pricePerSeat);
        }     
        if (departureDateTime) {
          const parsedDepartureTime = new Date(departureDateTime);

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
        const userId=req.session.userId;
    
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

        
        

        const pickup=await Location.findOne({city:ride.source.name});
        const drop=await Location.findOne({city:ride.destination.name});

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

export const searchRides = async (req, res) => {
  try {
    const { source, destination, seatsRequired, departureDate } = req.body;
    const userId = req.session.userId;

    if (!source || !destination || !seatsRequired || !departureDate) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    const today = new Date();
    today.setSeconds(0, 0);

    const searchDate = new Date(departureDate);
    searchDate.setHours(0, 0, 0, 0);

     // if searching for today, start from NOWW
    const lowerBound =
    searchDate.toDateString() === today.toDateString()
    ? today
    : searchDate;
//============== making a tolerance of 2 km around destination ==================
    const dropBuffer = {
        type: "Polygon",
        coordinates: [
          createCircle(destination.location.coordinates, 2000) // 2 km tolerance
        ]
      };

    const candidateRides = await Ride.aggregate([
      {
        $geoNear:{
          near:{
            type:"Point",
            coordinates:source.location.coordinates
          },
          key:"route",
          distanceField:"distanceFromSource",
          maxDistance:5000, //5KM
          spherical:true,
          query:{
            status:"upcoming",
            driverId:{$ne:userId},
            totalAvailableSeats:{$gte:Number(seatsRequired)},
            departureDateTime:{$gte:lowerBound},
          }
        },
      },
      {
        $match:{
          route:{
            $geoIntersects:{
              $geometry: dropBuffer
            }
          }
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"driverId",
          foreignField:"_id",
          as:"driver",
        }
      },
      {
        $unwind: {
        path: "$driver",
        preserveNullAndEmptyArrays: false
      }
      },
      {
      $sort:{ distanceFromSource: 1}
      },
      {
        $project:{
          "driver.password":0
        }
      }
    ]);

// ============ filtering on the basis of seat availability for overlapping segments========
    const validrides = [];
    for(const ride of candidateRides){
     
      const pickIndex = findNearestWpRouteIndex(ride.waypoints, source.location.coordinates);

      
      const dropIndex =findNearestWpRouteIndex(ride.waypoints, destination.location.coordinates);
      console.log(pickIndex,dropIndex);

      if(pickIndex > dropIndex) continue;

      const usableSegments=ride.segments.filter(seg =>
              seg.fromIndex >= pickIndex && 
              seg.toIndex <= dropIndex
            );
      
      const askedDist=usableSegments.reduce((acc,seg)=>(acc + seg.distance),0);
      
      const cost=Math.ceil((askedDist / ride.distance )*ride.pricePerSeat);
      
      
      const seatsOk= usableSegments.every((seg) =>
      seg.availableSeats >= seatsRequired
      );
      
      
      
      if(seatsOk){

        const pickupPoint = await reverseGeocode(ride.route.coordinates[pickIndex])

        const dropPoint = await  reverseGeocode(ride.route.coordinates[dropIndex])

        console.log(pickupPoint);
        
        
        validrides.push({
          ...ride,
          pickupPoint:{
            ...pickupPoint.result
          },
          dropPoint:dropPoint.result,
          askedDist,
          cost
        });
      }

    }

    return res.status(200).json(validrides);
    } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error fetching rides",
      error: error.message,
    });
  }
};

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
        const userId=req.session.userId;
        
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