import { useLocation, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Pencil, XCircle, PlayCircle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

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
            // ✅ remove from booking requests
            setBookingRequests((prev) =>
            prev.filter((req) => req._id !== bookingId)
            );

             // ✅ refetch confirmed passengers
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
            // ✅ remove from booking requests
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


 
  


  // Edit Ride Form component
  const EditRideForm = ({ ride, onCancel, onSave }) => {
    const [formData, setFormData] = useState({
      pricePerSeat: ride.pricePerSeat,
      departureDate: ride.departureDateTime.split("T")[0],
      departureTime: new Date(ride.departureDateTime).toISOString().slice(11, 16),
      source: ride.source,
      destination: ride.destination,
      totalAvailableSeats: ride.totalAvailableSeats,
    });

    useEffect(() => {
      setFormData({
        pricePerSeat: ride.pricePerSeat,
        departureDate: ride.departureDateTime.split("T")[0],
        departureTime: new Date(ride.departureDateTime).toISOString().slice(11, 16),
        source: ride.source,
        destination: ride.destination,
        totalAvailableSeats: ride.totalAvailableSeats,
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

        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="rounded-md border p-2"
            placeholder="Source"
          />
          <input
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="rounded-md border p-2"
            placeholder="Destination"
          />
          <input
            type="date"
            name="departureDate"
            value={formData.departureDate}
            onChange={handleChange}
            className="rounded-md border p-2"
          />
          <input
            type="time"
            name="departureTime"
            value={formData.departureTime}
            onChange={handleChange}
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
            name="totalAvailableSeats"
            min={1}
            max={6}
            value={formData.totalAvailableSeats}
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
        <AlertDialog open={confirmProfileOpen} onOpenChange={setConfirmProfileOpen}>
                <AlertDialogTrigger asChild>
                  <Button className="mt-8">
                    <Save className="mr-2 h-4 w-4" />
                    Update Profile Photo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Update profile picture?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace your existing profile picture.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        setConfirmProfileOpen(false);
                        handle
                      }}
                    >
                      Confirm
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-5xl px-6 space-y-10">

        {/* Ride Header */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold">
                {ride.source} → {ride.destination}
              </h1>
              <p className="text-muted-foreground mt-1">
                {new Date(ride.departureDateTime).toDateString()} ·{" "}
                {new Date(ride.departureDateTime).toLocaleTimeString()}
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Seats</p>
                  <p className="text-lg font-semibold">
                    {ride.totalAvailableSeats}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-lg font-semibold">₹{ride.pricePerSeat}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-lg font-semibold capitalize">
                    {ride.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Ride Form */}
        {isEditing && (
          <EditRideForm
            ride={ride}
            onCancel={() => setIsEditing(false)}
            onSave={async (data) => {
              const departureTimeISO = new Date(
                `${data.departureDate}T${data.departureTime}`
              ).toISOString();

              const payload = {
                _id: ride._id,
                source: data.source,
                destination: data.destination,
                pricePerSeat: Number(data.pricePerSeat),
                totalAvailableSeats: Number(data.totalAvailableSeats),
                departureTime: departureTimeISO,
              };

              const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/api/rides/`,
                {
                  method: "PATCH",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(payload),
                }
              );

              if (response.ok) {
                await response.json(); // ignore partial update response
                await fetchRide();     // ✅ refetch full ride after update
                setIsEditing(false);
              }
            }}
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
              disabled={confirmedPassengers.length > 0}
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
                if (ride.status === "active" || ride.status === "completed") {
                  setStatusMessage(
                    "You cannot edit a ride once it has started or completed"
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