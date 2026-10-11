import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import itemRoutes from "./routes/items.js";

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "StockWise API is running" });
});

app.use("/api/items", itemRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.status ? err.message : "Internal server error"
  });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it to server/.env");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
