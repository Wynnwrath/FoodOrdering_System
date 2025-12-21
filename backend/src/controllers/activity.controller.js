import { prisma } from "../db.js";

export const getHistory = async (req, res) => {
  try {
    const history = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" }, // Newest first
      take: 100, // Limit to last 100 events
    });
    res.json(history);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
};