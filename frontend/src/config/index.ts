// Supabase configuration
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Application configuration
export const APP_NAME = "Viral AI UGC";
export const BASE_URL = import.meta.env.VITE_BASE_URL;

export const API_CONFIG = {
  // For AI features (OpenAI)
  AI_ENDPOINT: process.env.NODE_ENV === 'production' 
    ? '/api/generate-hooks'  // Vercel Function in production
    : 'http://localhost:3000/generate-hooks', // Local backend in development
  
  // For video rendering (always needs the backend server)
  VIDEO_RENDER_ENDPOINT: 'http://localhost:3000/render-video'
};
