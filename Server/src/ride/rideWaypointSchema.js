import mongoose from "mongoose";

export const waypointSchema = new mongoose.Schema(
  {
    index: {
      type: Number,
      required: true
    },

    name: {
      type: String, // city / place name
      required: true
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },

    routePointIndex: {
      type: Number, // index on decoded route polyline
      required: true
    }
  },
  { _id: false }
);