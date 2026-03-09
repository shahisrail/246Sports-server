#!/bin/bash

# 246Sports Database Setup Script
# This script sets up the database and verifies the installation

set -e  # Exit on error

echo "🚀 246Sports Backend Setup"
echo "==========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME="sports_db"
DB_USER="postgres"
SCHEMA_FILE="database/schema_v2.sql"

echo "📋 Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Schema: $SCHEMA_FILE"
echo ""

# Check if PostgreSQL is running
echo "1️⃣  Checking PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL 14+ and try again"
    exit 1
fi

if ! pg_isready &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL is not running${NC}"
    echo "Please start PostgreSQL and try again"
    echo ""
    echo "macOS: brew services start postgresql@14"
    echo "Ubuntu: sudo service postgresql start"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo ""

# Check if database exists
echo "2️⃣  Checking database..."
DB_EXISTS=$(psql -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -w "$DB_NAME" | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "Creating database '$DB_NAME'..."
    createdb -U "$DB_USER" "$DB_NAME"
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' already exists${NC}"
    read -p "Drop and recreate? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping database..."
        dropdb -U "$DB_USER" "$DB_NAME"
        echo "Creating database..."
        createdb -U "$DB_USER" "$DB_NAME"
        echo -e "${GREEN}✅ Database recreated${NC}"
    else
        echo "Keeping existing database"
    fi
fi
echo ""

# Check if schema file exists
echo "3️⃣  Checking schema file..."
if [ ! -f "$SCHEMA_FILE" ]; then
    echo -e "${RED}❌ Schema file not found: $SCHEMA_FILE${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi
echo -e "${GREEN}✅ Schema file found${NC}"
echo ""

# Run schema migration
echo "4️⃣  Running database migration..."
psql -U "$DB_USER" -d "$DB_NAME" -f "$SCHEMA_FILE" > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Schema migration completed${NC}"
else
    echo -e "${RED}❌ Schema migration failed${NC}"
    exit 1
fi
echo ""

# Verify tables created
echo "5️⃣  Verifying tables..."
TABLE_COUNT=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo -e "${GREEN}✅ $TABLE_COUNT tables created${NC}"
    echo ""
    echo "Tables:"
    psql -U "$DB_USER" -d "$DB_NAME" -c "\dt" | tail -n +4 | head -n -2
else
    echo -e "${RED}❌ No tables found${NC}"
    exit 1
fi
echo ""

# Test database connection
echo "6️⃣  Testing database connection..."
TEST_RESULT=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1;" | tr -d ' ')

if [ "$TEST_RESULT" = "1" ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    exit 1
fi
echo ""

# Check .env file
echo "7️⃣  Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    if [ -f ".env.example" ]; then
        echo "Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}✅ .env file created${NC}"
        echo -e "${YELLOW}⚠️  Please update .env with your database credentials${NC}"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Create logs directory
echo "8️⃣  Creating logs directory..."
mkdir -p logs
echo -e "${GREEN}✅ Logs directory created${NC}"
echo ""

# Check dependencies
echo "9️⃣  Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Dependencies installed${NC}"
    else
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Build project
echo "🔟  Building project..."
npm run build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Project built successfully${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    echo "Please check the errors above and fix them"
    exit 1
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Start the development server:"
echo -e "   ${YELLOW}npm run dev${NC}"
echo ""
echo "2. Check health status:"
echo -e "   ${YELLOW}curl http://localhost:3000/health${NC}"
echo ""
echo "3. Open API documentation:"
echo -e "   ${YELLOW}http://localhost:3000/api-docs${NC}"
echo ""
echo "4. Register your first user:"
echo -e "   ${YELLOW}curl -X POST http://localhost:3000/api/v1/auth/register \\\\${NC}"
echo -e "     ${YELLOW}-H 'Content-Type: application/json' \\\\${NC}"
echo -e "     ${YELLOW}-d '{\"name\":\"Admin\",\"email\":\"admin@246sports.com\",\"password\":\"Admin123!\",\"role\":\"SUPER_ADMIN\"}'${NC}"
echo ""
echo "For more information, see QUICKSTART.md"
echo ""
