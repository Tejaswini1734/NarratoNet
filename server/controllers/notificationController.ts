import { Request, Response } from "express";
import { storage } from "../storage";

export const notificationController = {
  // GET /api/notifications
  async getUserNotifications(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  },

  // PATCH /api/notifications/:id/read
  async markNotificationAsRead(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const notificationId = req.params.id;
      const success = await storage.markNotificationAsRead(notificationId);
      
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  },

  // GET /api/notifications/unread/count
  async getUnreadNotificationCount(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      res.json({ unreadCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch unread notification count" });
    }
  }
};