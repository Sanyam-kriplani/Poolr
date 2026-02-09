import { haversine } from "./haversine.js";

/**
 * Create ride segments from waypoints
 *
 * @param {Array} waypoints - sorted by routePointIndex ASC
 * @param {Array} routeCoords - full route coordinates [[lng,lat], ...]
 * @param {Number} totalSeats - seats offered by driver
 * @returns {Array} segments
 */
export function createSegmentsFromWaypoints(
  waypoints,
  routeCoords,
  totalSeats
) {
  if (!waypoints || waypoints.length < 2) {
    throw new Error("At least two waypoints are required to create segments");
  }

  // Ensure correct order (defensive)
  const sortedWaypoints = [...waypoints].sort(
    (a, b) => a.routePointIndex - b.routePointIndex
  );

  const segments = [];

  for (let i = 0; i < sortedWaypoints.length - 1; i++) {
    const fromIndex = sortedWaypoints[i].routePointIndex;
    const toIndex = sortedWaypoints[i + 1].routePointIndex;

    if (fromIndex >= toIndex) {
      throw new Error("Invalid waypoint order");
    }

    // Calculate distance for this segment
    let distance = 0;

    for (let j = fromIndex + 1; j <= toIndex; j++) {
      distance += haversine(
        routeCoords[j - 1],
        routeCoords[j]
      );
    }

    segments.push({
      fromIndex,
      toIndex,
      availableSeats: totalSeats,
      distance: Math.round(distance) // meters
    });
  }

  return segments;
}