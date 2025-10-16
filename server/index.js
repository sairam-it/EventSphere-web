import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();

// 🧩 Middlewares
app.use(cors());
app.use(express.json());

// 🗄️ Connect MongoDB
connectDB();

// 🌐 Routes
app.use("/api/auth", authRoutes);

// ✅ Test route
app.get("/", (req, res) => {
  res.status(200).send("EventSphere backend is running 🚀");
});

// ⚙️ Start server
const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
