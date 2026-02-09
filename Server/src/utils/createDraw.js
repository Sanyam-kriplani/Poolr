// radiusMeters = 2000 → 2km
export function createCircle([lng, lat], radiusMeters, steps = 32) {
  const earthRadius = 6378137; // meters
  const coords = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (i * 2 * Math.PI) / steps;

    const dx = radiusMeters * Math.cos(angle);
    const dy = radiusMeters * Math.sin(angle);

    const deltaLng = (dx / earthRadius) * (180 / Math.PI);
    const deltaLat = (dy / earthRadius) * (180 / Math.PI);

    coords.push([
      lng + deltaLng,
      lat + deltaLat
    ]);
  }

  return coords;
}