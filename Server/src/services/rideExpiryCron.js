import cron from "node-cron";
import Ride from "../models/rideModel.js";

const startRideExpiryCron = () => {
  cron.schedule("*/5 * * * *", async () => {
    try {
      const now = new Date();

      const result = await Ride.updateMany(
        {
          departureDateTime: { $lt: now },
          status: "upcoming"
        },
        {
          $set: {
            status: "expired"
          }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`⏰ Expired rides: ${result.modifiedCount}`);
      }
    } catch (err) {
      console.error("Ride expiry cron error:", err);
    }
  });

  console.log("✅ Ride expiry cron started");
};

export default startRideExpiryCron;