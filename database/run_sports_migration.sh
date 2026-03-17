#!/bin/bash

# ============================================================
# SPORTS TABLE SYSTEM MIGRATION RUNNER
# Multi-Sport Platform Enhancement
# Version: 1.0.0
# Date: 2026-03-13
# ============================================================

# This script runs the complete sports table system migration
# in the correct order with proper error handling

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database configuration
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-246sports}
DB_USER=${DB_USER:-postgres}

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}246Sports - Sports Table System Migration${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2

    echo -e "${YELLOW}Running: ${description}${NC}"
    echo -e "${YELLOW}File: ${file}${NC}"
    echo ""

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file"; then
        echo -e "${GREEN}✓ ${description} completed successfully${NC}"
        echo ""
    else
        echo -e "${RED}✗ ${description} failed${NC}"
        echo -e "${RED}Migration aborted. Please check the error above.${NC}"
        exit 1
    fi
}

# ============================================================
-- PRE-MIGRATION CHECKS
-- ============================================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}PRE-MIGRATION CHECKS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Check if database exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${GREEN}✓ Database '$DB_NAME' exists${NC}"
else
    echo -e "${RED}✗ Database '$DB_NAME' does not exist${NC}"
    echo -e "${YELLOW}Please create the database first:${NC}"
    echo "  createdb $DB_NAME"
    exit 1
fi

# Check if migrations directory exists
MIGRATIONS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/migrations"
SEEDS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/seeds"

if [ ! -d "$MIGRATIONS_DIR" ]; then
    echo -e "${RED}✗ Migrations directory not found: $MIGRATIONS_DIR${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Migrations directory found${NC}"
echo ""

# ============================================================
-- BACKUP DATABASE
-- ============================================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}BACKUP DATABASE${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

BACKUP_FILE="${DB_NAME}_backup_$(date +%Y%m%d_%H%M%S).sql"
echo -e "${YELLOW}Creating backup: $BACKUP_FILE${NC}"

if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"; then
    echo -e "${GREEN}✓ Backup created successfully: $BACKUP_FILE${NC}"
    echo ""
else
    echo -e "${RED}✗ Backup failed${NC}"
    echo -e "${YELLOW}Please create a manual backup before proceeding${NC}"
    exit 1
fi

# ============================================================
-- RUN MIGRATIONS
-- ============================================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}RUNNING MIGRATIONS${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

# Step 1: Create sports table system
run_sql_file \
    "$MIGRATIONS_DIR/001_add_sports_table_system.sql" \
    "Sports Table System Migration"

# Step 2: Seed sports data
run_sql_file \
    "$SEEDS_DIR/seed_sports_data.sql" \
    "Sports Data Seed"

# Step 3: Seed sport positions
run_sql_file \
    "$SEEDS_DIR/seed_sport_positions.sql" \
    "Sport Positions Data Seed"

# Step 4: Migrate existing data
run_sql_file \
    "$MIGRATIONS_DIR/002_migrate_existing_sports_data.sql" \
    "Existing Sports Data Migration"

# ============================================================
-- POST-MIGRATION VERIFICATION
-- ============================================================

echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}POST-MIGRATION VERIFICATION${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}Verifying sports data...${NC}"
SPORT_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM sports WHERE deleted_at IS NULL;")
echo -e "${GREEN}✓ Total sports: $SPORT_COUNT${NC}"

echo ""
echo -e "${YELLOW}Verifying sport positions data...${NC}"
POSITION_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM sport_positions WHERE deleted_at IS NULL;")
echo -e "${GREEN}✓ Total sport positions: $POSITION_COUNT${NC}"

echo ""
echo -e "${YELLOW}Verifying competitions migration...${NC}"
COMPETITIONS_WITH_SPORT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM competitions WHERE sport_id IS NOT NULL;")
echo -e "${GREEN}✓ Competitions with sport_id: $COMPETITIONS_WITH_SPORT${NC}"

echo ""
echo -e "${YELLOW}Showing sports by category:${NC}"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT category, COUNT(*) as count FROM sports WHERE deleted_at IS NULL GROUP BY category ORDER BY count DESC;"

echo ""
echo -e "${YELLOW}Checking for unmigrated competitions:${NC}"
UNMIGRATED=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM competitions WHERE sport IS NOT NULL AND sport_id IS NULL;")
if [ "$UNMIGRATED" -eq 0 ]; then
    echo -e "${GREEN}✓ All competitions migrated successfully${NC}"
else
    echo -e "${YELLOW}⚠ Warning: $UNMIGRATED competitions could not be migrated${NC}"
    echo -e "${YELLOW}Run this query to see details:${NC}"
    echo "  SELECT id, name, sport FROM competitions WHERE sport IS NOT NULL AND sport_id IS NULL;"
fi

# ============================================================
-- NEXT STEPS
-- ============================================================

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}MIGRATION COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${GREEN}✓ Sports table system is now active${NC}"
echo ""
echo -e "${YELLOW}IMPORTANT: Read the migration notes below:${NC}"
echo ""
echo "1. 📝 Verify the migrated data in your application"
echo "2. 🧪 Test all CRUD operations for competitions"
echo "3. 🧪 Test all CRUD operations for news"
echo "4. 📊 Update application code to use sport_id foreign keys"
echo "5. 🔄 Update API endpoints to use sports table"
echo "6. ✅ After verification, drop old sport columns:"
echo "     - Run the DROP COLUMN commands in 002_migrate_existing_sports_data.sql"
echo ""
echo "Backup file: $BACKUP_FILE"
echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${YELLOW}For rollback instructions, see:${NC}"
echo "  002_migrate_existing_sports_data.sql (Rollback section)"
echo -e "${BLUE}============================================${NC}"

exit 0
