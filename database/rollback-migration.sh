#!/bin/bash

# ============================================================
# 246Sports Migration Rollback Script
# Rolls back the last N migrations
# ============================================================

set -e

echo "🔄 246Sports Migration Rollback"
echo "================================"
echo ""

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo "❌ .env file not found!"
    exit 1
fi

# Database connection parameters
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-sports_db}
DB_USER=${DB_USER:-postgres}

# Migration directory
MIGRATIONS_DIR="database/migrations"

# Parse arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 <number_of_migrations_to_rollback>"
    echo ""
    echo "Example:"
    echo "  $0 1    # Rollback last migration"
    echo "  $0 3    # Rollback last 3 migrations"
    echo ""
    exit 1
fi

ROLLBACK_COUNT=$1

echo "📡 Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "🔙 Rolling back last $ROLLBACK_COUNT migration(s)"
echo ""

# Check if schema_migrations table exists
table_exists=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_migrations')")

if [ "$table_exists" != "t" ]; then
    echo "❌ Migration tracking table not found. Cannot rollback."
    exit 1
fi

# Get the last N migrations
echo "🔍 Finding migrations to rollback..."
migrations_to_rollback=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT migration_name FROM schema_migrations ORDER BY executed_at DESC LIMIT $ROLLBACK_COUNT")

if [ -z "$migrations_to_rollback" ]; then
    echo "❌ No migrations found to rollback"
    exit 1
fi

# Show what will be rolled back
echo ""
echo "📋 The following migrations will be rolled back:"
echo "$migrations_to_rollback" | while read -r migration_name; do
    echo "  - $migration_name"
done
echo ""

# Confirm rollback
read -p "❓ Are you sure you want to rollback these migrations? (yes/NO) " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

# Rollback each migration
echo ""
echo "🔄 Rolling back migrations..."
echo "-----------------------------"

rollback_number=0
echo "$migrations_to_rollback" | while read -r migration_name; do
    rollback_number=$((rollback_number + 1))

    echo ""
    echo "[$rollback_number] Rolling back: $migration_name"

    # Check if rollback SQL file exists
    rollback_file="$MIGRATIONS_DIR/${migration_name}.rollback.sql"
    if [ -f "$rollback_file" ]; then
        echo "  🔄 Running rollback SQL..."
        if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$rollback_file" > /tmp/rollback_$$.log 2>&1; then
            echo "  ✅ Rollback SQL executed"
        else
            echo "  ⚠️  Rollback SQL failed (continuing anyway)"
            cat /tmp/rollback_$$.log | sed 's/^/     /'
        fi
        rm -f /tmp/rollback_$$.log
    else
        echo "  ⚠️  No rollback SQL file found (will just remove from tracking)"
    fi

    # Remove from migration tracking
    echo "  🗑️  Removing from migration tracking..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \
        "DELETE FROM schema_migrations WHERE migration_name = '$migration_name';"

    echo "  ✅ Rolled back"
done

echo ""
echo "================================"
echo "✅ Rollback completed!"
echo ""
echo "📊 Current migration status:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \
    "SELECT migration_name, executed_at FROM schema_migrations ORDER BY executed_at DESC;" 2>/dev/null || echo "No migrations remaining"
