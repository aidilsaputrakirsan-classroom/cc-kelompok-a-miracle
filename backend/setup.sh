#!/bin/bash

echo "Starting backend setup..."

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

echo "Setup complete!"
echo "Run server with: uvicorn main:app --reload"