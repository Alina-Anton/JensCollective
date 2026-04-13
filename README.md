# Jen’s Collective

**Product name:** Jen’s Collective — a supportive community led by Jen, bringing people together through jiu jitsu and shared experiences.

---

## Product vision

Build a **private, tight-knit digital community** where members of Jen’s jiu jitsu circle can:

- Connect beyond the gym
- Organize and join events
- Support each other’s growth
- Build meaningful relationships through shared training and experiences

The product should feel **welcoming and community-first**, not “just another scheduling app.”

---

## Core value proposition

Compared with generic gym software, Jen’s Collective emphasizes:

- **Personal connection** — people first, features second
- **Social engagement** — lightweight feed, not noisy social media
- **Shared experiences** — seminars, open mats, socials
- **Consistency and accountability** — reservations, reminders, visibility

---

## MVP scope

### 1. Authentication

- Email/password (**planned: Firebase Auth**)
- Optional **Google** sign-in
- **Profile:** name, **belt**, phone (optional), profile photo

### 2. Events & experiences

Members can:

- Browse **upcoming events** (master classes, open mats, seminars, socials, etc.)
- **Create events** (coaches/admins per permissions)

**Event fields:** title, description, date & time, location, max capacity, optional price, host.

### 3. Reservations

- Reserve a spot (**+1 guest** where enabled)
- Show **remaining spots**; **prevent overbooking**
- Optional **waitlist**
- **Cancel** reservation

### 4. Community feed _(heart of the app)_

Lightweight social board:

- Posts (text; **optional images later**)
- **“Who’s coming?”**-style posts tied to events
- **Event discussions**
- **Comments** and **reactions**

### 5. Member dashboard

Per user:

- Upcoming events
- My reservations
- Community updates
- **Quick actions** (join / post / create)

### 6. Notifications (MVP = email)

- Reservation confirmation
- Event reminders
- Event updates

_(SMS or push may be considered later; MVP is email-first.)_

### 7. Profile page

- Name + **belt level**
- Events attended
- Upcoming bookings
- Community activity summary

---

## Differentiating features

### Belt-level identity

Belts as first-class identity: **White → Blue → Purple → Brown → Black** (and **Pink** where applicable in your affiliation rules). Reinforces belonging and progression, not just “user name + avatar.”

### “Find a partner”

Structured prompts for member posts, for example:

- Looking for a **drilling partner**
- **Open mat** tonight?
- **Coffee** / **walk** / casual hangouts
- **Looking for help** (technique, mindset, logistics)

### Event chat

Each event includes a **mini discussion thread** for coordination and hype before the session.

---

## Success criteria (product)

- Members use the **feed** regularly, not only the calendar
- Events fill without chaos (**clear capacity, waitlist, cancellations**)
- New members understand **culture and belt identity** within minutes
- Coaches spend less time on **manual coordination** (DM chains, spreadsheets)

---
