import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import polyline from "@mapbox/polyline";
import { useUserVehicle } from "@/store/userVehicleContext.jsx";
import { fetchLocation, fetchWayPoints, postRide, fetchRideRoute } from "@/api/ride.api.js";
export function usePublishRide() {

  const [sourceResults, setSourceResults] = useState([]);
  const [sourceInput, setSourceInput] = useState("");
  const [skipSourceSearch, setSkipSourceSearch] = useState(false);

  const [destinationResults, setDestinationResults] = useState([]);
  const [destinationInput, setDestinationInput] = useState("");
  const [skipDestinationSearch, setSkipDestinationSearch] = useState(false);
  const [rideDetails,setRideDetails]=useState({});
  const navigate=useNavigate();

  const [showWaypointsStep, setShowWaypointsStep] = useState(false);
  const [availableWaypoints, setAvailableWaypoints] = useState([]);
  const [selectedWaypoints, setSelectedWaypoints] = useState([]);
  const [waypointsLoading, setWaypointsLoading] = useState(false);

  const routeDetails=useRef(null);
  const [route, setRoute] = useState(null);
  const [showMap, setShowMap] = useState(false);


  const [message, setMessage] = useState("");
  const { userVehicle } = useUserVehicle();
  const [routeStale, setRouteStale] = useState(false);
 
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
        const response = await fetchLocation(destinationInput);

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
          const response = await fetchLocation(sourceInput);
  
          if (!response.ok) {
            setSourceResults([]);
            return;
          }
  
          const results = await response.json();
          console.log(results.data);
          setSourceResults(results.data || []);
        } catch (error) {
          console.error("Source search error:", error);
        }
      }, 800);
  
      return () => clearTimeout(timeoutId);
    }, [sourceInput]);

  const handleSourceChange = (e) => {
    const { id, value } = e.target;
    setSourceInput(value);

    setRideDetails((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (showMap) {
      setRouteStale(true);
    }
  };

  const handleDestinationChange = (e) => {
    const { id, value } = e.target;
    setDestinationInput(value);
    
    setRideDetails((prev) => ({
      ...prev,
      [id]: value,
    }));

    if (showMap) {
      setRouteStale(true);
    }
  };

  const handleNext = async () => {
      try {
        if (!rideDetails?.source || !rideDetails?.destination) {
          setMessage("Please select source and destination first");
          return;
        }
  
       const response = await fetchRideRoute(rideDetails);
  
        const data = await response.json();
  
        if (!response.ok) {
          setMessage(data.message || "Failed to generate route");
          return;
        }
  
        routeDetails.current = data;
        
        setRoute(polyline.decode(data.polyline)); // [[lat,lng]]
        setShowMap(true);
        setRouteStale(false);
        setShowWaypointsStep(false);
        setAvailableWaypoints([]);
        setSelectedWaypoints([]);
        setMessage("");
      } catch (err) {
        console.error(err);
        setMessage("Error generating route preview");
      }
    };

  const handleFetchWaypoints = async () => {
  try {
    setWaypointsLoading(true);

    const response = await fetchWayPoints(rideDetails, routeDetails.current);

    const data = await response.json();

    if (!response.ok) {
      setMessage(data?.message || "Failed to fetch waypoints");
      return;
    }

    const lastIndex = route.length - 1;

    const sorted = [...(data.waypoints || [])]
      .filter(
        (wp) =>
          wp.routePointIndex !== 0 &&
          wp.routePointIndex !== lastIndex
      )
      .sort((a, b) => (b.importance || 0) - (a.importance || 0));

    setAvailableWaypoints(sorted);
    setShowWaypointsStep(true);
  } catch (err) {
    console.error(err);
    setMessage("Error fetching waypoints");
  } finally {
    setWaypointsLoading(false);
  }
    };

 const addWaypoint = (wp) => {
  if (selectedWaypoints.some(w => w.routePointIndex === wp.routePointIndex)) {
    return;
  }
  setSelectedWaypoints(prev => [...prev, wp]);
};

const removeWaypoint = (index) => {
  setSelectedWaypoints(prev => prev.filter((_, i) => i !== index));
};

 const handleRidePublish = () => {
    if (routeStale) {
      setMessage("Please refetch the route after changing source or destination");
      return;
    }
    if (!userVehicle?._id) {
      setMessage("Please add a vehicle first");
      return;
    }

    const { departureDate, departureTime } = rideDetails;
    const combinedDate = new Date(`${departureDate}T${departureTime}:00`);
    const formattedDateTime = combinedDate
      .toISOString()
      .replace("Z", "+00:00");

    const finalWaypoints =
          [
            {
              name: rideDetails.source.name,
              location: rideDetails.source.location,
              routePointIndex: 0,
            },
            ...selectedWaypoints,
            {
              name: rideDetails.destination.name,
              location: rideDetails.destination.location,
              routePointIndex: route.length - 1,
            },
          ];

    const payload = {
      ...rideDetails,
      routePolyline: routeDetails.current.polyline,
      distance: routeDetails.current.distance,
      duration: routeDetails.current.duration,
      waypoints: finalWaypoints,
      departureDateTime: formattedDateTime,
      vehicleId: userVehicle?._id,
    };

    console.log(payload);

    const publish = async () => {
      try {
        console.log("Publishing ride with payload:", payload);
        const response = await postRide(payload);
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

  // --- Distance & Duration formatters ---
  const formatDistance = (meters) => {
    if (!meters) return "";
    return meters >= 1000
      ? `${(meters / 1000).toFixed(1)} km`
      : `${meters} m`;
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins} min`;
  };

  return { sourceInput, sourceResults, handleSourceChange, destinationInput, destinationResults, handleDestinationChange, handleNext, route, showMap, message, handleFetchWaypoints, waypointsLoading, availableWaypoints, selectedWaypoints, addWaypoint, removeWaypoint, handleRidePublish, formatDistance, formatDuration, showWaypointsStep, setSkipSourceSearch, setSkipDestinationSearch, rideDetails, setRideDetails, setSourceInput, setDestinationInput, setSourceResults, setDestinationResults, setMessage, routeDetails, routeStale, userVehicle };

}