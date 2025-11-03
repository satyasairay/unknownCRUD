#!/bin/bash

# Initial VPS setup script for Hostinger
# Run this once on your VPS to prepare for GitHub deployments

echo "Setting up VPS for GitHub deployments..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx python3 python3-pip python3-venv nodejs npm git

# Create web directory
sudo mkdir -p /var/www/html
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Remove default nginx site
sudo rm -f /etc/nginx/sites-enabled/default

# Create data directory
sudo mkdir -p /var/www/html/data/library
sudo chown -R www-data:www-data /var/www/html/data

# Setup firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

echo "VPS setup complete!"
echo "Next steps:"
echo "1. Add your SSH key to GitHub repository secrets as VPS_SSH_KEY"
echo "2. Add your VPS IP as VPS_HOST in GitHub secrets"
echo "3. Add your username as VPS_USERNAME in GitHub secrets"
echo "4. Domain already configured for prabhati.org"
echo "5. Push to main branch to trigger deployment"