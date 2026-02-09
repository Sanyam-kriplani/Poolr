import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export const getOptimizedRoute = async (sourceCoords, destinationCoords) => {

  console.log(process.env.ORS_API_KEY+"=");
  
     
  try {
    const response = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [sourceCoords, destinationCoords],
        instructions: false,
        geometry: true,
        preference: "fastest",
      },
      {
        headers: {
          "Authorization":`${process.env.ORS_API_KEY}=`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log(response.data.features[0].properties.summary);
    
    return response.data.features[0];
  } catch (error) {
    console.error(
      "ORS ERROR:",
      error.response?.data || error.message)
  }

};