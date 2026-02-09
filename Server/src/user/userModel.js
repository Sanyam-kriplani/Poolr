import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true  
    },
    age:{
        type: Number,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true    
    },
    phone_no:{
        type: String,
        required: true,
        unique: true
    },
    profile_photo:{
        type: String
    },
    rating:{
        type: Number,
        default: 0
    },
    password_hash:{
        type: String,
        required: true
    },
    otp:{
        type:Number,
        default:null
    },
    otpExpiredTime:{
        type:Date,
        default:null,
    },
    lastUpdated:{
        type: Date,
        default: Date.now
    },
    registrationDate:{
        type: Date,
        default: Date.now
    }

});

const User = mongoose.model('User', userSchema);

export default User;


// User {
//   id integer pk
//   name string
//   age integer
//   email string
//   phone_no integer
//   vehicle_id objectId[] fk
//   profile_photo string
//   rating integer
//   password_hash string
//   lastUpdated timestamp
//   registrationDate date
// }