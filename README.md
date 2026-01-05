# DevPulseX Frontend

A modern, developer-oriented dashboard built with Next.js 14, TypeScript, Tailwind CSS, and React Query.

## Features

- 🎨 **Vercel-inspired UI** - Clean, minimal, and professional design
- 🌓 **Dark/Light Mode** - Automatic theme switching
- 🔐 **JWT Authentication** - Secure login and protected routes
- 📊 **Real-time Metrics** - Project and user performance dashboards
- 🚀 **React Query** - Efficient data fetching and caching
- 📱 **Responsive Design** - Works on all devices
- 🎯 **TypeScript** - Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running at `http://localhost:8080`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Minimum required vars for local dev:

```env
# Backend API (base URL must include /api)
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Trello OAuth
NEXT_PUBLIC_TRELLO_API_KEY=<your_trello_app_key>
NEXT_PUBLIC_TRELLO_REDIRECT_URI=http://localhost:3000/auth/callback
```

Notes:
- Get your Trello App Key from https://trello.com/app-key (copy “Key”).
- Ensure `NEXT_PUBLIC_TRELLO_API_KEY` is set; otherwise linking will show an error and Trello will report “App not found”.
- The redirect URI should match what your app expects: `/auth/callback` is handled here and posts the token to the backend.

## Deploy on Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Add environment variables:
	- `NEXT_PUBLIC_API_URL` with your backend URL
	- `NEXT_PUBLIC_TRELLO_API_KEY` with your Trello app key
	- `NEXT_PUBLIC_TRELLO_REDIRECT_URI` with your deployed callback (e.g., https://your-frontend/auth/callback)
4. Deploy!

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js 14 App Router pages
│   ├── components/       # Reusable React components
│   ├── hooks/           # Custom React Query hooks
│   ├── lib/             # API clients and utilities
│   ├── stores/          # Zustand state management
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
└── ...config files
```

## Available Pages

- `/` - Login
- `/dashboard` - Main dashboard with metrics
- `/projects` - Project management
- `/tasks` - Task tracking
- `/issues` - Issue management
- `/commits` - Commit history
- `/deployments` - Deployment tracking
### Deployments page

The Deployments page now includes:

- KPI cards: total deployments, success rate, and failures
- Filters: search by id/project, filter by project and status
- Sorting: by project, status, or deployed time
- Pagination: 10/20/50 per page
- Utilities: export current view to CSV
- UX: loading skeletons, empty state, and inline error with retry

All functionality is client-side and powered by React Query for data fetching.

- `/teams` - Team management
- `/users` - User administration

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query)
- **HTTP Client:** Axios
- **Icons:** Lucide React
- **Charts:** Recharts
- **Theme:** next-themes
- **Notifications:** Sonner

## License

MIT
