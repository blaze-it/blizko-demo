# Zokoli

Platform for fast local micro-events in your neighborhood.

## What is Zokoli?

Zokoli connects neighbors through live micro-events — workouts, workshops, kids activities, meetups, lectures, and shared leisure activities. Organizers create events in minutes, participants discover and join nearby events effortlessly.

## Tech Stack

- **Runtime**: Node.js 22
- **Package Manager**: pnpm with workspaces
- **Language**: TypeScript
- **Backend**: Hono, tRPC, Prisma ORM
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL
- **Auth**: BetterAuth

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Setup database
pnpm db:generate
pnpm db:push

# Start development
pnpm dev
```

## Structure

```
packages/
├── server/   # Hono + tRPC API server
├── client/   # React web application
└── shared/   # Shared utilities and types
```

## Key Routes

- `/` - Landing page
- `/events` - Browse all events
- `/events/new` - Create event
- `/events/:id` - Event detail
- `/my-events` - My organized & joined events
- `/login` - Sign in
- `/register` - Sign up
