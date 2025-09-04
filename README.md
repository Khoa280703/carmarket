# Car Market 🚗

A modern full-stack marketplace for buying and selling used cars.

## Tech Stack

**Frontend:** React + TypeScript + Tailwind CSS + Vite  
**Backend:** NestJS + TypeScript + PostgreSQL + JWT Auth  
**Database:** PostgreSQL + Redis (Docker)

## Quick Start

### 1. Setup

```bash
npm install
npm run db:up
```

### 2. Environment Files

Create these files with your settings:

- `packages/server/.env` (copy from `packages/server/env.example`)
- `packages/client/.env` (copy from `packages/client/env.example`)

### 3. Run Development

**Option A: Both together**

```bash
npm run dev
```

**Option B: Separate terminals**

```bash
# Terminal 1
npm run server

# Terminal 2
npm run client
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000/api
- **Database**: localhost:5432

## Available Commands

```bash
npm run dev      # Start both client & server
npm run client   # Start frontend only
npm run server   # Start backend only
npm run build    # Build both for production
npm run db:up    # Start database
npm run db:down  # Stop database
```

## Features

- 🔐 JWT Authentication (register, login, password reset)
- 🚗 Car listings with image upload support
- 🔍 Advanced search and filtering
- 👤 User profiles and dashboard
- 🛡️ Admin panel for managing users and listings
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time updates and notifications

## Project Structure

```
carmarket/
├── packages/
│   ├── client/     # React frontend
│   └── server/     # NestJS backend
├── docker-compose.yml
└── package.json
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/listings` - Get car listings
- `GET /api/search` - Search with filters
- `GET /api/admin/*` - Admin endpoints (protected)

## Environment Variables

**Server (.env):**

```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=carmarket_user
DATABASE_PASSWORD=carmarket_password
DATABASE_NAME=carmarket
JWT_SECRET=your-secret-key
PORT=3000
```

**Client (.env):**

```env
VITE_API_URL=http://localhost:3000/api
```

## License

MIT
