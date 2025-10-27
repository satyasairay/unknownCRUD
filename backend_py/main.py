#!/usr/bin/env python3
"""Production entry point for the FastAPI application."""

import os
import uvicorn
from app import create_app

# Load production environment if available
if os.path.exists('.env.production'):
    from dotenv import load_dotenv
    load_dotenv('.env.production')

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=False,
        workers=1
    )