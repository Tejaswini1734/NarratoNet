# NarratoNet - Story Sharing Platform

## Overview

NarratoNet is a full-stack story sharing platform that allows users to read, write, and interact with stories. The application features user authentication, story management, social interactions (likes, comments, follows), and real-time notifications. It's built using a modern tech stack with React frontend, Express backend, and PostgreSQL database.

## User Preferences

Preferred communication style: Simple, everyday language.
Backend structure preference: MERN stack pattern with organized controllers, routes, and models.
Feature requirements: Comprehensive story management, social interactions, and notification system.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared code:

### Directory Structure
- `/client` - React frontend application
- `/server` - Express.js backend API
- `/shared` - Shared TypeScript types and database schema
- `/migrations` - Database migration files

### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, TailwindCSS, shadcn/ui components
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **State Management**: TanStack Query (React Query)
- **Styling**: TailwindCSS with custom CSS variables for theming

## Key Components

### Frontend Architecture
- **Component Library**: Uses shadcn/ui components built on Radix UI primitives
- **Routing**: Wouter for client-side routing with protected routes
- **State Management**: TanStack Query for server state, React Context for auth
- **Styling**: TailwindCSS with CSS custom properties for theming
- **Build Tool**: Vite with TypeScript support and path aliases

### Backend Architecture
- **API Structure**: RESTful API with Express.js
- **Authentication**: Session-based auth using Passport.js with local strategy
- **Database Access**: Drizzle ORM with type-safe queries
- **Session Storage**: In-memory session store (configurable for production)
- **Password Security**: Scrypt hashing with salt

### Database Schema
The application uses 5 main entities:
- **Users**: User accounts with authentication and profile data
- **Stories**: Main content with title, content, genre, and metadata
- **Comments**: User comments on stories
- **Likes**: User likes on stories
- **Follows**: User following relationships

## Data Flow

### Authentication Flow
1. User submits login/register form
2. Backend validates credentials using Passport.js
3. Session created and stored in memory store
4. Frontend receives user data and updates auth context
5. Protected routes check authentication status

### Story Management Flow
1. Stories fetched via TanStack Query with filtering/search
2. CRUD operations go through Express API endpoints
3. Database operations handled by Drizzle ORM
4. Real-time updates via query invalidation

### Social Features Flow
1. Like/comment actions trigger API calls
2. Backend updates database and creates notifications
3. Frontend invalidates relevant queries to update UI
4. Notification system tracks user interactions

## External Dependencies

### Major Frontend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/***: Headless UI components for accessibility
- **wouter**: Lightweight routing library
- **tailwindcss**: Utility-first CSS framework
- **react-hook-form**: Form handling with validation

### Major Backend Dependencies
- **express**: Web application framework
- **passport**: Authentication middleware
- **drizzle-orm**: Type-safe ORM for PostgreSQL
- **@neondatabase/serverless**: PostgreSQL client for Neon
- **express-session**: Session management middleware

### Development Dependencies
- **typescript**: Type safety across the stack
- **vite**: Fast build tool for frontend
- **drizzle-kit**: Database migration and introspection tool

## Deployment Strategy

### Build Process
1. Frontend builds to `dist/public` using Vite
2. Backend builds to `dist` using esbuild with ESM output
3. Database schema managed through Drizzle migrations

### Environment Configuration
- Development: Uses Vite dev server with HMR
- Production: Serves static files through Express
- Database: Requires `DATABASE_URL` environment variable
- Sessions: Requires `SESSION_SECRET` environment variable

### Database Management
- Schema defined in `/shared/schema.ts`
- Migrations generated and applied via `drizzle-kit`
- Uses PostgreSQL dialect with UUID primary keys
- Supports both development and production environments

The application is designed to be deployed on platforms like Replit, with configuration for development banners and runtime error overlays in development mode.

## Recent Changes (January 2025)

### Backend Enhancement and MERN-style Organization
**Database Integration Completed**: Successfully migrated from in-memory storage to PostgreSQL database using Drizzle ORM.
- **Created organized backend structure** with separate controllers, routes, and models folders
- **Added comprehensive Story Controller** with all required CRUD operations and interactions
- **Implemented enhanced API routes**:
  - POST /api/stories/post - Create new stories
  - PUT /api/stories/edit/:id - Edit existing stories  
  - DELETE /api/stories/delete/:id - Delete stories
  - GET /api/stories/feed - Get personalized story feed
  - GET /api/stories/genre/:name - Filter stories by genre
  - GET /api/stories/search?q=... - Search stories by content
  - GET /api/stories/:storyId - Get individual story details
  - POST /api/stories/:id/like - Like/unlike stories
  - POST /api/stories/:id/comment - Comment on stories
  - POST /api/stories/:id/subscribe - Subscribe to story authors
- **Enhanced Notification System** with dedicated controller and routes
- **Added sample data seeding** for development and testing
- **Improved storage interface** with additional methods for personalized feeds
- **Maintained backward compatibility** with existing frontend components

### Architecture Improvements
- **Modular route organization** following MERN stack best practices
- **Controller-based business logic** separation for better maintainability
- **Enhanced type safety** with proper TypeScript interfaces
- **Model validation utilities** for data integrity
- **Automatic sample data initialization** for new installations
- **PostgreSQL Database Integration** with Drizzle ORM for production-ready data persistence
- **Database schema management** with automatic table creation and migrations
- **Type-safe database queries** with optimized performance for all operations