import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config();

const MAPBOX_URL="https://api.mapbox.com/search/geocode/v6"

export const reverseGeocode=async ([lng,lat])=>{
 try {
    // console.log("Reverse geocode input:", lng, lat);
    const response=await axios.get(`${MAPBOX_URL}/reverse?longitude=${lng}&latitude=${lat}`,{
        params:{
            access_token:process.env.MAPBOX_ACCESS_TOKEN,
            // types:"places,locality,region,district",
            limit:1
        },
        timeout:5000
    })

    const features=response.data?.features
    if(!features )return null
    
    const place=features[0];

    // console.log(place);
    
    
    const ctx = place.properties?.context || {};
    const city = ctx.place?.name ||
        ctx.locality?.name || 
        ctx.district?.name || null

    const importanceScore = {
        address: 1,
        street: 2,
        postcode: 3,
        locality: 4,
        place: 5
        }[place.properties.feature_type] || 0;

    
        const location={
            type:"Point",
            coordinates:place.geometry.coordinates
        }   


    
    
    const displayName = place.properties.place_formatted;
    const result ={
        city,
        importance:importanceScore,
        location,
        displayName
    }

    
    return{
        result
    }
 } catch (error) {
     console.error("Mapbox reverse geocode failed:", error.message);
     return null;
 }
};