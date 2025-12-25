#!/bin/bash

# Color output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Arkedia Deployment Preparation${NC}"
echo "=================================="

# Step 1: Build Frontend
echo -e "\n${YELLOW}Step 1: Building Frontend...${NC}"
cd client
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend build successful${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..

# Step 2: Check Backend Dependencies
echo -e "\n${YELLOW}Step 2: Checking Backend Dependencies...${NC}"
cd server
npm list
echo -e "${GREEN}✓ Dependencies listed${NC}"
cd ..

# Step 3: Create Deployment Checklist
echo -e "\n${YELLOW}Step 3: Creating Deployment Checklist...${NC}"
cat > DEPLOYMENT_CHECKLIST.md << 'EOF'
# Deployment Checklist

## Pre-Deployment (Local)
- [ ] Run `npm run build` in client/
- [ ] Verify `dist/` folder created
- [ ] Review server/.env values (DO NOT COMMIT)
- [ ] Run npm audit to check vulnerabilities

## MongoDB Atlas Setup
- [ ] Create MongoDB Atlas account
- [ ] Create cluster
- [ ] Create database user
- [ ] Add IP address to whitelist (0.0.0.0/0 for now)
- [ ] Copy connection string

## Backend Setup on Hostinger
- [ ] Upload server/ files
- [ ] Create .env with production values
- [ ] Run `npm install --production`
- [ ] Install PM2: `npm install -g pm2`
- [ ] Start with: `pm2 start src/index.js --name "booking-api"`
- [ ] Verify: `pm2 logs booking-api`

## Frontend Setup on Hostinger
- [ ] Upload dist/ contents to public_html/client/
- [ ] Create .htaccess for React Router
- [ ] Update VITE_API_URL in build
- [ ] Test: Visit yourdomain.com

## Domain & SSL
- [ ] Add domain in Hostinger
- [ ] Enable SSL certificate
- [ ] Update CLIENT_ORIGIN in backend
- [ ] Rebuild frontend with correct VITE_API_URL
- [ ] Re-upload frontend files

## Testing
- [ ] Test API endpoint: curl https://yourdomain.com/api
- [ ] Test Frontend: Visit https://yourdomain.com
- [ ] Test Login: super@arkedia.com / Password123!
- [ ] Check logs: pm2 logs booking-api
- [ ] Monitor performance

## Monitoring
- [ ] Set up PM2 monitoring
- [ ] Monitor MongoDB usage
- [ ] Check server resources
- [ ] Set up error alerts
EOF
echo -e "${GREEN}✓ Checklist created${NC}"

# Step 4: Summary
echo -e "\n${GREEN}=================================="
echo "Preparation Complete!"
echo "=================================="
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review DEPLOYMENT_GUIDE.md"
echo "2. Review DEPLOYMENT_CHECKLIST.md"
echo "3. Set up MongoDB Atlas"
echo "4. Prepare environment variables"
echo "5. Follow deployment guide for Hostinger upload"
echo -e "${NC}"
