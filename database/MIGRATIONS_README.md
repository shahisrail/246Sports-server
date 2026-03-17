# Database Migrations Guide

246Sports Database Migration System - Complete guide for running and managing database migrations.

## 📋 Overview

This migration system manages database schema changes in a versioned, trackable way. All migrations are stored in `database/migrations/` and numbered sequentially.

## 🗂️ Migration Files

### Existing Migrations

1. **001_add_sports_table_system.sql** - Multi-sport platform enhancement
2. **002_migrate_existing_sports_data.sql** - Migrate hardcoded sports to new system
3. **003_add_email_system_tables.sql** - Email templates and delivery tracking

### New Migrations (MVP Completion)

4. **004_add_email_subscriptions_system.sql** - Email newsletter subscription system
   - Creates `email_subscriptions` table
   - Adds subscription management functions
   - Creates `active_subscribers` view
   - Tracks user preferences (news, fixtures, results)

5. **005_enhance_venue_gps_support.sql** - GPS coordinates and location features
   - Adds GPS validation to venues table
   - Creates geospatial indexes
   - Adds distance calculation functions
   - Generates Google/Apple Maps URLs
   - Creates `venues_with_gps` view

## 🚀 Running Migrations

### Quick Start

```bash
# Navigate to backend directory
cd backend

# Run all pending migrations
./database/run-migration.sh

# Run with specific environment
DB_HOST=localhost DB_NAME=sports_db ./database/run-migration.sh
```

### What Happens During Migration?

1. ✅ Checks database connection
2. ✅ Creates `schema_migrations` tracking table (if needed)
3. ✅ Scans `database/migrations/` directory
4. ✅ Runs each migration in order (skipping already applied ones)
5. ✅ Records successful migrations in tracking table
6. ✅ Shows summary of results

## 🔄 Rolling Back Migrations

### Rollback Last Migration

```bash
# Rollback the last 1 migration
./database/rollback-migration.sh 1

# Rollback the last 3 migrations
./database/rollback-migration.sh 3
```

### What Happens During Rollback?

1. ✅ Shows which migrations will be rolled back
2. ✅ Asks for confirmation
3. ✅ Executes `.rollback.sql` file (if exists)
4. ✅ Removes migration from tracking table
5. ✅ Shows current migration status

## 📊 Migration Tracking

### Check Applied Migrations

```sql
-- View all applied migrations
SELECT migration_name, executed_at
FROM schema_migrations
ORDER BY executed_at DESC;

-- Count migrations
SELECT COUNT(*) as total_migrations FROM schema_migrations;
```

### Migration Status

```bash
# Run migrations (shows status at end)
./database/run-migration.sh

# Direct SQL check
psql -h localhost -U postgres -d sports_db -c \
  "SELECT * FROM schema_migrations ORDER BY executed_at DESC;"
```

## 🧪 Testing Migrations

### Test on Development Database First

```bash
# 1. Create test database
createdb -h localhost -U postgres sports_db_test

# 2. Run migrations on test database
DB_NAME=sports_db_test ./database/run-migration.sh

# 3. Verify changes
psql -h localhost -U postgres -d sports_db_test -c "\dt"

# 4. Test rollback
DB_NAME=sports_db_test ./database/rollback-migration.sh 1

# 5. Drop test database
dropdb -h localhost -U postgres sports_db_test
```

### Verify Migration Results

```sql
-- After migration 004: Check email subscriptions table
\d email_subscriptions
SELECT COUNT(*) FROM email_subscriptions;

-- After migration 005: Check venue GPS functions
SELECT format_google_maps_url(13.1939, -59.5432, 'Kensington Oval');
SELECT * FROM find_venues_near_location(13.1939, -59.5432, 10);
```

## 🔍 Migration File Structure

### Standard Migration Template

```sql
-- ============================================================
-- PHASE: Migration Name
-- Description
-- Version: 1.0.0
-- Date: YYYY-MM-DD
-- ============================================================

-- Step 1: Create/alter tables
-- Step 2: Create indexes
-- Step 3: Create functions
-- Step 4: Create triggers
-- Step 5: Add comments
-- Step 6: Create views

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Migration completed successfully';
END $$;
```

### Rollback File Template

```sql
-- ============================================================
-- ROLLBACK: Migration Name
-- ============================================================

-- WARNING: This will delete data!

-- Drop in reverse order:
-- 1. Views
-- 2. Triggers
-- 3. Functions
-- 4. Indexes
-- 5. Tables

DO $$
BEGIN
    RAISE NOTICE '✅ Rollback completed';
END $$;
```

## 🛠️ Creating New Migrations

### Naming Convention

```
XXX_descriptive_name.sql
XXX_descriptive_name.sql.rollback.sql
```

Where `XXX` is the next sequential number (004, 005, etc.)

### Steps to Create Migration

1. **Create migration file**
   ```bash
   # Next number is 006
   touch database/migrations/006_your_feature.sql
   ```

2. **Write migration SQL**
   - Use transactions where possible
   - Add error handling
   - Include helpful notices
   - Comment each section

3. **Create rollback file**
   ```bash
   touch database/migrations/006_your_feature.sql.rollback.sql
   ```

4. **Test locally**
   ```bash
   # On test database
   DB_NAME=sports_db_test ./database/run-migration.sh

   # Verify changes
   # Test rollback
   DB_NAME=sports_db_test ./database/rollback-migration.sh 1
   ```

5. **Document in this README**

## ⚠️ Best Practices

### DO ✅

- Always test on development database first
- Create rollback scripts for destructive changes
- Use transactions for multi-step operations
- Add comments explaining complex logic
- Validate data before inserting/updating
- Use CHECK constraints for data integrity
- Create indexes for frequently queried columns

### DON'T ❌

- Never run migrations on production without testing
- Don't modify existing migration files (create new ones)
- Don't use `IF EXISTS` for critical table creation
- Don't forget to update documentation
- Don't use SELECT * in production code
- Don't create circular dependencies

## 🐛 Troubleshooting

### Migration Fails

1. **Check the error log**
   ```bash
   # View detailed error
   cat /tmp/migration_*.log
   ```

2. **Fix the issue**
   - Might be syntax error
   - Might be missing dependency
   - Might be data conflict

3. **Option A: Fix and re-run**
   - Fix the migration file
   - Remove from tracking table
   - Run migration again

4. **Option B: Rollback and fix**
   ```bash
   ./database/rollback-migration.sh 1
   # Fix migration file
   ./database/run-migration.sh
   ```

### Common Issues

**Issue: "relation already exists"**
- Solution: Migration already ran, check schema_migrations table

**Issue: "permission denied"**
- Solution: Check database user permissions

**Issue: "database does not exist"**
- Solution: Create database first or check .env file

**Issue: Migration hangs**
- Solution: Check database connection, might be locked

## 📝 Migration Checklist

Before running migrations on production:

- [ ] Tested on development/staging environment
- [ ] Backup database created
- [ ] Rollback plan tested
- [ ] Migration reviewed by team
- [ ] Downtime scheduled (if needed)
- [ ] Monitoring/alerting ready
- [ ] Documentation updated

## 📞 Support

For migration issues:

1. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`
2. Check application logs
3. Review migration files for syntax errors
4. Test rollback procedure

## 📚 Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Migration Best Practices](https://martinfowler.com/articles/evodb.html)
- [PostgreSQL CREATE INDEX](https://www.postgresql.org/docs/current/sql-createindex.html)

---

**Last Updated:** 2026-03-17
**Version:** 1.0.0
