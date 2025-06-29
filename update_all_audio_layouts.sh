#!/bin/bash

# This script updates all audio content pages across the site to use the audios layout
# It will search through all subdirectories in the الصوتيات section

echo "Starting to update all audio content layouts..."

# Find all index.md files in the الصوتيات directory and all its subdirectories
find content/الصوتيات/ -name "index.md" -type f | while read -r file; do
  echo "Processing $file"
  
  # Replace 'layout: "single"' with 'layout: "audios"'
  sed -i '' 's/layout: "single"/layout: "audios"/g' "$file"
  
  echo "Updated $file"
done

echo "All audio content layouts updated to use audios layout"
echo "Done!" 