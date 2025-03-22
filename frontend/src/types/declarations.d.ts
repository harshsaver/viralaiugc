// This file contains type declarations for modules that TypeScript can't find

declare module 'react';
declare module 'react/jsx-runtime';
declare module 'lucide-react';
declare module 'sonner';
declare module 'react-router-dom';

// Add NodeJS namespace if it's missing
declare namespace NodeJS {
  interface Timeout {}
}
