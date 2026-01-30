import Review from '../models/reviewModel.js'
import Ride from '../models/rideModel.js'
import User from '../models/userModel.js'



export const postReview= async (req,res)=>{
    try {
        const passengerId=req.user_id;
        const {rideId,rating,remarks}= req.body;
    
        if(!rideId){
            return res.status(400).json({
                message:"rideId is missing"
            })
        }
        const ride=await Ride.findById(rideId);
    
        if(!ride){
            return res.status(404).json({
                message:"Ride not found"
            })
        }
        const isPassenger = ride.passengers.some(
          (id) => id.toString() === passengerId.toString()
        );
    
        if(!isPassenger){
            return res.status(403).json({
                message:"You are not authorized to give rating to this ride"
            })
        }
    
        if(!rating ){
            return res.status(400).json({
                message:"Rating is a required field"
            })
        }
        const driverId=ride.driverId;

        // prevent duplicate review by same passenger for same ride & driver
        const existingReview = await Review.findOne({
          rideId: rideId,
          passengerId: passengerId,
          driverId: driverId,
        });

        if (existingReview) {
          return res.status(409).json({
            message: "You have already reviewed this ride",
          });
        }

        const newReview=new Review({
            rideId,
            passengerId,
            driverId,
            rating,
            remarks
        })
        
        const savedReview= await newReview.save();

        // recalculate driver's average rating using aggregation
        const ratingStats = await Review.aggregate([
          {
            $match: { driverId: driverId },
          },
          {
            $group: {
              _id: "$driverId",
              avgRating: { $avg: "$rating" },
            },
          },
        ]);

        if (ratingStats.length > 0) {
          await User.findByIdAndUpdate(driverId, {
            rating: Number(ratingStats[0].avgRating.toFixed(1)),
          });
        }
    
        return res.status(200).json({
            message:"Review has been saved successfully",
            savedReview
        })
    } catch (error) {
        return res.status(500).json({
            message:"Error posting review",
            error:error.message
        })
    }
}

export const getReviewsByDriverId= async (req,res)=>{
try {
        const driverId=req.query;
    
        if(!driverId){
            return res.status(400).json({
                message:"driverId is required"
            })
        }
    
        const reviews=await Review.find();
    
        if(reviews.length()===0){
            return res.status(200).json({
                message:"No reviews yet"
            })
        }
    
        return res.status(200).json({reviews});
} catch (error) {
    return res.status(200).json({
        message:"Error fetching reviews",
        error:error.message
    })
}
}
