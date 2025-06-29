#!/bin/bash

# Find all index.md files in the شرح-عمدة-الفقه directory and subdirectories
find content/الصوتيات/شرح-عمدة-الفقه/ -name "index.md" -type f | while read -r file; do
  echo "Processing $file"
  
  # Replace 'layout: "single"' with 'layout: "audios"'
  sed -i '' 's/layout: "single"/layout: "audios"/g' "$file"
  
  echo "Updated $file"
done

echo "All شرح-عمدة-الفقه layouts updated to use audios layout" 