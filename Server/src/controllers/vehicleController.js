import User from "../models/userModel.js";
import Vehicle from "../models/vehicleModel.js";

export const addVehicle= async (req,res)=>{
    try {
        const driverId=req.user_id;
        console.log(driverId);
        const{brand, model, registrationNo, color}=req.body;

    
        if(!brand || !model || !registrationNo || !color){
            return res.status(400).json({
                message:"Required fields are missing"
            })
        }
    
        const existingVehicle=await Vehicle.findOne({
            registrationNo
        });
        if(existingVehicle){
            return res.status(400).json({
                message:"Vehicle with this is registrationNo already exists"
            })
        }

        await Vehicle.updateMany(
          { driverId },
          { $set: { isActive: false } }
        );
    
        const newVehicle= new Vehicle({
            driverId,
            brand,
            model,
            registrationNo,
            color,
            isActive: true
        });
    
        const savedVehicle= await newVehicle.save();
    
        return res.status(200).json({
            message:"Vehicle saved sucessfully"
        })
    } catch (error) {
        return res.status(500).json({
            message:"Error adding vehicle"
        })
    }
    
}

export const deleteVehicle= async (req,res)=>{
    try {
        const { id }=req.params;
        
        const userId=req.user_id;
    
        if(!id){
            return res.status(400).json({
                message:"vehicle Id is required"
            })
        }
        const vehicle= await Vehicle.findById(id);
    
        if(!vehicle.driverId.equals(userId)){
            return res.status(403).json({
                message:"You are not authorized to delete this vehicle"
            })
        }
    
        await Vehicle.deleteOne({
            _id:id
        });
        return res.status(200).json({
            message:"Vehicle deleted successfully"
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Error deleteing vehicle"
        })
    }
}

// export const getMyVehicles= async(req,res)=>{
//     try {
//         const driverId=req.user_id;
    
//         const myVehicles=await Vehicle.find({driverId});
    
//         if(typeof(myVehicles)===undefined || myVehicles.length===0){
//             return res.status(404).json({
//                 message:"No vehicles found, please add a vehicle first."
//             });
//         }
    
//         return res.status(200).json({myVehicles});
//     } catch (error) {
//         return res.status(500).json({
//             message:"Error fetching vehicles"
//         })
//     }
// }

export const getVehicleByDriverId= async(req,res)=>{
    try {
        const driverId=req.user_id;
    
    
        const vehicle = await Vehicle.findOne({ driverId, isActive: true });
    
        if(!vehicle){
            return res.status(404).json({
                message:"Vehicle not found"
            })
        }
        
        return res.status(200).json(vehicle);
        
    } catch (error) {
        return res.status(500).json({
            message:"Error fetching vehicle"
        })
    }
}
