import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Car,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyPublishedRides() {
const [rides,setRides]=useState([]);
const [message,setMessage]=useState("");
const navigate=useNavigate();

// useEffect(()=>{
//     const getRides=async ()=>{
//         try {
//             const response=await fetch(import.meta.env.VITE_API_BASE_URL+'/api/rides/myRides',{
//                 method:'GET',
//                 credentials:'include',
//                 headers:{
//                     "Content-Type":"application/json"
//                 },
//                 body:null
//             })
//             if(!response.ok){
//                 setMessage("Error fetching Rides");
//             }else{
//                 const data = await response.json();
//                 setRides(data.myrides); // ya data directly, backend ke hisaab se
//                 console.log(rides);    
//             }
            
//         } catch (error) {
//             setMessage("Error fetching Rides");
//             console.log(error);
//         }
//     }
//     getRides();
// },[])

const handleClick=(ride)=>{
    navigate('/manage-ride',{
        state:{ride},
    })
}

useEffect(() => {
  const fetchMyPublishedRides = async () => {
    try {
      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/api/rides/myRides",
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        setMessage("Failed to fetch published rides");
        return;
      }

      const data = await response.json();
      setRides(data.myRides);

    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while fetching rides");
    }
  };

  fetchMyPublishedRides();
}, []);

useEffect(() => {
  console.log(rides);
}, [rides]);

const formatDate = (isoString) => {
  return new Date(isoString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (isoString) => {
  return new Date(isoString).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};


  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-5xl px-6 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">My Published Rides</h1>
          <p className="text-muted-foreground">
            Manage rides you’ve published for other travelers
          </p>
        </div>

        <Separator />

        {/* EMPTY STATE (toggle later with logic) */}
        {rides.length===0 && (
          <div className="rounded-lg border bg-card p-10 text-center">
            <Car className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold">No rides published yet</h2>
            <p className="text-muted-foreground mt-1">
              Publish a ride and start sharing your journey
            </p>
          </div>
        )}

        {/* RIDE LIST */}
        <div className="grid gap-6">

          {/* RIDE CARD */}
          {rides.map((r) => (
            <Card
              key={r._id}
              onClick={() => handleClick(r)}
              className="transition cursor-pointer hover:shadow-md"
            >
            <CardHeader className="flex flex-row items-center justify-between" >
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5 text-primary" />
                {r.source} → {r.destination}
              </CardTitle>

              {/* STATUS */}
              <Badge variant="secondary">{r.status}</Badge>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* DETAILS GRID */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                    {formatDate(r.departureDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                    {formatTime(r.departureDateTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Seats</p>
                    <p className="font-medium">{r.totalAvailableSeats} available</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <IndianRupee className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">₹{r.pricePerSeat} / seat</p>
                  </div>
                </div>

              </div>


            </CardContent>
          </Card>))}

        </div>
      </div>
    </div>
  );
}