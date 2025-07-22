#!/bin/bash

# Script to clean up temporary binary data files

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMP_DIR="$SCRIPT_DIR/tmp"

if [ ! -d "$TMP_DIR" ]; then
    echo "No tmp directory found."
    exit 0
fi

# Show current size
echo "Current tmp directory size:"
du -sh "$TMP_DIR"

# Count files
FILE_COUNT=$(find "$TMP_DIR" -type f | wc -l)
echo "Number of files: $FILE_COUNT"

# Ask for confirmation
read -p "Do you want to clean up temporary binary data? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Clean up binary data files older than 1 hour
    echo "Cleaning up binary data files older than 1 hour..."
    find "$TMP_DIR/workflows/*/executions/*/binary_data" -type f -mmin +60 -delete 2>/dev/null
    
    # Remove empty directories
    find "$TMP_DIR" -type d -empty -delete 2>/dev/null
    
    echo "Cleanup complete!"
    echo "New tmp directory size:"
    du -sh "$TMP_DIR"
else
    echo "Cleanup cancelled."
fi