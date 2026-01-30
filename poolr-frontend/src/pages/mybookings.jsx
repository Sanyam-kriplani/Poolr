import { useEffect, useState, Fragment } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [openReviewId, setOpenReviewId] = useState(null);
  const [submittedReviews, setSubmittedReviews] = useState({});

  const handleSubmitReview = async (booking) => {
    try {
      const reviewData = submittedReviews[booking._id];

      if (!reviewData?.rating) {
        alert("Please select a star rating before submitting");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/reviews`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rideId: booking.rideId?._id,
            rating: reviewData.rating,
            remarks: reviewData.remark || "",
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to submit review");
        return;
      }

      setSubmittedReviews((prev) => ({
        ...prev,
        [booking._id]: {
          ...prev[booking._id],
          submitted: true,
        },
      }));

      setOpenReviewId(null);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while submitting review");
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/bookings/myBookings`,
        {
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to fetch bookings");
        setLoading(false);
        return;
      }

      setBookings(data || []);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while fetching bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBookings();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading your bookings...</p>;
  }

  if (message) {
    return <p className="text-center mt-10 text-muted-foreground">{message}</p>;
  }

  if (bookings.length === 0) {
    return (
      <p className="text-center mt-10 text-muted-foreground">
        You have no bookings yet
      </p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h2 className="text-2xl font-semibold">My Bookings</h2>

      {bookings.map((booking) => (
        <Fragment key={booking._id}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {booking.rideId
                    ? `${booking.rideId.source} → ${booking.rideId.destination}`
                    : "Ride details unavailable"}
                </span>

                <Badge
                  variant={
                    booking.status === "approved"
                      ? "success"
                      : booking.status === "rejected"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {booking.status?.toUpperCase() || "PENDING"}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={booking.driverId?.avatar} />
                  <AvatarFallback>
                    {booking.driverId?.name?.trim()?.[0]}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <p className="font-medium">{booking.driverId?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Seats booked: {booking.seatsBooked}
                  </p>
                </div>
              </div>

              <div className="text-right text-sm text-muted-foreground">
                {booking.rideId?.departureDateTime ? (
                  <>
                    <p>
                      {new Date(booking.rideId.departureDateTime).toLocaleDateString()}
                    </p>
                    <p>
                      {new Date(booking.rideId.departureDateTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </>
                ) : (
                  <p>—</p>
                )}
                {booking.rideId?.pricePerSeat && (
                  <p className="font-medium text-foreground">
                    ₹{booking.rideId.pricePerSeat} / seat
                  </p>
                )}
              </div>
              {(booking.status === "approved" || booking.status === "confirmed") &&
                !submittedReviews[booking._id]?.submitted && (
                <button
                  onClick={() =>
                    setOpenReviewId(
                      openReviewId === booking._id ? null : booking._id
                    )
                  }
                  className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 transition"
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  Rate ride
                </button>
              )}
            </CardContent>
            {openReviewId === booking._id && (
              <div className="border-t px-6 py-4 space-y-3">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() =>
                        setSubmittedReviews((prev) => ({
                          ...prev,
                          [booking._id]: {
                            ...(prev[booking._id] || {}),
                            rating: star,
                          },
                        }))
                      }
                      className={`text-xl ${
                        submittedReviews[booking._id]?.rating >= star
                          ? "text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  rows={3}
                  placeholder="Write your experience..."
                  onChange={(e) =>
                    setSubmittedReviews((prev) => ({
                      ...prev,
                      [booking._id]: {
                        ...(prev[booking._id] || {}),
                        remark: e.target.value,
                      },
                    }))
                  }
                />

                <button
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm"
                  onClick={() => handleSubmitReview(booking)}
                >
                  Submit review
                </button>
              </div>
            )}
          </Card>
        </Fragment>
      ))}
    </div>
  );
}
