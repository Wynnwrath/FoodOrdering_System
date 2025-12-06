import express from "express";
import cors from "cors";
import { prisma } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "5mb" })); 
app.use(cors());

const roundMoney = (x) => Math.round(x * 100) / 100;

// --- MENU ROUTES ---

// GET /menu - used by Waiter & Manager
app.get("/menu", async (req, res) => {
  try {
    const items = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });
    res.json(items);
  } catch (err) {
    console.error("GET /menu error", err);
    res.status(500).json({ error: "Failed to load menu" });
  }
});

// POST /menu - used by Manager to add a menu item
app.post("/menu", async (req, res) => {
  try {
    const { name, price, category, imageUrl } = req.body;

    const item = await prisma.menu.create({
      data: {
        name,
        price: Number(price),
        category,
        imageUrl,
      },
    });

    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("POST /menu error", err);
    res.status(500).json({ error: "Failed to add menu item" });
  }
});

// PUT /menu/:id - update menu item
app.put("/menu/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, category, imageUrl } = req.body;

    const updated = await prisma.menu.update({
      where: { id },
      data: {
        name,
        price: price !== undefined ? Number(price) : undefined,
        category,
        imageUrl,
      },
    });

    res.json({ success: true, item: updated });
  } catch (err) {
    console.error("PUT /menu/:id error", err);
    res.status(404).json({ error: "Menu item not found" });
  }
});

// DELETE /menu/:id - delete menu item
app.delete("/menu/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.menu.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /menu/:id error", err);
    res.status(404).json({ error: "Menu item not found" });
  }
});

// --- ORDER ROUTES ---

// POST /orders - waiter creates order, logs totals
app.post("/orders", async (req, res) => {
  try {
    const {
      tableNumber,
      orders: orderLines,
      subtotal,
      tax,
      total,
    } = req.body;

        // Prevent double-booking: Check if table has an active order
    if (tableNumber != null) {
      const active = await prisma.order.findFirst({
        where: {
          tableNumber: Number(tableNumber),
          status: { not: "SERVED" },  // Still active
        },
      });

      if (active) {
        return res.status(400).json({
          error: `Table ${tableNumber} already has an active order (Order #${active.id}).`,
        });
      }
    }

    if (!Array.isArray(orderLines) || orderLines.length === 0) {
      return res
        .status(400)
        .json({ error: "Order must have at least one item" });
    }

    // 🔹 Clean & round all money values to 2 decimals
    const cleanSubtotal =
      subtotal != null ? roundMoney(Number(subtotal)) : null;
    const cleanTax = tax != null ? roundMoney(Number(tax)) : null;
    const cleanTotal = total != null ? roundMoney(Number(total)) : null;

    const newOrder = await prisma.order.create({
      data: {
        status: "PENDING",
        tableNumber: tableNumber != null ? Number(tableNumber) : null,
        subtotal: cleanSubtotal,
        tax: cleanTax,
        total: cleanTotal,
        items: {
          create: orderLines.map((item) => ({
            menuId: item.itemId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: { include: { menu: true } },
      },
    });

    const shaped = {
      ...newOrder,
      orders: newOrder.items.map((i) => ({
        itemId: i.menuId,
        quantity: i.quantity,
      })),
    };

    res.status(201).json({ success: true, order: shaped });
  } catch (err) {
    console.error("Error creating order:", err);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// GET /orders?status=... - kitchen & waiter views yesir
app.get("/orders", async (req, res) => {
  try {
    const { status } = req.query;

    const orders = await prisma.order.findMany({
      where: status ? { status: String(status) } : {},
      orderBy: { createdAt: "asc" }, 
      include: {
        items: { include: { menu: true } },
      },
    });

    const shaped = orders.map((order) => ({
      ...order,
      orders: order.items.map((item) => ({
        itemId: item.menuId,
        quantity: item.quantity,
      })),
    }));

    res.json(shaped);
  } catch (err) {
    console.error("GET /orders error", err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// PUT /orders/:id/status - update order status (PENDING -> READY -> SERVED -> PAID)
app.put("/orders/:id/status", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: { status }, // updatedAt auto-changes in Prisma
      include: {
        items: { include: { menu: true } },
      },
    });

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("PUT /orders/:id/status error", err);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// --- TABLE CHECK ROUTE ---
// Used to prevent creating a new order for a table that already has an active order
app.get("/tables/check/:tableNumber", async (req, res) => {
  try {
    const tableNumber = Number(req.params.tableNumber);

    const existing = await prisma.order.findFirst({
      where: {
        tableNumber,
        status: { not: "SERVED" },  // Active order (PENDING or READY)
      },
    });

    res.json({ occupied: !!existing });
  } catch (err) {
    console.error("GET /tables/check error", err);
    res.status(500).json({ error: "Failed to check table" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

