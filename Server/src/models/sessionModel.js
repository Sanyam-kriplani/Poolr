import mongoose from "mongoose";

// models/Session.js


const sessionSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

const Session = mongoose.model("Session", sessionSchema);
export default Session;