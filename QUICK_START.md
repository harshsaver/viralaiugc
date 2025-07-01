# Quick Start Guide - Local Development

## ✅ You've Already Done:
1. Created user in Supabase: `e7f0ed80-850e-438b-90f8-0d2d8d995939`
2. Updated code with hardcoded user ID
3. Backend dependencies installed

## 🔧 What You Need to Do Now:

### 1. Update Backend Environment Variables
Edit `backend/.env` file with your Supabase credentials:

```bash
# Open in your editor
nano backend/.env
# or
code backend/.env
```

Replace these values:
```env
SUPABASE_URL=https://YOUR-PROJECT.supabase.co
SUPABASE_KEY=YOUR-SERVICE-ROLE-KEY  # From Project Settings > API > service_role
SUPABASE_STORAGE_BUCKET=generated-videos
```

### 2. Run the Application

```bash
# From project root
./start-local.sh
```

This will start:
- Backend on http://localhost:3000
- Frontend on http://localhost:8080 (or 5173)

### 3. Test Video Generation

1. Open http://localhost:8080 in browser
2. Select an AI avatar
3. Enter a hook text
4. Select audio (optional)
5. Click "Generate UGC"
6. Check Supabase dashboard → Table Editor → `generated_videos` 
7. Video will process and upload automatically!

## 🚨 Troubleshooting

**Backend crashes on start?**
- Check `backend/.env` has correct Supabase credentials
- Make sure all values are filled in

**Frontend on different port?**
- Port 5173 might be in use
- Check terminal output for actual URL

**Video stays "pending"?**
- Make sure backend is running
- Check backend terminal for errors
- Verify Supabase credentials are correct

## 📝 Need Your Supabase Credentials?

1. Go to your Supabase project
2. Settings → API
3. Copy:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **service_role key**: `eyJhbGciOiJ...` (the longer one)

That's it! Your app should now work locally without authentication! 🚀 