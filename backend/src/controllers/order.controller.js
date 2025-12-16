import { prisma } from "../db.js";

// Utility function (moved from original index.js)
const roundMoney = (x) => Math.round(x * 100) / 100;


// POST /orders
export const createOrder = async (req, res) => {
  try {
    const { tableNumber, orderItems } = req.body;

    // 1. Calculate totals
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

    const TAX_RATE = 0.05; // 5% tax
    const tax = roundMoney(subtotal * TAX_RATE);
    const total = roundMoney(subtotal + tax);

    // 2. Create the Order
    const newOrder = await prisma.order.create({
      data: {
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

    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    console.error("Order POST error:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
};


// GET /orders?status=...
export const getOrders = async (req, res) => {
  try {
    const { status } = req.query;

    let orders;
    
    // Find all orders that are NOT 'PAID'
    const whereClause = status 
      ? { status } 
      : { status: { not: "PAID" } };

    orders = await prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: "asc" },
        include: {
          items: {
            include: { menu: true },
          },
        },
    });

    // Custom data shaping logic (moved from original index.js)
    const shaped = orders.map(order => ({
      ...order,
      orders: order.items.map(item => ({
        ...item,
        // Rename 'items' to 'orders' to match your frontend usage
        itemId: item.menuId, 
      })),
    }));

    res.json(shaped);
  } catch (err) {
    console.error("Orders GET error:", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


// PUT /orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: { include: { menu: true } },
      },
    });

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("Order status PUT error:", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
};


// GET /tables/check/:tableNumber
export const checkTableAvailability = async (req, res) => {
  try {
    const tableNumber = Number(req.params.tableNumber);

    const existing = await prisma.order.findFirst({
      where: {
        tableNumber,
        status: { not: "PAID" }, // Check for any active status
      },
    });

    // If an order exists (is active), return that order, otherwise null
    res.json({ activeOrder: existing || null }); 
  } catch (err) {
    console.error("Table check error:", err);
    res.status(500).json({ error: "Failed to check table status" });
  }
};