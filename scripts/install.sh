#!/bin/bash

# zkML Bounty Review System - Install & Run Script
# 
# This script automates the setup and launch of the PoC
# Run this after cloning the repository

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║     🔐 zkML Bounty Review System - Setup & Launch            ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_step() {
    echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${YELLOW}$1${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Check Node.js version
print_step "Checking Prerequisites"

if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install Node.js 18+ first."
    echo "  Download from: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js $NODE_VERSION found"

if ! command -v npm &> /dev/null; then
    print_error "npm not found."
    exit 1
fi

NPM_VERSION=$(npm --version)
print_status "npm $NPM_VERSION found"

# Install dependencies
print_step "Installing Dependencies"

if [ -d "node_modules" ]; then
    print_info "node_modules already exists. Skipping npm install..."
else
    print_info "Running npm install..."
    npm install || {
        print_error "Failed to install dependencies"
        exit 1
    }
fi

print_status "Dependencies installed"

# Setup environment
print_step "Setting Up Environment"

if [ -f ".env.local" ]; then
    print_info ".env.local already exists"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        print_status "Created .env.local from .env.example"
    else
        print_error ".env.example not found"
    fi
fi

# Build project
print_step "Building Project"

npm run build || {
    print_error "Build failed"
    exit 1
}

print_status "Project built successfully"

# Display next steps
print_step "🚀 Setup Complete!"

echo -e "${GREEN}Your zkML Bounty Review System is ready!${NC}\n"

echo "📊 Available Commands:"
echo "  npm run dev      - Start development server"
echo "  npm run build    - Build for production"
echo "  npm start        - Start production server"
echo "  npm run lint     - Run ESLint"
echo ""

echo "🔗 Quick Links:"
echo "  Web Interface:     http://localhost:3000"
echo "  Documentation:     ./ZKML_POC_DOCUMENTATION.md"
echo "  Quick Start:       ./QUICKSTART.md"
echo "  Testing Guide:     ./TESTING_GUIDE.md"
echo ""

echo "🎯 Next Steps:"
echo "  1. Run: npm run dev"
echo "  2. Open: http://localhost:3000"
echo "  3. Submit a bounty for evaluation"
echo "  4. View the zero-knowledge proof"
echo ""

echo "💡 Try the Demo:"
echo "  npx ts-node scripts/demo.ts"
echo ""

read -p "Would you like to start the development server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Starting Development Server"
    echo "Server will be available at http://localhost:3000"
    echo "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
else
    echo "Setup complete! Run 'npm run dev' when you're ready to start."
fi
