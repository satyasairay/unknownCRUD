#!/usr/bin/env python3
"""Initialize production environment with default admin user."""

import json
import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend_py"))

from app import hash_password
import uuid

def create_default_admin():
    """Create default admin user if no users exist."""
    
    # Get data root from environment or default
    data_root = os.getenv("DATA_ROOT", "/var/www/html/data/library")
    users_file = Path(data_root) / "_users.json"
    
    # Create directory if it doesn't exist
    users_file.parent.mkdir(parents=True, exist_ok=True)
    
    # Check if users file exists and has content
    if users_file.exists():
        try:
            with open(users_file, 'r') as f:
                users = json.load(f)
                if users:  # File exists and has users
                    print(f"Users file already exists with {len(users)} users")
                    return
        except (json.JSONDecodeError, FileNotFoundError):
            pass
    
    # Create default admin user
    default_admin = {
        "id": str(uuid.uuid4()),
        "email": "admin@satsangee.org",
        "password_hash": hash_password("admin123"),  # Change this password!
        "roles": ["platform_admin"],
        "twoFactorEnabled": False
    }
    
    users = [default_admin]
    
    # Write users file
    with open(users_file, 'w') as f:
        json.dump(users, f, indent=2)
    
    print(f"Created default admin user: admin@satsangee.org")
    print("WARNING: Change the default password immediately!")
    print(f"Users file created at: {users_file}")

if __name__ == "__main__":
    create_default_admin()