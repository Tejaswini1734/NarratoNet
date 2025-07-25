import { Router } from "express";
import { storyController } from "../controllers/storyController";

const router = Router();

// Story CRUD operations
router.post("/post", storyController.createStory);
router.put("/edit/:id", storyController.editStory);
router.delete("/delete/:id", storyController.deleteStory);

// Story browsing and discovery
router.get("/feed", storyController.getStoryFeed);
router.get("/genre/:name", storyController.getStoriesByGenre);
router.get("/search", storyController.searchStories);
router.get("/:storyId", storyController.getStoryById);

// Story interactions
router.post("/:id/like", storyController.likeStory);
router.post("/:id/comment", storyController.commentOnStory);
router.post("/:id/subscribe", storyController.subscribeToAuthor);

export default router;