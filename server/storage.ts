import { type User, type InsertUser, type Story, type InsertStory, type Comment, type InsertComment, type Like, type Follow, type Notification, type StoryWithAuthor, type CommentWithAuthor, type NotificationWithDetails } from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Story operations
  getStory(id: string): Promise<Story | undefined>;
  getStoryWithAuthor(id: string): Promise<StoryWithAuthor | undefined>;
  getStoriesByAuthor(authorId: string): Promise<StoryWithAuthor[]>;
  getAllStories(limit?: number, offset?: number): Promise<StoryWithAuthor[]>;
  getStoriesByGenre(genre: string, limit?: number, offset?: number): Promise<StoryWithAuthor[]>;
  searchStories(query: string, limit?: number, offset?: number): Promise<StoryWithAuthor[]>;
  createStory(story: InsertStory & { authorId: string }): Promise<Story>;
  updateStory(id: string, story: Partial<InsertStory>): Promise<Story | undefined>;
  deleteStory(id: string): Promise<boolean>;
  
  // Comment operations
  getCommentsByStory(storyId: string): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment & { authorId: string }): Promise<Comment>;
  deleteComment(id: string): Promise<boolean>;
  
  // Like operations
  getLike(storyId: string, userId: string): Promise<Like | undefined>;
  createLike(storyId: string, userId: string): Promise<Like>;
  deleteLike(storyId: string, userId: string): Promise<boolean>;
  getLikesCount(storyId: string): Promise<number>;
  
  // Follow operations
  getFollow(followerId: string, followingId: string): Promise<Follow | undefined>;
  createFollow(followerId: string, followingId: string): Promise<Follow>;
  deleteFollow(followerId: string, followingId: string): Promise<boolean>;
  getFollowersCount(userId: string): Promise<number>;
  getFollowingCount(userId: string): Promise<number>;
  
  // Notification operations
  getNotificationsByUser(userId: string): Promise<NotificationWithDetails[]>;
  createNotification(notification: { type: string; userId: string; fromUserId: string; storyId?: string; commentId?: string }): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;
  
  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private stories: Map<string, Story>;
  private comments: Map<string, Comment>;
  private likes: Map<string, Like>;
  private follows: Map<string, Follow>;
  private notifications: Map<string, Notification>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.stories = new Map();
    this.comments = new Map();
    this.likes = new Map();
    this.follows = new Map();
    this.notifications = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      bio: insertUser.bio ?? null,
      avatar: insertUser.avatar ?? null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Story operations
  async getStory(id: string): Promise<Story | undefined> {
    return this.stories.get(id);
  }

  async getStoryWithAuthor(id: string): Promise<StoryWithAuthor | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const author = await this.getUser(story.authorId);
    if (!author) return undefined;

    const likesCount = await this.getLikesCount(id);
    const commentsCount = Array.from(this.comments.values()).filter(c => c.storyId === id).length;

    return {
      ...story,
      author: {
        id: author.id,
        username: author.username,
        displayName: author.displayName,
        avatar: author.avatar,
      },
      likesCount,
      commentsCount,
    };
  }

  async getStoriesByAuthor(authorId: string): Promise<StoryWithAuthor[]> {
    const stories = Array.from(this.stories.values()).filter(s => s.authorId === authorId && s.isPublished);
    const storiesWithAuthor = await Promise.all(stories.map(async (story) => {
      const storyWithAuthor = await this.getStoryWithAuthor(story.id);
      return storyWithAuthor!;
    }));
    return storiesWithAuthor.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }

  async getAllStories(limit = 20, offset = 0): Promise<StoryWithAuthor[]> {
    const stories = Array.from(this.stories.values())
      .filter(s => s.isPublished)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);

    const storiesWithAuthor = await Promise.all(stories.map(async (story) => {
      const storyWithAuthor = await this.getStoryWithAuthor(story.id);
      return storyWithAuthor!;
    }));
    return storiesWithAuthor;
  }

  async getStoriesByGenre(genre: string, limit = 20, offset = 0): Promise<StoryWithAuthor[]> {
    const stories = Array.from(this.stories.values())
      .filter(s => s.isPublished && s.genre.toLowerCase() === genre.toLowerCase())
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);

    const storiesWithAuthor = await Promise.all(stories.map(async (story) => {
      const storyWithAuthor = await this.getStoryWithAuthor(story.id);
      return storyWithAuthor!;
    }));
    return storiesWithAuthor;
  }

  async searchStories(query: string, limit = 20, offset = 0): Promise<StoryWithAuthor[]> {
    const stories = Array.from(this.stories.values())
      .filter(s => s.isPublished && (
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.content.toLowerCase().includes(query.toLowerCase()) ||
        s.excerpt.toLowerCase().includes(query.toLowerCase())
      ))
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(offset, offset + limit);

    const storiesWithAuthor = await Promise.all(stories.map(async (story) => {
      const storyWithAuthor = await this.getStoryWithAuthor(story.id);
      return storyWithAuthor!;
    }));
    return storiesWithAuthor;
  }

  async createStory(insertStory: InsertStory & { authorId: string }): Promise<Story> {
    const id = randomUUID();
    const story: Story = {
      ...insertStory,
      id,
      coverImage: insertStory.coverImage ?? null,
      publishedAt: new Date(),
      isPublished: true,
    };
    this.stories.set(id, story);
    return story;
  }

  async updateStory(id: string, updateData: Partial<InsertStory>): Promise<Story | undefined> {
    const story = this.stories.get(id);
    if (!story) return undefined;

    const updatedStory = { ...story, ...updateData };
    this.stories.set(id, updatedStory);
    return updatedStory;
  }

  async deleteStory(id: string): Promise<boolean> {
    return this.stories.delete(id);
  }

  // Comment operations
  async getCommentsByStory(storyId: string): Promise<CommentWithAuthor[]> {
    const comments = Array.from(this.comments.values())
      .filter(c => c.storyId === storyId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const commentsWithAuthor = await Promise.all(comments.map(async (comment) => {
      const author = await this.getUser(comment.authorId);
      return {
        ...comment,
        author: {
          id: author!.id,
          username: author!.username,
          displayName: author!.displayName,
          avatar: author!.avatar,
        },
      };
    }));
    return commentsWithAuthor;
  }

  async createComment(insertComment: InsertComment & { authorId: string }): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    return comment;
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.comments.delete(id);
  }

  // Like operations
  async getLike(storyId: string, userId: string): Promise<Like | undefined> {
    return Array.from(this.likes.values()).find(l => l.storyId === storyId && l.userId === userId);
  }

  async createLike(storyId: string, userId: string): Promise<Like> {
    const id = randomUUID();
    const like: Like = {
      id,
      storyId,
      userId,
      createdAt: new Date(),
    };
    this.likes.set(id, like);
    return like;
  }

  async deleteLike(storyId: string, userId: string): Promise<boolean> {
    const like = await this.getLike(storyId, userId);
    if (!like) return false;
    return this.likes.delete(like.id);
  }

  async getLikesCount(storyId: string): Promise<number> {
    return Array.from(this.likes.values()).filter(l => l.storyId === storyId).length;
  }

  // Follow operations
  async getFollow(followerId: string, followingId: string): Promise<Follow | undefined> {
    return Array.from(this.follows.values()).find(f => f.followerId === followerId && f.followingId === followingId);
  }

  async createFollow(followerId: string, followingId: string): Promise<Follow> {
    const id = randomUUID();
    const follow: Follow = {
      id,
      followerId,
      followingId,
      createdAt: new Date(),
    };
    this.follows.set(id, follow);
    return follow;
  }

  async deleteFollow(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.getFollow(followerId, followingId);
    if (!follow) return false;
    return this.follows.delete(follow.id);
  }

  async getFollowersCount(userId: string): Promise<number> {
    return Array.from(this.follows.values()).filter(f => f.followingId === userId).length;
  }

  async getFollowingCount(userId: string): Promise<number> {
    return Array.from(this.follows.values()).filter(f => f.followerId === userId).length;
  }

  // Notification operations
  async getNotificationsByUser(userId: string): Promise<NotificationWithDetails[]> {
    const notifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const notificationsWithDetails = await Promise.all(notifications.map(async (notification) => {
      const fromUser = await this.getUser(notification.fromUserId);
      const story = notification.storyId ? await this.getStory(notification.storyId) : undefined;

      return {
        ...notification,
        fromUser: {
          id: fromUser!.id,
          username: fromUser!.username,
          displayName: fromUser!.displayName,
          avatar: fromUser!.avatar,
        },
        story: story ? {
          id: story.id,
          title: story.title,
        } : undefined,
      };
    }));
    return notificationsWithDetails;
  }

  async createNotification(data: { type: string; userId: string; fromUserId: string; storyId?: string; commentId?: string }): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...data,
      id,
      storyId: data.storyId ?? null,
      commentId: data.commentId ?? null,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }
}

export const storage = new MemStorage();
