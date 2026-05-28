# Project L.I.B.R.A.R.Y.

### Library Interface for Boosting Reading Access and Resources Year-round

A touchscreen-friendly library kiosk system built to support the literacy initiative at **[Chicago CRED](https://www.chicagocred.org)**, enabling participants to check out and return books, and track their reading history — all without staff intervention.

---

## Overview

Project L.I.B.R.A.R.Y. was created to solve a real problem: without a system to manage users, inventory, and their interactions, it's impossible to properly track books or measure reading engagement. This kiosk provides a self-service experience for participants to:

- **Select their name** from a participant directory and verify their identity via birthday
- **Scan book barcodes** (ISBN via camera) or search by ISBN manually to check out books
- **Return books** and indicate whether a book report was completed
- **Track checkout history** per participant, including due dates and return dates

---

## Tech Stack

| Category       | Technology                                    |
| -------------- | --------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (Webpack)    |
| Language       | TypeScript                                    |
| Styling        | Tailwind CSS v4                               |
| UI Components  | [shadcn/ui](https://ui.shadcn.com), Radix UI  |
| Database       | [Supabase](https://supabase.com) (PostgreSQL) |
| Authentication | [Clerk](https://clerk.com)                    |

---

## Getting Started

### Prerequisites

- Node.js 20+

### Installation

```bash
git clone https://github.com/jamalmriley/project-library.git
cd project-library
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=  # Your Clerk publishable key
CLERK_SECRET_KEY=                   # Your Clerk secret key (server-only)

# Google
GOOGLE_WEB_FONTS_API_KEY=           # Google Fonts API key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=          # Your Supabase service role key (server-only)
```

> ⚠️ `CLERK_SECRET_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are server-only variables and must **never** be prefixed with `NEXT_PUBLIC_`. They are only accessed via Next.js API routes.

### Running the App

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Database Setup

This project uses Supabase as its backend. The `participants` table should have the following schema:

| Column             | Type          | Notes                                     |
| ------------------ | ------------- | ----------------------------------------- |
| `id`               | `text`        | Primary key                               |
| `created_at`       | `timestamptz` | Auto-generated                            |
| `updated_at`       | `timestamptz` | Updated on each change                    |
| `first_name`       | `text`        |                                           |
| `last_name`        | `text`        |                                           |
| `birthday`         | `text`        | Stored as `MMDD` (e.g. `0115` for Jan 15) |
| `email`            | `text`        |                                           |
| `site`             | `text`        | Site/location identifier                  |
| `notes`            | `text`        | Optional staff notes                      |
| `checkout_history` | `jsonb`       | Array of checkout records, nullable       |

---

## API Routes

| Method  | Route                       | Description                                   |
| ------- | --------------------------- | --------------------------------------------- |
| `GET`   | `/api/books?isbn={isbn}`    | Fetch a book by ISBN from Google Books API    |
| `GET`   | `/api/participants`         | Fetch all participants                        |
| `GET`   | `/api/participants?id={id}` | Fetch a single participant by ID              |
| `PATCH` | `/api/participants?id={id}` | Update a participant (checkout history, etc.) |

---

## Features

**Touchscreen-first design** — all interactions are designed for large touch targets on kiosk displays, with no keyboard required for the core checkout flow.

**Barcode scanning** — uses the device camera to scan EAN-13 ISBN barcodes in real time with a 2-second cooldown between scans to support continuous multi-book checkout.

**Birthday verification** — participants verify their identity by entering their birthday (MM/DD) via a large OTP-style input before proceeding to checkout.

**Self-checkout & return** — participants can check books out and return them independently, with checkout history stored per participant in Supabase.

**Book report tracking** — during book returns, participants can indicate whether they completed a book report for each returned book.

**Server-side API key protection** — the Google Books API key and Supabase service role key are never exposed to the browser; all sensitive requests are proxied through Next.js API routes.

---

## About Chicago CRED

[Chicago CRED](https://www.chicagocred.org) (Create Real Economic Destiny) is a nonprofit working to reduce gun violence and create economic opportunity for young adults in Chicago. Project L.I.B.R.A.R.Y. supports their literacy programming by giving staff and participants a reliable way to manage reading resources year-round.

---

## License

This project is private and not licensed for public use.
