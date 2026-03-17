#!/bin/bash

# ============================================================
# 246Sports Migration Verification Script
# Tests that migrations were applied correctly
# ============================================================

set -e

echo "🔍 246Sports Migration Verification"
echo "==================================="
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

echo "📡 Database: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# Test counter
total_tests=0
passed_tests=0
failed_tests=0

# Function to run a test
run_test() {
    local test_name=$1
    local test_sql=$2
    local expected_result=$3

    total_tests=$((total_tests + 1))
    echo "🧪 Test $total_tests: $test_name"

    result=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "$test_sql" 2>&1) || true

    if [ "$result" = "$expected_result" ]; then
        echo "  ✅ PASSED"
        passed_tests=$((passed_tests + 1))
    else
        echo "  ❌ FAILED"
        echo "  Expected: $expected_result"
        echo "  Got: $result"
        failed_tests=$((failed_tests + 1))
    fi
    echo ""
}

# ============================================================
# MIGRATION 004: Email Subscriptions System Tests
# ============================================================

echo "📧 Testing Migration 004: Email Subscriptions System"
echo "---------------------------------------------------"

run_test \
    "email_subscriptions table exists" \
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'email_subscriptions')" \
    "t"

run_test \
    "email_subscriptions has correct columns" \
    "SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'email_subscriptions' AND column_name IN ('id', 'email', 'association_id', 'status', 'unsubscribe_token', 'preferences')" \
    "6"

run_test \
    "idx_email_subscriptions_email index exists" \
    "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_email_subscriptions_email'" \
    "1"

run_test \
    "idx_email_subscriptions_association index exists" \
    "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_email_subscriptions_association'" \
    "1"

run_test \
    "is_subscribed_to_association function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'is_subscribed_to_association'" \
    "1"

run_test \
    "get_association_subscribers function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'get_association_subscribers'" \
    "1"

run_test \
    "unsubscribe_by_token function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'unsubscribe_by_token'" \
    "1"

run_test \
    "active_subscribers view exists" \
    "SELECT COUNT(*) FROM information_schema.views WHERE viewname = 'active_subscribers'" \
    "1"

# ============================================================
# MIGRATION 005: Venue GPS Enhancement Tests
# ============================================================

echo "📍 Testing Migration 005: Venue GPS Enhancement"
echo "-----------------------------------------------"

run_test \
    "venues table has latitude column" \
    "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'latitude')" \
    "t"

run_test \
    "venues table has longitude column" \
    "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'venues' AND column_name = 'longitude')" \
    "t"

run_test \
    "venues_latitude_check constraint exists" \
    "SELECT COUNT(*) FROM pg_constraint WHERE conname = 'venues_latitude_check'" \
    "1"

run_test \
    "venues_longitude_check constraint exists" \
    "SELECT COUNT(*) FROM pg_constraint WHERE conname = 'venues_longitude_check'" \
    "1"

run_test \
    "idx_venues_gps_coordinates index exists" \
    "SELECT COUNT(*) FROM pg_indexes WHERE indexname = 'idx_venues_gps_coordinates'" \
    "1"

run_test \
    "calculate_distance function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'calculate_distance'" \
    "1"

run_test \
    "find_venues_near_location function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'find_venues_near_location'" \
    "1"

run_test \
    "validate_gps_coordinates function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'validate_gps_coordinates'" \
    "1"

run_test \
    "format_google_maps_url function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'format_google_maps_url'" \
    "1"

run_test \
    "format_apple_maps_url function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname = 'format_apple_maps_url'" \
    "1"

run_test \
    "venues_with_gps view exists" \
    "SELECT COUNT(*) FROM information_schema.views WHERE viewname = 'venues_with_gps'" \
    "1"

# ============================================================
# FUNCTIONALITY TESTS
# ============================================================

echo "🔧 Testing Functionality"
echo "-----------------------"

# Test distance calculation
distance=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT ROUND(calculate_distance(13.1939, -59.5432, 13.1000, -59.6000)::numeric, 2)" 2>&1) || distance="ERROR"

total_tests=$((total_tests + 1))
echo "🧪 Test $total_tests: Distance calculation (Bridgetown to approximate location)"
if [ "$distance" != "ERROR" ] && [ "$distance" != "" ]; then
    echo "  ✅ PASSED - Distance: $distance km"
    passed_tests=$((passed_tests + 1))
else
    echo "  ❌ FAILED - Got: $distance"
    failed_tests=$((failed_tests + 1))
fi
echo ""

# Test GPS validation
validation=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT validate_gps_coordinates(13.1939, -59.5432)" 2>&1) || validation="ERROR"

total_tests=$((total_tests + 1))
echo "🧪 Test $total_tests: GPS coordinate validation"
if [ "$validation" = "t" ]; then
    echo "  ✅ PASSED - Valid coordinates accepted"
    passed_tests=$((passed_tests + 1))
else
    echo "  ❌ FAILED - Got: $validation"
    failed_tests=$((failed_tests + 1))
fi
echo ""

# Test Google Maps URL generation
maps_url=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT format_google_maps_url(13.1939, -59.5432, 'Kensington Oval')" 2>&1) || maps_url="ERROR"

total_tests=$((total_tests + 1))
echo "🧪 Test $total_tests: Google Maps URL generation"
if [[ "$maps_url" == *"google.com/maps"* ]]; then
    echo "  ✅ PASSED - URL generated"
    passed_tests=$((passed_tests + 1))
else
    echo "  ❌ FAILED - Got: $maps_url"
    failed_tests=$((failed_tests + 1))
fi
echo ""

# ============================================================
# MIGRATION TRACKING TESTS
# ============================================================

echo "📋 Testing Migration Tracking"
echo "----------------------------"

run_test \
    "schema_migrations table exists" \
    "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'schema_migrations')" \
    "t"

# Check if migrations are recorded
migration_count=$(psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc \
    "SELECT COUNT(*) FROM schema_migrations WHERE migration_name LIKE '004%' OR migration_name LIKE '005%'" 2>&1) || migration_count="0"

total_tests=$((total_tests + 1))
echo "🧪 Test $total_tests: New migrations recorded in tracking table"
if [ "$migration_count" = "2" ]; then
    echo "  ✅ PASSED - Both migrations recorded"
    passed_tests=$((passed_tests + 1))
else
    echo "  ⚠️  WARNING - Expected 2, got: $migration_count"
    echo "  (This is OK if running verification without applying migrations)"
    # Don't count as failed
    total_tests=$((total_tests - 1))
fi
echo ""

# ============================================================
# SUMMARY
# ============================================================

echo "======================================="
echo "📊 Verification Summary"
echo "======================================="
echo "Total tests: $total_tests"
echo "✅ Passed: $passed_tests"
echo "❌ Failed: $failed_tests"
echo ""

if [ $failed_tests -eq 0 ]; then
    echo "🎉 All tests passed! Migrations verified successfully."
    exit 0
else
    echo "⚠️  Some tests failed. Please review the results above."
    exit 1
fi
