# Arkedia Booking Platform - Hostinger Deployment Guide

This guide covers deploying your MERN booking platform to Hostinger Cloud Hosting with MongoDB Atlas.

## Prerequisites

- Hostinger Cloud Hosting account (already created ✓)
- A domain name (you'll need this for production)
- MongoDB Atlas account (free tier available)
- Terminal/SSH access to your server

---

## Phase 1: Set Up MongoDB Atlas

MongoDB Atlas provides a free tier perfect for getting started.

1. **Create MongoDB Atlas Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up and create a free account
   - Create a new project called "Arkedia"

2. **Create a Cluster**
   - Select "Create Deployment"
   - Choose "Free Tier" (M0 - perfectly fine for testing)
   - Select your region (choose one closest to your users)
   - Name it: `arkedia-cluster`
   - Click "Create Deployment"

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Username: `arkedia_user`
   - Password: Create a strong password (save it!)
   - Click "Add User"

4. **Get Connection String**
   - Go to "Database" → Your cluster
   - Click "Connect"
   - Choose "Drivers"
   - Copy the connection string (looks like: `mongodb+srv://arkedia_user:PASSWORD@arkedia-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - Replace `PASSWORD` with your actual password
   - You'll use this for `MONGO_URI` later

---

## Phase 2: Build Frontend for Production

1. **Build the React App**
   ```bash
   cd client
   npm run build
   ```
   This creates a `dist/` folder with static HTML/CSS/JS files.

2. **Verify the Build**
   ```bash
   npm run preview
   ```
   Test locally at `http://localhost:5173` to ensure it works.

---

## Phase 3: Prepare Backend Environment Variables

1. **Edit Backend .env for Production**
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://arkedia_user:YOUR_PASSWORD@arkedia-cluster.xxxxx.mongodb.net/booking_platform?retryWrites=true&w=majority
   JWT_SECRET=your-very-long-random-secret-key-change-this
   JWT_REFRESH_SECRET=your-very-long-random-refresh-secret-change-this
   ACCESS_TOKEN_EXPIRES=15m
   REFRESH_TOKEN_EXPIRES=7d
   CLIENT_ORIGIN=https://yourdomain.com
   ```

   **Important Security Notes:**
   - Generate strong random secrets for JWT keys (use: https://passwordsgenerator.net/)
   - Replace `YOUR_PASSWORD` with actual MongoDB password
   - Replace `yourdomain.com` with your actual domain
   - Never commit `.env` to git

2. **Create Production .env Example**
   - Keep `.env.example` for reference (no secrets)
   - Only upload actual `.env` via Hostinger (not git)

---

## Phase 4: Upload Backend to Hostinger

### Option A: Using Hostinger File Manager (Easiest)

1. **Login to Hostinger Dashboard**
   - Go to hostinger.com and login

2. **Access File Manager**
   - Find your Cloud Hosting instance
   - Click "File Manager" or "Web Hosting"
   - Navigate to `public_html` or `www` directory

3. **Upload Backend Files**
   - Create a folder: `api` or `backend`
   - Upload the following from your `server/` folder:
     - `src/` (entire folder)
     - `package.json`
     - `package-lock.json`
     - `.env` (separately, with production values)

4. **Install Dependencies on Server**
   - Open Terminal/SSH in Hostinger
   - Navigate to your backend folder:
     ```bash
     cd public_html/api
     npm install --production
     ```
   - This installs only production dependencies (faster)

### Option B: Using Git (Recommended for Updates)

1. **Create Git Repository**
   - Push your code to GitHub (without .env)
   - Make sure `.env` is in `.gitignore`

2. **Clone on Hostinger**
   ```bash
   cd public_html
   git clone https://github.com/yourusername/arkedia.git
   cd arkedia/server
   npm install --production
   ```

3. **Add .env file**
   - Create `.env` file on server with production values
   - Use Hostinger File Manager or SSH

---

## Phase 5: Upload Frontend to Hostinger

### Method 1: Upload Built Files Directly

1. **Using File Manager**
   - Create a folder: `client` in `public_html`
   - Upload entire `dist/` folder contents to `public_html/client/`
   - This includes all HTML, CSS, JS, assets

2. **Configure Web Server**
   - Create `.htaccess` in `public_html/client/`:
     ```apache
     <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /
       RewriteRule ^index\.html$ - [L]
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       RewriteRule . /index.html [L]
     </IfModule>
     ```
     This enables React Router to work properly on shared hosting.

### Method 2: Using Sub-domain (Better Practice)

1. **Create Subdomain in Hostinger**
   - Go to Hostinger Dashboard
   - Find "Subdomains"
   - Create: `app.yourdomain.com` or `client.yourdomain.com`
   - Point to a new folder (e.g., `public_html/app`)

2. **Upload Frontend Files**
   - Upload `dist/` contents to that subfolder
   - Add `.htaccess` same as above

---

## Phase 6: Start Backend Application

### Using Node Process Manager (Recommended)

1. **Install PM2 on Server**
   ```bash
   npm install -g pm2
   ```

2. **Start Backend with PM2**
   ```bash
   cd public_html/api
   pm2 start src/index.js --name "booking-api"
   pm2 save
   pm2 startup
   ```

3. **Verify it's Running**
   ```bash
   pm2 status
   pm2 logs booking-api
   ```

### Using Built-in Hostinger Tools

- Some Hostinger Cloud plans include application managers
- Check Hostinger Dashboard for "Node.js" or "Application Manager"
- Follow their specific setup instructions

---

## Phase 7: Configure Domain & SSL

1. **Add Domain to Hostinger**
   - Go to Hostinger Dashboard
   - Add your domain (if not already added)
   - Update DNS records to point to Hostinger

2. **Enable SSL Certificate**
   - Hostinger provides free SSL via Let's Encrypt
   - Go to "SSL/TLS" in Dashboard
   - Enable "Install SSL"
   - Wait 5-10 minutes for activation

3. **Update CORS in Backend .env**
   ```
   CLIENT_ORIGIN=https://yourdomain.com
   ```

4. **Update Frontend API URL**
   - In `client/.env`:
     ```
     VITE_API_URL=https://yourdomain.com/api
     ```
   - Rebuild frontend:
     ```bash
     cd client
     npm run build
     ```
   - Re-upload dist/ files

---

## Phase 8: Test Deployment

### Backend Tests

1. **Test API Endpoint**
   ```bash
   curl https://yourdomain.com/api/auth/login
   ```
   Should return error or route info (not 404)

2. **Check Logs**
   ```bash
   pm2 logs booking-api
   ```

### Frontend Tests

1. **Visit Frontend**
   - Go to https://yourdomain.com (or subdomain)
   - Should see login page

2. **Test Login Flow**
   - Try logging in with:
     - Email: `super@arkedia.com`
     - Password: `Password123!`
   - First, seed the database (next step)

### Seed Demo Data

1. **SSH into Server**
   ```bash
   cd public_html/api
   npm run seed
   ```
   This creates test users and roles.

2. **Check MongoDB Atlas**
   - Go to MongoDB Atlas
   - Click "Browse Collections"
   - Verify `users` collection has data

---

## Phase 9: Environment Checklist

### Backend (.env)
- [ ] `PORT=5000`
- [ ] `MONGO_URI=mongodb+srv://...` (with credentials)
- [ ] `JWT_SECRET` (long random string)
- [ ] `JWT_REFRESH_SECRET` (long random string)
- [ ] `CLIENT_ORIGIN=https://yourdomain.com`

### Frontend (.env)
- [ ] `VITE_API_URL=https://yourdomain.com/api`

---

## Troubleshooting

### Frontend shows blank page
- Check browser console (F12) for API errors
- Verify `VITE_API_URL` in frontend .env
- Ensure `.htaccess` is in correct folder
- Check CORS settings in backend

### Backend returns 404
- Verify Node.js process is running: `pm2 status`
- Check logs: `pm2 logs booking-api`
- Verify backend files uploaded correctly
- Check `.env` values match MongoDB connection

### MongoDB connection fails
- Verify connection string includes `/booking_platform` at end
- Check IP whitelist in MongoDB Atlas (add 0.0.0.0/0 for all)
- Test connection locally with same MONGO_URI

### CORS errors
- Verify `CLIENT_ORIGIN` matches frontend domain exactly
- Include `https://` in the URL
- Rebuild and redeploy frontend after changing

---

## Useful Commands

**SSH into Hostinger:**
```bash
ssh username@your-server-ip
```

**Check Node.js processes:**
```bash
pm2 list
pm2 logs
pm2 stop all
pm2 restart booking-api
```

**Check disk space:**
```bash
df -h
```

**View Hostinger logs:**
```bash
tail -f /var/log/apache2/error.log
```

---

## Security Reminders

1. **Never commit .env file** - add to `.gitignore`
2. **Use strong JWT secrets** - at least 32 characters
3. **Enable SSL** - always use HTTPS in production
4. **Whitelist MongoDB IPs** - if possible, restrict to Hostinger IPs
5. **Keep dependencies updated** - run `npm audit` regularly
6. **Set environment variables securely** - use Hostinger's secure storage if available

---

## Next Steps

1. ✓ Set up MongoDB Atlas
2. ✓ Build frontend
3. ✓ Prepare backend .env
4. ✓ Upload files to Hostinger
5. ✓ Install dependencies
6. ✓ Start backend with PM2
7. ✓ Configure domain & SSL
8. ✓ Test everything
9. Monitor logs and performance regularly

---

## Support Resources

- **Hostinger Support**: https://support.hostinger.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **Node.js Hosting**: https://nodejs.org/en/docs/guides/nodejs-web-app/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/

