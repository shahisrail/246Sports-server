#!/bin/bash

# 246Sports Database Migration Script
# This script will set up the database schema

set -e

echo "🚀 Starting database migration..."

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

echo "📡 Connecting to database: $DB_NAME@$DB_HOST:$DB_PORT"

# Check if database exists, if not create it
echo "📊 Checking if database exists..."
DB_EXISTS=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -lqt | cut -d \| -f 1 | grep -w $DB_NAME | wc -l)

if [ $DB_EXISTS -eq 0 ]; then
    echo "➕ Creating database: $DB_NAME"
    createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME
else
    echo "✅ Database $DB_NAME already exists"
fi

# Run the schema
echo "📝 Applying database schema..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f database/schema.sql

echo "✅ Database migration completed successfully!"
echo ""
echo "📊 Database statistics:"
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "\dt" | tail -n +2 | head -n -1 | wc -l | xargs echo "  - Total tables:"
