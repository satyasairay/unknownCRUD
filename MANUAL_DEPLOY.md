# Manual Deployment Guide

## Step 1: Upload Project to Server
```bash
# On your local machine, create a zip of the project
zip -r unknownCRUD.zip . -x "node_modules/*" "*/env/*" "*.git/*"

# Upload to server
scp unknownCRUD.zip user@satsangee.org:/tmp/

# On server, extract
ssh user@satsangee.org
cd /tmp
rm -rf unknownCRUD
unzip unknownCRUD.zip -d unknownCRUD
```

## Step 2: Run Deployment Script
```bash
# Navigate to project and run deployment
cd /tmp/unknownCRUD
chmod +x deploy.sh
sudo bash deploy.sh
```

## Step 3: Verify Deployment
```bash
# Check services
sudo systemctl status nginx
sudo systemctl status unknowncrud

# Test URLs
curl https://satsangee.org/
curl https://satsangee.org/sme
curl https://satsangee.org/api/health
```

## Troubleshooting
- Check nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check backend logs: `sudo journalctl -u unknowncrud -f`
- Restart services: `sudo systemctl restart nginx && sudo systemctl restart unknowncrud`