#!/bin/bash

# BlueStay - Standalone Platform Distiller
# This script bundles the platform codebase into a single distributable zip
# omitting internal bluestay platform secrets and git histories.

set -e

EXPORT_DIR="hotel-booking-standalone"
ZIP_FILE="$EXPORT_DIR-$(date +%F).zip"

echo "==========================================="
echo "🧳 Exporting Hotel Booking Standalone Build"
echo "==========================================="

# Clean past exports
rm -rf "$EXPORT_DIR"
rm -f "$ZIP_FILE"
mkdir "$EXPORT_DIR"

# Copy directories
echo "📋 Copying source directories..."
cp -r apps "$EXPORT_DIR/"
cp -r packages "$EXPORT_DIR/"
cp -r e2e "$EXPORT_DIR/"
# Exclude node_modules during copy if they exist
find "$EXPORT_DIR" -name "node_modules" -type d -prune -exec rm -rf '{}' +
find "$EXPORT_DIR" -name ".next" -type d -prune -exec rm -rf '{}' +
find "$EXPORT_DIR" -name "dist" -type d -prune -exec rm -rf '{}' +

# Copy config files
echo "⚙️ Copying base configurations..."
cp package.json "$EXPORT_DIR/"
cp turbo.json "$EXPORT_DIR/"
cp tsconfig.json "$EXPORT_DIR/"
cp playwright.config.ts "$EXPORT_DIR/"
cp README.standalone.md "$EXPORT_DIR/README.md"

# Configure standalone Docker and Environment
echo "🐳 Setting up standalone platform definitions..."
cp docker-compose.standalone.yml "$EXPORT_DIR/docker-compose.yml"
cp .env.standalone.example "$EXPORT_DIR/.env.example"

# Zip the bundle
echo "📦 Building client artifact: $ZIP_FILE..."
zip -r "$ZIP_FILE" "$EXPORT_DIR" > /dev/null

# Clean up temporary dir
rm -rf "$EXPORT_DIR"

echo "✅ Success! Delivered artifact: $ZIP_FILE"
echo "This zip contains a pure multi-service configuration ready for standalone Docker deployment."
