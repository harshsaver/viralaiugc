# Manual User Setup & Video Generation Guide

## 1. Manual User Setup (No Auth)

### Step 1: Create User in Supabase Auth
1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** → **Create new user**
4. Enter any email (e.g., `demo@example.com`)
5. Set a password
6. Copy the generated **User UID** (looks like: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### Step 2: Update the Code
Replace the hardcoded user ID in `frontend/src/components/ContentGenerator.tsx`:
```javascript
// Line ~107
const HARDCODED_USER_ID = "YOUR-USER-UID-HERE"; // Replace with your actual user ID
```

### Step 3: Verify Profile Exists
The user profile should be automatically created via the database trigger. Check:
1. Go to **Table Editor** → **profiles**
2. Confirm your user ID exists there
3. If not, manually insert a row with your user ID

## 2. Video Generation - Backend Requirements

### ❌ What Vercel CANNOT Do
- **Cannot run Remotion** (video rendering library)
- **Cannot process videos** (needs FFmpeg)
- **Serverless functions timeout** after 10-60 seconds
- Video rendering takes 5-10 minutes

### ✅ Your Options for Video Rendering

#### Option 1: Local Development (Free)
```bash
# On your computer
cd backend
npm start
# Keep running while generating videos
```
**Pros**: Free, full control  
**Cons**: Computer must be on, not scalable

#### Option 2: VPS/Cloud Server ($5-20/month)
**Recommended Services:**
- **DigitalOcean Droplet** ($6/month)
- **AWS EC2 t3.small** (~$15/month)
- **Linode/Vultr** ($5-10/month)

**Setup on VPS:**
```bash
# Install Node.js and FFmpeg
sudo apt update
sudo apt install nodejs npm ffmpeg -y

# Clone and setup
git clone <your-repo>
cd backend
npm install

# Create .env file
nano .env
# Add your Supabase credentials

# Run with PM2 (keeps running)
npm install -g pm2
pm2 start index.js
pm2 save
pm2 startup
```

#### Option 3: Render.com Background Workers
- Deploy backend as a **Background Worker**
- Supports long-running tasks
- ~$7/month for basic plan

#### Option 4: Railway.app
- Easy deployment
- Good for Node.js apps
- ~$5/month

## 3. How It Works

```
User clicks "Generate" → Saves to Supabase → Backend polls DB → Renders video → Uploads to Supabase
```

## 4. Quick Setup for Testing

### Without Backend (Limited):
- ✅ Can save video requests to database
- ✅ Can use all UI features
- ❌ Videos won't actually render
- ❌ Status stays "pending" forever

### With Backend:
1. Start backend: `cd backend && npm start`
2. Generate video in frontend
3. Backend automatically:
   - Detects new video request
   - Renders with Remotion
   - Uploads to Supabase storage
   - Updates status to "completed"

## 5. Production Recommendation

For production, use a VPS with:
- 2GB RAM minimum
- 2 CPU cores
- Ubuntu 20.04+
- Node.js 18+
- FFmpeg installed

This gives you:
- Always-on video rendering
- No local computer needed
- Scalable solution
- ~$10/month cost 