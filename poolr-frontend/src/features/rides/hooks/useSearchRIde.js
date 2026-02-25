import { searchRides } from "@/api/ride.api";
import { useState, useEffect } from "react";

export function useSearchRide(){

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromObj, setFromObj] = useState(null);
  const [toObj, setToObj] = useState(null);
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);


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

      const sourceObj={
        name:fromObj.city,
        location:{
        type:"Point",
        coordinates:[
        fromObj.longitude,
        fromObj.latitude
        ]}
        }
      const destinationObj={
        name:toObj.city,
        location:{
          type:"Point",
          coordinates:
          [
            toObj.longitude,
            toObj.latitude
          ]
      }
    }

      const res = await searchRides(sourceObj, destinationObj, seatsRequired, departureDate);

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "No rides found");
        setLoading(false);
        return;
      }

      setRides(data || []);
      console.log(data)
      setLoading(false);
    } catch (err) {
      setError("Something went wrong while searching rides");
      setLoading(false);
    }
    };

    return { from, to, setFrom, setTo, fromSuggestions, toSuggestions, fromSelected, toSelected, setFromSelected, setToSelected, setToObj, fromObj, toObj, setFromObj, departureDate, setDepartureDate, seatsRequired, setSeatsRequired, handleSearchRides, rides, loading, error, hasSearched, setFromSuggestions, setToSuggestions };

}