#!/bin/bash

# Deployment Status Check Script
# This script checks if Render has deployed our fixes

echo "🔍 Checking Mothership Deployment Status..."
echo "==========================================="
echo ""

# Check API health
echo "1. Checking API Health..."
HEALTH=$(curl -s https://mothership-api.onrender.com/health)
if [[ "$HEALTH" == '{"ok":true}' ]]; then
    echo "❌ API is running OLD code (simple health response)"
    echo "   The deployment hasn't updated yet!"
else
    echo "✅ API is running NEW code (detailed health response)"
fi
echo ""

# Test parse_prompt with proper format
echo "2. Testing parse_prompt endpoint..."
PARSE_RESULT=$(curl -s -X POST https://mothership-api.onrender.com/api/parse_prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Dentists in Charleston, SC"}' 2>/dev/null)

if echo "$PARSE_RESULT" | grep -q "lead_profile"; then
    echo "❌ API still has the lead_profile bug"
    echo "   Deployment not updated!"
else
    echo "✅ API parse_prompt is working!"
    echo "$PARSE_RESULT" | python3 -m json.tool 2>/dev/null || echo "$PARSE_RESULT"
fi
echo ""

# Check job health endpoint
echo "3. Checking job health endpoint..."
JOB_HEALTH=$(curl -s https://mothership-api.onrender.com/api/job_health)
if echo "$JOB_HEALTH" | grep -q "queue"; then
    echo "✅ Job health endpoint exists"
else
    echo "❌ Job health endpoint not found"
fi
echo ""

echo "==========================================="
echo "📊 DEPLOYMENT STATUS SUMMARY:"
echo ""

# Provide diagnosis
if [[ "$HEALTH" == '{"ok":true}' ]]; then
    echo "🚨 CRITICAL: Render has NOT deployed commit 484bb48"
    echo ""
    echo "ACTION REQUIRED:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Check the 'mothership-api' service"
    echo "3. Look at Events/Deploys tab for failures"
    echo "4. If no recent deploys, click 'Manual Deploy' → 'Deploy latest commit'"
    echo ""
    echo "5. Also check API keys are in the RIGHT services:"
    echo "   - API Service needs: OPENAI_API_KEY"
    echo "   - Workers Service needs: GOOGLE_MAPS_API_KEY"
    echo "   - Frontend only needs: API_URL (already set)"
else
    echo "✅ Deployment appears to be updated!"
    echo ""
    echo "Next steps:"
    echo "1. Ensure API keys are configured in Render"
    echo "2. Test the application at https://mothership-frontend.onrender.com"
fi
echo ""
echo "To manually trigger deployment:"
echo "1. Go to Render Dashboard"
echo "2. Select the service that needs updating"
echo "3. Click 'Manual Deploy' → 'Deploy latest commit'"
echo ""