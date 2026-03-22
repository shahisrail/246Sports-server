# Database Setup Guide

## 📋 Overview

This database is set up to **automatically check and create tables** when the server starts. No manual migration needed!

## 🚀 Quick Start

### Option 1: Auto Setup (Recommended)
The server will automatically check and create tables on startup:

```bash
npm start
```

That's it! The server will:
1. Connect to database
2. Check if tables exist
3. Create tables if missing
4. Start the server

### Option 2: Manual Setup
If you want to set up the database before starting the server:

```bash
# Check database status
npm run db:check

# Initialize database manually
npm run db:init
```

## 📁 Database Files

```
backend/
├── database/
│   ├── schema.sql           # Main database schema
│   └── README.md           # This file
├── src/
│   ├── config/
│   │   ├── database.ts     # Database connection & auto-check
│   │   └── database-init.ts # Table initialization logic
│   └── scripts/
│       └── startup-check.ts # Standalone startup check script
├── init-db.js              # Manual initialization script
└── check-db.js             # Database check script
```

## 🔧 Environment Variables

Make sure your `.env` file has:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## 📊 Tables Created

The schema creates the following tables:

### Core Tables
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `associations` - Sports associations
- `clubs` - Sports clubs
- `seasons` - Sports seasons
- `competitions` - Sports competitions
- `venues` - Match venues
- `teams` - Sports teams
- `team_competitions` - Team-competition relationships
- `players` - Player information
- `fixtures` - Match fixtures
- `fixture_updates` - Live match updates
- `results` - Match results
- `result_history` - Result change history
- `standings` - Competition standings
- `standings_history` - Standings history
- `news` - News articles
- `media` - Media files
- `email_subscriptions` - Email subscriptions
- `sports` - Sports types
- `background_jobs` - Background job queue
- `audit_logs` - Audit trail

## 🚢 Deployment

### Production Setup

When deploying to production (Coolify, Railway, etc.):

1. Set `DATABASE_URL` environment variable
2. Deploy the code
3. The server will automatically create tables on first start

No manual database setup required!

### Verification

After deployment, verify tables are created:

```bash
npm run start:check
```

## 🛠️ Troubleshooting

### Database connection failed

Check your `DATABASE_URL` in `.env`:
- Hostname is correct
- Port is correct (usually 5432)
- Username and password are correct
- Database name is correct

### Tables not creating

Check server logs for errors. Common issues:
- Insufficient database permissions
- Database connection issues
- SQL syntax errors (unlikely with tested schema)

### Manual reset

If you need to completely reset the database:

```sql
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
```

Then restart the server to recreate all tables.

## 📝 Notes

- All tables use UUID primary keys
- Foreign key relationships are properly set up
- Indexes are created for performance
- The schema is production-ready
- No manual migrations needed
- Tables are created automatically on server startup

## 🔄 Updating Schema

To modify the database schema:

1. Edit `database/schema.sql`
2. For production, create a migration script
3. For development, you can drop and recreate tables

## ✅ Best Practices

- Always test schema changes in development first
- Use transactions when making multiple changes
- Back up production database before schema changes
- Use the auto-setup feature for new deployments
- Keep schema.sql as the single source of truth
