# Orcish Dashboard

![orcish-dashboard](https://github.com/user-attachments/assets/cb458deb-9ba3-435e-a39c-7f48095c85c8)

## Overview

The Orcish Dashboard is a sleek and modern dashboard built with Shadcn. It features a responsive design with support for both light and dark modes, along with a customizable theme selector that lets you easily switch between different color schemes.

## Getting Started

### Installation

To begin, install the required dependencies using the following command:

```bash
pnpm i
```

# Development Server

After installing the dependencies run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase Setup

1. Create a Supabase project.
2. In Project Settings → API, copy:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only)
3. Create a `.env.local` in the project root and set:

```
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. In the Supabase SQL editor, create the `ads` table:

```
create table if not exists ads (
  id bigserial primary key,
  date date not null,
  campaign_name text not null,
  impressions integer not null,
  clicks integer not null,
  conversions integer not null,
  runrate integer not null
);
```

5. Start the dev server. The app will read data from `/api/ads`. On first run, the server will attempt to seed from the local sample dataset if the table is empty.

## Separate Backend (Express)

The repo includes a standalone backend in `backend/` exposing `/ads`.

Run backend:

```
cd backend
pnpm i
pnpm dev
```

Backend env (create `backend/.env`):

```
SUPABASE_URL=your-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGIN=http://localhost:3000
PORT=4000
```

Point frontend to backend:

Create `.env.local` at the project root:

```
NEXT_PUBLIC_BACKEND_URL=http://localhost:4000
```

If `NEXT_PUBLIC_BACKEND_URL` is set, the frontend calls the external backend; otherwise it falls back to Next.js `/api/ads`.