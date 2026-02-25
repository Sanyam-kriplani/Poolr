import { useState, useEffect } from "react";


export function useEditForm(ride, onSave) {

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

    return { formData, toLocalDateTimeInput, fromLocalDateTimeInput, handleChange, handleSubmit };
}