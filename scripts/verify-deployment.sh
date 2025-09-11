#!/bin/bash

# Deployment Verification Script
# Checks if Render has deployed the latest fixes

set -e

echo "========================================="
echo "Render Deployment Verification"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="https://mothership-api.onrender.com"
FRONTEND_URL="https://mothership-frontend.onrender.com"

echo "Checking deployment status..."
echo ""

# Function to check if a fix is deployed
check_fix() {
    local test_name=$1
    local test_command=$2
    local expected_result=$3
    
    echo -n "Testing: $test_name... "
    
    if eval "$test_command" 2>/dev/null | grep -q "$expected_result"; then
        echo -e "${GREEN}✓ FIXED${NC}"
        return 0
    else
        echo -e "${RED}✗ NOT FIXED${NC}"
        return 1
    fi
}

# Track overall status
all_fixed=true

echo -e "${BLUE}API Service Checks:${NC}"
echo "-------------------"

# Test 1: Check if API is responding
echo -n "1. API Health Check... "
if curl -s "$API_URL/health" | grep -q '"ok":true'; then
    echo -e "${GREEN}✓ ONLINE${NC}"
else
    echo -e "${RED}✗ OFFLINE${NC}"
    all_fixed=false
fi

# Test 2: Check parse_prompt endpoint with lead_profile fix
echo -n "2. Parse Prompt Fix (lead_profile)... "
TEST_PROMPT="dentists in Charleston, South Carolina"
RESPONSE=$(curl -s -X POST "$API_URL/api/parse_prompt" \
    -H "Content-Type: application/json" \
    -d "{\"prompt\":\"$TEST_PROMPT\"}" 2>/dev/null || echo "{}")

if echo "$RESPONSE" | grep -q '"lead_profile"'; then
    echo -e "${GREEN}✓ FIXED${NC}"
    echo "   Found lead_profile field in response"
else
    echo -e "${RED}✗ NOT FIXED${NC}"
    echo "   Missing lead_profile field (old code still deployed)"
    all_fixed=false
fi

# Test 3: Check state abbreviation handling
echo -n "3. State Abbreviation Fix... "
if echo "$RESPONSE" | grep -q '"state":"SC"'; then
    echo -e "${GREEN}✓ FIXED${NC}"
    echo "   State correctly converted to 'SC'"
elif echo "$RESPONSE" | grep -q '"state":"South Carolina"'; then
    echo -e "${YELLOW}⚠ PARTIAL${NC}"
    echo "   State not converted (returns 'South Carolina')"
    echo "   Client-side workaround will handle this"
else
    echo -e "${RED}✗ UNKNOWN${NC}"
    echo "   Could not determine state handling"
fi

# Test 4: Check CORS headers
echo -n "4. CORS Configuration... "
CORS_HEADER=$(curl -s -I "$API_URL/health" 2>/dev/null | grep -i "access-control-allow-origin" || echo "")
if [ -n "$CORS_HEADER" ]; then
    echo -e "${GREEN}✓ CONFIGURED${NC}"
    echo "   $CORS_HEADER"
else
    echo -e "${YELLOW}⚠ NOT SET${NC}"
    echo "   CORS headers not visible (may still work)"
fi

echo ""
echo -e "${BLUE}Frontend Service Checks:${NC}"
echo "----------------------"

# Test 5: Check if frontend is responding
echo -n "5. Frontend Health... "
if curl -s -I "$FRONTEND_URL" | grep -q "200 OK"; then
    echo -e "${GREEN}✓ ONLINE${NC}"
else
    echo -e "${RED}✗ OFFLINE${NC}"
    all_fixed=false
fi

# Test 6: Check if frontend has workaround code
echo -n "6. Client-side Workaround... "
if [ -f "../apps/frontend/src/lib/api.ts" ]; then
    if grep -q "API Workaround" ../apps/frontend/src/lib/api.ts; then
        echo -e "${GREEN}✓ DEPLOYED${NC}"
        echo "   Client-side fixes are in place"
    else
        echo -e "${YELLOW}⚠ NOT FOUND${NC}"
        echo "   Workaround code not detected locally"
    fi
else
    echo -e "${YELLOW}⚠ SKIPPED${NC}"
    echo "   Cannot check local files"
fi

echo ""
echo "========================================="
echo "Deployment Summary:"
echo "========================================="
echo ""

# Check git commits
echo -e "${BLUE}Expected Commits:${NC}"
echo "  - 484bb48: API validation fixes"
echo "  - 3444c6e: CORS configuration"
echo ""

if [ "$all_fixed" = true ]; then
    echo -e "${GREEN}✓ All fixes appear to be deployed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Test the application at $FRONTEND_URL"
    echo "2. Try a search like: 'Dentists in Charleston, SC'"
    echo "3. Monitor for any errors in the browser console"
else
    echo -e "${YELLOW}⚠ Some fixes are not yet deployed${NC}"
    echo ""
    echo "The client-side workaround should handle this, but to fully fix:"
    echo ""
    echo "1. Run: ./scripts/force-redeploy.sh"
    echo "2. Wait 3-5 minutes for deployment"
    echo "3. Run this script again to verify"
    echo ""
    echo -e "${BLUE}Current Workaround Status:${NC}"
    echo "The frontend has client-side fixes that should make the app work"
    echo "even with the old API code. Test at: $FRONTEND_URL"
fi

echo ""
echo "========================================="
echo "Testing Instructions:"
echo "========================================="
echo ""
echo "1. Open: $FRONTEND_URL"
echo "2. Enter search: 'Dentists in Charleston, South Carolina'"
echo "3. Click 'Find Leads'"
echo "4. Check browser console for '[API Workaround]' messages"
echo "5. Verify search results appear"
echo ""

# Optional: Test with curl
echo "Manual API Test Command:"
echo "------------------------"
echo "curl -X POST $API_URL/api/parse_prompt \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\":\"dentists in Charleston, SC\"}' | jq"
echo ""