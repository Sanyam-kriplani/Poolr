import { reverseGeocode } from "./reverseGeocode.js"

export const detectStops=async (sampledPoints,maxStops)=>{



if(!sampledPoints || sampledPoints.length === 0)return [];

const windowSize = Math.ceil(sampledPoints.length / maxStops);
const windowSamples = [];

for(let i = 0; i<sampledPoints.length;i+=windowSize){
    windowSamples.push(sampledPoints[i]);
}

const stops=[];
const seenCity=new Set();

for(const point of windowSamples){

    const place=await reverseGeocode(point.coordinates);

    if (!place || !place.result || !place.result.city) continue;

    if(seenCity.has(place.result.city))continue;
    seenCity.add(place.result.city);

    stops.push({
     name:place.result.city,
     location:{
        type:"Point",
        coordinates: place.result.location.coordinates,
     },
     routePointIndex:point.routePointIndex,
     importance: place.result.importance   
    });

}


// sorting stopps by decs importance and returning top 5
return stops
  .sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))
  .slice(0, 5);

};