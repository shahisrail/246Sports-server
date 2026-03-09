# Quick Setup Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git (optional)

## Step-by-Step Setup

### 1. Install Dependencies

From the root directory:

```bash
npm run install:all
```

This will install dependencies for:
- Root monorepo (concurrently)
- Backend API
- Frontend React app

### 2. Set Up Backend

```bash
cd backend

# Create environment file
cp .env.example .env

# Edit .env with your database credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sports246
# DB_USER=postgres
# DB_PASSWORD=your_password

# Create database
createdb sports246

# Run migrations
npm run db:migrate

# (Optional) Seed with sample data
npm run db:seed

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3000`

### 3. Set Up Frontend

Open a new terminal:

```bash
cd frontend

# Environment file is already set up (.env)
# Default: VITE_API_BASE_URL=http://localhost:3000

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Access the Application

1. Open browser to `http://localhost:5173`
2. You'll be redirected to the login page
3. Use demo credentials:
   - Email: `super.admin@246sports.bb`
   - Password: Any password (demo mode)

### 5. Explore

- **Dashboard**: View statistics and quick actions
- **Associations**: Manage sports associations
- **API Docs**: Visit `http://localhost:3000/api-docs`

## Development Commands

### Start Both Servers (From Root)
```bash
npm run dev
```

This starts both backend and frontend concurrently.

### Individual Commands

**Backend:**
```bash
cd backend
npm run dev      # Development with hot reload
npm run build    # Build for production
npm start        # Start production server
```

**Frontend:**
```bash
cd frontend
npm run dev      # Development with hot reload
npm run build    # Build for production
npm run preview  # Preview production build
```

## Troubleshooting

### Database Connection Error
```bash
# Check PostgreSQL is running
pg_ctl status

# Start PostgreSQL if needed
pg_ctl start

# Create database if it doesn't exist
createdb sports246
```

### Port Already in Use
```bash
# Change backend port in backend/.env
PORT=3001

# Change frontend port in frontend/vite.config.ts
server: {
  port: 5174
}
```

### Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Read the full documentation**: Check `/backend/README.md` for API details
2. **Explore the features**: Visit `/associations`, `/clubs`, `/teams`
3. **Customize**: Edit the components in `/frontend/src/pages/components/`
4. **Add features**: Follow the existing patterns to add new CRUD pages

## Architecture Overview

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Frontend   │         │   Backend    │         │  Database   │
│  (React)    │◄───────►│  (Express)   │◄───────►│ (PostgreSQL)│
│  Port 5173  │  HTTP   │  Port 3000   │  SQL    │  Port 5432  │
└─────────────┘         └──────────────┘         └─────────────┘
```

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with full-text search
- **State Management**: Zustand (client), TanStack Query (server)
- **Authentication**: JWT with refresh tokens

## Support

For detailed documentation, see:
- Main README: `/README.md`
- Backend docs: `/backend/README.md`
- API documentation: `http://localhost:3000/api-docs` (when running)
