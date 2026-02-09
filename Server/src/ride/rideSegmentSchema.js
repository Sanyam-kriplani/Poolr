import mongoose from "mongoose";

export const segmentSchema = new mongoose.Schema(
  {
    fromIndex: {
      type: Number,
      required: true
    },

    toIndex: {
      type: Number,
      required: true
    },

    availableSeats: {
      type: Number,
      required: true,
      min: 0
    },

    distance: {
      type: Number, // meters
      required: true
    }
  },
  { _id: false }
);