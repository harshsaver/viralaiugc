#!/bin/bash

echo "🔧 Setting up ReelPost for local development..."

# Check if .env exists in backend, if not create from example
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo "⚠️  Please edit backend/.env with your Supabase credentials:"
        echo "   - SUPABASE_URL"
        echo "   - SUPABASE_KEY (service role key)"
        echo ""
        read -p "Press Enter after updating .env file to continue..."
    else
        echo "❌ No .env.example found. Creating basic .env..."
        cat > backend/.env << EOF
# App
PORT=3000
RENDER_CONCURRENCY=5

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-service-key
SUPABASE_STORAGE_BUCKET=generated-videos

# OpenAI (optional - only for local hook generation)
# OPENAI_API_KEY=your-openai-api-key
EOF
        echo "⚠️  Created backend/.env - Please update with your Supabase credentials!"
        read -p "Press Enter after updating .env file to continue..."
    fi
else
    echo "✅ Backend .env file already exists"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install
cd ..

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd frontend && npm install
cd ..

echo ""
echo "✅ Setup complete! You can now run:"
echo "   ./start-local.sh"
echo ""
echo "📝 Make sure you have:"
echo "   1. Updated backend/.env with your Supabase credentials"
echo "   2. FFmpeg installed (brew install ffmpeg)"
echo "   3. The hardcoded user ID in ContentGenerator.tsx matches your Supabase user" 