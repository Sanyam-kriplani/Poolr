import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, XCircle, PlayCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

import { MapContainer, TileLayer, Marker, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";


export default function ManageRide() {
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


  // Safety check for page refresh or direct access)
  if (!state?.ride) {
  return <Navigate to="/my-published-rides" replace />;
  }

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
  
 
  


  // Edit Ride Form component
 const EditRideForm = ({ ride, onCancel, onSave, errorMessage }) => {
    // --- Datetime helpers for local/ISO conversion ---
    const toLocalDateTimeInput = (isoString) => {
      const d = new Date(isoString);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
        d.getHours()
      )}:${pad(d.getMinutes())}`;
    };

    const fromLocalDateTimeInput = (localValue) => {
      const [datePart, timePart] = localValue.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute] = timePart.split(":").map(Number);
      return new Date(year, month - 1, day, hour, minute).toISOString();
    };
    const [formData, setFormData] = useState({
      pricePerSeat: ride.pricePerSeat,
      departureDateTime: ride.departureDateTime,
      source: ride.source,
      destination: ride.destination,
      totalSeats: ride.totalAvailableSeats,
    });

    useEffect(() => {
      setFormData({
        pricePerSeat: ride.pricePerSeat,
        departureDateTime: ride.departureDateTime,
        source: ride.source,
        destination: ride.destination,
        totalSeats: ride.totalAvailableSeats,
      });
    }, [ride]);

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      await onSave(formData);
    };

    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Edit Ride Details</h2>
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="datetime-local"
            name="departureDateTime"
            value={toLocalDateTimeInput(formData.departureDateTime)}
            onChange={(e) =>
              setFormData({
                ...formData,
                departureDateTime: fromLocalDateTimeInput(e.target.value),
              })
            }
            className="rounded-md border p-2"
          />
          <input
            type="number"
            name="pricePerSeat"
            value={formData.pricePerSeat}
            onChange={handleChange}
            className="rounded-md border p-2"
            placeholder="Price per seat"
          />
          <input
            type="number"
            name="totalSeats"
            min={1}
            max={6}
            value={formData.totalSeats}
            onChange={handleChange}
            className="rounded-md border p-2"
            placeholder="Total seats"
          />

          <div className="flex gap-3 pt-2">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-6xl px-6 space-y-10">

        {/* Ride Header */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h1 className="text-3xl font-semibold">
                {ride.source.name} → {ride.destination.name}
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                {new Date(ride.departureDateTime).toDateString()} ·{" "}
                {new Date(ride.departureDateTime).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Seats</p>
                  <p className="text-lg font-semibold">
                    {ride.totalAvailableSeats}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Price</p>
                  <p className="text-lg font-semibold">
                    ₹{ride.pricePerSeat}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Distance</p>
                  <p className="text-lg font-semibold">
                    {formatDistance(ride?.distance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Duration</p>
                  <p className="text-lg font-semibold">
                    {formatDuration(ride?.duration)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {ride.status}
                  </p>
                </div>
                {formattedWaypoints.length > 0 && (
                  <div className="col-span-full mt-4 rounded-lg bg-muted/40 p-4 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                      Route Stops
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {formattedWaypoints.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          {/* Dot */}
                          <span
                            className={`h-2 w-2 rounded-full ${
                              idx === 0
                                ? "bg-blue-500"
                                : idx === formattedWaypoints.length - 1
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                          />
                          {/* Label */}
                          <span className="rounded-md border bg-muted px-3 py-1.5 text-sm font-medium">
                            {point}
                          </span>
                          {/* Arrow (except last) */}
                          {idx < formattedWaypoints.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Route Map */}
        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Route Overview</h2>

          <div className="h-[350px] w-full overflow-hidden rounded-lg">
            <MapContainer
              center={sourceCoords}
              zoom={12}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={sourceCoords} />
              <Marker position={destinationCoords} />

              {/* Waypoint Markers */}
              {waypointCoords.map((pos, idx) => (
                <CircleMarker
                  key={idx}
                  center={pos}
                  radius={5}
                  pathOptions={{
                    color: "#16a34a",      // dark green border
                    fillColor: "#22c55e",  // green fill
                    fillOpacity: 0.9,
                  }}
                />
              ))}

              {routePolyline.length > 0 && (
                <Polyline
                  positions={routePolyline}
                  pathOptions={{ color: "#2563eb", weight: 4 }}
                />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Edit Ride Form */}
        {isEditing && (
          <EditRideForm
            ride={ride}
            onCancel={() => setIsEditing(false)}
            onSave={handleRideUpdate}
            errorMessage={editErrorMessage}
          />
        )}

        {/* Confirmed Passengers */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Confirmed Passengers</h2>
          {passengerMessage && (
            <p className="text-sm text-muted-foreground">{passengerMessage}</p>
          )}

          <div className="grid gap-4">
            {confirmedPassengers?.map((p) => (
              <div
                key={p._id}
                className="flex items-center justify-between rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {p.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {p.phone}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-600">
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Booking Requests */}
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Booking Requests</h2>
          {requestMessage && (
            <p className="text-sm text-muted-foreground">{requestMessage}</p>
          )}

          <div className="grid gap-4">
            {bookingRequests.map((req) => (
              <div
                key={req._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-lg border bg-card p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {req.passengerId.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>

                  <div>
                    <p className="font-medium">{req.passengerId.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Seats requested: {req.seatsBooked}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="rounded-md px-4 py-2 text-sm font-medium text-white hover:bg-green-700" onClick={()=>{handleAccept(req._id)}}>
                    Accept
                  </Button>
                  <Button className="rounded-md  px-4 py-2 text-sm font-medium text-white hover:bg-red-700" onClick={()=>{handleReject(req._id)}}>
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Ride Actions */}
        <section className="rounded-xl border bg-card p-6 space-y-4">
          <h2 className="text-xl font-semibold">Ride Actions</h2>
          <p className="text-sm text-muted-foreground">
            Manage this ride. Editing will update ride details, cancelling will stop new bookings.
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-4 pt-2 ${
              ride.status === "cancelled" ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            

          

            <Button
              variant="outline"
              disabled={confirmedPassengers.length > 0 || ride.status==="expired"}
              className={`flex items-center gap-2 ${
                confirmedPassengers.length > 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              onClick={() => {
                if (confirmedPassengers.length > 0) {
                  setStatusMessage(
                    "You cannot edit the ride after passengers have joined"
                  );
                  return;
                }
                setIsEditing(true);
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit Ride
            </Button>
            {statusMessage && (
              <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500"></span>
                {statusMessage}
              </div>
            )}
            <div className="flex items-center gap-3">
              {ride.status === "upcoming" && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Cancel Ride
                    </Button>
                  </AlertDialogTrigger>

                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel this ride?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will cancel the ride and notify passengers if any.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Ride</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          handleCancelRide();
                        }}
                      >
                        Confirm Cancel
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {cancelMessage && (
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  {cancelMessage}
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}