#!/bin/bash

# Directory containing all the book sections
BASE_DIR="content/الصوتيات/شرح-كتاب-الوجيز-في-فقه-السنة-والكتاب-العزيز"

# Find all index.md files in the subdirectories
for file in ${BASE_DIR}/كتاب-*/index.md; do
  # Check if the file already has a layout parameter
  if ! grep -q "layout: \"single\"" "$file"; then
    # Add the layout parameter after the type parameter
    sed -i '' 's/type: "page"/type: "page"\nlayout: "single"/' "$file"
    echo "Updated $file"
  else
    echo "Skipped $file (already has layout parameter)"
  fi
done

echo "All files updated successfully!" 