import { prisma } from "../db.js";
import { logActivity } from "../logger.js"; // Importing from src/logger.js

// GET /menu
export const getMenu = async (req, res) => {
  try {
    const items = await prisma.menu.findMany({
      orderBy: { id: "asc" },
    });
    res.json(items);
  } catch (err) {
    console.error("Menu GET error:", err);
    res.status(500).json({ error: "Failed to load menu" });
  }
};

// POST /menu
export const createMenuItem = async (req, res) => {
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

    await logActivity("MENU_CREATE", `Created item: ${name} ($${price})`, "Manager");

    res.status(201).json({ success: true, item });
  } catch (err) {
    console.error("Menu POST error:", err);
    res.status(500).json({ error: "Failed to add menu item" });
  }
};

// PUT /menu/:id
export const updateMenuItem = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, price, category, imageUrl } = req.body;

    const updatedItem = await prisma.menu.update({
      where: { id },
      data: {
        name,
        price: Number(price),
        category,
        imageUrl,
      },
    });

    await logActivity("MENU_UPDATE", `Updated item: ${name} ($${price})`, "Manager");

    res.json({ success: true, item: updatedItem });
  } catch (err) {
    console.error("Menu PUT error:", err);
    res.status(500).json({ error: "Failed to update menu item" });
  }
};

// DELETE /menu/:id
export const deleteMenuItem = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.menu.findUnique({ where: { id } });

    await prisma.menu.delete({
      where: { id },
    });

    if (item) {
        await logActivity("MENU_DELETE", `Deleted item: ${item.name}`, "Manager");
    }

    res.json({ success: true, message: "Menu item deleted" });
  } catch (err) {
    console.error("Menu DELETE error:", err);
    res.status(500).json({ error: "Failed to delete menu item" });
  }
};