# Video Generation Authentication Guide

## The Issue

You encountered the error:
```
insert or update on table "generated_videos" violates foreign key constraint "generated_videos_user_id_fkey"
```

## Why This Happens

1. **Database Design**: The `generated_videos` table requires a valid `user_id` that references an existing profile
2. **Authentication Required**: You must be signed in to generate videos
3. **This is By Design**: The app tracks which user generated which video

## The Fix Applied

The code now:
1. Checks if you're authenticated before generating videos
2. Shows a sign-in dialog if you're not authenticated
3. Uses your actual user ID instead of a random UUID

## How Video Generation Works

### With Authentication (Required):
```
User Signs In → Creates Profile → Can Generate Videos
```

### What Happens:
1. Click "Generate UGC"
2. If not signed in → Shows auth dialog
3. Sign in with Google
4. Video is saved with your user ID
5. Backend server renders the video

## Important Notes

- **Sign In Required**: Video generation always requires authentication
- **Backend Still Needed**: The local server must be running for video rendering
- **Carousels Don't Need Auth**: Only video generation requires sign-in

## To Generate Videos:

1. **Sign in** using Google authentication
2. **Start backend server**: `cd backend && npm start`
3. **Create your video** in the app
4. Video will be saved to your account

This authentication requirement ensures:
- Videos are tied to user accounts
- Usage can be tracked
- Credits/limits can be enforced
- Your content is secure 