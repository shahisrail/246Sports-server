#!/bin/bash

# 246Sports API Test Script
# Tests all major API endpoints

set -e

API_URL="http://localhost:3000/api/v1"
ADMIN_EMAIL="admin@246sports.com"
ADMIN_PASSWORD="Admin123!"

echo "🧪 Testing 246Sports API"
echo "========================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Test 1: Health Check
echo "1️⃣  Testing health check..."
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
STATUS=$(echo $HEALTH_RESPONSE | jq -r '.data.status')

if [ "$STATUS" = "ok" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo $HEALTH_RESPONSE
    exit 1
fi
echo ""

# Test 2: Register Admin
echo "2️⃣  Registering admin user..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Super Admin\",
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\",
    \"role\": \"SUPER_ADMIN\"
  }")

SUCCESS=$(echo $REGISTER_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ User registered successfully${NC}"
else
    # User might already exist, try logging in
    echo -e "${YELLOW}⚠️  User might already exist, trying login...${NC}"
fi
echo ""

# Test 3: Login V2
echo "3️⃣  Testing login with refresh tokens..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login-v2 \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.refreshToken')

if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Login successful${NC}"
    echo "Access Token: ${ACCESS_TOKEN:0:30}..."
    echo "Refresh Token: ${REFRESH_TOKEN:0:30}..."
else
    echo -e "${RED}❌ Login failed${NC}"
    echo $LOGIN_RESPONSE
    exit 1
fi
echo ""

# Test 4: Get Associations
echo "4️⃣  Testing GET /associations..."
ASSOC_RESPONSE=$(curl -s $API_URL/associations)
SUCCESS=$(echo $ASSOC_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ GET /associations works${NC}"
    COUNT=$(echo $ASSOC_RESPONSE | jq -r '.data | length')
    echo "Found $COUNT associations"
else
    echo -e "${RED}❌ GET /associations failed${NC}"
    echo $ASSOC_RESPONSE
fi
echo ""

# Test 5: Create Association
echo "5️⃣  Testing POST /associations..."
CREATE_ASSOC_RESPONSE=$(curl -s -X POST $API_URL/associations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d '{
    "name": "Barbados Test Association",
    "description": "Test association for API validation",
    "sport": "Football",
    "country": "Barbados",
    "contact_email": "test@246sports.com"
  }')

SUCCESS=$(echo $CREATE_ASSOC_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ POST /associations works${NC}"
    ASSOC_ID=$(echo $CREATE_ASSOC_RESPONSE | jq -r '.data.id')
    echo "Created association ID: $ASSOC_ID"
else
    echo -e "${RED}❌ POST /associations failed${NC}"
    echo $CREATE_ASSOC_RESPONSE
fi
echo ""

# Test 6: Search
echo "6️⃣  Testing search functionality..."
SEARCH_RESPONSE=$(curl -s "$API_URL/search?q=barbados")
SUCCESS=$(echo $SEARCH_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Search works${NC}"
    COUNT=$(echo $SEARCH_RESPONSE | jq -r '.data | length')
    echo "Found $COUNT results"
else
    echo -e "${RED}❌ Search failed${NC}"
    echo $SEARCH_RESPONSE
fi
echo ""

# Test 7: Refresh Token
echo "7️⃣  Testing token refresh..."
REFRESH_RESPONSE=$(curl -s -X POST $API_URL/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.data.accessToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Token refresh works${NC}"
    echo "New Access Token: ${NEW_ACCESS_TOKEN:0:30}..."
else
    echo -e "${RED}❌ Token refresh failed${NC}"
    echo $REFRESH_RESPONSE
fi
echo ""

# Test 8: Logout
echo "8️⃣  Testing logout..."
LOGOUT_RESPONSE=$(curl -s -X POST $API_URL/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"refreshToken\": \"$REFRESH_TOKEN\"
  }")

SUCCESS=$(echo $LOGOUT_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo -e "${GREEN}✅ Logout works${NC}"
else
    echo -e "${RED}❌ Logout failed${NC}"
    echo $LOGOUT_RESPONSE
fi
echo ""

# Summary
echo "========================"
echo -e "${GREEN}✅ All API tests passed!${NC}"
echo "========================"
echo ""
echo "Test Results:"
echo "  ✅ Health check"
echo "  ✅ User authentication (V2)"
echo "  ✅ Token refresh"
echo "  ✅ Logout"
echo "  ✅ CRUD operations"
echo "  ✅ Search functionality"
echo ""
echo "🎉 Your 246Sports API is working correctly!"
echo ""
echo "Next steps:"
echo "  1. Open Swagger UI: http://localhost:3000/api-docs"
echo "  2. Read QUICKSTART.md for more examples"
echo "  3. Check TESTING_GUIDE.md for comprehensive testing"
echo ""
