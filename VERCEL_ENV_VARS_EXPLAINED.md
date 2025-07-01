# Vercel Environment Variables Explained

## Why Can't I Use `OPEN_AI_API` Directly in My React Code?

### The Short Answer
Vercel env vars (`OPEN_AI_API`) are **server-side only**. To use them in React (client-side), you need:
- `VITE_` prefix for Vite projects
- `NEXT_PUBLIC_` prefix for Next.js projects
- OR use a serverless function

## Three Ways to Use API Keys in Vercel

### Option 1: Vercel Serverless Functions (Recommended) ✅
```javascript
// frontend/api/generate-hooks.js
export default async function handler(req, res) {
  const apiKey = process.env.OPEN_AI_API; // ✅ Works without prefix!
  // Your API logic here
}
```

Then in React:
```javascript
// No API key needed in React!
const response = await fetch('/api/generate-hooks', {
  method: 'POST',
  body: JSON.stringify({ product })
});
```

### Option 2: Client-Side with VITE_ Prefix ⚠️
```javascript
// In React component
const apiKey = import.meta.env.VITE_OPEN_AI_API; // ⚠️ Exposed to browser!
```

### Option 3: External Backend Server ✅
```javascript
// Your separate backend (like you have now)
const apiKey = process.env.OPENAI_API_KEY; // ✅ Secure
```

## Why Your Other Project Works

Your other React + Vite project on Vercel likely has:

1. **A `/api` folder with serverless functions**
   ```
   frontend/
   ├── src/
   ├── api/
   │   └── generate-hooks.js  ← This runs on Vercel's servers
   └── package.json
   ```

2. **The React code calls the API route**
   ```javascript
   // Calls YOUR API, not OpenAI directly
   fetch('/api/generate-hooks')  // No API key needed here!
   ```

## Which Option Should You Choose?

| Option | Security | Complexity | Best For |
|--------|----------|------------|----------|
| Vercel Functions | ✅ Secure | Easy | Most Vercel projects |
| VITE_ prefix | ❌ Exposed | Easiest | Prototypes only |
| External Backend | ✅ Secure | Complex | Advanced needs |

## Quick Migration to Vercel Functions

1. Create `frontend/api/generate-hooks.js` (already created for you)
2. Update your React service:
   ```javascript
   // Change from:
   fetch('http://localhost:3000/generate-hooks')
   // To:
   fetch('/api/generate-hooks')
   ```
3. Add `OPEN_AI_API` (without VITE_) to Vercel env vars
4. Deploy!

No local backend server needed anymore! 🎉 