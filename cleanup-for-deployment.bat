@echo off
echo Cleaning up files that should not be in repository...

REM Remove virtual environment (will be recreated on server)
if exist "backend_py\env" (
    echo Removing virtual environment...
    rmdir /s /q "backend_py\env" 2>nul
)

REM Remove data directory (should be created on server)
if exist "data" (
    echo Removing data directory...
    rmdir /s /q "data" 2>nul
)

REM Remove any remaining .js files in src
echo Removing compiled JS files...
for /r "frontend\src" %%i in (*.js) do (
    if not "%%~nxi"=="vite.config.js" (
        del "%%i" 2>nul
    )
)

echo Cleanup complete!
echo Ready for deployment.