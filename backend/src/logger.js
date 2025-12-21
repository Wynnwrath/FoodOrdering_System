import { prisma } from "./db.js";

export const logActivity = async (action, details, user = "System") => {
  try {
    await prisma.activityLog.create({
      data: {
        action,
        details,
        user,
      },
    });
    console.log(`[LOG]: ${action} - ${details}`);
  } catch (err) {
    console.error("Failed to write activity log:", err);
  }
};