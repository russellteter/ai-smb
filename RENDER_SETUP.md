# Render Production Deployment Instructions

## Overview
Your Mothership Leads application is configured for deployment on Render with the following services:
- **Database**: PostgreSQL (`mothership-database`)
- **Cache**: Redis (`mothership-redis`) 
- **API**: Web service (`mothership-api`)
- **Workers**: Background job processor (`mothership-workers`)
- **Frontend**: Next.js UI (`mothership-frontend`)
- **Migration**: One-time job (`mothership-migrate`)

## Required Environment Variables

### 1. API Keys (Manual Setup Required)
You must configure these environment variables in the Render Dashboard:

#### For `mothership-api` service:
- `OPENAI_API_KEY`: Your OpenAI API key for prompt parsing
- `GOOGLE_MAPS_API_KEY`: Your Google Maps API key for Places searches

#### For `mothership-workers` service:
- `GOOGLE_MAPS_API_KEY`: Same Google Maps API key (for Places API calls)

### 2. Automatic Environment Variables
These are automatically configured via render.yaml:
- `DATABASE_URL`: Auto-generated from PostgreSQL service
- `REDIS_URL`: Auto-generated from Redis service
- `NODE_ENV=production`: Set for all services
- `PORT=3001`: Set for API service
- `API_URL=https://mothership-api.onrender.com`: Set for frontend

## Deployment Steps

### Step 1: Push Changes to GitHub
The render.yaml changes are ready to deploy. Push to your main branch:
```bash
git push origin main
```

### Step 2: Configure Environment Variables in Render Dashboard
1. Go to https://dashboard.render.com
2. Navigate to your `mothership-api` service
3. Go to Environment tab
4. Add these variables:
   - `OPENAI_API_KEY`: [Your OpenAI API key]
   - `GOOGLE_MAPS_API_KEY`: [Your Google Maps API key]

5. Navigate to your `mothership-workers` service  
6. Go to Environment tab
7. Add this variable:
   - `GOOGLE_MAPS_API_KEY`: [Same Google Maps API key]

### Step 3: Trigger Migration Job
1. In Render Dashboard, find the `mothership-migrate` job
2. Click "Manual Deploy" to run database migrations
3. Verify it completes successfully

### Step 4: Verify Services
Check that all services are running:
1. **API Health**: https://mothership-api.onrender.com/health
2. **Frontend**: https://mothership-frontend.onrender.com
3. **Job Health**: https://mothership-api.onrender.com/api/job_health

## Service URLs
- **Frontend**: https://mothership-frontend.onrender.com
- **API**: https://mothership-api.onrender.com
- **API Health**: https://mothership-api.onrender.com/health
- **Job Status**: https://mothership-api.onrender.com/api/job_health

## Troubleshooting

### Common Issues:
1. **Redis connection errors**: Should be resolved with latest render.yaml
2. **Database connection**: Ensure migration job ran successfully
3. **API key errors**: Verify environment variables are set correctly
4. **CORS issues**: Frontend should connect to API automatically

### Monitoring:
- Check service logs in Render Dashboard
- Monitor job queue health at `/api/job_health`
- Test end-to-end by running a search from the frontend

## Next Steps After Deployment
1. Test the complete search flow
2. Monitor performance and costs
3. Consider custom domain setup
4. Set up monitoring/alerting as needed

## Support
If you encounter issues:
1. Check service logs in Render Dashboard
2. Verify environment variables are set
3. Ensure all services are in "running" state
4. Test API endpoints directly if frontend issues occur