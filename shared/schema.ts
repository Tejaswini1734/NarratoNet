import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  bio: text("bio"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stories = pgTable("stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  excerpt: text("excerpt").notNull(),
  genre: text("genre").notNull(),
  coverImage: text("cover_image"),
  authorId: varchar("author_id").notNull().references(() => users.id),
  publishedAt: timestamp("published_at").defaultNow().notNull(),
  readTime: integer("read_time").notNull(), // in minutes
  isPublished: boolean("is_published").default(true).notNull(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  authorId: varchar("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const likes = pgTable("likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storyId: varchar("story_id").notNull().references(() => stories.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const follows = pgTable("follows", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  followerId: varchar("follower_id").notNull().references(() => users.id),
  followingId: varchar("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(), // 'like', 'comment', 'follow'
  userId: varchar("user_id").notNull().references(() => users.id),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  storyId: varchar("story_id").references(() => stories.id),
  commentId: varchar("comment_id").references(() => comments.id),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
  displayName: true,
  bio: true,
  avatar: true,
});

export const insertStorySchema = createInsertSchema(stories).pick({
  title: true,
  content: true,
  excerpt: true,
  genre: true,
  coverImage: true,
  readTime: true,
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  storyId: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStory = z.infer<typeof insertStorySchema>;
export type Story = typeof stories.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type Like = typeof likes.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Notification = typeof notifications.$inferSelect;

// Extended types for API responses
export type StoryWithAuthor = Story & {
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
};

export type CommentWithAuthor = Comment & {
  author: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
};

export type NotificationWithDetails = Notification & {
  fromUser: Pick<User, 'id' | 'username' | 'displayName' | 'avatar'>;
  story?: Pick<Story, 'id' | 'title'>;
};
