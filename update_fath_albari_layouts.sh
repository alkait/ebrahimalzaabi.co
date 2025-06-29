#!/bin/bash

# Find all index.md files in the فتح-الباري subdirectories
find content/الصوتيات/فتح-الباري/ -name "index.md" -type f | while read -r file; do
  echo "Processing $file"
  
  # Replace 'layout: "single"' with 'layout: "audios"'
  sed -i '' 's/layout: "single"/layout: "audios"/g' "$file"
  
  echo "Updated $file"
done

echo "All فتح-الباري layouts updated to use audios layout" 