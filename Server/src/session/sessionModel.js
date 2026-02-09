import mongoose from "mongoose";

// models/Session.js


const sessionSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,
  },
  type:{
    type:String,
    enum: ["LOGIN", "PASSWORD_RESET"],
    default: "upcoming"
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expiresAt: {
    type: Date
  },
  session: Object,
}, { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);
export default Session;