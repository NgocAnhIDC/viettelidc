#!/bin/bash

# KPI TT Cloud - Setup Script
# This script sets up the development environment for User & Role Data Management

echo "🚀 KPI TT Cloud - User & Role Data Management Setup"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p api/logs
mkdir -p database/backups
mkdir -p nginx

# Install API dependencies
echo "📦 Installing API dependencies..."
cd api
npm install
cd ..

# Create environment file
echo "⚙️ Creating environment configuration..."
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=kpi_user
DB_PASSWORD=kpi_password
DB_NAME=users_db

# JWT Configuration
JWT_SECRET=kpi-tt-cloud-jwt-secret-key-2025

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# API Configuration
API_PORT=3001
NODE_ENV=development
EOF

# Create nginx configuration
echo "🌐 Creating nginx configuration..."
cat > nginx/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    upstream api {
        server user-api:3001;
    }

    server {
        listen 80;
        server_name localhost;

        # Serve static files
        location / {
            root /var/www/html;
            index index.html;
            try_files \$uri \$uri/ /index.html;
        }

        # Proxy API requests
        location /api/ {
            proxy_pass http://api;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
        }
    }
}
EOF

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for MySQL to be ready
echo "⏳ Waiting for MySQL to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

# Test API health
echo "🏥 Testing API health..."
sleep 10
curl -f http://localhost:3001/api/health || echo "⚠️ API health check failed"

echo ""
echo "✅ Setup completed successfully!"
echo ""
echo "🌐 Services are now running:"
echo "   - Web Application: http://localhost"
echo "   - User Management API: http://localhost:3001"
echo "   - MySQL Database: localhost:3306"
echo "   - Redis Cache: localhost:6379"
echo ""
echo "📋 Demo Accounts:"
echo "   - admin/admin123 (Admin)"
echo "   - cpo/cpo123 (CPO)"
echo "   - pm1/pm123 (PM)"
echo "   - po1/po123 (PO)"
echo "   - dev1/dev123 (Dev)"
echo ""
echo "🛠️ Useful commands:"
echo "   - Stop services: docker-compose down"
echo "   - View logs: docker-compose logs -f"
echo "   - Restart API: docker-compose restart user-api"
echo "   - Access MySQL: docker-compose exec mysql mysql -u kpi_user -p users_db"
echo ""
echo "📖 For more information, see User-Management-Setup-Guide.md"
EOF
