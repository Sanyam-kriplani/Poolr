import { useState } from "react";
import { useLocation } from "react-router-dom";
import { useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";

export function useRideManage() {
  const { state } = useLocation();

  
  const { ride: initialRide } = state;
  const [ride, setRide] = useState(initialRide);
  const [confirmedPassengers, setConfirmedPassengers] = useState([]);
  const [bookingRequests, setBookingRequests] = useState([]);
  const [passengerMessage, setPassengerMessage] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editErrorMessage, setEditErrorMessage] = useState("");

  const [cancelMessage, setCancelMessage] = useState("");

  const [statusMessage, setStatusMessage] = useState("");

  const navigate = useNavigate();

  

  const handleAccept=async(bookingId)=>{
    try {
            const response=await fetch(import.meta.env.VITE_API_BASE_URL+'/api/bookings/confirmBooking',{
            method:"PATCH",
            credentials:"include",
            headers:{
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            _id:bookingId
            }),
            })
            //removing from booking requests
            setBookingRequests((prev) =>
            prev.filter((req) => req._id !== bookingId)
            );

             //refetching confirmed passengers
            fetchPassengers();

            const rideRes = await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/rides/getRideById?rideId=${ride._id}`,
              { method: "GET", credentials: "include" }
            );
            if (rideRes.ok) {
              const rideData = await rideRes.json();
              setRide(rideData.ride || rideData);
            }
    
            
        } catch (error) {
            setPassengerMessage("error fetching passengers");
            console.log(error);
        }
  }

  const handleReject=async(bookingId)=>{
    try {
            const response=await fetch(import.meta.env.VITE_API_BASE_URL+'/api/bookings/cancelBooking',{
            method:"PATCH",
            credentials:"include",
            headers:{
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            _id:bookingId
            }),
            })
            //removing from booking requests
            setBookingRequests((prev) =>
            prev.filter((req) => req._id !== bookingId)
            );

    
            
        } catch (error) {
            setPassengerMessage("error fetching passengers");
            console.log(error);
        }

 }

  const handleCancelRide = async () => {
   console.log("handleCancelRide invoked → sending request");
    try {
      setCancelMessage("");
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/cancelRide`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            _id: ride._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data?.message) {
          setCancelMessage(data.message);
        } else {
          setCancelMessage("Unable to cancel ride");
        }
        return;
      }

      navigate("/my-published-rides", { replace: true });
    } catch (error) {
      console.log("Error cancelling ride", error);
      setCancelMessage("Something went wrong while cancelling the ride");
    }
  };

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
                setConfirmedPassengers(data || []);
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

    useEffect(() => {
      fetchPassengers();
      }, []);

   useEffect(()=>{
       const fetchRequests=async()=>{
           try {
               
               const response=await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bookings/bookingRequests?rideId=${ride._id}`,{
                   method:"GET",
                   credentials:"include"
               })
               if(!response.ok){
                   setRequestMessage("error fetching requests");
                   return;
               }
                   const data=await response.json();
                   setBookingRequests(data || []);
                   if (!data || data.length === 0) {
                     setRequestMessage("No booking requests right now");
                   } else {
                     setRequestMessage("");
                   }
                   
               
           } catch (error) {
               setRequestMessage("error fetching requests");
               console.log(error);
           }
       }
       fetchRequests();
     },[])

    const fetchRide = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/rides/getRideById?rideId=${initialRide._id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.log("error fetching ride");
          return;
        }

        const data = await response.json();
        setRide(data.ride || data);
      } catch (error) {
        console.log("error fetching ride", error);
      }
    };

    useEffect(()=>{ if (initialRide?._id) {
          fetchRide();
        }},[]);

    const handleRideUpdate = async (formData) => {
    try {
      const payload = {
        _id: ride._id,
        pricePerSeat: Number(formData.pricePerSeat),
        totalAvailableSeats: Number(formData.totalSeats),
        departureDateTime: formData.departureDateTime,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setEditErrorMessage(data?.message || "Ride update failed");
        return;
      }

      // refresh ride state after successful update
      setEditErrorMessage("");
      await fetchRide();
      setIsEditing(false);
    } catch (error) {
      console.log("Error updating ride", error);
    }
    };

    // Extract source & destination coordinates for map
  const sourceCoords = [
    ride.source.location.coordinates[1],
    ride.source.location.coordinates[0],
  ];

  const destinationCoords = [
    ride.destination.location.coordinates[1],
    ride.destination.location.coordinates[0],
  ];

  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const routePolyline =
    ride?.route?.coordinates?.map(([lng, lat]) => [lat, lng]) || [];

  // Waypoints (exclude source & destination if they are also stored as waypoints)
  const waypointCoords =
    ride?.waypoints
      ?.map((wp) => [
        wp.location.coordinates[1],
        wp.location.coordinates[0],
      ])
      // omit source & destination if present in waypoints
      .filter(
        ([lat, lng]) =>
          !(
            (lat === sourceCoords[0] && lng === sourceCoords[1]) ||
            (lat === destinationCoords[0] && lng === destinationCoords[1])
          )
      ) || [];

  // --- Waypoints formatter (Source → Waypoints → Destination) ---
  const formattedWaypoints = ride
    ? [
        ride.source.name,
        ...(ride.waypoints
          ?.filter(
            (wp) =>
              wp.name !== ride.source.name &&
              wp.name !== ride.destination.name
          )
          .map((wp) => wp.name) || []),
        ride.destination.name,
      ]
    : [];

  // --- Distance and Duration formatters ---
  const formatDistance = (meters) => {
    if (!meters) return "-";
    return meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${meters} m`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins} min`;
  };

  const hasInvalidRide = !state?.ride;
  
  return {hasInvalidRide, ride, confirmedPassengers, bookingRequests, passengerMessage, requestMessage, setIsEditing, isEditing, editErrorMessage, cancelMessage, statusMessage, handleAccept, handleReject, handleCancelRide, handleRideUpdate, sourceCoords, destinationCoords, routePolyline, waypointCoords, formattedWaypoints, formatDistance, formatDuration, };

}