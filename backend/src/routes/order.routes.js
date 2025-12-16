import express from "express";
import { 
    createOrder, 
    getOrders, 
    updateOrderStatus,
    checkTableAvailability 
} from "../controllers/order.controller.js";

const router = express.Router();

// Base route is /orders (as mounted in index.js)
router.post("/", createOrder); // POST /orders
router.get("/", getOrders); // GET /orders?status=...
router.put("/:id/status", updateOrderStatus); // PUT /orders/:id/status

// Move the table check route here (we will access it via /orders/check/1)
router.get("/check/:tableNumber", checkTableAvailability);

export default router;