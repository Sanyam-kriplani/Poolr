import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    index: true
  },
  state: {
    type: String,
    required: true,
    index: true
  },
  country: {
    type: String,
    required: true,
    default: "India"
  },
  countryCode: {
    type: String,
    required: true,
    default: "IN"
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { timestamps: true });

/* Isse duplicate entry nhi hongi */
locationSchema.index(
  { city: 1, state: 1 },
  { unique: true }
);

const Location = mongoose.model("Location", locationSchema);

export default Location;

// Location[icon:map]{
// id string PK
// city string 
// state string
// latitude string
// longitude string
// }