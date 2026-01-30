import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Star } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Command, CommandItem } from "@/components/ui/command";

import {
  MapPin,
  Calendar,
  Users,
  Search,
  Car,
} from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { useNavigate } from "react-router-dom";

export default function SearchRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const [fromSelected, setFromSelected] = useState(false);
  const [toSelected, setToSelected] = useState(false);

  const [departureDate, setDepartureDate] = useState("");
  const [seatsRequired, setSeatsRequired] = useState(1);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!from) {
      setFromSuggestions([]);
      return;
    }

    const fetchFromLocations = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/locations?city=${from}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          }
        );
        const data = await res.json();
        if (res.ok) {
          setFromSuggestions(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchFromLocations();
  }, [from]);

  useEffect(() => {
    if (!to) {
      setToSuggestions([]);
      return;
    }

    const fetchToLocations = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/locations?city=${to}`,
          {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          }
        );
        const data = await res.json();
        if (res.ok) {
          setToSuggestions(Array.isArray(data) ? data : data?.data || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchToLocations();
  }, [to]);

  const handleSearchRides = async () => {
    setHasSearched(true);
    try {
      setLoading(true);
      setError("");

      const query = new URLSearchParams({
        source: from,
        destination: to,
        seatsRequired,
        departureDate,
      }).toString();

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/rides/search?${query}`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No rides found");
        setLoading(false);
        return;
      }

      setRides(data || []);
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while searching rides");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/40">

      {/* SEARCH BAR */}
      <section className="bg-background border-b">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 p-4">
              
              <div className="relative flex-1 min-w-[180px]">
                <Popover open={fromSuggestions.length > 0} modal={false}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 w-full">
                    
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="From"
                        value={from}
                        onChange={(e) => {
                          setFrom(e.target.value);
                          setFromSelected(false);
                        }}
                        onBlur={() => {
                          if (!fromSelected) {
                            setFrom("");
                            setFromSuggestions([]);
                          }
                        }}
                      />
                    </div>
                  </PopoverTrigger>

                  <PopoverContent
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="z-50 w-[--radix-popover-trigger-width] rounded-md border bg-background shadow"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      {Array.isArray(fromSuggestions) &&
                        fromSuggestions.map((loc) => (
                          <CommandItem
                            key={loc._id || loc.id || loc.name || JSON.stringify(loc)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setFrom(loc.name || loc.city || loc.label || loc);
                              setFromSuggestions([]);
                              setFromSelected(true);
                            }}
                          >
                            {loc.name || loc.city || loc.label || loc}
                          </CommandItem>
                        ))}
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="relative flex-1 min-w-[180px]">
                <Popover open={toSuggestions.length > 0} modal={false}>
                  <PopoverTrigger asChild>
                    <div className="flex items-center gap-2 w-full">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="To"
                        value={to}
                        onChange={(e) => {
                          setTo(e.target.value);
                          setToSelected(false);
                        }}
                        onBlur={() => {
                          if (!toSelected) {
                            setTo("");
                            setToSuggestions([]);
                          }
                        }}
                      />
                    </div>
                  </PopoverTrigger>

                  <PopoverContent
                    side="bottom"
                    align="start"
                    sideOffset={6}
                    className="z-50 w-[--radix-popover-trigger-width] rounded-md border bg-background shadow"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command>
                      {Array.isArray(toSuggestions) &&
                        toSuggestions.map((loc) => (
                          <CommandItem
                            key={loc._id || loc.id || loc.name || JSON.stringify(loc)}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setTo(loc.name || loc.city || loc.label || loc);
                              setToSuggestions([]);
                              setToSelected(true);
                            }}
                          >
                            {loc.name || loc.city || loc.label || loc}
                          </CommandItem>
                        ))}
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex items-center gap-2 min-w-[160px]">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 min-w-[140px]">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min="1"
                  placeholder="Passengers"
                  value={seatsRequired}
                  onChange={(e) => setSeatsRequired(e.target.value)}
                />
              </div>

              <Button
                className="px-8"
                disabled={!fromSelected || !toSelected || !departureDate}
                onClick={handleSearchRides}
              >
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>

            </CardContent>
          </Card>
        </div>
      </section>

      {/* RESULTS */}
      <section className="mx-auto max-w-7xl px-6 py-10 space-y-6">

        {hasSearched && !loading && rides.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">
              Currently, we do not have any matching rides
            </h3>
            <p className="text-muted-foreground max-w-md">
              Try changing your route, date, or number of passengers.
            </p>
          </div>
        )}

        {!loading && !hasSearched && (
          <div className="flex flex-col items-center justify-center text-center py-20">
            <Car className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">
              Search for a ride
            </h3>
            <p className="text-muted-foreground max-w-md">
              Enter your route details above to find available rides.
            </p>
          </div>
        )}

        {/* Render Ride Cards if rides exist */}
        {!loading && rides.length > 0 && (
          <div className="space-y-4">
            {rides.map((ride) => (
              <RideCard key={ride._id} ride={ride} />
            ))}
          </div>
        )}

      </section>
    </div>
  );
}

function RideCard({ ride }) {
  const navigate = useNavigate();
  const driver = ride.driverId;

  const date = new Date(ride.departureDateTime);
  const time = date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card
      className="border hover:shadow-md transition cursor-pointer"
      onClick={() => navigate(`/view-ride`, { state: { ride } })}
    >
      <CardContent className="
        grid gap-4 px-4 py-4
        grid-cols-1
        sm:grid-cols-[1fr_auto]
        lg:grid-cols-[260px_1fr_120px]
        items-center
      ">

        {/* LEFT: Driver */}
        <div className="flex items-center gap-3 sm:col-span-2 lg:col-span-1">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={`${import.meta.env.VITE_API_BASE_URL}${driver?.profile_photo}`}
            />
            <AvatarFallback>
              {driver?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-0.5">
            <p className="font-semibold leading-none">
              {driver?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Age {driver?.age}
            </p>

            <div className="flex items-center gap-1 text-xs">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>{driver?.rating ?? "N/A"}</span>
            </div>
          </div>
        </div>

        {/* CENTER: Ride Details */}
        <div className="flex flex-col gap-1 text-sm sm:col-span-1">
          <p className="font-medium">
            {ride.source} → {ride.destination}
          </p>

          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span>⏰ {time}</span>
            <span>💺 {ride.totalAvailableSeats} seats</span>
          </div>
        </div>

        {/* RIGHT: Price */}
        <div className="text-left sm:text-right lg:text-right">
          <p className="text-xl sm:text-2xl font-bold text-primary leading-none">
            ₹{ride.pricePerSeat}
          </p>
          <p className="text-xs text-muted-foreground">
            per seat
          </p>
        </div>

      </CardContent>
    </Card>
  );
}