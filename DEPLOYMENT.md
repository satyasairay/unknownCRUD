# Deployment Guide - Hostinger VPS via GitHub

## Prerequisites
- Hostinger VPS with Ubuntu/Debian
- GitHub repository
- Domain name pointed to your VPS IP

## Setup Steps

### 1. Initial VPS Setup
```bash
# SSH into your VPS
ssh root@your-vps-ip

# Run the setup script
wget https://raw.githubusercontent.com/your-username/unknownCRUD/main/setup-vps.sh
chmod +x setup-vps.sh
./setup-vps.sh
```

### 2. Configure GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:
- `VPS_HOST`: Your VPS IP address
- `VPS_USERNAME`: Your VPS username (usually `root`)
- `VPS_SSH_KEY`: Your private SSH key content

### 3. Generate SSH Key (if needed)
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -c "your-email@example.com"

# Copy public key to VPS
ssh-copy-id root@your-vps-ip

# Copy private key content to GitHub secrets
cat ~/.ssh/id_rsa
```

### 4. Update Configuration Files
- Replace `your-domain.com` in `nginx.conf` with your actual domain
- Update `VITE_API_BASE` in `frontend/.env.production` with your domain
- Update `ALLOWED_ORIGINS` in `backend_py/app.py` with your domain

### 5. Deploy
```bash
# Push to main branch
git add .
git commit -m "Deploy to VPS"
git push origin main
```

## Automatic Deployment
- Every push to `main` branch triggers automatic deployment
- GitHub Actions will build and deploy your app
- Check Actions tab for deployment status

## Manual Commands on VPS
```bash
# Check service status
sudo systemctl status unknown-crud

# View logs
sudo journalctl -u unknown-crud -f

# Restart service
sudo systemctl restart unknown-crud

# Check nginx status
sudo systemctl status nginx

# Test nginx config
sudo nginx -t
```

## Troubleshooting
- Check GitHub Actions logs for build errors
- SSH into VPS and check service logs
- Ensure firewall allows ports 80/443
- Verify domain DNS settings