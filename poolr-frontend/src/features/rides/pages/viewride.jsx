import { useLocation, useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useViewRide } from "../hooks/useViewRide";

import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function ViewRide() {
  
  const { passengerMessage, passengers, bookingMessage, seatsBooked, setSeatsBooked, sendBookingRequest, sourceCoords, destinationCoords, pickupCoords, dropCoords, waypointCoords, routePolyline, sourceIcon, destinationIcon, waypointIcon, bounds, driver, date, time, ride, askedSeats } = useViewRide();

   if (!ride) {
    return (
      <div className="flex justify-center items-center py-20 text-muted-foreground">
        Unable to load ride details. Please go back and try again.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">

      {/* TOP: Ride & Driver Card */}
      <Card>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-[280px_1fr_160px] gap-6 items-center">

          {/* Driver */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={`${import.meta.env.VITE_API_BASE_URL}${ride.driver.profile_photo}`}
              />
              <AvatarFallback>
                {driver?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold text-lg">
                {ride.driver?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                Age {ride.driver?.age}
              </p>
              <div className="flex items-center gap-1 text-sm mt-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>{ride.driver?.rating ?? "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Ride details */}
          <div className="space-y-1 text-sm">
            <p className="font-medium text-base">
              {ride?.source?.name} → {ride?.destination?.name}
            </p>
            <p className="text-muted-foreground">
              Departure time: {time}
            </p>
            <p className="text-muted-foreground">
              Seats available: {ride.availableSeats}
            </p>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              ₹{ride.cost}
            </p>
            <p className="text-xs text-muted-foreground">
              per seat
            </p>
          </div>

        </CardContent>
      </Card>

      {/* ROUTE MAP */}
      <Card>
        <CardHeader>
          <CardTitle>Route Overview</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-[350px] w-full overflow-hidden rounded-lg">
            <MapContainer
              bounds={bounds}
              zoom={12}
              scrollWheelZoom={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <Marker position={sourceCoords} icon={sourceIcon} />

              {pickupCoords && (
                <Marker position={pickupCoords} icon={waypointIcon} />
              )}

              {dropCoords && (
                <Marker position={dropCoords} icon={waypointIcon} />
              )}

              <Marker position={destinationCoords} icon={destinationIcon} />

              {routePolyline.length > 0 && (
                <Polyline
                  positions={routePolyline}
                  pathOptions={{
                    color: "#2563eb",
                    weight: 4,
                    opacity: 0.9,
                  }}
                />
              )}
            </MapContainer>
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
            max={ride.availableSeats}
            placeholder="Number of seats"
            className="sm:max-w-[200px]"
            value={askedSeats}
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