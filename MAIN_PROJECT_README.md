# 246Sports - Full Stack Sports Management Platform

<div align="center">

**Multi-Tenant National Sports Platform for Barbados**

[![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14%2B-blue)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Frontend Documentation](#frontend-documentation)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)

---

## Overview

246Sports is a comprehensive full-stack sports management platform designed for national sports associations in Barbados. The system provides complete functionality for managing associations, clubs, teams, competitions, fixtures, results, and automated standings calculations.

### Architecture

This is a monorepo containing both frontend and backend applications:

- **Backend**: Node.js/Express API with PostgreSQL database (in `/backend`)
- **Frontend**: React 18 + TypeScript + Vite application (in `/frontend`)

---

## Project Structure

```
246Sports/
├── backend/                    # Backend API application
│   ├── src/
│   │   ├── config/            # Database and API configuration
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Express middleware (auth, tenant, rate limiting)
│   │   ├── modules/           # Feature modules (associations, clubs, teams, etc.)
│   │   ├── routes/            # API route definitions
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions (logger, JWT, validators)
│   │   ├── app.ts             # Express app configuration
│   │   └── server.ts          # Server entry point
│   ├── database/              # SQL schema and seed files
│   ├── package.json           # Backend dependencies
│   └── tsconfig.json          # TypeScript configuration
│
├── frontend/                   # Frontend React application
│   ├── src/
│   │   ├── pages/
│   │   │   └── components/
│   │   │       ├── auth/      # Authentication components (Login, Register)
│   │   │       ├── dashboard/ # Dashboard and main pages
│   │   │       ├── associations/ # Association management
│   │   │       ├── clubs/     # Club management
│   │   │       ├── teams/     # Team management
│   │   │       ├── layout/    # Shared layout components (Navbar, Sidebar)
│   │   │       └── ui/        # Reusable UI components (Button, Input, etc.)
│   │   ├── lib/
│   │   │   ├── api/           # API client and service functions
│   │   │   ├── stores/        # Zustand state management
│   │   │   └── utils/         # Utility functions
│   │   ├── types/             # TypeScript type definitions
│   │   ├── App.tsx            # Main app component with routing
│   │   └── main.tsx           # Application entry point
│   ├── package.json           # Frontend dependencies
│   └── vite.config.ts         # Vite configuration
│
└── README.md                   # This file
```

---

## Features

### Backend Features
- **Multi-Tenant Architecture**: Association-level data isolation
- **Role-Based Access Control**: 6 user roles with granular permissions
- **JWT Authentication**: Refresh token rotation for security
- **Rate Limiting**: Multi-tier rate limiting for API protection
- **Results Workflow**: Three-step process (SUBMITTED → CONFIRMED → PUBLISHED)
- **Automated Standings**: Real-time calculations when results published
- **Comprehensive Audit Trail**: Track all operations
- **Soft Delete**: Recoverable deletions
- **Full-Text Search**: Global search with relevance ranking
- **API Documentation**: Swagger/OpenAPI documentation

### Frontend Features
- **Modern React 18**: With hooks and concurrent features
- **TypeScript**: Full type safety
- **Vite**: Lightning-fast build tool
- **React Router**: Client-side routing
- **TanStack Query**: Server state management and caching
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first CSS framework
- **Responsive Design**: Mobile-first approach
- **Authentication System**: Login, logout, token management
- **Dashboard**: Statistics and quick actions
- **CRUD Interfaces**: For associations, clubs, teams, and more

---

## Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 5
- **Language**: TypeScript 5.9
- **Database**: PostgreSQL 14+
- **ORM**: Raw SQL with `pg` driver
- **Authentication**: JWT with refresh tokens
- **Security**: Helmet, CORS, express-rate-limit
- **Logging**: Winston with file rotation
- **API Docs**: Swagger UI

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5.9
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **Routing**: React Router 6
- **State Management**: Zustand 4
- **Server State**: TanStack Query 5
- **HTTP Client**: Axios
- **Forms**: React Hook Form
- **Utilities**: clsx, tailwind-merge, date-fns

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.0.0 or higher
- **PostgreSQL** 14 or higher
- **npm** or **yarn** package manager
- **Git** for version control

---

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd 246Sports
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create database
createdb sports246

# Run database migrations
npm run db:migrate

# (Optional) Run seed data
npm run db:seed

# Start backend server
npm run dev
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# The default .env should work for local development

# Start frontend dev server
npm run dev
```

The frontend application will be available at `http://localhost:5173`

---

## Development

### Backend Development

```bash
cd backend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### Frontend Development

```bash
cd frontend

# Development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## API Documentation

Once the backend server is running, visit `http://localhost:3000/api-docs` for interactive API documentation (Swagger UI).

### Main API Endpoints

- **Authentication**: `/api/v1/auth/*`
- **Associations**: `/api/v1/associations/*`
- **Clubs**: `/api/v1/clubs/*`
- **Teams**: `/api/v1/teams/*`
- **Competitions**: `/api/v1/competitions/*`
- **Fixtures**: `/api/v1/fixtures/*`
- **Results**: `/api/v1/results/*`
- **Standings**: `/api/v1/standings/*`
- **News**: `/api/v1/news/*`
- **Search**: `/api/v1/search/*`
- **Users**: `/api/v1/users/*`

---

## Frontend Documentation

### Pages and Routes

- `/` - Dashboard (protected)
- `/login` - Login page
- `/register` - Registration page
- `/associations` - Associations list
- `/associations/:id` - Association details
- `/clubs` - Clubs list
- `/teams` - Teams list
- `/competitions` - Competitions list
- `/fixtures` - Fixtures list
- `/standings` - Standings table

### Key Components

- **Navbar** - Navigation bar with user menu
- **Dashboard** - Main dashboard with statistics
- **AssociationList** - Associations table with pagination
- **LoginForm** - Login form with validation
- **ProtectedRoute** - Route guard for authenticated pages

---

## Environment Variables

### Backend (.env)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports246
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## Deployment

### Backend Deployment

1. Set environment variables on your server
2. Build the TypeScript code: `npm run build`
3. Start the production server: `npm start`
4. Use a process manager like PM2: `pm2 start dist/server.js`
5. Set up Nginx as a reverse proxy
6. Configure SSL with Let's Encrypt

### Frontend Deployment

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Configure your hosting to serve static files
4. Set up SPA routing (all routes should index.html)

---

## User Roles

The platform supports 6 user roles with hierarchical permissions:

1. **SUPER_ADMIN** - Full system access
2. **ASSOCIATION_ADMIN** - Manage association and its data
3. **CLUB_ADMIN** - Manage club and teams
4. **TEAM_ADMIN** - Manage specific team
5. **COACH** - View and update team data
6. **VIEWER** - Read-only access

---

## Testing

### Backend Testing

```bash
cd backend

# Run the API test script
./test-api.sh

# Run user management tests
./test-user-management.sh
```

### Manual Testing

1. Start both backend and frontend servers
2. Visit `http://localhost:5173`
3. Use demo credentials to login:
   - Super Admin: `super.admin@246sports.bb`
   - Association Admin: `association.admin@246sports.bb`
   - Club Admin: `club.admin@246sports.bb`
   - Password: Any password (demo mode)

---

## Troubleshooting

### Backend Issues

**Database connection error:**
- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists: `createdb sports246`

**Port already in use:**
- Change PORT in `.env` or kill the process using the port

### Frontend Issues

**API connection error:**
- Ensure backend server is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Verify CORS settings in backend

**Build errors:**
- Delete `node_modules` and run `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request

---

## License

This project is licensed under the ISC License.

---

## Support

For support and questions:
- Open an issue on GitHub
- Email: support@246sports.bb
- Documentation: See `/backend` folder for detailed API docs

---

## Acknowledgments

- Built for the Barbados sports community
- Uses modern web technologies for best performance
- Follows industry best practices for security and scalability
