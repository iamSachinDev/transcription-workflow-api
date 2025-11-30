#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Transcription Workflow API - Development Setup"
echo "=================================================="
echo ""

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check if MongoDB is installed
if ! command -v mongod &> /dev/null; then
    print_error "MongoDB is not installed. Please install MongoDB 6.8+ from https://www.mongodb.com/try/download/community"
    exit 1
fi
print_success "MongoDB detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi
print_success "npm $(npm -v) detected"

echo ""
echo "📥 Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

echo ""
echo "⚙️  Setting up environment configuration..."
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_info "Please update .env with your configuration (MongoDB URI, Azure credentials, etc.)"
    else
        print_error ".env.example not found"
        exit 1
    fi
else
    print_info ".env file already exists, skipping..."
fi

echo ""
echo "🗄️  Checking MongoDB connection..."
# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    print_success "MongoDB is running"
else
    print_info "MongoDB is not running. Starting MongoDB..."
    # Try to start MongoDB (this might need adjustment based on OS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        if command -v brew &> /dev/null; then
            brew services start mongodb-community &> /dev/null
            if [ $? -eq 0 ]; then
                print_success "MongoDB started via Homebrew"
            else
                print_info "Please start MongoDB manually: brew services start mongodb-community"
            fi
        else
            print_info "Please start MongoDB manually: mongod"
        fi
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo systemctl start mongod &> /dev/null
        if [ $? -eq 0 ]; then
            print_success "MongoDB started via systemctl"
        else
            print_info "Please start MongoDB manually: sudo systemctl start mongod"
        fi
    else
        print_info "Please start MongoDB manually: mongod"
    fi
fi

echo ""
echo "🧪 Running tests..."
npm test
if [ $? -eq 0 ]; then
    print_success "All tests passed!"
else
    print_error "Some tests failed. Please check the output above."
fi

echo ""
echo "📚 Generating Swagger documentation..."
npm run swagger-gen
if [ $? -eq 0 ]; then
    print_success "Swagger documentation generated"
else
    print_error "Failed to generate Swagger documentation"
fi

echo ""
echo "=================================================="
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "📝 Next steps:"
echo "   1. Update .env with your configuration"
echo "   2. Start development server: npm run dev"
echo "   3. Visit http://localhost:7777/api-docs for API documentation"
echo ""
echo "🔧 Available commands:"
echo "   npm run dev       - Start development server with hot reload"
echo "   npm test          - Run test suite"
echo "   npm run build     - Build for production"
echo "   npm start         - Start production server"
echo "   npm run lint      - Run linter"
echo "   npm run lint:fix  - Fix linting issues"
echo ""
print_success "Happy coding! 🚀"
