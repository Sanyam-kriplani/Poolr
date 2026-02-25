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
import { MapContainer, TileLayer, Polyline, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import polyline from "@mapbox/polyline";

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


import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useUserVehicle } from "@/store/userVehicleContext.jsx";
import { usePublishRide } from "../hooks/usePublishRide.js";

export default function PublishRide() {


  const { sourceInput, sourceResults, handleSourceChange, destinationInput, destinationResults, handleDestinationChange, handleNext, route, showMap, message, handleFetchWaypoints, waypointsLoading, availableWaypoints, selectedWaypoints, addWaypoint, removeWaypoint, showWaypointsStep, handleRidePublish, formatDistance, formatDuration, setSkipSourceSearch, setSkipDestinationSearch, rideDetails, setRideDetails, setSourceInput, setDestinationInput, setDestinationResults, setSourceResults, setMessage, routeDetails, routeStale, userVehicle }
    = usePublishRide();

  return (<form
    onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
    }}
  >
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
                            const sourceObj={
                              name:r.city,
                              location:{
                              type:"Point",
                              coordinates:[
                                r.longitude,
                                r.latitude
                              ]}
                            }
                            setSourceInput(sourceObj.name);
                            setRideDetails((prev)=>({
                            ...prev,
                            source:sourceObj
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
                            const destinationObj={
                              name:r.city,
                              location:{
                              type:"Point",
                              coordinates:[
                                r.longitude,
                                r.latitude
                              ]}
                            }
                            setDestinationInput(destinationObj.name);
                            setRideDetails((prev)=>({
                            ...prev,
                            destination:destinationObj
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

            {showMap && route && (
              <div className="md:col-span-2 space-y-3">
                {/* Distance & Duration */}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 rounded-md border px-3 py-1">
                    <span className="font-medium">Distance:</span>
                    <span>
                      {formatDistance(routeDetails.current?.distance)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md border px-3 py-1">
                    <span className="font-medium">Estimated time:</span>
                    <span>
                      {formatDuration(routeDetails.current?.duration)}
                    </span>
                  </div>
                </div>
                {/* Map */}
                <div className="h-[400px] rounded-md overflow-hidden">
                  <MapContainer
                    center={route[0]}
                    zoom={7}
                    className="h-full w-full"
                    scrollWheelZoom={false}
                    keyboard={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"   
                    />
                    <Polyline positions={route} />
                    {/* Selected Waypoint Markers */}
                    {selectedWaypoints.map((wp, i) => {
                      const point = route[wp.routePointIndex];
                      if (!point) return null;

                      return (
                        <CircleMarker
                          key={i}
                          center={point}
                          radius={6}
                          pathOptions={{
                            color: "#16a34a",      // green border
                            fillColor: "#22c55e",  // green fill
                            fillOpacity: 0.9,
                          }}
                        />
                      );
                    })}

                    {/* Source Marker */}
                    <CircleMarker
                      center={route[0]}
                      radius={7}
                      pathOptions={{
                        color: "#2563eb",
                        fillColor: "#3b82f6",
                        fillOpacity: 1,
                      }}
                    />

                    {/* Destination Marker */}
                    <CircleMarker
                      center={route[route.length - 1]}
                      radius={7}
                      pathOptions={{
                        color: "#dc2626",
                        fillColor: "#ef4444",
                        fillOpacity: 1,
                      }}
                    />
                  </MapContainer>
                </div>
              </div>
            )}
            {showMap && !showWaypointsStep && !routeStale && (
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" onClick={handleFetchWaypoints}>
                  {waypointsLoading ? "Loading..." : "Add Waypoints (Optional)"}
                </Button>
              </div>
            )}

            {showMap && routeStale && (
              <div className="md:col-span-2 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Source or destination changed. Route may be outdated.
                </p>
                <Button type="button" variant="outline" onClick={handleNext}>
                  Refetch Route
                </Button>
              </div>
            )}

              {showWaypointsStep && (
                <div className="md:col-span-2 space-y-4">
                  <h3 className="font-semibold">Suggested Waypoints</h3>

                  <div className="flex flex-wrap gap-2">
                    {availableWaypoints.map((wp, i) => (
                      <Button
                        key={i}
                        type="button"
                        variant="outline"
                        onClick={() => addWaypoint(wp)}
                      >
                        {wp.name}
                        {wp.importance >= 4 && (
                          <span className="ml-2 text-xs text-green-600 font-medium">
                            Recommended
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>

                  {selectedWaypoints.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Selected Waypoints</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedWaypoints.map((wp, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 rounded-full border px-3 py-1 text-sm"
                          >
                            {wp.name}
                            <button
                              type="button"
                              className="ml-1"
                              onClick={() => removeWaypoint(i)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            <div className="md:col-span-2 flex justify-end pt-4">
            {!showMap && (
              <Button
            type="button"
            className="px-8"
            onClick={handleNext}>
            Next
          </Button>
            )}

          {showMap && (
            <Button
              type="button"
              className="px-8"
              onClick={handleRidePublish}
              disabled={routeStale}
            >
              Publish Ride
            </Button>
          )}
        </div>

          </CardContent>
        </Card>

      </div>
    </div>
    </form>
  );
}