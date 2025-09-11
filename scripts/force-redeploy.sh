#!/bin/bash

# Force Render Redeploy Script
# This script helps trigger a manual redeployment on Render when auto-deploy is stuck

set -e

echo "========================================="
echo "Render Force Redeploy Tool"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Render CLI is available
if command -v render &> /dev/null; then
    echo -e "${GREEN}✓${NC} Render CLI detected"
    echo ""
    echo "Attempting to trigger redeploy via CLI..."
    echo ""
    
    # Note: This requires authentication with Render CLI
    echo "Services to redeploy:"
    echo "  1. mothership-api"
    echo "  2. mothership-workers"
    echo "  3. mothership-frontend"
    echo ""
    
    read -p "Which service to redeploy? (1-3, or 'all'): " choice
    
    case $choice in
        1)
            echo "Redeploying API service..."
            render deploy mothership-api --yes
            ;;
        2)
            echo "Redeploying Workers service..."
            render deploy mothership-workers --yes
            ;;
        3)
            echo "Redeploying Frontend service..."
            render deploy mothership-frontend --yes
            ;;
        all)
            echo "Redeploying all services..."
            render deploy mothership-api --yes
            render deploy mothership-workers --yes
            render deploy mothership-frontend --yes
            ;;
        *)
            echo -e "${RED}Invalid choice${NC}"
            exit 1
            ;;
    esac
else
    echo -e "${YELLOW}⚠${NC} Render CLI not installed"
    echo ""
    echo "Manual Redeploy Instructions:"
    echo "================================"
    echo ""
    echo "Since the Render CLI is not available, follow these steps to manually trigger a redeploy:"
    echo ""
    echo -e "${GREEN}Option 1: Via Render Dashboard (Recommended)${NC}"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Navigate to your service (mothership-api, mothership-workers, or mothership-frontend)"
    echo "3. Click on 'Manual Deploy' button"
    echo "4. Select 'Deploy latest commit' or enter specific commit hash:"
    echo "   - Latest fix commit: 3444c6e (CORS and validation fixes)"
    echo "5. Click 'Deploy'"
    echo ""
    echo -e "${GREEN}Option 2: Via Git Push (Force Auto-Deploy)${NC}"
    echo "1. Make a trivial change to trigger auto-deploy:"
    echo "   git commit --allow-empty -m 'chore: trigger Render redeploy'"
    echo "   git push origin main"
    echo ""
    echo -e "${GREEN}Option 3: Via Render API${NC}"
    echo "1. Get your Render API key from: https://dashboard.render.com/account/api-keys"
    echo "2. Run the following curl command:"
    echo ""
    echo "   curl -X POST \\"
    echo "     https://api.render.com/v1/services/{SERVICE_ID}/deploys \\"
    echo "     -H 'Authorization: Bearer YOUR_API_KEY' \\"
    echo "     -H 'Content-Type: application/json' \\"
    echo "     -d '{\"clearCache\": true}'"
    echo ""
    echo "Service IDs (find in Render dashboard URL):"
    echo "  - API Service: Check URL when viewing mothership-api"
    echo "  - Worker Service: Check URL when viewing mothership-workers"
    echo "  - Frontend Service: Check URL when viewing mothership-frontend"
    echo ""
fi

echo ""
echo "========================================="
echo "After Triggering Redeploy:"
echo "========================================="
echo ""
echo "1. Monitor deployment progress in Render dashboard"
echo "2. Check deployment logs for any errors"
echo "3. Run ./scripts/verify-deployment.sh to confirm new code is deployed"
echo "4. Test the application functionality"
echo ""
echo "Expected deployment time: 3-5 minutes per service"
echo ""
echo -e "${YELLOW}Note:${NC} If auto-deploy is still not working after this:"
echo "  1. Check render.yaml configuration"
echo "  2. Verify GitHub webhook is connected"
echo "  3. Check Render service settings for 'Auto-Deploy' toggle"
echo ""