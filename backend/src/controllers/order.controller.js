import { prisma } from "../db.js";
import { logActivity } from "../logger.js"; 

const roundMoney = (x) => Math.round(x * 100) / 100;

// POST /orders
export const createOrder = async (req, res) => {
  try {
    const { tableNumber, orderItems } = req.body;

    // --- 1. CALCULATE TICKET NUMBER ---
    // Since "End Day" now sets EVERYTHING to "ARCHIVED",
    // this count will be 0 after you press End Day.
    const activeCount = await prisma.order.count({
      where: {
        status: { not: "ARCHIVED" } 
      }
    });
    
    // If activeCount is 0, nextTicketNumber becomes 1.
    const nextTicketNumber = activeCount + 1;
    // ----------------------------------

    // Calculate totals
    const menuItems = await prisma.menu.findMany({
      where: { id: { in: orderItems.map((item) => item.itemId) } },
    });

    const menuMap = menuItems.reduce((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});

    let subtotal = 0;
    for (const item of orderItems) {
      const menuItem = menuMap[item.itemId];
      if (menuItem) {
        subtotal += menuItem.price * item.quantity;
      }
    }

    const TAX_RATE = 0.05; 
    const tax = roundMoney(subtotal * TAX_RATE);
    const total = roundMoney(subtotal + tax);

    // Create Order with ticketNumber
    const newOrder = await prisma.order.create({
      data: {
        ticketNumber: nextTicketNumber, 
        tableNumber: tableNumber ? Number(tableNumber) : null,
        status: "PENDING",
        subtotal,
        tax,
        total,
        items: {
          createMany: {
            data: orderItems.map((item) => ({
              menuId: item.itemId,
              quantity: item.quantity,
            })),
          },
        },
      },
      include: {
        items: { include: { menu: true } },
      },
    });

    await logActivity(
        "ORDER_CREATE", 
        `Ticket #${nextTicketNumber} created for Table ${tableNumber || 'N/A'}. Total: $${total}`, 
        "Waiter"
    );

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Order POST error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// ... (Rest of your file: getOrders, updateOrderStatus, checkTableAvailability remain unchanged)
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const whereClause = status ? { status } : { status: { notIn: ["PAID", "ARCHIVED"] } };

    const orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
        include: {
          items: {
            include: { menu: true },
          },
        },
    });

    const shaped = orders.map(order => ({
      ...order,
      orders: order.items.map(item => ({
        ...item,
        itemId: item.menuId, 
      })),
    }));

    res.json(shaped);
  } catch (err) {
    console.error("Orders GET error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, paidAmount, change } = req.body; 

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { menu: true } },
      },
    });

    let logMessage = `Ticket #${updated.ticketNumber} status changed to ${status}`;
    let userRole = "System";

    if (status === "PAID") {
        userRole = "Cashier";
        if (paidAmount) {
            logMessage += `. Paid: $${paidAmount}, Change: $${change}`;
        }
    } else if (status === "READY") {
        userRole = "Kitchen";
    } else if (status === "SERVED") {
        userRole = "Waiter";
    }

    await logActivity("ORDER_UPDATE", logMessage, userRole);

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("Order status PUT error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

export const checkTableAvailability = async (req, res) => {
  try {
    const tableNumber = Number(req.params.tableNumber);

    const existing = await prisma.order.findFirst({
      where: {
        tableNumber,
        status: { notIn: ["PAID", "ARCHIVED"] }, 
      },
    });

    res.json({ activeOrder: existing || null }); 
  } catch (err) {
    console.error("Table check error:", err);
    res.status(500).json({ error: "Failed to check table status" });
  }
};