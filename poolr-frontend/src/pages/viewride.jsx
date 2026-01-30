import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Users } from "lucide-react";
import { useState, useEffect } from "react";

export default function ViewRide() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [passengers,setPassengers]=useState([]);
  const [passengerMessage,setPassengerMessage]=useState("");
  const [seatsBooked, setSeatsBooked] = useState("");
  const [bookingMessage, setBookingMessage] = useState("");

  

  const ride = state?.ride;

 const sendBookingRequest = async () => {
  if (!seatsBooked || seatsBooked <= 0) {
    setBookingMessage("Please enter a valid number of seats");
    return;
  }

  try {
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
        }),
      }
    );

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
  
  if (!ride) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        Unable to load ride details. Please go back and try again.
      </div>
    );
  }

  const driver = ride.driverId;
  const date = new Date(ride.departureDateTime);
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

      {/* TOP: Ride & Driver Card */}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[280px_1fr_160px] gap-6 items-center">

          {/* Driver */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`${import.meta.env.VITE_API_BASE_URL}${driver?.profile_photo}`}
              />
              <AvatarFallback>
                {driver?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold text-lg">
                {driver?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Age {driver?.age}
              </p>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{driver?.rating ?? "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Ride details */}
          <div className="space-y-1 text-sm">
            <p className="font-medium text-base">
              {ride.source} → {ride.destination}
            </p>
            <p className="text-muted-foreground">
              Departure time: {time}
            </p>
            <p className="text-muted-foreground">
              Seats available: {ride.totalAvailableSeats}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              ₹{ride.pricePerSeat}
            </p>
            <p className="text-xs text-muted-foreground">
              per seat
            </p>
          </div>

        </CardContent>
      </Card>

      {/* PASSENGERS SECTION */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Users className="h-5 w-5" />
          <CardTitle>
            Who you will be travelling with
          </CardTitle>
        </CardHeader>

        <CardContent>
          {passengers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {passengers.map((p) => (
                <div
                  key={p._id}
                  className="flex items-center gap-3 border rounded-md p-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`${import.meta.env.VITE_API_BASE_URL}${p.profile_photo}`}
                    />
                    <AvatarFallback>
                      {p.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Age {p.age}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No confirmed passengers yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* BOOK SEAT SECTION */}
      <Card>
        <CardHeader>
          <CardTitle>
            Request to book seats
          </CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
          <Input
            type="number"
            min="1"
            max={ride.totalAvailableSeats}
            placeholder="Number of seats"
            className="sm:max-w-[200px]"
            value={seatsBooked}
            onChange={(e) => setSeatsBooked(e.target.value)}
          />

          <Button onClick={sendBookingRequest}>
            Send booking request
          </Button>
          {bookingMessage && (
            <p className="text-sm text-muted-foreground mt-2">
              {bookingMessage}
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}