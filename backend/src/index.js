import express from "express";
import cors from "cors";
import { prisma } from "./db.js"; // This path is correct

// --- CORRECTED IMPORTS ---
// They must start with './' to look in the current directory (src/)
import menuRoutes from "./routes/menu.routes.js";
import orderRoutes from "./routes/order.routes.js";
// -------------------------
import { getHistory } from "./controllers/activity.controller.js";
import { getDashboardStats, archiveDailySales } from "./controllers/dashboard.controller.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(express.json({ limit: "5mb" })); 
app.use(cors());

// --- ROUTES ---
app.use("/menu", menuRoutes);
app.use("/orders", orderRoutes);
app.get("/history", getHistory);

// --- DASHBOARD ROUTES ---
app.get("/dashboard/stats", getDashboardStats);
app.post("/dashboard/archive", archiveDailySales);
// -------------------------------

// --- START SERVER ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});