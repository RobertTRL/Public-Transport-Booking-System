#!/usr/bin/env bash
# Render build script — runs during every deploy
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Seed the database (only inserts if tables are empty)
python seed.py
