@echo off
echo Creating deployment package...

REM Create zip excluding unnecessary files
powershell -Command "Compress-Archive -Path '.' -DestinationPath 'unknownCRUD.zip' -Force -CompressionLevel Optimal -Exclude 'node_modules','*\env','*.git'"

echo.
echo Upload unknownCRUD.zip to your server at /tmp/
echo Then run: cd /tmp/unknownCRUD && sudo bash deploy.sh
echo.
pause