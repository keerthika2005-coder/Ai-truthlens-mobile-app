#!/usr/bin/env bash

echo "=========================================="
echo "      Starting AI TruthLens Forensic Suite"
echo "=========================================="
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting server at http://localhost:3000..."
npm run dev
