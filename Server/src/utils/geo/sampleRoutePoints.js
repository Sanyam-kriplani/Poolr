import { haversine } from "./haversine.js";

const SAMPLE_DISTANCE = 30_000; // 5 km

export function sampleRoutePoints(routeCoords) {
  let sampled = [];
  let accDist = 0;


  console.log(
  haversine(
    routeCoords[0],
    routeCoords[routeCoords.length - 1]
  )
);

  for (let i = 1; i < routeCoords.length; i++) {
    accDist += haversine(routeCoords[i - 1], routeCoords[i]);

    if (accDist >= SAMPLE_DISTANCE) {
      sampled.push({
        coordinates: routeCoords[i],
        routePointIndex: i
      });
      accDist = 0;
    }
  }
  console.log(sampled);
  return sampled;
}