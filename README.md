# Chicago CRED L.I.B.R.A.R.Y.

### Literacy Interface for Boosting Reading Access and Resources Year-round

A touchscreen-friendly library kiosk system built to support the literacy initiative at **[Chicago CRED](https://www.chicagocred.org)**, enabling participants to check out and return books, and track their reading history — all without staff intervention.

---

## Overview

The Chicago CRED L.I.B.R.A.R.Y. was created to solve a real problem: without a system to manage users, inventory, and their interactions, it's impossible to properly track books or measure reading engagement. The platform has two interfaces:

**Kiosk** — a self-service touchscreen experience for participants to:

- Select their name from a participant directory and verify their identity via birthday
- Scan book barcodes (ISBN via camera) or search by ISBN manually to check out books
- Indicate who the book is for (themselves, their child(ren), or both)
- Return books and indicate whether a book report was completed
- Track checkout history per participant, including due dates and return dates

**Admin Portal** — a management dashboard for staff to:

- View reading activity metrics and charts on a dashboard
- Manage participants and staff accounts
- Manage library inventory, including adding books via barcode scan or manual entry
- Configure site-specific settings including checkout limits, return windows, and SMS notifications
- Send automated text message notifications to participants via GoTo Connect

---

## Tech Stack

| Category       | Technology                                    |
| -------------- | --------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org)              |
| Language       | TypeScript                                    |
| Styling        | Tailwind CSS v4                               |
| UI Components  | [shadcn/ui](https://ui.shadcn.com), Radix UI  |
| Database       | [Supabase](https://supabase.com) (PostgreSQL) |
| Authentication | [Clerk](https://clerk.com)                    |

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A [Clerk](https://clerk.com) application
- A [Google Books API](https://developers.google.com/books) key
- A [GoTo Connect](https://developer.goto.com) OAuth client

### Installation

```bash
git clone https://github.com/jamalmriley/project-library.git
cd project-library
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=    # Your Clerk publishable key
CLERK_SECRET_KEY=                     # Your Clerk secret key (server-only)
CLERK_WEBHOOK_SECRET=                 # Your Clerk webhook secret (server-only)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/admin
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/admin

# Google
GOOGLE_BOOKS_API_KEY=                 # Google Books API key (server-only)

# GoTo Connect (optional — required for SMS notifications)
GOTO_CLIENT_ID=                       # GoTo OAuth client ID
GOTO_CLIENT_SECRET=                   # GoTo OAuth client secret (server-only)
GOTO_REDIRECT_URI=                    # e.g. http://localhost:3000/api/auth/goto/callback

# Supabase
NEXT_PUBLIC_SUPABASE_URL=             # Your Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=            # Your Supabase service role key (server-only)
```

> ⚠️ Variables without `NEXT_PUBLIC_` are server-only and must never be exposed to the browser. They are only accessed via Next.js API routes.

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

This project uses Supabase (PostgreSQL) as its backend. The following tables are required:

### `participants`

| Column             | Type          | Notes                                     |
| ------------------ | ------------- | ----------------------------------------- |
| `id`               | `text`        | Primary key                               |
| `created_at`       | `timestamptz` | Auto-generated                            |
| `updated_at`       | `timestamptz` | Updated on each change                    |
| `first_name`       | `text`        |                                           |
| `last_name`        | `text`        |                                           |
| `birthday`         | `text`        | Stored as `MMDD` (e.g. `0115` for Jan 15) |
| `email`            | `text`        |                                           |
| `site`             | `jsonb`       | Site object                               |
| `notes`            | `text`        | Optional staff notes                      |
| `checkout_history` | `jsonb`       | Array of checkout records, nullable       |

### `library`

| Column             | Type          | Notes                                      |
| ------------------ | ------------- | ------------------------------------------ |
| `id`               | `text`        | Primary key (format: `{siteId}_{isbn}`)    |
| `created_at`       | `timestamptz` | Auto-generated                             |
| `updated_at`       | `timestamptz` | Updated on each change                     |
| `book_info`        | `jsonb`       | Google Books or manual book data           |
| `site`             | `jsonb`       | Site object                                |
| `available_count`  | `int4`        | Copies currently available                 |
| `total_count`      | `int4`        | Total copies regardless of checkout status |
| `checkout_history` | `jsonb`       | Array of checkout records, nullable        |

### `sites`

| Column            | Type          | Notes                         |
| ----------------- | ------------- | ----------------------------- |
| `id`              | `text`        | Primary key                   |
| `created_at`      | `timestamptz` | Auto-generated                |
| `updated_at`      | `timestamptz` | Updated on each change        |
| `name`            | `text`        | Full site name                |
| `nickname`        | `text`        | Short site name               |
| `salesforce_name` | `jsonb`       | Site name in Salesforce       |
| `region`          | `text`        |                               |
| `neighborhood`    | `text`        |                               |
| `settings`        | `jsonb`       | Site-specific settings object |

---

## API Routes

### Books

| Method   | Route                      | Description                            |
| -------- | -------------------------- | -------------------------------------- |
| `GET`    | `/api/books?isbn={isbn}`   | Fetch a book by ISBN from Google Books |
| `GET`    | `/api/library`             | Fetch all books in the library         |
| `GET`    | `/api/library?id={id}`     | Fetch a single library book by ID      |
| `GET`    | `/api/library?isbn={isbn}` | Fetch a library book by ISBN           |
| `POST`   | `/api/library`             | Add a book to the library              |
| `PATCH`  | `/api/library?id={id}`     | Update a library book                  |
| `DELETE` | `/api/library?id={id}`     | Remove a book from the library         |

### Participants

| Method   | Route                               | Description                      |
| -------- | ----------------------------------- | -------------------------------- |
| `GET`    | `/api/participants`                 | Fetch all participants           |
| `GET`    | `/api/participants?id={id}`         | Fetch a single participant by ID |
| `GET`    | `/api/participants?siteId={siteId}` | Fetch participants by site       |
| `POST`   | `/api/participants`                 | Add a participant                |
| `PATCH`  | `/api/participants?id={id}`         | Update a participant             |
| `DELETE` | `/api/participants?id={id}`         | Remove a participant             |

### Users

| Method   | Route                | Description                     |
| -------- | -------------------- | ------------------------------- |
| `GET`    | `/api/users`         | Fetch all Clerk users           |
| `GET`    | `/api/users?id={id}` | Fetch a single Clerk user by ID |
| `POST`   | `/api/users`         | Send a Clerk invitation         |
| `PATCH`  | `/api/users?id={id}` | Update a Clerk user             |
| `DELETE` | `/api/users?id={id}` | Delete a Clerk user             |

### Sites

| Method  | Route                | Description                           |
| ------- | -------------------- | ------------------------------------- |
| `GET`   | `/api/sites`         | Fetch all sites                       |
| `GET`   | `/api/sites?id={id}` | Fetch a single site by ID             |
| `PATCH` | `/api/sites?id={id}` | Update a site (settings, GoTo tokens) |

### GoTo Connect (SMS)

| Method | Route                     | Description                  |
| ------ | ------------------------- | ---------------------------- |
| `GET`  | `/api/auth/goto`          | Initiate GoTo OAuth flow     |
| `GET`  | `/api/auth/goto/callback` | Handle GoTo OAuth callback   |
| `POST` | `/api/goto/send`          | Send an SMS via GoTo Connect |

---

## Authentication & Permissions

Authentication is handled by [Clerk](https://clerk.com). Staff accounts are created via invitation only. Role-based access control (RBAC) is implemented using a custom attribute-based access control (ABAC) system with the following roles:

| Role          | Description                            |
| ------------- | -------------------------------------- |
| `super_admin` | Full platform access                   |
| `admin`       | Manages staff, participants, and books |
| `staff`       | Manages participants and books         |
| `viewer`      | View-only access                       |

Roles and site assignments are stored in Clerk's `publicMetadata` and are never exposed to the client directly.

---

## Features

**Touchscreen-first design** — All kiosk interactions are designed for large touch targets on iPad displays, with no keyboard required for the core checkout and return flows. Participants can check books out and return them independently. The web app uses the device camera to scan EAN-13 ISBN barcodes in real time with a 2-second cooldown between scans to support continuous multi-book checkout, mirrored for natural interaction.

**Library inventory management** — Staff can add books via barcode scan (Google Books API) or manual entry, and manage existing inventory including updating and removing books.

**Admin dashboard** — Staff can view reading activity metrics including checkouts over time, checkouts by purpose, most-read genres, reading pace distribution, and top readers.

**Site-specific settings** — Each site can configure its own checkout limits, return windows, extension limits, overdue penalties, and notification preferences.

**SMS notifications** — Staff can connect their GoTo Connect account to send automated text message notifications to participants on checkout and return.

**ABAC permissions** — All admin UI elements (buttons, table columns, form fields) are conditionally rendered based on the current user's role using a custom `hasPermission` system and reusable `Abac_____` components.

---

## About Chicago CRED

[Chicago CRED](https://www.chicagocred.org) (Create Real Economic Destiny) is a nonprofit working to reduce gun violence and create economic opportunity for young adults in Chicago. Project L.I.B.R.A.R.Y. supports their literacy programming by giving staff and participants a reliable way to manage reading resources year-round.

---

## License

This project is private and not licensed for public use.
