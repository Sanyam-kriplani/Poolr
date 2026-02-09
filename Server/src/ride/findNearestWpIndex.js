import { haversine } from "../utils/geo/haversine.js";

export function findNearestWpRouteIndex( waypoints, pointCoords){
    let minDist= Infinity;
    let nearestRouteIndex = -1;

    console.log(pointCoords)

    for( const wp of waypoints){

        const [lng, lat] = wp.location.coordinates;
        
        
        const dist = haversine(
            [lng,
            lat],
            [ pointCoords[0],
            pointCoords[1]]
        );
        
        if(dist < minDist ){
            minDist = dist;
            nearestRouteIndex = wp.routePointIndex;
        }
    }
    
    return nearestRouteIndex;
}