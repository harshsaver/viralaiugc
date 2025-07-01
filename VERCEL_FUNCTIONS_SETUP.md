# Using Vercel Serverless Functions in This Project

## ✅ YES, You Can Use Vercel Functions!

This project uses a **hybrid approach**:
- **Vercel Functions** for OpenAI API calls (lightweight, serverless)
- **Separate Backend** for video rendering (heavy processing with Remotion)

## Current Setup

### 1. OpenAI Hook Generation (Can Use Vercel Functions)
```
frontend/api/generate-hooks.js  ← Already created for you!
```

### 2. Video Rendering (Requires Separate Backend)
```
backend/api/server.js  ← Must keep running for video features
```

## How to Deploy with Vercel Functions

### Step 1: Add Environment Variable to Vercel
```
OPEN_AI_API=sk-your-api-key-here  (No VITE_ prefix needed!)
```

### Step 2: Deploy to Vercel
The frontend will automatically:
- Use `/api/generate-hooks` in production (Vercel Function)
- Fall back to `localhost:3000` in development

### Step 3: For Video Features
Users still need to run the backend locally:
```bash
cd backend
npm start
```

## Why This Hybrid Approach?

| Feature | Vercel Functions | Separate Backend | Why? |
|---------|-----------------|------------------|------|
| AI Hooks | ✅ Perfect | ❌ Overkill | Quick API calls, stateless |
| Video Rendering | ❌ Can't | ✅ Required | Needs Remotion, FFmpeg, long processing |
| File Storage | ✅ Can work | ✅ Also works | Depends on your needs |

## Code Already Set Up For You

1. **Vercel Function**: `frontend/api/generate-hooks.js`
2. **Smart Service**: `frontend/src/services/openaiService.ts`
   - Tries Vercel Function first (production)
   - Falls back to local backend (development)
3. **Config**: `frontend/src/config/index.ts`

## No Changes Needed!

Just:
1. Add `OPEN_AI_API` to Vercel env vars
2. Deploy
3. It works! 🎉

The app will use Vercel Functions for AI features automatically when deployed! 