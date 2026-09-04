#!/usr/bin/env bash
# Render build script — runs during every deploy
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
flask db upgrade

# Seed the database and ensure trips are scheduled for today
python seed.py --force
