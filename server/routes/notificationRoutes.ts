import { Router } from "express";
import { notificationController } from "../controllers/notificationController";

const router = Router();

// Get user notifications
router.get("/", notificationController.getUserNotifications);

// Mark notification as read
router.patch("/:id/read", notificationController.markNotificationAsRead);

// Get unread notification count
router.get("/unread/count", notificationController.getUnreadNotificationCount);

export default router;