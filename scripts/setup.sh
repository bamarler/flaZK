#!/bin/bash

echo "🚀 Setting up flaZK development environment..."

# Install dependencies
npm install

# Setup Redis & PostgreSQL with Docker
docker-compose up -d

# Initialize database
npm run db:migrate

# Compile circuits
cd packages/circuits
npm run compile:circuits

# Generate trusted setup
npm run setup:ceremony

# Build SDK
cd ../sdk
npm run build

# Setup environment files
cp .env.example .env
echo "⚠️  Please update .env with your API keys"

# Install Git hooks
npx husky install

echo "✅ Setup complete! Run 'npm run dev' to start"