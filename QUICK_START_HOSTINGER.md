# Quick Start: Hostinger Deployment

## 🚀 Quick Reference

### MongoDB Atlas (Free)
1. Sign up: https://www.mongodb.com/cloud/atlas
2. Create cluster (M0 free tier)
3. Create user `arkedia_user` with strong password
4. Copy connection string: `mongodb+srv://arkedia_user:PASSWORD@cluster.xxxxx.mongodb.net/booking_platform?retryWrites=true&w=majority`

### Local Preparation (Windows)
```bash
# Run preparation script
prepare-deploy.bat

# Or manually:
cd client
npm run build

cd ../server
npm install --production
```

### Files to Upload to Hostinger

**Backend** (`/server` folder):
- `src/` directory
- `package.json`
- `package-lock.json`
- `.env` (with MongoDB connection & production secrets)

**Frontend** (built `client/dist/`):
- All contents of `dist/` folder
- `.htaccess` file (use `.htaccess-frontend` as template)

### Hostinger SSH Commands

```bash
# Navigate to backend
cd public_html/api
npm install --production

# Install PM2 globally
npm install -g pm2

# Start backend
pm2 start src/index.js --name "booking-api"
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs booking-api
```

### Key Environment Variables

**Backend `.env`:**
```
PORT=5000
MONGO_URI=mongodb+srv://arkedia_user:YOUR_PASSWORD@...
JWT_SECRET=LONG_RANDOM_STRING_32_CHARS_MIN
JWT_REFRESH_SECRET=LONG_RANDOM_STRING_32_CHARS_MIN
CLIENT_ORIGIN=https://yourdomain.com
```

**Frontend `client/.env` (before build):**
```
VITE_API_URL=https://yourdomain.com/api
```

### Testing Checklist
- [ ] Backend API responds: `curl https://yourdomain.com/api`
- [ ] Frontend loads at: https://yourdomain.com
- [ ] Login works: super@arkedia.com / Password123!
- [ ] Check backend logs: `pm2 logs booking-api`

### Demo Credentials (after seeding)
- **Super Admin**: super@arkedia.com / Password123!
- **Admin**: admin@arkedia.com / Password123!
- **Hotel**: hotel@arkedia.com / Password123!
- **Restaurant**: restaurant@arkedia.com / Password123!
- **Activity**: activity@arkedia.com / Password123!

### Important Links
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md` for full instructions
- **Hostinger Help**: https://support.hostinger.com/
- **MongoDB Docs**: https://docs.mongodb.com/
- **PM2 Docs**: https://pm2.keymetrics.io/

---

## Timeline

**Typical deployment: 30-45 minutes**

1. MongoDB Atlas setup: 5-10 min
2. Frontend build: 2-3 min
3. Upload to Hostinger: 5-10 min
4. Backend setup on server: 10-15 min
5. Testing & debugging: 5-10 min

---

## Common Issues & Solutions

### ❌ Frontend shows blank page
**Solution:**
- Check browser console (F12) for errors
- Verify `.htaccess` is in the right folder
- Ensure `VITE_API_URL` points to correct backend

### ❌ Backend returns 404
**Solution:**
- Check PM2 status: `pm2 status`
- View logs: `pm2 logs booking-api`
- Verify Node.js is installed: `node -v`

### ❌ MongoDB connection fails
**Solution:**
- Check credentials in `.env`
- Verify IP whitelist in MongoDB Atlas (allow 0.0.0.0/0)
- Test locally first with same connection string

### ❌ CORS errors in console
**Solution:**
- Verify `CLIENT_ORIGIN` in backend matches frontend URL exactly
- Include `https://` not just domain
- Restart backend: `pm2 restart booking-api`

---

## Security Reminders ⚠️

- ✓ Never commit `.env` to git
- ✓ Use strong JWT secrets (32+ characters)
- ✓ Enable HTTPS/SSL (Hostinger provides free)
- ✓ Add `.env` to `.gitignore`
- ✓ Restrict MongoDB IP whitelist if possible
- ✓ Change JWT secrets before production
- ✓ Monitor logs regularly: `pm2 logs`

---

## Next Actions

1. **Read** `DEPLOYMENT_GUIDE.md` for detailed steps
2. **Run** `prepare-deploy.bat` to build frontend
3. **Set up** MongoDB Atlas account
4. **Follow** Hostinger upload instructions in guide
5. **Test** deployment using checklist

Good luck! 🚀
