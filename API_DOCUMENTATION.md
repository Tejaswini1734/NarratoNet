# NarratoNet API Documentation

## Backend Features Overview

NarratoNet now includes a comprehensive backend API built with Node.js, Express.js, and organized following MERN stack best practices.

## 🛠 Backend Structure

```
server/
├── controllers/           # Business logic controllers
│   ├── storyController.ts    # Story CRUD and interactions
│   └── notificationController.ts # Notification management
├── routes/               # API route definitions
│   ├── storyRoutes.ts       # Story-related routes
│   └── notificationRoutes.ts # Notification routes
├── models/               # Data models and validation
│   └── index.ts            # Model exports and utilities
├── auth.ts              # Authentication setup
├── storage.ts           # Data storage interface
├── seedData.ts          # Sample data for development
└── index.ts             # Server entry point
```

## ✅ Story Routes

### Story CRUD Operations
- **POST /api/stories/post** - Create a new story
- **PUT /api/stories/edit/:id** - Edit existing story (author only)
- **DELETE /api/stories/delete/:id** - Delete story (author only)

### Story Discovery
- **GET /api/stories/feed** - Get personalized story feed
- **GET /api/stories/genre/:name** - Filter stories by genre
- **GET /api/stories/search?q=...** - Search stories by content
- **GET /api/stories/:storyId** - Get individual story details

### Story Interactions
- **POST /api/stories/:id/like** - Like/unlike a story
- **POST /api/stories/:id/comment** - Comment on a story
- **POST /api/stories/:id/subscribe** - Subscribe to story author

## ✅ Notification Routes

- **GET /api/notifications** - Get user-specific notifications
- **PATCH /api/notifications/:id/read** - Mark notification as read
- **GET /api/notifications/unread/count** - Get unread notification count

## 🔐 Authentication

All routes except public story browsing require JWT-based authentication middleware. The current implementation uses session-based authentication that can be easily upgraded to JWT.

## 📝 Request/Response Examples

### Create Story
```bash
POST /api/stories/post
Content-Type: application/json

{
  "title": "My Amazing Story",
  "content": "This is the full story content...",
  "excerpt": "A brief description...",
  "genre": "Fantasy",
  "readTime": 5,
  "coverImage": "optional-image-url"
}
```

### Search Stories
```bash
GET /api/stories/search?q=fantasy&limit=10&offset=0
```

### Like a Story
```bash
POST /api/stories/123e4567-e89b-12d3-a456-426614174000/like
```

### Comment on Story
```bash
POST /api/stories/123e4567-e89b-12d3-a456-426614174000/comment
Content-Type: application/json

{
  "content": "Great story! I loved the character development."
}
```

## 🔄 Data Flow

1. **Story Creation**: User submits story → Controller validates → Storage persists → Response sent
2. **Interactions**: User likes/comments → Notification created → Author notified
3. **Discovery**: User searches → Controller filters → Results with user-specific data returned

## 🗃 Sample Data

The application automatically creates sample data on first run, including:
- 3 sample users with different writing styles
- 4 sample stories across different genres
- Sample likes, comments, follows, and notifications
- Realistic author interactions and social features

## 🚀 Features Implemented

- ✅ Complete CRUD operations for stories
- ✅ Story discovery and filtering by genre
- ✅ Full-text search across title, content, and excerpt
- ✅ Social features (likes, comments, follows)
- ✅ Comprehensive notification system
- ✅ Author subscription functionality
- ✅ Personalized story feeds
- ✅ Route protection and authorization
- ✅ Organized controller/route structure
- ✅ TypeScript type safety throughout
- ✅ Sample data for development/testing

The backend is now fully compatible with MERN stack patterns while maintaining the existing frontend functionality.

## 🗄️ Database Integration

**PostgreSQL Database**: Successfully integrated with Drizzle ORM for production-ready data persistence.

### Database Features:
- ✅ **PostgreSQL with Drizzle ORM** - Type-safe database operations
- ✅ **Automatic schema management** - Tables created via `npm run db:push`
- ✅ **UUID primary keys** - Secure and unique identifiers
- ✅ **Optimized queries** - Efficient joins and indexes
- ✅ **Migration support** - Schema versioning and updates
- ✅ **Sample data seeding** - Automatic development data population

### Database Tables:
- **users** - User accounts and profiles
- **stories** - Story content and metadata
- **comments** - User comments on stories
- **likes** - Story likes and reactions
- **follows** - User following relationships
- **notifications** - User activity notifications

The application now provides **persistent data storage** with all the benefits of a production database while maintaining the same API interface.