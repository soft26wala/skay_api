import express from "express";
import {
  fetchSingleOrder,
  placeNewOrder,
  fetchMyOrders,
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  getStallionSettings,
  saveStallionSettings,
  shipOrderWithStallion,
  attachStallionTracking,
  trackStallionOrder,
  syncAllStallionOrders,
} from "../controllers/orderController.js";
import {
  isAuthenticated,
  authorizedRoles,
} from "../middlewares/authMiddleware.js";

const router = express.Router();
router.post("/new", isAuthenticated, placeNewOrder);
router.get("/orders/me", isAuthenticated, fetchMyOrders);

// Stallion Express Endpoints
router.get(
  "/admin/stallion/config",
  isAuthenticated,
  authorizedRoles("Admin"),
  getStallionSettings
);
router.post(
  "/admin/stallion/config",
  isAuthenticated,
  authorizedRoles("Admin"),
  saveStallionSettings
);
router.post(
  "/admin/stallion/ship/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  shipOrderWithStallion
);
router.post(
  "/admin/stallion/attach-tracking/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  attachStallionTracking
);
router.post(
  "/admin/stallion/sync-all",
  isAuthenticated,
  authorizedRoles("Admin"),
  syncAllStallionOrders
);
router.get("/stallion/track/:orderId", isAuthenticated, trackStallionOrder);

router.get("/:orderId", isAuthenticated, fetchSingleOrder);

router.get(
  "/admin/getall",
  isAuthenticated,
  authorizedRoles("Admin"),
  fetchAllOrders
);
router.put(
  "/admin/update/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  updateOrderStatus
);
router.delete(
  "/admin/delete/:orderId",
  isAuthenticated,
  authorizedRoles("Admin"),
  deleteOrder
);

export default router;
