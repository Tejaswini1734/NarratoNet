// Models export file for better organization
// In a real MERN stack, these would be Mongoose models
// For now, we're using the existing storage system with proper type definitions

export * from "@shared/schema";

// Additional model-like functions for data validation and transformation
export const validateStoryData = (data: any) => {
  const requiredFields = ['title', 'content', 'excerpt', 'genre', 'readTime'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (data.title.length < 3) {
    throw new Error('Title must be at least 3 characters long');
  }

  if (data.content.length < 100) {
    throw new Error('Content must be at least 100 characters long');
  }

  if (data.excerpt.length < 10) {
    throw new Error('Excerpt must be at least 10 characters long');
  }

  return true;
};

export const validateCommentData = (data: any) => {
  if (!data.content || data.content.trim().length < 1) {
    throw new Error('Comment content is required');
  }

  if (data.content.length > 1000) {
    throw new Error('Comment content must be less than 1000 characters');
  }

  return true;
};

// Story genres enum for consistency
export const STORY_GENRES = [
  'Fantasy',
  'Science Fiction',
  'Mystery',
  'Romance',
  'Thriller',
  'Horror',
  'Adventure',
  'Drama',
  'Comedy',
  'Historical Fiction',
  'Young Adult',
  'Non-Fiction'
] as const;

export type StoryGenre = typeof STORY_GENRES[number];

// Notification types enum
export const NOTIFICATION_TYPES = {
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  NEW_STORY: 'new_story'
} as const;