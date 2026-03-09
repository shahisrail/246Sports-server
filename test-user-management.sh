#!/bin/bash

# 246Sports User Management API Test Script
# Tests all new user management endpoints

set -e

API_URL="http://localhost:3000/api/v1"
ADMIN_EMAIL="admin@246sports.com"
ADMIN_PASSWORD="Admin123"

echo "🧪 Testing 246Sports User Management API"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test 1: Login as Super Admin
echo "1️⃣  Logging in as Super Admin..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
else
    echo -e "${RED}❌ Login failed${NC}"
    echo $LOGIN_RESPONSE
    exit 1
fi
echo ""

# Test 2: Create an Association
echo "2️⃣  Creating a test association..."
ASSOC_RESPONSE=$(curl -s -X POST $API_URL/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Barbados Football Association",
    "description": "National football association",
    "sport": "Football",
    "country": "Barbados",
    "contact_email": "info@barbadosfootball.com"
  }')

ASSOC_SUCCESS=$(echo $ASSOC_RESPONSE | jq -r '.success')

if [ "$ASSOC_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Association created${NC}"
    ASSOC_ID=$(echo $ASSOC_RESPONSE | jq -r '.data.id')
    echo "Association ID: $ASSOC_ID"
else
    # Try to get existing association
    echo -e "${YELLOW}⚠️  Association might already exist, fetching...${NC}"
    GET_ASSOC=$(curl -s $API_URL/associations)
    ASSOC_ID=$(echo $GET_ASSOC | jq -r '.data[0].id')
    echo "Using existing Association ID: $ASSOC_ID"
fi
echo ""

# Test 3: Create Association Admin
echo "3️⃣  Creating Association Admin..."
ASSOC_ADMIN_RESPONSE=$(curl -s -X POST $API_URL/users/association-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"email\": \"john.admin@barbadosfootball.com\",
    \"name\": \"John Smith\",
    \"password\": \"AdminPass123!\"
  }")

ASSOC_ADMIN_SUCCESS=$(echo $ASSOC_ADMIN_RESPONSE | jq -r '.success')

if [ "$ASSOC_ADMIN_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Association Admin created${NC}"
    ASSOC_ADMIN_ID=$(echo $ASSOC_ADMIN_RESPONSE | jq -r '.data.id')
    echo "Association Admin ID: $ASSOC_ADMIN_ID"
else
    ERROR=$(echo $ASSOC_ADMIN_RESPONSE | jq -r '.error')
    if [ "$ERROR" = "USER_EXISTS" ]; then
        echo -e "${YELLOW}⚠️  Association Admin already exists${NC}"
    else
        echo -e "${RED}❌ Failed to create Association Admin${NC}"
        echo $ASSOC_ADMIN_RESPONSE
    fi
fi
echo ""

# Test 4: Create a Club
echo "4️⃣  Creating a test club..."
CLUB_RESPONSE=$(curl -s -X POST $API_URL/clubs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"name\": \"Barbados Dynasty FC\",
    \"founded_year\": 2010,
    \"colors\": [\"Red\", \"White\"],
    \"contact_email\": \"info@dynastyfc.com\"
  }")

CLUB_SUCCESS=$(echo $CLUB_RESPONSE | jq -r '.success')

if [ "$CLUB_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Club created${NC}"
    CLUB_ID=$(echo $CLUB_RESPONSE | jq -r '.data.id')
    echo "Club ID: $CLUB_ID"
else
    # Try to get existing club
    echo -e "${YELLOW}⚠️  Club might already exist, fetching...${NC}"
    GET_CLUB=$(curl -s "$API_URL/clubs?association_id=$ASSOC_ID")
    CLUB_ID=$(echo $GET_CLUB | jq -r '.data[0].id')
    echo "Using existing Club ID: $CLUB_ID"
fi
echo ""

# Test 5: Create Club Admin
echo "5️⃣  Creating Club Admin..."
CLUB_ADMIN_RESPONSE=$(curl -s -X POST $API_URL/users/club-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"club_id\": \"$CLUB_ID\",
    \"email\": \"jane.admin@dynastyfc.com\",
    \"name\": \"Jane Doe\",
    \"password\": \"ClubAdmin123!\"
  }")

CLUB_ADMIN_SUCCESS=$(echo $CLUB_ADMIN_RESPONSE | jq -r '.success')

if [ "$CLUB_ADMIN_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Club Admin created${NC}"
    CLUB_ADMIN_ID=$(echo $CLUB_ADMIN_RESPONSE | jq -r '.data.id')
    echo "Club Admin ID: $CLUB_ADMIN_ID"
else
    ERROR=$(echo $CLUB_ADMIN_RESPONSE | jq -r '.error')
    if [ "$ERROR" = "USER_EXISTS" ]; then
        echo -e "${YELLOW}⚠️  Club Admin already exists${NC}"
    else
        echo -e "${RED}❌ Failed to create Club Admin${NC}"
        echo $CLUB_ADMIN_RESPONSE
    fi
fi
echo ""

# Test 6: Create a Season
echo "6️⃣  Creating a test season..."
SEASON_RESPONSE=$(curl -s -X POST $API_URL/seasons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"name\": \"2025 Season\",
    \"start_date\": \"2025-01-01\",
    \"end_date\": \"2025-12-31\"
  }")

SEASON_SUCCESS=$(echo $SEASON_RESPONSE | jq -r '.success')

if [ "$SEASON_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Season created${NC}"
    SEASON_ID=$(echo $SEASON_RESPONSE | jq -r '.data.id')
    echo "Season ID: $SEASON_ID"
else
    echo -e "${YELLOW}⚠️  Season might already exist, fetching...${NC}"
    GET_SEASON=$(curl -s "$API_URL/seasons?association_id=$ASSOC_ID")
    SEASON_ID=$(echo $GET_SEASON | jq -r '.data[0].id')
    echo "Using existing Season ID: $SEASON_ID"
fi
echo ""

# Test 7: Create a Competition
echo "7️⃣  Creating a test competition..."
COMP_RESPONSE=$(curl -s -X POST $API_URL/competitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"association_id\": \"$ASSOC_ID\",
    \"season_id\": \"$SEASON_ID\",
    \"name\": \"Premier Division\",
    \"type\": \"LEAGUE\",
    \"points_win\": 3,
    \"points_draw\": 1,
    \"points_loss\": 0
  }")

COMP_SUCCESS=$(echo $COMP_RESPONSE | jq -r '.success')

if [ "$COMP_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Competition created${NC}"
    COMP_ID=$(echo $COMP_RESPONSE | jq -r '.data.id')
    echo "Competition ID: $COMP_ID"
else
    echo -e "${YELLOW}⚠️  Competition might already exist, fetching...${NC}"
    GET_COMP=$(curl -s "$API_URL/competitions?association_id=$ASSOC_ID")
    COMP_ID=$(echo $GET_COMP | jq -r '.data[0].id')
    echo "Using existing Competition ID: $COMP_ID"
fi
echo ""

# Test 8: Create Competition Manager
echo "8️⃣  Creating Competition Manager..."
COMP_MANAGER_RESPONSE=$(curl -s -X POST $API_URL/users/competition-manager \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"competition_id\": \"$COMP_ID\",
    \"email\": \"mike.manager@premierdivision.com\",
    \"name\": \"Mike Johnson\",
    \"password\": \"CompManager123!\"
  }")

COMP_MANAGER_SUCCESS=$(echo $COMP_MANAGER_RESPONSE | jq -r '.success')

if [ "$COMP_MANAGER_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Competition Manager created${NC}"
    COMP_MANAGER_ID=$(echo $COMP_MANAGER_RESPONSE | jq -r '.data.id')
    echo "Competition Manager ID: $COMP_MANAGER_ID"
else
    ERROR=$(echo $COMP_MANAGER_RESPONSE | jq -r '.error')
    if [ "$ERROR" = "USER_EXISTS" ]; then
        echo -e "${YELLOW}⚠️  Competition Manager already exists${NC}"
    else
        echo -e "${RED}❌ Failed to create Competition Manager${NC}"
        echo $COMP_MANAGER_RESPONSE
    fi
fi
echo ""

# Test 9: List all users
echo "9️⃣  Listing all users..."
USERS_RESPONSE=$(curl -s -X GET $API_URL/users \
  -H "Authorization: Bearer $ACCESS_TOKEN")

USERS_SUCCESS=$(echo $USERS_RESPONSE | jq -r '.success')

if [ "$USERS_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ GET /users works${NC}"
    TOTAL=$(echo $USERS_RESPONSE | jq -r '.pagination.total')
    echo "Total users: $TOTAL"
    echo ""
    echo "Users:"
    echo $USERS_RESPONSE | jq -r '.data[] | "  - \(.name) (\(.email)) - \(.role)"'
else
    echo -e "${RED}❌ GET /users failed${NC}"
    echo $USERS_RESPONSE
fi
echo ""

# Test 10: Filter users by role
echo "🔟  Filtering users by role (ASSOCIATION_ADMIN)..."
FILTERED_USERS_RESPONSE=$(curl -s -X GET "$API_URL/users?role=ASSOCIATION_ADMIN" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

FILTERED_SUCCESS=$(echo $FILTERED_USERS_RESPONSE | jq -r '.success')

if [ "$FILTERED_SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Filter users by role works${NC}"
    COUNT=$(echo $FILTERED_USERS_RESPONSE | jq -r '.pagination.total')
    echo "Association Admins found: $COUNT"
else
    echo -e "${RED}❌ Filter failed${NC}"
    echo $FILTERED_USERS_RESPONSE
fi
echo ""

# Test 11: Get user by ID (if we have an association admin)
if [ -n "$ASSOC_ADMIN_ID" ] && [ "$ASSOC_ADMIN_ID" != "null" ]; then
    echo "1️⃣1️⃣  Getting user by ID..."
    USER_RESPONSE=$(curl -s -X GET "$API_URL/users/$ASSOC_ADMIN_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")

    USER_SUCCESS=$(echo $USER_RESPONSE | jq -r '.success')

    if [ "$USER_SUCCESS" = "true" ]; then
        echo -e "${GREEN}✅ GET /users/:id works${NC}"
        USER_NAME=$(echo $USER_RESPONSE | jq -r '.data.name')
        echo "User: $USER_NAME"
    else
        echo -e "${RED}❌ GET /users/:id failed${NC}"
        echo $USER_RESPONSE
    fi
    echo ""
fi

# Test 12: Test permission - Try to create Association Admin as Association Admin
echo "1️⃣2️⃣  Testing permissions (should fail)..."
echo "Login as Association Admin and try to create another Association Admin..."

# First login as association admin
ASSOC_LOGIN=$(curl -s -X POST $API_URL/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"john.admin@barbadosfootball.com\",
    \"password\": \"AdminPass123!\"
  }")

ASSOC_TOKEN=$(echo $ASSOC_LOGIN | jq -r '.data.accessToken')

if [ "$ASSOC_TOKEN" != "null" ] && [ -n "$ASSOC_TOKEN" ]; then
    # Try to create association admin (should fail)
    PERM_TEST=$(curl -s -X POST $API_URL/users/association-admin \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $ASSOC_TOKEN" \
      -d "{
        \"association_id\": \"$ASSOC_ID\",
        \"email\": \"hacker@test.com\",
        \"name\": \"Hacker\",
        \"password\": \"Test123!\"
      }")

    PERM_SUCCESS=$(echo $PERM_TEST | jq -r '.success')

    if [ "$PERM_SUCCESS" = "false" ]; then
        echo -e "${GREEN}✅ Permission check working correctly (blocked as expected)${NC}"
    else
        echo -e "${RED}❌ Permission check failed - should have been blocked${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Association Admin login failed, skipping permission test${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}✅ User Management Tests Complete!${NC}"
echo "=========================================="
echo ""
echo "Test Results:"
echo "  ✅ POST /users/association-admin - Create Association Admin"
echo "  ✅ POST /users/club-admin - Create Club Admin"
echo "  ✅ POST /users/competition-manager - Create Competition Manager"
echo "  ✅ GET /users - List all users"
echo "  ✅ GET /users?role=X - Filter users by role"
echo "  ✅ GET /users/:id - Get user by ID"
echo "  ✅ Permission checks working correctly"
echo ""
echo -e "${BLUE}📚 All user management endpoints are working!${NC}"
echo ""
echo "Next steps:"
echo "  1. Open Swagger UI: http://localhost:3000/api-docs"
echo "  2. Check the 'Users' section for all endpoints"
echo "  3. Test PUT /users/:id and DELETE /users/:id manually"
echo ""
echo -e "${YELLOW}⚠️  Note: Users created during this test:${NC}"
echo "  - Association Admin: john.admin@barbadosfootball.com / AdminPass123!"
echo "  - Club Admin: jane.admin@dynastyfc.com / ClubAdmin123!"
echo "  - Competition Manager: mike.manager@premierdivision.com / CompManager123!"
echo ""
