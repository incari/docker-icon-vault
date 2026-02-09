#!/bin/bash

# Cleanup script for old workflow files
# This removes all the old scripts and documentation that are no longer needed

echo "🧹 Cleaning up old workflow files..."
echo ""

# Old documentation files
OLD_DOCS=(
  "AUTOMATION.md"
  "DOWNLOAD-SCRIPT-FIX.md"
  "HOW-IT-WORKS.md"
  "QUICK-START.md"
  "WORKFLOW.md"
)

# Old script files
OLD_SCRIPTS=(
  "scraper-dom.js"
  "auto-download-logos.js"
  "auto-download-logos.py"
  "automate-flow.sh"
  "clean-json.js"
  "download-from-google.sh"
  "download-google-logos.js"
  "fix-download-script.sh"
  "generate-download-script.js"
  "generate-smart-download.js"
  "get-existing-names.js"
  "merge-json-files.js"
  "analyze-logos.js"
)

# Old directories
OLD_DIRS=(
  "icons-review"
  "icons-rejected"
  "icons-aproved"
)

echo "📄 Removing old documentation files..."
for file in "${OLD_DOCS[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "   ✅ Removed: $file"
  else
    echo "   ⏭️  Not found: $file"
  fi
done
echo ""

echo "📜 Removing old script files..."
for file in "${OLD_SCRIPTS[@]}"; do
  if [ -f "$file" ]; then
    rm "$file"
    echo "   ✅ Removed: $file"
  else
    echo "   ⏭️  Not found: $file"
  fi
done
echo ""

echo "📁 Removing old directories..."
for dir in "${OLD_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    rm -rf "$dir"
    echo "   ✅ Removed: $dir/"
  else
    echo "   ⏭️  Not found: $dir/"
  fi
done
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📁 Remaining files:"
echo "   ✓ scraper.js (NEW)"
echo "   ✓ merge-new-images.js (NEW)"
echo "   ✓ NEW-WORKFLOW.md (NEW)"
echo "   ✓ list.json"
echo "   ✓ icons/"
echo "   ✓ README.md"
echo "   ✓ update-readme.js (kept for README generation)"
echo ""
echo "💡 Next steps:"
echo "   1. Review the NEW-WORKFLOW.md for the new workflow"
echo "   2. Update README.md if needed"
echo "   3. Commit the changes"
echo ""

