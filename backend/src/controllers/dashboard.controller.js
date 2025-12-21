import { prisma } from "../db.js";

// GET /dashboard/stats
export const getDashboardStats = async (req, res) => {
  try {
    // 1. Calculate Revenue & Total Transactions (PAID only, excluding Archived)
    // NOTE: Once archived, this returns 0 (which is what you want for a new day)
    const salesAgg = await prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: { 
        status: "PAID" 
        // implicitly excludes "ARCHIVED" because status can't be both
      },
    });

    // 2. Get Live Counts (PENDING, READY, SERVED)
    // We strictly filter out ARCHIVED so the dashboard goes to 0
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        status: { not: "ARCHIVED" } 
      }
    });

    // Helper to extract count safely
    const getCount = (status) => {
      const found = statusCounts.find(s => s.status === status);
      return found ? found._count.id : 0;
    };

    // 3. Get Top 5 Items (Only from Active/Paid orders, not archived ones)
    // This resets the "Best Sellers" chart for the new day
    const topItemsRaw = await prisma.orderItem.groupBy({
      by: ['menuId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
      where: {
        order: {
            status: { not: "ARCHIVED" }
        }
      }
    });

    const topItems = await Promise.all(topItemsRaw.map(async (item) => {
      const menu = await prisma.menu.findUnique({ where: { id: item.menuId } });
      return {
        name: menu ? menu.name : "Unknown",
        count: item._sum.quantity || 0
      };
    }));

    // 4. Recent Orders Log (Only Active)
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { status: { not: "ARCHIVED" } }, // <--- Hides old history
      include: { items: { include: { menu: true } } }
    });

    res.json({
      totalRevenue: salesAgg._sum.total || 0,
      totalTransactions: salesAgg._count.id || 0,
      pendingCount: getCount("PENDING"),
      readyCount: getCount("READY"),
      servedCount: getCount("SERVED"),
      topItems,
      recentOrders,
    });

  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};

// POST /dashboard/archive
// THIS IS THE FIX FOR "END DAY"
export const archiveDailySales = async (req, res) => {
  try {
    // Update EVERYTHING that isn't already archived.
    // This catches PENDING, READY, SERVED, and PAID.
    const result = await prisma.order.updateMany({
      where: { 
        status: { not: "ARCHIVED" } 
      },
      data: { status: "ARCHIVED" },
    });
    
    // Result: 
    // 1. All Dashboard counts become 0.
    // 2. Ticket Counter (in order.controller) will see 0 active orders and reset to #1.
    
    res.json({ success: true, message: `Day Ended. Archived ${result.count} orders. Ticket counter reset.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to archive" });
  }
};