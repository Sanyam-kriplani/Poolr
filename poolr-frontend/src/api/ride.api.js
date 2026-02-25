export async function fetchLocation(input){
    const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/locations?city=${encodeURIComponent(input)}`,
          { credentials: "include" }
        );
    
        return response;
}

export async function fetchWayPoints(rideDetails, routeDetails){
    
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/rides/getRideWayPoints`,
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: rideDetails.source,
          destination: rideDetails.destination,
          routePolyline: routeDetails.polyline,
        }),
      }
    );

    return response;
}

export async function fetchRideRoute(rideDetails){
     const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/rides/getRideRoute`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              source: rideDetails.source,
              destination: rideDetails.destination,
            }),
          }
        );

        return response;
}

export async function postRide(payload){
    const response = await fetch(
          import.meta.env.VITE_API_BASE_URL + "/api/rides/",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );
        return response;
}

export async function searchRides(sourceObj, destinationObj, seatsRequired, departureDate){
   const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/search`,
        {
          method: "POST",
          credentials: "include",
          headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          source:sourceObj,
          destination:destinationObj,
          seatsRequired,
          departureDate
        })
        }    
      );

      return response;
}

export async function sendRequest(ride, seatsBooked){
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/bookings/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          rideId: ride._id,
          seatsBooked: Number(seatsBooked),
          pickupPoint: ride.pickupPoint,
          dropPoint: ride.dropPoint,
          RequestedPrice: ride.cost      
        }),
      }
    );

    return response;
}