#!/bin/bash

# Deployment script for Hostinger VPS

echo "Starting deployment..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend_py
pip install -r requirements.txt
cd ..

# Copy files to web directory
echo "Copying files..."
sudo cp -r frontend/dist/* /var/www/html/
sudo mkdir -p /var/www/html/api
sudo cp -r backend_py/* /var/www/html/api/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/

# Start backend service
echo "Starting backend service..."
cd /var/www/html/api
python main.py &

echo "Deployment complete!"