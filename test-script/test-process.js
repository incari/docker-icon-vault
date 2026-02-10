#!/usr/bin/env node

/**
 * Test Process Icons Script
 * Processes test-icons.txt and creates filtered-icons.json
 */

const fs = require('fs');
const https = require('https');

// Configuration
const ICONS_FILE = 'test-icons.txt';
const OUTPUT_FILE = 'filtered-icons.json';

// Parse icons file
function parseIconsFile() {
  const content = fs.readFileSync(ICONS_FILE, 'utf-8');
  const lines = content.split('\n');
  const icons = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || /^[A-Z]/.test(trimmed) && !trimmed.includes('—')) {
      continue;
    }
    
    const match = trimmed.match(/^(.+?)\s*—\s*(.+)$/);
    if (match) {
      const [, displayName, dockerImage] = match;
      // Extract base name from docker image
      const name = dockerImage.trim().split('/').pop();
      icons.push({
        displayName: displayName.trim(),
        dockerImage: dockerImage.trim(),
        name: name
      });
    }
  }
  
  return icons;
}

// Fetch description from Docker Hub API
async function fetchDockerHubDescription(imageName) {
  return new Promise((resolve) => {
    // Handle special registries
    let apiPath = imageName;
    if (imageName.startsWith('quay.io/')) {
      // Quay.io doesn't have a public API like Docker Hub
      resolve('');
      return;
    }
    
    const url = `https://hub.docker.com/v2/repositories/${apiPath}/`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const desc = json.description || json.full_description?.split('\n')[0] || '';
          resolve(desc);
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

// Fetch description from GitHub API
async function fetchGitHubDescription(repoPath) {
  return new Promise((resolve) => {
    const url = `https://api.github.com/repos/${repoPath}`;
    const options = {
      headers: {
        'User-Agent': 'Docker-Icon-Vault-Script'
      }
    };
    
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.description || '');
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

// Main function
async function main() {
  console.log('🚀 Test Processing icons...\n');
  
  // Parse icons file
  console.log('📋 Reading test-icons.txt...');
  const icons = parseIconsFile();
  console.log(`   Found ${icons.length} icons\n`);
  
  // Fetch descriptions
  console.log('📝 Fetching descriptions...\n');
  const processedIcons = [];
  
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    console.log(`[${i + 1}/${icons.length}] Processing ${icon.displayName}...`);
    
    let description = '';
    
    // Try Docker Hub first
    description = await fetchDockerHubDescription(icon.dockerImage);
    
    // If not found and looks like GitHub repo, try GitHub
    if (!description && icon.dockerImage.includes('/') && !icon.dockerImage.includes('.io/')) {
      description = await fetchGitHubDescription(icon.dockerImage);
    }
    
    // Fallback
    if (!description) {
      description = `${icon.displayName} - Docker container`;
    }
    
    processedIcons.push({
      name: icon.name,
      displayName: icon.displayName,
      dockerImage: icon.dockerImage,
      description: description.substring(0, 200),
      logo_url: `./icons/${icon.name}.png`
    });
    
    console.log(`   ✓ ${description.substring(0, 60)}...\n`);
  }
  
  // Save
  console.log('💾 Saving filtered-icons.json...');
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(processedIcons, null, 2));
  console.log(`   ✓ Saved ${processedIcons.length} icons\n`);
  
  console.log('✅ Done! Next: run test-download.js');
}

main().catch(console.error);

