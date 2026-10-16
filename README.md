# LinkPulse — URL Shortener & Analytics Platform

A professional URL shortener with real-time click analytics, built for a college hackathon. Create short links, track clicks, and manage your URLs from a polished dashboard.

## Features

- **Shorten any URL** — Paste a valid `http://` or `https://` URL and get a unique short code instantly.
- **Custom aliases** — Optionally choose your own short code (e.g., `my-link`). Duplicates are rejected.
- **Instant redirects** — Opening a short URL performs a 302 redirect to the original destination.
- **Click tracking** — Every redirect is recorded as a click event with a timestamp.
- **Dashboard analytics** — Real total links, total clicks, per-link click counts, and creation dates.
- **Copy & search** — Copy any short URL to your clipboard in one click. Search across all links by URL, short code, or alias.
- **Activate/deactivate** — Toggle a link's active status. Inactive links return a 410 Gone response.
- **Delete links** — Remove links with a confirmation step. Clicks are cascade-deleted.
- **Full state coverage** — Loading spinners, empty states, success confirmations, and error messages for invalid URLs, duplicate aliases, missing links, and database failures.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Tailwind CSS |
| Build tool | Vite |
| Database | Supabase (PostgreSQL) |
| Redirect server | Supabase Edge Functions (Deno) |
| Icons | Lucide React |

## Database Schema

### `links` table

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated unique ID |
| `original_url` | text | The destination URL |
| `short_code` | text (unique) | The generated or custom short code |
| `custom_alias` | text (nullable) | The user-provided alias, if any |
| `is_active` | boolean | Whether the link is active (default `true`) |
| `created_at` | timestamptz | Creation timestamp |

### `clicks` table

| Column | Type | Description |
|---|---|---|
| `id` | uuid (PK) | Auto-generated unique ID |
| `link_id` | uuid (FK → links.id) | Which link was clicked |
| `referrer` | text (nullable) | Referer header from the request |
| `clicked_at` | timestamptz | When the click occurred |

Both tables have Row Level Security enabled. Since this is a single-tenant demo (no sign-in), policies allow the `anon` and `authenticated` roles to read and write. The redirect edge function uses the service role key (server-side only) to look up links and insert click records.

## Environment Variables

All Supabase environment variables are pre-populated in `.env` — no manual configuration needed:

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
```

The edge function uses server-side secrets (never exposed to the browser):

```
SUPABASE_URL=<same-url>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

## How It Works

### Creating a short link
1. User enters a destination URL and optional custom alias in the dashboard.
2. The frontend validates the URL format and alias characters.
3. If no custom alias is provided, a 6-character random code is generated using `crypto.getRandomValues`.
4. The app checks for duplicate short codes before inserting.
5. The link is saved to the `links` table with `is_active = true`.

### Redirecting a short URL
1. A visitor opens `https://<project>.supabase.co/functions/v1/redirect/<shortCode>`.
2. The edge function looks up the `short_code` in the `links` table (using the service role key).
3. If found and active, a click event is recorded in the `clicks` table.
4. The function returns a **302 redirect** to the `original_url`.
5. If the link is not found, a **404** is returned. If inactive, a **410 Gone** is returned.

### Dashboard analytics
1. The dashboard fetches all links ordered by creation date (newest first).
2. It fetches all click records for those links and aggregates counts per link.
3. Stats cards display total links and total clicks. Each link card shows its individual click count.

## Running Locally

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Building for Production

```bash
npm run build
```

Output is generated in the `dist/` directory.

## Deployment

### Frontend
The Vite app can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, etc.). Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables on your hosting platform.

### Edge Function
The redirect edge function is deployed to Supabase Edge Functions. It is already deployed in this project. To redeploy after changes:

1. Edit `supabase/functions/redirect/index.ts`.
2. Use the Supabase MCP `deploy_edge_functions` tool (or Supabase dashboard) to deploy.

### Database
The database schema is already applied via migration. No additional setup is needed.

## Testing the Full Flow

1. **Create a short link**: Open the dashboard, enter `https://github.com` in the URL field, optionally type a custom alias like `github`, and click "Shorten URL".
2. **Open the short URL**: Click the "Open" button or paste the short URL into a new browser tab.
3. **Verify the redirect**: You should be redirected to `https://github.com`.
4. **Verify the click record**: Return to the dashboard and click the refresh button. The click count for that link should increase by 1.
5. **Check the stats**: The "Total Clicks" stat card should reflect the updated count.

## Project Structure

```
src/
├── App.tsx                    # Main app — state management, data fetching
├── components/
│   ├── Header.tsx             # Top navigation bar with branding
│   ├── StatsCards.tsx         # Total links & total clicks stat cards
│   ├── CreateLinkForm.tsx     # URL input, alias input, create button
│   └── LinksList.tsx          # Searchable list of links with actions
├── lib/
│   ├── supabase.ts            # Supabase client singleton
│   └── utils.ts               # URL validation, code generation, helpers
└── types/
    └── index.ts               # TypeScript interfaces

supabase/
├── config.toml                # Edge function configuration
└── functions/
    └── redirect/
        └── index.ts           # Redirect server (lookup, record click, 302)
```
