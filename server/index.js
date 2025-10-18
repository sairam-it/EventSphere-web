import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";

// 🧩 Route Imports
import authRoutes from "./routes/authRoutes.js";
import eventRoutes from "./routes/eventRoutes.js"; 
import registrationRoutes from "./routes/registrationRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";



dotenv.config();

const app = express();

// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// 🗄️ Connect MongoDB
connectDB();

// 🌐 Routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/events", eventRoutes); // ✅ Event-related routes
app.use("/api/registrations", registrationRoutes);
app.use("/api/teams", teamRoutes); // 🏗️ Team-related routes


// ✅ Test route
app.get("/", (req, res) => {
  res.status(200).send("EventSphere backend is running 🚀");
});

// ⚙️ Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
