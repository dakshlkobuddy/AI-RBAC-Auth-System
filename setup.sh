#!/bin/bash
# Quick Setup Script for Email-Based CRM System
# Run this script to automatically setup the entire project

echo "======================================"
echo "Email-Based CRM System - Setup Script"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✓ Node.js detected: $(node --version)"
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    exit 1
fi

echo "✓ PostgreSQL detected"
echo ""

# Navigate to backend
echo "📂 Setting up backend..."
cd backend

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✓ Dependencies installed"
echo ""

# Create .env file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your PostgreSQL credentials"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "🗄️  Setting up database..."
echo "Make sure PostgreSQL is running and you've created the 'email_crm_db' database"
echo "If not, run: psql -U postgres"
echo "           CREATE DATABASE email_crm_db;"
echo "           \q"
echo ""
read -p "Press Enter when ready to run migrations..."

# Run migrations
node migrations/run.js

if [ $? -ne 0 ]; then
    echo "❌ Migration failed"
    exit 1
fi

echo "✓ Database tables created"
echo ""

# Seed sample data
echo "📊 Seeding sample data..."
node migrations/sample-data.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed data"
    exit 1
fi

echo "✓ Sample data seeded"
echo ""

# Navigate back
cd ..

echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Start backend server:"
echo "   cd backend && npm start"
echo ""
echo "2. In a new terminal, start frontend:"
echo "   cd frontend && http-server -p 3000"
echo "   (or: python -m http.server 3000)"
echo ""
echo "3. Open browser and go to: http://localhost:3000"
echo ""
echo "Test credentials:"
echo "  Admin:     admin@company.com / admin123"
echo "  Marketing: marketing@company.com / marketing123"
echo "  Support:   support@company.com / support123"
echo ""
echo "Documentation:"
echo "  - Full setup: SETUP.md"
echo "  - Quick start: QUICK_START.md"
echo "  - API docs: backend/API_DOCUMENTATION.md"
echo ""
