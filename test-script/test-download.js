#!/usr/bin/env node

/**
 * Test Download Icons Script
 * Downloads icons from Docker Hub and GitHub
 */

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration
const INPUT_FILE = 'filtered-icons.json';
const ICONS_DIR = 'icons';
const MANUAL_LIST = 'manual-download-list.txt';

// Ensure icons directory exists
if (!fs.existsSync(ICONS_DIR)) {
  fs.mkdirSync(ICONS_DIR);
}

// Download file from URL
function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(filepath);

    const request = protocol.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return downloadFile(response.headers.location, filepath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
        return reject(new Error(`HTTP ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// Fetch Docker Hub logo
async function fetchDockerHubLogo(dockerImage) {
  return new Promise((resolve) => {
    // Handle special registries
    if (dockerImage.startsWith('quay.io/')) {
      resolve('');
      return;
    }

    const url = `https://hub.docker.com/v2/repositories/${dockerImage}/`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const logoUrl = json.logo_url?.large || json.logo_url?.small || '';
          // Skip default Gravatar logos
          if (logoUrl && !logoUrl.includes('gravatar.com')) {
            resolve(logoUrl);
          } else {
            resolve('');
          }
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

// Fetch GitHub logo
async function fetchGitHubLogo(repoPath) {
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
          const logoUrl = json.organization?.avatar_url || json.owner?.avatar_url || '';
          resolve(logoUrl);
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

// Fetch first image from Bing Images (more reliable than Google/DuckDuckGo)
async function fetchImageFromBing(query) {
  return new Promise((resolve) => {
    const searchQuery = encodeURIComponent(query + ' logo');
    const searchUrl = `https://www.bing.com/images/search?q=${searchQuery}&first=1`;

    https.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          // Bing stores image URLs in murl field
          // Look for pattern: "murl":"https://..."
          const murlMatch = data.match(/"murl":"([^"]+)"/);
          if (murlMatch && murlMatch[1]) {
            const imageUrl = murlMatch[1].replace(/\\u002f/g, '/');
            resolve(imageUrl);
            return;
          }

          // Fallback: look for any image URLs in the page
          const imageMatches = data.match(/https?:\/\/[^\s"'<>\\]+\.(jpg|jpeg|png|svg)/gi);
          if (imageMatches && imageMatches.length > 0) {
            for (let url of imageMatches) {
              // Skip Bing's own URLs
              if (!url.includes('bing.com') &&
                !url.includes('microsoft.com') &&
                !url.includes('msn.com') &&
                url.length < 500) {
                resolve(url);
                return;
              }
            }
          }

          resolve('');
        } catch (e) {
          resolve('');
        }
      });
    }).on('error', () => resolve(''));
  });
}

// Load curated logo URLs
let curatedLogos = {};
try {
  curatedLogos = JSON.parse(fs.readFileSync('./logo-urls.json', 'utf8'));
} catch (e) {
  // File doesn't exist, use empty object
}

// Try to get logo from common sources based on project name
// ONLY use verified, actual project logos - NO GitHub avatars!
function getKnownLogoUrls(name, displayName) {
  // Check curated list first
  if (curatedLogos[name.toLowerCase()]) {
    return [curatedLogos[name.toLowerCase()]];
  }

  return [];
}

// Detect file type and return extension
function detectFileType(filepath) {
  try {
    const buffer = fs.readFileSync(filepath);
    // Check PNG signature
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return 'png';
    }
    // Check JPEG signature
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return 'jpg';
    }
    // Check SVG (starts with < or <?xml)
    const start = buffer.toString('utf8', 0, 100).trim();
    if (start.startsWith('<svg') || start.startsWith('<?xml')) {
      return 'svg';
    }
    return null;
  } catch (err) {
    return null;
  }
}

// Try multiple URLs until one works and is a valid image
async function tryMultipleUrls(urls, filepath) {
  for (const url of urls) {
    try {
      await downloadFile(url, filepath);
      // Validate it's a real image (PNG/JPG/SVG)
      const fileType = detectFileType(filepath);
      if (fileType) {
        return { url, fileType }; // Success
      } else {
        // Not a valid image, delete and try next
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }
    } catch (err) {
      // Try next URL
      continue;
    }
  }
  return null; // All failed
}

