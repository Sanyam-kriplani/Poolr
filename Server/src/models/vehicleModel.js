import mongoose from 'mongoose'; 

const vehicleSchema = await mongoose.Schema({
driverId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
},
brand:{
    type:String,
    required:true
},
model:{
    type:String,
    required:true
},
registrationNo:{
    type:String,
    required:true
},
color:{
    type:String,
    required:true
},
isActive:{
    type:Boolean,
    default:true
}
},{timestamps: true});

const Vehicle= await mongoose.model('Vehicle',vehicleSchema);

export default Vehicle;


// Vehicle[icon: car]{
// id stiring PK
// driver_id string FK 
// brand string
// model string
// registration_number string
// seats_available integer
// created_at date
// }