# Render Environment Variables Setup Guide

## Quick Setup Checklist

### 1. API Service (mothership-api)
Navigate to: https://dashboard.render.com → mothership-api → Environment

**Required Manual Setup:**
- [ ] `OPENAI_API_KEY` - Your OpenAI API key (starts with `sk-`)
- [ ] `GOOGLE_MAPS_API_KEY` - Your Google Maps API key (starts with `AIza`)

**Auto-configured (verify these exist):**
- [x] `DATABASE_URL` - From mothership-database
- [x] `REDIS_URL` - From mothership-redis
- [x] `NODE_ENV` - Set to `production`

### 2. Worker Service (mothership-workers)
Navigate to: https://dashboard.render.com → mothership-workers → Environment

**Required Manual Setup:**
- [ ] `GOOGLE_MAPS_API_KEY` - Same key as API service

**Auto-configured (verify these exist):**
- [x] `DATABASE_URL` - From mothership-database
- [x] `REDIS_URL` - From mothership-redis
- [x] `NODE_ENV` - Set to `production`

### 3. Frontend Service (mothership-frontend)
Navigate to: https://dashboard.render.com → mothership-frontend → Environment

**Already Configured (verify):**
- [x] `API_URL` - Should be `https://mothership-api.onrender.com`
- [x] `NODE_ENV` - Set to `production`

### 4. Migration Job (mothership-migrate)
**Auto-configured:**
- [x] `DATABASE_URL` - From mothership-database
- [x] `NODE_ENV` - Set to `production`

## Getting Your API Keys

### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to Render dashboard for mothership-api service

**Note:** Without this key, prompt parsing will fall back to generic responses.

### Google Maps API Key
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable these APIs:
   - Places API (New)
   - Geocoding API
4. Go to APIs & Services → Credentials
5. Click "Create Credentials" → "API Key"
6. Copy the key (starts with `AIza`)
7. Add to Render dashboard for both mothership-api and mothership-workers

**Note:** Without this key, location-based search features will be disabled.

## Verification Steps

### 1. Check Service Health
After adding environment variables, verify each service:

```bash
# Check API health
curl https://mothership-api.onrender.com/health

# Expected response shows all services connected:
{
  "ok": true,
  "services": {
    "database": { "status": "connected" },
    "redis": { "status": "connected" },
    "openai": { "configured": true },
    "google_maps": { "configured": true }
  }
}
```

### 2. Test Prompt Parsing
```bash
curl -X POST https://mothership-api.onrender.com/api/parse_prompt \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Find dentists in San Francisco"}'
```

### 3. Check Migration Status
In Render dashboard, check the mothership-migrate job logs to ensure migrations ran successfully.

## Troubleshooting

### Service Won't Start
1. Check logs in Render dashboard
2. Verify all required environment variables are set
3. Restart the service after adding variables

### Database Connection Errors
1. Ensure mothership-database service is running
2. Check DATABASE_URL is properly linked
3. Verify migration job has completed

### Redis Connection Errors
1. Ensure mothership-redis service is running
2. Check REDIS_URL is properly linked
3. Verify Redis plan has `noeviction` policy

### API Key Issues
- OpenAI: Check key starts with `sk-` and has valid credits
- Google Maps: Ensure Places API and Geocoding API are enabled

## Local Development

To verify your environment locally:

```bash
# Install dependencies
pnpm install

# Run verification script
pnpm verify-env

# Or check specific service
SERVICE_NAME=api pnpm verify-env
SERVICE_NAME=frontend pnpm verify-env
SERVICE_NAME=workers pnpm verify-env
```

## Security Notes

- Never commit API keys to Git
- Use Render's environment variable management
- Rotate keys periodically
- Monitor usage in provider dashboards

## Support

If you continue to have issues:
1. Check service logs in Render dashboard
2. Use the health endpoint to diagnose issues
3. Run the local verification script
4. Check that all services show as "Live" in Render