// Main function
async function main() {
  console.log('🚀 Test Downloading icons...\n');

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ ${INPUT_FILE} not found. Run test-process.js first.`);
    process.exit(1);
  }

  const icons = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`📋 Found ${icons.length} icons to download\n`);

  const results = {
    success: [],
    manual: []
  };

  const updatedIcons = []; // Track icons with updated extensions

  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    let filename = `${icon.name}.png`;
    let filepath = `${ICONS_DIR}/${filename}`;

    console.log(`[${i + 1}/${icons.length}] ${icon.displayName}...`);

    let logoUrl = '';
    let source = '';
    let downloaded = false;
    let actualExtension = 'png';

    // Try known logos first (multiple URLs)
    const knownUrls = getKnownLogoUrls(icon.name, icon.displayName);
    if (knownUrls.length > 0) {
      const result = await tryMultipleUrls(knownUrls, filepath);
      if (result) {
        logoUrl = result.url;
        actualExtension = result.fileType;
        source = 'Known Source';
        downloaded = true;

        // Rename file if extension is different
        if (actualExtension !== 'png') {
          const newFilepath = `${ICONS_DIR}/${icon.name}.${actualExtension}`;
          fs.renameSync(filepath, newFilepath);
          filepath = newFilepath;
          filename = `${icon.name}.${actualExtension}`;
        }
      }
    }

    // Try Docker Hub
    if (!downloaded && !icon.dockerImage.startsWith('quay.io/')) {
      logoUrl = await fetchDockerHubLogo(icon.dockerImage);
      if (logoUrl) {
        try {
          const tempPath = `${ICONS_DIR}/${icon.name}.tmp`;
          await downloadFile(logoUrl, tempPath);
          const fileType = detectFileType(tempPath);
          if (fileType) {
            actualExtension = fileType;
            const finalPath = `${ICONS_DIR}/${icon.name}.${fileType}`;
            fs.renameSync(tempPath, finalPath);
            filepath = finalPath;
            source = 'Docker Hub';
            downloaded = true;
          } else {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }
        } catch (err) {
          // Failed, try next source
        }
      }
    }

    // Try Bing image search as last resort
    if (!downloaded) {
      console.log(`   → Searching Bing Images...`);
      logoUrl = await fetchImageFromBing(icon.displayName);
      if (logoUrl) {
        try {
          const tempPath = `${ICONS_DIR}/${icon.name}.tmp`;
          await downloadFile(logoUrl, tempPath);
          const fileType = detectFileType(tempPath);
          if (fileType) {
            actualExtension = fileType;
            const finalPath = `${ICONS_DIR}/${icon.name}.${fileType}`;
            fs.renameSync(tempPath, finalPath);
            filepath = finalPath;
            source = 'Google Images';
            downloaded = true;
          } else {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
          }
        } catch (err) {
          // Failed
        }
      }
    }

    // Report results
    if (downloaded) {
      console.log(`   ✓ Downloaded from ${source} (${actualExtension})`);
      console.log(`   URL: ${logoUrl}\n`);
      results.success.push(icon.name);

      // Update icon with correct extension
      icon.logo_url = `./icons/${icon.name}.${actualExtension}`;
      updatedIcons.push(icon);
    } else {
      console.log(`   ✗ Could not download automatically\n`);
      results.manual.push(icon);
    }
  }

  // Generate manual download list
  if (results.manual.length > 0) {
    let manualContent = '# Manual Icon Download List\n';
    manualContent += '# Download these icons manually and save to icons/ directory\n\n';

    results.manual.forEach(icon => {
      const searchQuery = encodeURIComponent(`${icon.displayName} logo`);
      const googleUrl = `https://www.google.com/search?tbm=isch&q=${searchQuery}`;
      manualContent += `${icon.name}.png\n`;
      manualContent += `  Name: ${icon.displayName}\n`;
      manualContent += `  Docker: ${icon.dockerImage}\n`;
      manualContent += `  Search: ${googleUrl}\n\n`;
    });

    fs.writeFileSync(MANUAL_LIST, manualContent);
  }

  // Update filtered-icons.json with correct extensions
  if (updatedIcons.length > 0) {
    console.log('💾 Updating filtered-icons.json with correct file extensions...');
    fs.writeFileSync(INPUT_FILE, JSON.stringify(icons, null, 2));
    console.log(`   ✓ Updated ${updatedIcons.length} entries\n`);
  }

  // Summary
  console.log('\n📊 Summary:');
  console.log(`   ✓ Successfully downloaded: ${results.success.length}`);
  console.log(`   ⚠️  Need manual download: ${results.manual.length}\n`);

  if (results.manual.length > 0) {
    console.log(`📝 Created ${MANUAL_LIST} with Google search links\n`);
  }

  console.log('✅ Done! Check the icons/ directory');
}

main().catch(console.error);

