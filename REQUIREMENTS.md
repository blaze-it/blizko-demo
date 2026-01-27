# Local Events Platform - PoC Requirements

## Client Brief (Czech → English)

Platform for **fast local micro-events** in your immediate neighborhood.

**Not** mass events. **Not** city-wide cultural calendars.
**Live micro-events nearby:**
- Courtyard workouts
- Workshops & courses
- Kids activities
- Neighbor meetups
- Lectures
- Shared leisure activities

## User Personas

### Participants want to:
- Find activities close to home
- Meet their neighbors
- Keep kids meaningfully engaged
- Break daily routine
- Join quickly and easily

### Organizers want to:
- Simple event creation
- Fast setup (minutes, not hours)
- New income stream
- New ideas / inspiration
- Launch an event in minutes — just set format, price, time, and capacity

Platform handles all technical and payment infrastructure.

## Core Value Proposition

Local events become an everyday part of life — as simple as sending a chat message.

Solves the fundamental problem: **lack of simple infrastructure for local activities.**
Replaces fragmented chats, manual payments, and disorganized overviews with a
**unified space for live events, communication, and neighbor connections.**

Goal: participating in a nearby event is as easy as sending a message.

## PoC Scope

### Must Have (MVP for demo)
1. **Event Creation** (Organizer flow)
   - Title, description, category
   - Date, time, duration
   - Location (address + map pin)
   - Price (free or paid)
   - Capacity (max participants)
   - Quick creation — minimal steps

2. **Event Discovery** (Participant flow)
   - Map view showing nearby events
   - List view with filters (category, date, distance)
   - Event detail page
   - Location-based — show events within radius

3. **Event Signup / Join**
   - One-click join for free events
   - Payment placeholder for paid events (no real payment in PoC)
   - Participant count / spots remaining

4. **Basic User Auth**
   - Simple sign-up / login
   - User profile (name, neighborhood)

### Nice to Have (if time allows)
- Chat per event (organizer ↔ participants)
- Push notifications for nearby new events
- Organizer dashboard (my events, participants)
- Rating / reviews after event
- Recurring events

### Out of Scope for PoC
- Real payment processing (Stripe etc.)
- Admin panel
- Moderation / reporting
- Email notifications
- Mobile native app (web-first, mobile-responsive)

## Tech Stack (PoC)

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js (simple credentials for PoC)
- **Maps**: Leaflet / Mapbox (free tier)
- **Deployment**: Vercel (optional)

## Data Model (Draft)

### User
- id, name, email, password, neighborhood, avatar, createdAt

### Event
- id, title, description, category, organizerId
- date, startTime, endTime, duration
- locationName, address, latitude, longitude
- price (0 = free), currency
- capacity, currentParticipants
- status (draft, published, cancelled, completed)
- createdAt, updatedAt

### EventParticipant
- id, eventId, userId, status (confirmed, cancelled), joinedAt

### Category (enum or table)
- workout, workshop, kids, meetup, lecture, leisure, other

## Pages / Routes

1. `/` — Landing / home with map + nearby events
2. `/events` — Browse all events (list + filters)
3. `/events/[id]` — Event detail
4. `/events/new` — Create event (organizer)
5. `/profile` — User profile
6. `/login` — Login
7. `/register` — Register
8. `/my-events` — My created events + my signups
