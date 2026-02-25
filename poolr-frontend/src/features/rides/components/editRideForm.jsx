import { useEditForm } from "../hooks/useEditForm.js";
import { Button } from "@/components/ui/button";


export default function  EditRideForm ({ ride, onCancel, onSave, errorMessage }) {
    const { formData, toLocalDateTimeInput, fromLocalDateTimeInput, handleChange, handleSubmit } = useEditForm(ride, onSave);
    
    return (
      <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-semibold">Edit Ride Details</h2>
        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMessage}
          </div>
        )}
        <form onSubmit={handleSubmit} className="grid gap-4">
          <input
            type="datetime-local"
            name="departureDateTime"
            value={toLocalDateTimeInput(formData.departureDateTime)}
            onChange={(e) =>
              setFormData({
                ...formData,
                departureDateTime: fromLocalDateTimeInput(e.target.value),
              })
            }
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
            name="totalSeats"
            min={1}
            max={6}
            value={formData.totalSeats}
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
      </div>
    );
  };