import os
import sys

# Make `server/` importable regardless of where pytest is invoked from, so
# `import schemas` / `from config import ma` resolve the same way the app does.
SERVER_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)
    
from app import app