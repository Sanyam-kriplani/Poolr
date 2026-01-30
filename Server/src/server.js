import connectDB from "./db.js";
import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";


const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  console.log("Connected to MongoDB");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


