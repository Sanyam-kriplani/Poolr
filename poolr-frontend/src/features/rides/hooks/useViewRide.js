import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import L from "leaflet";
import { sendRequest } from "@/api/ride.api";

export function useViewRide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [passengers,setPassengers]=useState([]);
  const [passengerMessage,setPassengerMessage]=useState("");
  const [seatsBooked, setSeatsBooked] = useState(state?.seats || "");
  const [bookingMessage, setBookingMessage] = useState("");


  const ride = state?.ride;
  const askedSeats = state?.seats;
  console.log("Asked seats in view ride:", askedSeats);

  const sendBookingRequest = async () => {
  if (!seatsBooked || seatsBooked <= 0) {
    setBookingMessage("Please enter a valid number of seats");
    return;
  }

  try {
    const response = await sendRequest(ride, seatsBooked);

    const data = await response.json();

    if (!response.ok) {
      setBookingMessage(data.message || "Failed to send booking request");
      return;
    }
    setBookingMessage("Booking request sent successfully");
    setSeatsBooked("");
    navigate("/my-bookings");
  } catch (error) {
    console.error(error);
    setBookingMessage("Something went wrong. Please try again.");
  }
};

 
 useEffect(()=>{
  const fetchPassengers=async()=>{
        try {
            
            const response=await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/rides/getPassengers?rideId=${ride._id}`,{
                method:"GET",
                credentials:"include"
            })
            if(!response.ok){
                setPassengerMessage("error fetching passengers");
                return;
            }
                const data=await response.json();
                setPassengers(data || []);
                if (!data || data.length === 0) {
                  setPassengerMessage("No confirmed passengers yet");
                } else {
                  setPassengerMessage("");
                }
                
            
        } catch (error) {
            setPassengerMessage("error fetching passengers");
            console.log(error);
        }
    }
  fetchPassengers();
  },[])
  
 

  // 📍 Source & destination coords (GeoJSON → Leaflet)
  const sourceCoords = [
    ride.source.location.coordinates[1],
    ride.source.location.coordinates[0],
  ];

  const destinationCoords = [
    ride.destination.location.coordinates[1],
    ride.destination.location.coordinates[0],
  ];

  // 📍 Pickup & Drop points (GeoJSON → Leaflet)
  const pickupCoords = ride?.pickupPoint
    ? [
        ride.pickupPoint.location.coordinates[1],
        ride.pickupPoint.location.coordinates[0],
      ]
    : null;

  const dropCoords = ride?.dropPoint
    ? [
        ride.dropPoint.location.coordinates[1],
        ride.dropPoint.location.coordinates[0],
      ]
    : null;

  // 📌 Waypoints (GeoJSON → Leaflet)
  const waypointCoords =
    ride?.waypoints?.map((wp) => [
      wp.location.coordinates[1],
      wp.location.coordinates[0],
    ]) || [];

  // 🛣️ Full route polyline from backend (road-following)
  const routePolyline =
    ride?.route?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];

  // Map icons
  const sourceIcon = new L.Icon.Default();
  const destinationIcon = new L.Icon.Default();
  const waypointIcon = new L.Icon.Default();

  // Auto-fit map to route
  const bounds =
    routePolyline.length > 0
      ? routePolyline
      : [sourceCoords, destinationCoords];

  const driver = ride.driverId;
  const date = new Date(ride.departureDateTime);
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return { passengerMessage, passengers, bookingMessage, seatsBooked, setSeatsBooked, sendBookingRequest, sourceCoords, destinationCoords, pickupCoords, dropCoords, waypointCoords, routePolyline, sourceIcon, destinationIcon, waypointIcon, bounds, driver, date, time, ride, askedSeats,  };

}