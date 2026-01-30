import mongoose from 'mongoose'; 

const reviewSchema = await mongoose.Schema({
driverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
rideId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Ride",
    required:true
},
passengerId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
rating:{
    type:Number,
    required:true
},
remarks:{
    type:String
}
},{timestamps:true});

const Review= await mongoose.model('Review',reviewSchema);

export default Review;

// Review[icon: star]{
//   id string pk
//   driver_id string fk
//   ride_id string fk
//   passenger_id string fk
//   rating integer
//   review string
//   created_at date
// }

