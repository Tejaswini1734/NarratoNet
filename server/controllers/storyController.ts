import { Request, Response } from "express";
import { storage } from "../storage";
import { insertStorySchema } from "@shared/schema";

export const storyController = {
  // POST /api/stories/post
  async createStory(req: Request, res: Response) {
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
  },

  // PUT /api/stories/edit/:id
  async editStory(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const storyId = req.params.id;
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Check if user owns the story
      if (story.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to edit this story" });
      }

      const validatedData = insertStorySchema.partial().parse(req.body);
      const updatedStory = await storage.updateStory(storyId, validatedData);
      
      if (!updatedStory) {
        return res.status(404).json({ message: "Story not found" });
      }

      res.json(updatedStory);
    } catch (error) {
      res.status(400).json({ message: "Invalid story data" });
    }
  },

  // DELETE /api/stories/delete/:id
  async deleteStory(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const storyId = req.params.id;
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      // Check if user owns the story
      if (story.authorId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this story" });
      }

      const success = await storage.deleteStory(storyId);
      if (!success) {
        return res.status(404).json({ message: "Story not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete story" });
    }
  },

  // GET /api/stories/feed
  async getStoryFeed(req: Request, res: Response) {
    try {
      const { limit = "20", offset = "0" } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      const stories = await storage.getAllStories(limitNum, offsetNum);

      // Add isLiked for authenticated users
      if (req.isAuthenticated()) {
        for (const story of stories) {
          const like = await storage.getLike(story.id, req.user!.id);
          story.isLiked = !!like;
        }
      }

      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch story feed" });
    }
  },

  // GET /api/stories/genre/:name
  async getStoriesByGenre(req: Request, res: Response) {
    try {
      const { name } = req.params;
      const { limit = "20", offset = "0" } = req.query;
      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      const stories = await storage.getStoriesByGenre(name, limitNum, offsetNum);

      // Add isLiked for authenticated users
      if (req.isAuthenticated()) {
        for (const story of stories) {
          const like = await storage.getLike(story.id, req.user!.id);
          story.isLiked = !!like;
        }
      }

      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stories by genre" });
    }
  },

  // GET /api/stories/search?q=...
  async searchStories(req: Request, res: Response) {
    try {
      const { q: query, limit = "20", offset = "0" } = req.query;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const limitNum = parseInt(limit as string);
      const offsetNum = parseInt(offset as string);

      const stories = await storage.searchStories(query as string, limitNum, offsetNum);

      // Add isLiked for authenticated users
      if (req.isAuthenticated()) {
        for (const story of stories) {
          const like = await storage.getLike(story.id, req.user!.id);
          story.isLiked = !!like;
        }
      }

      res.json(stories);
    } catch (error) {
      res.status(500).json({ message: "Failed to search stories" });
    }
  },

  // GET /api/stories/:storyId
  async getStoryById(req: Request, res: Response) {
    try {
      const { storyId } = req.params;
      const story = await storage.getStoryWithAuthor(storyId);
      
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
  },

  // POST /api/stories/:id/like
  async likeStory(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const storyId = req.params.id;
      const existingLike = await storage.getLike(storyId, req.user!.id);
      
      if (existingLike) {
        return res.status(400).json({ message: "Story already liked" });
      }

      const like = await storage.createLike(storyId, req.user!.id);

      // Create notification for story author
      const story = await storage.getStory(storyId);
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
  },

  // POST /api/stories/:id/comment
  async commentOnStory(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const storyId = req.params.id;
      const { content } = req.body;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content is required" });
      }

      const comment = await storage.createComment({
        content: content.trim(),
        storyId,
        authorId: req.user!.id,
      });

      // Create notification for story author
      const story = await storage.getStory(storyId);
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
      res.status(500).json({ message: "Failed to create comment" });
    }
  },

  // POST /api/stories/:id/subscribe (Follow the author)
  async subscribeToAuthor(req: Request, res: Response) {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }

    try {
      const storyId = req.params.id;
      const story = await storage.getStory(storyId);
      
      if (!story) {
        return res.status(404).json({ message: "Story not found" });
      }

      const authorId = story.authorId;

      if (authorId === req.user!.id) {
        return res.status(400).json({ message: "Cannot subscribe to yourself" });
      }

      const existingFollow = await storage.getFollow(req.user!.id, authorId);
      if (existingFollow) {
        return res.status(400).json({ message: "Already subscribed to this author" });
      }

      const follow = await storage.createFollow(req.user!.id, authorId);

      // Create notification
      await storage.createNotification({
        type: "follow",
        userId: authorId,
        fromUserId: req.user!.id,
      });

      res.status(201).json({ 
        message: "Successfully subscribed to author",
        follow 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to subscribe to author" });
    }
  }
};