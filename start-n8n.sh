#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)
export NODE_TLS_REJECT_UNAUTHORIZED=0
export N8N_SECURE_COOKIE=false
export NODE_NO_WARNINGS=1

# Load our custom configuration to bypass payload limits
export NODE_OPTIONS="--require ./n8n-config.js"

# Set n8n configuration
export N8N_CUSTOM_EXTENSIONS="$(pwd)"
export N8N_PORT=5678
export N8N_HOST=localhost
export N8N_RUNNERS_ENABLED=true
export N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
export N8N_PAYLOAD_SIZE_MAX=4294967296
export N8N_DEFAULT_BINARY_DATA_MODE=filesystem
export N8N_BINARY_DATA_STORAGE_PATH="$(pwd)/tmp"

# Build the node first if dist doesn't exist
if [ ! -d "dist" ]; then
    echo "Building the custom node..."
    pnpm build
fi

# Start n8n
echo "Starting n8n with custom Notion Upload Media node..."
echo "n8n will be available at: http://localhost:5678"
echo "Custom extensions path: $(pwd)"
echo "Environment variables loaded:"
echo "- NOTION_TOKEN_V2: ${NOTION_TOKEN_V2:0:20}..."
echo "- SPACE_ID: $SPACE_ID"
echo "- NOTION_USER_ID: $NOTION_USER_ID"
echo "- N8N_CUSTOM_EXTENSIONS: $N8N_CUSTOM_EXTENSIONS"
echo ""
echo "Checking dist folder contents:"
ls -la dist/
echo ""
echo "Development workflow:"
echo "1. Make changes to the node code"
echo "2. Run 'pnpm build' to rebuild"
echo "3. Restart n8n (Ctrl+C and run this script again)"
echo ""

npx n8n start 2>&1 | tee n8n.log
