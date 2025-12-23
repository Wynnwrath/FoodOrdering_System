import { prisma } from "../db.js";

export const getHistory = async (req, res) => {
  try {
    const history = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" }, 
      take: 100, 
    });
    res.json(history);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to load history" });
  }
};