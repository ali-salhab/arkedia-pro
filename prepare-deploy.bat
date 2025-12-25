@echo off
REM Arkedia Deployment Preparation Script for Windows

setlocal enabledelayedexpansion
color 0A

echo.
echo ===================================
echo  Arkedia Deployment Preparation
echo ===================================
echo.

REM Step 1: Build Frontend
echo Building Frontend...
cd client
call npm run build
if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Frontend build failed!
    pause
    exit /b 1
)
cd ..
echo [OK] Frontend build successful
echo.

REM Step 2: Check Backend Dependencies
echo Checking Backend Dependencies...
cd server
call npm list
cd ..
echo [OK] Dependencies checked
echo.

REM Step 3: Create Deployment Checklist
echo Creating Deployment Checklist...
(
echo # Deployment Checklist
echo.
echo ## Pre-Deployment (Local^)
echo - [ ] Run `npm run build` in client/
echo - [ ] Verify `dist/` folder created
echo - [ ] Review server/.env values (DO NOT COMMIT^)
echo - [ ] Run npm audit to check vulnerabilities
echo.
echo ## MongoDB Atlas Setup
echo - [ ] Create MongoDB Atlas account
echo - [ ] Create cluster
echo - [ ] Create database user
echo - [ ] Add IP address to whitelist (0.0.0.0/0 for now^)
echo - [ ] Copy connection string
echo.
echo ## Backend Setup on Hostinger
echo - [ ] Upload server/ files
echo - [ ] Create .env with production values
echo - [ ] Run `npm install --production`
echo - [ ] Install PM2: `npm install -g pm2`
echo - [ ] Start with: `pm2 start src/index.js --name "booking-api"`
echo - [ ] Verify: `pm2 logs booking-api`
echo.
echo ## Frontend Setup on Hostinger
echo - [ ] Upload dist/ contents to public_html/client/
echo - [ ] Create .htaccess for React Router
echo - [ ] Update VITE_API_URL in build
echo - [ ] Test: Visit yourdomain.com
echo.
echo ## Domain ^& SSL
echo - [ ] Add domain in Hostinger
echo - [ ] Enable SSL certificate
echo - [ ] Update CLIENT_ORIGIN in backend
echo - [ ] Rebuild frontend with correct VITE_API_URL
echo - [ ] Re-upload frontend files
echo.
echo ## Testing
echo - [ ] Test API endpoint: curl https://yourdomain.com/api
echo - [ ] Test Frontend: Visit https://yourdomain.com
echo - [ ] Test Login: super@arkedia.com / Password123!
echo - [ ] Check logs: pm2 logs booking-api
echo - [ ] Monitor performance
echo.
echo ## Monitoring
echo - [ ] Set up PM2 monitoring
echo - [ ] Monitor MongoDB usage
echo - [ ] Check server resources
echo - [ ] Set up error alerts
) > DEPLOYMENT_CHECKLIST.md
echo [OK] Checklist created
echo.

REM Step 4: Summary
echo.
echo ===================================
echo  Preparation Complete!
echo ===================================
echo.
echo Next Steps:
echo 1. Review DEPLOYMENT_GUIDE.md
echo 2. Review DEPLOYMENT_CHECKLIST.md
echo 3. Set up MongoDB Atlas
echo 4. Prepare environment variables
echo 5. Follow deployment guide for Hostinger upload
echo.
echo ===================================
pause
