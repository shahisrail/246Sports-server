# Database Setup

This folder contains the database schema and migrations for the 246Sports platform.

## Files

- **schema.sql** - The main database schema with all tables (20 tables)
- **schema_old.sql** - Old schema backup (do not use)
- **migrations/** - Folder for incremental migration scripts
- **migrate.sh** - Automated migration script
- **seeds.sql** - Sample data for development (if available)

## Quick Start

### Option 1: Using the migration script (Recommended)

```bash
cd backend
npm run db:migrate
```

### Option 2: Manual setup

```bash
# Set the password in .env file first
# Then run:
psql -U postgres -d sports_db -f database/schema.sql
```

## Database Schema

The schema includes 20 tables:

### Core Tables
- **users** - User accounts and authentication
- **associations** - Sports associations
- **clubs** - Sports clubs
- **teams** - Teams within clubs
- **venues** - Competition venues

### Competition Tables
- **competitions** - Leagues, tournaments, cups
- **seasons** - Competition seasons
- **team_competitions** - Team participation in competitions

### Match Tables
- **fixtures** - Scheduled matches
- **results** - Match results
- **fixture_updates** - Live match updates
- **standings** - League standings
- **standings_history** - Historical standings snapshots
- **result_history** - Historical result tracking

### Content Tables
- **news** - News articles and announcements
- **media** - Media files and images
- **players** - Player registrations

### System Tables
- **audit_logs** - Audit trail for all changes
- **refresh_tokens** - JWT refresh tokens
- **background_jobs** - Scheduled background tasks

## Key Features

- **Full-text search** on news articles
- **Soft deletes** (deleted_at columns)
- **Audit trail** for all data changes
- **Multi-tenant** architecture
- **UUID primary keys** for all tables
- **Proper indexes** for performance

## Environment Variables

Make sure your `.env` file has:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sports_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## Troubleshooting

### Database connection failed
- Check PostgreSQL is running: `pg_ctl status`
- Verify credentials in `.env`
- Ensure database exists: `psql -U postgres -l`

### Permission errors
- Make sure the user has CREATE DATABASE privileges
- Check the user can connect: `psql -U postgres -h localhost -c "SELECT 1"`

### Schema already exists
- Drop and recreate: `DROP DATABASE sports_db;` then run migration
- Or use: `npm run db:setup` to re-apply schema

## Production Notes

Before deploying to production:
1. Change all default passwords
2. Enable SSL for database connections
3. Set up regular backups
4. Configure connection pooling
5. Review and optimize indexes
6. Set up monitoring and alerts
