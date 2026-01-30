import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
    PopoverAnchor,
} from "@/components/ui/popover";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

import {
  MapPin,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Car,
} from "lucide-react";

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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserVehicle } from "@/context/userVehicleContext.jsx";

export default function PublishRide() {
  const [sourceResults, setSourceResults] = useState([]);
  const [sourceInput, setSourceInput] = useState("");
  const [skipSourceSearch, setSkipSourceSearch] = useState(false);

  const [destinationResults, setDestinationResults] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [skipDestinationSearch, setSkipDestinationSearch] = useState(false);
  const [rideDetails,setRideDetails]=useState({});
  const navigate=useNavigate();

  const [message, setMessage] = useState("");
  const { userVehicle } = useUserVehicle();
  

  useEffect(() => {
    if (skipSourceSearch) {
      setSkipSourceSearch(false);
      return;
    }

    if (!sourceInput || sourceInput.trim().length < 2) {
      setSourceResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/locations?city=${encodeURIComponent(sourceInput)}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          setSourceResults([]);
          return;
        }

        const results = await response.json();
        setSourceResults(results.data || []);
      } catch (error) {
        console.error("Source search error:", error);
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [sourceInput]);


  useEffect(() => {
    if (skipDestinationSearch) {
      setSkipDestinationSearch(false);
      return;
    }

    if (!destinationInput || destinationInput.trim().length < 2) {
      setDestinationResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/locations?city=${encodeURIComponent(destinationInput)}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          setDestinationResults([]);
          return;
        }

        const results = await response.json();
        setDestinationResults(results.data || []);
      } catch (error) {
        console.error("Destination search error:", error);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [destinationInput]);


  const handleSourceChange = (e) => {
    const {id,value}=e.target;
    setSourceInput(value);
    setRideDetails((prev)=>({
        ...prev,
        [id]: value
    }));
  };

  const handleDestinationChange = (e) => {
    const {id,value}=e.target;
    setDestinationInput(value);
    setRideDetails((prev)=>({
        ...prev,
        [id]: value
    }));
  };

  const handleRidePublish = () => {
  if (!userVehicle?._id) {
    setMessage("Please add a vehicle first");
    return;
  }

  const { departureDate, departureTime } = rideDetails;
  const combinedDate = new Date(`${departureDate}T${departureTime}:00`);
  const formattedDateTime = combinedDate
    .toISOString()
    .replace("Z", "+00:00");

  const payload = {
    ...rideDetails,
    departureDateTime: formattedDateTime,
    vehicleId: userVehicle?._id,
  };

  console.log(payload);

  const publish = async () => {
    try {
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

      let data = {};
      try {
        data = await response.json();
      } catch {}

      if (!response.ok) {
        setMessage(data?.message || "Error publishing ride");
        return;
      }

      setMessage(data?.message || "Ride published successfully");
      navigate("/my-published-rides");
    } catch (error) {
      setMessage("Error publishing ride", error);
    }
  };
  publish();
};

  return (
    <div className="min-h-screen bg-muted/40 py-10">
      <div className="mx-auto max-w-3xl px-6 space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold">Publish a Ride</h1>
          <p className="text-muted-foreground">
            Share your ride and save on travel costs
          </p>
        </div>

        <Separator />

        {/* FORM CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5 text-primary" />
              Ride Details
            </CardTitle>
          </CardHeader>

          <CardContent className="grid gap-6 md:grid-cols-2">

            {/* Source */}
            <div className="space-y-2">
              <Popover
                open={
                  sourceResults.length > 0 &&
                  sourceResults.some(
                    (r) => r.city.toLowerCase() !== sourceInput.toLowerCase()
                  )
                }
              >
                <Label htmlFor="source" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Source Location
                </Label>

                <PopoverAnchor>
                  <Input
                    id="source"
                    placeholder="e.g. New Delhi"
                    value={sourceInput}
                    onChange={handleSourceChange}
                  />
                </PopoverAnchor>

                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="p-0 w-[var(--radix-popover-trigger-width)] bg-card text-card-foreground border shadow-lg z-50"
                >
                  <Command>
                    <CommandEmpty>No results</CommandEmpty>
                    <CommandGroup>
                      {sourceResults.map((r) => (
                        <CommandItem
                          key={r._id}
                          onSelect={() => {
                            setSkipSourceSearch(true);
                            setSourceInput(r.city);
                            setRideDetails((prev)=>({
                            ...prev,
                            source:r.city
                            }));
                            setSourceResults([]);
                          }}
                        >
                          {r.city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Popover
                open={
                  destinationResults.length > 0 &&
                  destinationResults.some(
                    (r) => r.city.toLowerCase() !== destinationInput.toLowerCase()
                  )
                }
              >
                <Label htmlFor="destination" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Destination Location
                </Label>

                <PopoverAnchor>
                  <Input
                    id="destination"
                    placeholder="e.g. Jaipur"
                    value={destinationInput}
                    onChange={handleDestinationChange}
                    
                  />
                </PopoverAnchor>

                <PopoverContent
                  side="bottom"
                  align="start"
                  sideOffset={4}
                  className="p-0 w-[var(--radix-popover-trigger-width)] bg-card text-card-foreground border shadow-lg z-50"
                >
                  <Command>
                    <CommandEmpty>No results</CommandEmpty>
                    <CommandGroup>
                      {destinationResults.map((r) => (
                        <CommandItem
                          key={r._id}
                          onSelect={() => {
                            setSkipDestinationSearch(true);
                            setDestinationInput(r.city);
                            setRideDetails((prev)=>({
                            ...prev,
                            destination:r.city
                            }));
                            setDestinationResults([]);
                          }}
                        >
                          {r.city}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Departure Date */}
            <div className="space-y-2">
              <Label htmlFor="departureDate" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Departure Date
              </Label>
              <Input
                id="departureDate"
                type="date"
                required
                onChange={(e) => {
                  const selectedDate =e.target.value;
                  const today = new Date().toISOString().split("T")[0];
                  

                  if (selectedDate < today) {
                    setMessage("Departure date must be today or a future date");
                    e.target.value = "";
                  } else {
                    setMessage("");
                    const {id,value}=e.target;
                    setRideDetails((prev)=>({
                    ...prev,
                    [id]: value
                    }));
                  }
                }}
              />
            </div>

            {/* Departure Time */}
            <div className="space-y-2">
              <Label htmlFor="departureTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Departure Time
              </Label>
              <Input
                id="departureTime"
                type="time"
                required
                onChange={(e) => {
                  const dateValue = document.getElementById("departureDate")?.value;

                  if (!dateValue) {
                    setMessage("Please select departure date first");
                    e.target.value = "";
                    return;
                  }

                  const today=new Date().toISOString().split("T")[0];
                  //if the date is in future, every time should be valid
                  if(dateValue>today){
                    setMessage("");
                    const {id,value}=e.target
                    setRideDetails((prev)=>({
                      ...prev,
                      [id]:value
                    }))
                    return;
                  }

                  const selectedDateTime = new Date(`${today}T${e.target.value}:00`);
                  const now = new Date();
                  const tenMinutesLater = new Date(now.getTime() + 10 * 60 * 1000);

                  if (selectedDateTime < tenMinutesLater) {
                    setMessage("Departure time must be at least 10 minutes from now");
                    e.target.value = "";
                  } else {
                    setMessage("");
                    const {id,value}=e.target;
                    setRideDetails((prev)=>({
                    ...prev,
                    [id]: value
                    }));
                  }
                }}
              />
            </div>

            {/* Seats */}
            <div className="space-y-2">
              <Label htmlFor="totalAvailableSeats" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Seats Available
              </Label>
              <Input
                id="totalAvailableSeats"
                type="number"
                min="1"
                required
                placeholder="e.g. 3"
                onChange={(e) => {
                  if (Number(e.target.value) < 1) {
                    setMessage("Seats available must be at least 1");
                    e.target.value = "";
                  } else {
                    setMessage("");
                    const {id,value}=e.target;
                    setRideDetails((prev)=>({
                    ...prev,
                    [id]: value
                    }));
                  }
                }}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="pricePerSeat" className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Price per Seat
              </Label>
              <Input
                id="pricePerSeat"
                type="number"
                min="0"
                placeholder="e.g. 450"
                onChange={(e)=>{
                  if (Number(e.target.value) <= 0) {
                    setMessage(" Set a real price");
                    e.target.value = "";
                  } else {
                    setMessage("");
                    const {id,value}=e.target;
                    setRideDetails((prev)=>({
                    ...prev,
                    [id]: value
                    }));
                  }
                }}
              />
            </div>

            {message && (
              <div className="md:col-span-2 rounded-md border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
                {message}
              </div>
            )}

            {/* SUBMIT */}
            <div className="md:col-span-2 flex justify-end pt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button className="px-8">Publish Ride</Button>
                </AlertDialogTrigger>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Publish this ride?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Once published, passengers will be able to view and book this ride.
                      Please confirm before proceeding.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleRidePublish}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      Yes, Publish
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}