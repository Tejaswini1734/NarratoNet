import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertStorySchema, insertCommentSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // sets up /api/register, /api/login, /api/logout, /api/user
  setupAuth(app);

  // Story routes
  app.get("/api/stories", async (req, res) => {
    try {
      const { genre, search, limit = "20", offset = "0" } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      let stories;
      if (search) {
        stories = await storage.searchStories(search as string, limitNum, offsetNum);
      } else if (genre && genre !== "all") {
        stories = await storage.getStoriesByGenre(genre as string, limitNum, offsetNum);
      } else {
        stories = await storage.getAllStories(limitNum, offsetNum);
      }

      // Add isLiked for authenticated users
      if (req.isAuthenticated()) {
        for (const story of stories) {
          const like = await storage.getLike(story.id, req.user!.id);
          story.isLiked = !!like;
        }
      }

      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories" });
    }
  });

  app.get("/api/stories/:id", async (req, res) => {
    try {
      const story = await storage.getStoryWithAuthor(req.params.id);
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Add isLiked for authenticated users
      if (req.isAuthenticated()) {
        const like = await storage.getLike(story.id, req.user!.id);
        story.isLiked = !!like;
      }

      res.json(story);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story" });
    }
  });

  app.post("/api/stories", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validatedData = insertStorySchema.parse(req.body);
      const story = await storage.createStory({
        ...validatedData,
        authorId: req.user!.id,
      });
      res.status(201).json(story);
    } catch (error) {
      res.status(400).json({ message: "Invalid story data" });
    }
  });

  // Comment routes
  app.get("/api/stories/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCommentsByStory(req.params.id);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post("/api/stories/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        storyId: req.params.id,
      });
      const comment = await storage.createComment({
        ...validatedData,
        authorId: req.user!.id,
      });

      // Create notification for story author
      const story = await storage.getStory(req.params.id);
      if (story && story.authorId !== req.user!.id) {
        await storage.createNotification({
          type: "comment",
          userId: story.authorId,
          fromUserId: req.user!.id,
          storyId: story.id,
          commentId: comment.id,
        });
      }

      res.status(201).json(comment);
    } catch (error) {
      res.status(400).json({ message: "Invalid comment data" });
    }
  });

  // Like routes
  app.post("/api/stories/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const existingLike = await storage.getLike(req.params.id, req.user!.id);
      if (existingLike) {
        return res.status(400).json({ message: "Story already liked" });
      }

      const like = await storage.createLike(req.params.id, req.user!.id);

      // Create notification for story author
      const story = await storage.getStory(req.params.id);
      if (story && story.authorId !== req.user!.id) {
        await storage.createNotification({
          type: "like",
          userId: story.authorId,
          fromUserId: req.user!.id,
          storyId: story.id,
        });
      }

      res.status(201).json(like);
    } catch (error) {
      res.status(500).json({ message: "Failed to like story" });
    }
  });

  app.delete("/api/stories/:id/like", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const success = await storage.deleteLike(req.params.id, req.user!.id);
      if (!success) {
        return res.status(404).json({ message: "Like not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unlike story" });
    }
  });

  // Follow routes
  app.post("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.params.id === req.user!.id) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    try {
      const existingFollow = await storage.getFollow(req.user!.id, req.params.id);
      if (existingFollow) {
        return res.status(400).json({ message: "Already following user" });
      }

      const follow = await storage.createFollow(req.user!.id, req.params.id);

      // Create notification
      await storage.createNotification({
        type: "follow",
        userId: req.params.id,
        fromUserId: req.user!.id,
      });

      res.status(201).json(follow);
    } catch (error) {
      res.status(500).json({ message: "Failed to follow user" });
    }
  });

  app.delete("/api/users/:id/follow", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const success = await storage.deleteFollow(req.user!.id, req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Follow not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to unfollow user" });
    }
  });

  // Notification routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const notifications = await storage.getNotificationsByUser(req.user!.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
