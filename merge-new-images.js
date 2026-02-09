#!/usr/bin/env node

/**
 * Merge new-list-page*.json files into list.json
 * 
 * This script:
 * - Reads existing list.json
 * - Reads all new-list-page*.json files
 * - Merges them (avoiding duplicates)
 * - Writes back to list.json
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Merging new images into list.json...\n');

// Read existing list.json
const listPath = path.join(__dirname, 'list.json');
let existingImages = [];
const existingNames = new Set();

if (fs.existsSync(listPath)) {
  existingImages = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  existingImages.forEach(img => existingNames.add(img.name));
  console.log(`📄 Loaded ${existingImages.length} existing images from list.json`);
} else {
  console.log('ℹ️  No existing list.json found (creating new)');
}

// Find all new-list-page*.json files
const newListFiles = fs.readdirSync(__dirname)
  .filter(f => f.startsWith('new-list-page') && f.endsWith('.json'))
  .sort();

if (newListFiles.length === 0) {
  console.log('❌ No new-list-page*.json files found');
  console.log('💡 Run the scraper.js in browser first');
  process.exit(1);
}

console.log(`📄 Found ${newListFiles.length} new list files:`);
newListFiles.forEach(f => console.log(`   - ${f}`));
console.log('');

// Merge new images
let addedCount = 0;
let duplicateCount = 0;

newListFiles.forEach(file => {
  const filepath = path.join(__dirname, file);
  const newImages = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  
  console.log(`Processing ${file}...`);
  
  newImages.forEach(img => {
    if (!existingNames.has(img.name)) {
      existingImages.push(img);
      existingNames.add(img.name);
      addedCount++;
      console.log(`   ✨ Added: ${img.name}`);
    } else {
      duplicateCount++;
      console.log(`   ⏭️  Skipped: ${img.name} (duplicate)`);
    }
  });
  
  console.log('');
});

console.log('📊 Merge statistics:');
console.log(`   ✨ New images added: ${addedCount}`);
console.log(`   ⏭️  Duplicates skipped: ${duplicateCount}`);
console.log(`   📝 Total images: ${existingImages.length}`);
console.log('');

// Write merged list
fs.writeFileSync(listPath, JSON.stringify(existingImages, null, 2), 'utf8');
console.log(`✅ Updated: list.json`);
console.log('');

// Ask if user wants to delete the new-list-page*.json files
console.log('💡 Next steps:');
console.log('   1. Review the updated list.json');
console.log('   2. Delete new-list-page*.json files: rm new-list-page*.json');
console.log('   3. Delete download-logos-page*.sh files: rm download-logos-page*.sh');
console.log('');

