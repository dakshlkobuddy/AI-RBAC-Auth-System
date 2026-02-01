@echo off
REM Quick Setup Script for Email-Based CRM System
REM Windows Batch Version

color 0A
title Email-Based CRM System - Setup

echo.
echo ======================================
echo Email-Based CRM System - Setup Script
echo ======================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js detected: %NODE_VERSION%
echo.

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed.
    pause
    exit /b 1
)

echo ✓ npm is available
echo.

REM Navigate to backend
echo 📂 Setting up backend...
cd backend

REM Install dependencies
echo 📦 Installing backend dependencies...
echo This may take a few minutes...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✓ Dependencies installed
echo.

REM Create .env file
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env >nul
    echo ⚠️  IMPORTANT: Update .env with your PostgreSQL credentials!
    echo.
    echo Open 'backend\.env' and update:
    echo   - DB_PASSWORD: your PostgreSQL password
    echo.
) else (
    echo ✓ .env file already exists
)

echo.
echo 🗄️  Database Setup
echo ================
echo.
echo Before continuing, ensure PostgreSQL is running and the database exists.
echo.
echo To create the database, open Command Prompt/PowerShell and run:
echo   psql -U postgres
echo   CREATE DATABASE email_crm_db;
echo   \q
echo.
pause /prompt "Press any key when ready to run migrations..."

REM Run migrations
echo.
echo Running database migrations...
node migrations/run.js

if errorlevel 1 (
    echo ❌ Migration failed
    echo Check your .env file and PostgreSQL connection
    pause
    exit /b 1
)

echo ✓ Database tables created
echo.

REM Seed sample data
echo 📊 Seeding sample data...
node migrations/sample-data.js

if errorlevel 1 (
    echo ❌ Failed to seed data
    pause
    exit /b 1
)

echo ✓ Sample data seeded
echo.

REM Navigate back
cd ..

echo.
echo ======================================
echo ✅ Setup Complete!
echo ======================================
echo.
echo 📋 Next Steps:
echo.
echo 1. Start Backend Server
echo    Open Command Prompt/PowerShell and run:
echo    cd backend
echo    npm start
echo.
echo 2. Start Frontend Server
echo    Open another Command Prompt/PowerShell and run:
echo    cd frontend
echo    npx http-server -p 3000
echo.
echo 3. Open Browser
echo    Go to: http://localhost:3000
echo.
echo 👤 Test Credentials:
echo    Admin:     admin@company.com / admin123
echo    Marketing: marketing@company.com / marketing123
echo    Support:   support@company.com / support123
echo.
echo 📚 Documentation:
echo    - SETUP.md (detailed setup guide)
echo    - QUICK_START.md (quick reference)
echo    - README.md (full documentation)
echo    - backend/API_DOCUMENTATION.md (API reference)
echo.
pause /prompt "Press any key to exit..."
