# Final Setup Guide - Clean Architecture

## Quick Summary

- **OpenAI API Key**: Only for AI hook generation (Products tab)
- **Video Rendering**: Uses Remotion, no AI or API key needed
- **Two separate backends**: Vercel Functions for AI, Local server for video

## Setup Steps

### 1. For AI Hook Generation (Vercel Functions) ✅

**In Vercel Dashboard:**
```
OPEN_AI_API = sk-your-openai-key-here  ✅ Done!
```

That's it! The `/api/generate-hooks` function will handle AI securely.

### 2. For Video Rendering (Local Backend)

**In `backend/.env`:**
```env
# Video rendering settings
PORT=3000
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
SUPABASE_STORAGE_BUCKET=generated-videos

# NO OpenAI key needed here!
```

**Run the server:**
```bash
cd backend
npm start
```

## What Each Part Does

| Feature | Where It Runs | Needs API Key? |
|---------|---------------|----------------|
| AI Hook Generation | Vercel Function | ✅ Yes (OpenAI) |
| Video Rendering | Local Backend | ❌ No |
| Carousel Creation | Frontend Only | ❌ No |
| File Storage | Supabase | ❌ No |

## Why This Architecture?

1. **Security**: OpenAI key never exposed to browser
2. **Separation**: Each service does one thing
3. **Flexibility**: Can deploy AI features without video rendering
4. **Cost**: Only pay for what you use

## Common Confusion Cleared

❌ **Wrong**: "Video rendering needs OpenAI"  
✅ **Right**: Video rendering only uses Remotion to process videos

❌ **Wrong**: "Everything needs the backend server"  
✅ **Right**: Only video rendering needs the backend server

❌ **Wrong**: "Need VITE_ prefix for all API keys"  
✅ **Right**: Only need prefixes for keys used in frontend code 