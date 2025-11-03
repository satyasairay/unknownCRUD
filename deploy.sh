#!/bin/bash

# Complete redeployment script - removes everything and redeploys from scratch
set -e

echo "🚀 Starting complete redeployment..."

# Stop services
echo "⏹️ Stopping services..."
sudo systemctl stop nginx || true
sudo systemctl stop unknowncrud || true
sudo pkill -f "python.*main.py" || true
sudo pkill -f "uvicorn" || true

# Clean up existing deployment
echo "🧹 Cleaning up existing files..."
sudo rm -rf /var/www/html/*

# Create fresh directories
echo "📁 Creating directories..."
sudo mkdir -p /var/www/html
sudo mkdir -p /var/www/html/api
sudo mkdir -p /var/www/html/data/library

# Build frontend
echo "🏗️ Building frontend..."
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/html/
cd ..

# Setup backend
echo "⚙️ Setting up backend..."
cd backend_py
sudo cp -r * /var/www/html/api/
cd /var/www/html/api
sudo python3 -m venv env
sudo env/bin/pip install -r requirements.txt
cd -

# Copy data
echo "📊 Copying data..."
sudo cp -r data/library/* /var/www/html/data/library/

# Set permissions
echo "🔐 Setting permissions..."
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Copy nginx config
echo "🌐 Configuring nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/default

# Setup systemd service
echo "⚙️ Setting up systemd service..."
sudo cp systemd.service /etc/systemd/system/unknowncrud.service
sudo systemctl daemon-reload

# Test nginx config
sudo nginx -t

# Start services
echo "▶️ Starting services..."
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl start unknowncrud
sudo systemctl enable unknowncrud

echo "✅ Redeployment complete!"
echo "🔗 Testing URLs:"
sleep 3
curl -I https://prabhati.org/ || echo "Frontend not responding"
curl -I https://prabhati.org/sme || echo "SME route not responding"
curl -I https://prabhati.org/api/health || echo "Backend may still be starting..."

echo "📋 Services status:"
sudo systemctl status nginx --no-pager -l
sudo systemctl status unknowncrud --no-pager -l