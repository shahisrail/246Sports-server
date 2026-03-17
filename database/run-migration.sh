#!/bin/bash

# ============================================================
# 246Sports Migration Runner
# Runs database migrations in sequence
# ============================================================

set -e

echo "🚀 246Sports Database Migration Runner"
echo "======================================="
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

echo "📡 Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo "📁 Migrations directory: $MIGRATIONS_DIR"
echo ""

# Function to check if a migration has already been run
has_migration_run() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file" .sql)

    # Check if migration record exists
    local count=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
        "SELECT COUNT(*) FROM schema_migrations WHERE migration_name = '$migration_name'")

    [ "$count" -gt 0 ]
}

# Function to mark migration as run
mark_migration_run() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file" .sql)
    local migration_checksum=$(md5sum "$migration_file" | cut -d' ' -f1)

    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \
        "INSERT INTO schema_migrations (migration_name, checksum, executed_at) \
         VALUES ('$migration_name', '$migration_checksum', CURRENT_TIMESTAMP);"
}

# Check if schema_migrations table exists, if not create it
echo "📋 Setting up migration tracking..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME >/dev/null 2>&1 <<EOF || true
CREATE TABLE IF NOT EXISTS schema_migrations (
    id SERIAL PRIMARY KEY,
    migration_name VARCHAR(255) NOT NULL UNIQUE,
    checksum VARCHAR(255),
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
echo "✅ Migration tracking ready"
echo ""

# Get list of migration files sorted by name
echo "🔍 Scanning for migration files..."
if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo "❌ Migrations directory not found: $MIGRATIONS_DIR"
    exit 1
fi

# Get all SQL files and sort them
migrations=$(find "$MIGRATIONS_DIR" -name "*.sql" -type f | sort)

if [ -z "$migrations" ]; then
    echo "❌ No migration files found in $MIGRATIONS_DIR"
    exit 1
fi

migration_count=$(echo "$migrations" | wc -l)
echo "✅ Found $migration_count migration file(s)"
echo ""

# Run each migration
echo "🎯 Running migrations..."
echo "-----------------------"

migration_number=0
successful_migrations=0
skipped_migrations=0
failed_migrations=0

for migration_file in $migrations; do
    migration_number=$((migration_number + 1))
    migration_name=$(basename "$migration_file")

    echo ""
    echo "[$migration_number/$migration_count] Processing: $migration_name"

    # Check if migration already ran
    if has_migration_run "$migration_file"; then
        echo "  ⏭️  Already applied, skipping..."
        skipped_migrations=$((skipped_migrations + 1))
        continue
    fi

    # Run the migration
    echo "  🔄 Applying..."
    if psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_file" > /tmp/migration_$$.log 2>&1; then
        echo "  ✅ Success"
        mark_migration_run "$migration_file"
        successful_migrations=$((successful_migrations + 1))

        # Show any notices or info messages
        if grep -i "NOTICE\|INFO" /tmp/migration_$$.log >/dev/null; then
            echo "  📝 Details:"
            grep -i "NOTICE\|INFO" /tmp/migration_$$.log | sed 's/^/     /'
        fi
    else
        echo "  ❌ Failed!"
        failed_migrations=$((failed_migrations + 1))
        echo "  📋 Error log:"
        cat /tmp/migration_$$.log | sed 's/^/     /'

        # Ask user if they want to continue
        echo ""
        read -p "❓ A migration failed. Do you want to continue with remaining migrations? (y/N) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Migration aborted by user"
            exit 1
        fi
    fi

    # Clean up temp log
    rm -f /tmp/migration_$$.log
done

echo ""
echo "======================================="
echo "📊 Migration Summary"
echo "======================================="
echo "Total migrations: $migration_count"
echo "✅ Successful: $successful_migrations"
echo "⏭️  Skipped: $skipped_migrations"
echo "❌ Failed: $failed_migrations"
echo ""

if [ $failed_migrations -eq 0 ]; then
    echo "🎉 All migrations completed successfully!"
    echo ""
    echo "📊 Current migration status:"
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c \
        "SELECT migration_name, executed_at FROM schema_migrations ORDER BY executed_at DESC;" 2>/dev/null || echo "No migrations recorded yet"
    exit 0
else
    echo "⚠️  Some migrations failed. Please review the errors above."
    exit 1
fi
