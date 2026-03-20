#!/bin/bash

# Production Deployment Script for Saraswati Classes Backend

set -e

echo "🚀 Starting production deployment..."

# Configuration
APP_NAME="saraswati-classes-api"
DOCKER_IMAGE="saraswati-classes-api:latest"
CONTAINER_NAME="saraswati-api-prod"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}!${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is not recommended for production."
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create deployment directory
DEPLOY_DIR="/opt/saraswati-classes"
sudo mkdir -p $DEPLOY_DIR
sudo chown $USER:$USER $DEPLOY_DIR

# Copy application files
print_status "Copying application files..."
cp -r backend/* $DEPLOY_DIR/
cd $DEPLOY_DIR

# Create environment file
if [ ! -f ".env" ]; then
    print_warning "Creating .env file from example..."
    cp .env.example .env
    print_warning "Please configure your .env file with production values!"
    read -p "Press Enter to continue after configuring .env..."
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Pull latest images
print_status "Pulling latest images..."
docker-compose pull

# Build and start services
print_status "Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "Services are running successfully!"
else
    print_error "Some services failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T api npx prisma migrate deploy

# Seed database if needed
print_status "Seeding database..."
docker-compose exec -T api npm run prisma:seed

# Setup log rotation
print_status "Setting up log rotation..."
sudo tee /etc/logrotate.d/saraswati-classes > /dev/null <<EOF
$DEPLOY_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
}
EOF

# Setup systemd service (optional)
read -p "Setup systemd service for auto-restart? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setting up systemd service..."
    sudo tee /etc/systemd/system/saraswati-classes.service > /dev/null <<EOF
[Unit]
Description=Saraswati Classes API
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$DEPLOY_DIR
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF
    
    sudo systemctl enable saraswati-classes.service
    sudo systemctl start saraswati-classes.service
fi

# Display status
print_status "Deployment completed!"
echo
echo "Application URL: http://$(hostname -I | awk '{print $1}'):3000"
echo "API Docs: http://$(hostname -I | awk '{print $1}'):3000/api-docs"
echo "Health Check: http://$(hostname -I | awk '{print $1}'):3000/health"
echo
print_status "Useful commands:"
echo "  Check logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart services: docker-compose restart"
echo "  View status: docker-compose ps"