# Landing Page with Waitlist Setup

## Overview

A new anime-styled, green-themed landing page with waitlist functionality has been added to the project.

## Features

### 🎨 Design
- **Anime-styled**: Playful, vibrant design with floating emoji elements
- **Green theme**: Lush, nature-inspired color palette
- **Glassmorphism**: Semi-transparent card with backdrop blur
- **Responsive**: Different backgrounds for desktop and mobile

### 📱 Responsive Backgrounds
- **Desktop**: `bg1.png` (hidden on mobile)
- **Mobile**: `bg2.png` (hidden on desktop)
- Images located in `frontend/public/`

### ✨ Interactive Elements
- Floating anime elements (🌸, 🎋, ⭐, ✨) with animations
- Hover effects on the main card
- Animated submit button
- Custom spin-slow animation

## Routes

- `/` - New landing page with waitlist
- `/dashboard` - Main application dashboard
- `/old-landing` - Previous landing page (kept for reference)

## Waitlist Implementation

Currently, the waitlist shows a success message without backend integration. To fully implement:

### 1. Create Waitlist Table in Supabase

```sql
CREATE TABLE waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anyone
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT TO anon
  WITH CHECK (true);
```

### 2. Update the Component

Replace the mock implementation in `handleSubmit`:

```typescript
const { error } = await supabase
  .from('waitlist')
  .insert({ email });

if (error) {
  if (error.code === '23505') { // Duplicate email
    toast.error("You're already on the list!");
  } else {
    toast.error("Something went wrong. Please try again.");
  }
} else {
  toast.success("🎉 You're on the list! We'll notify you when we launch.");
  setEmail("");
}
```

## Customization

### Colors
- Primary gradient: `from-green-600 to-emerald-400`
- Button gradient: `from-green-500 to-emerald-400`
- Border accent: `border-green-400/50`

### Animations
- `animate-spin-slow`: 8s rotation
- `animation-delay-2000`: 2s delay
- Standard Tailwind animations: `bounce`, `pulse`

## Testing

1. Run locally: `./start-local.sh`
2. Visit http://localhost:8080
3. Test email submission
4. Navigate to `/dashboard` to access the main app

The landing page creates an engaging first impression while collecting emails for launch! 