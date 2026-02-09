/**
 * Docker Hub Official Images Scraper
 * 
 * Run this script in the browser console on https://hub.docker.com/search?badges=official
 * 
 * Features:
 * - Fetches existing images from GitHub Pages (https://incari.github.io/docker-icon-vault/list.json)
 * - Skips deprecated images
 * - Skips images already in the list
 * - Handles nested image names (e.g., python/pytorch, atlassian/confluence)
 * - Generates new-list.json with new images
 * - Generates download-logos.sh for downloading logos
 */

(async function scrapeDockerHub() {
  console.log('🚀 Docker Hub Scraper - Starting...');
  console.log('');

  // Fetch existing images from GitHub Pages
  const existingImages = new Set();
  const deprecatedImages = new Set();
  const GITHUB_LIST_URL = 'https://incari.github.io/docker-icon-vault/list.json';

  console.log('📋 Fetching existing images from GitHub Pages...');
  try {
    const response = await fetch(GITHUB_LIST_URL);
    if (response.ok) {
      const existingData = await response.json();
      existingData.forEach(img => {
        existingImages.add(img.name);
        // Check if marked as deprecated in the list
        if (img.deprecated === true) {
          deprecatedImages.add(img.name);
        }
      });
      console.log(`✅ Loaded ${existingImages.size} existing images`);
      console.log(`⚠️  Found ${deprecatedImages.size} deprecated images`);
    } else {
      console.log('ℹ️  No existing list found (first run)');
    }
  } catch (e) {
    console.log('⚠️  Could not load from GitHub Pages:', e.message);
    console.log('ℹ️  Continuing in first-run mode...');
  }
  console.log('');

  const newImages = [];
  const imagesForDownload = [];

  // Find all product cards on the page
  const cards = document.querySelectorAll('[data-testid="product-card-link"]');
  console.log(`📊 Found ${cards.length} image cards on this page`);
  console.log('');

  let skippedExisting = 0;
  let skippedDeprecated = 0;
  let addedNew = 0;

  cards.forEach((card, index) => {
    const cardContainer = card.closest('.MuiPaper-root');

    // Extract name from the link
    const name = card.textContent.trim();

    // Extract description
    const descElement = cardContainer.querySelector('.product-description');
    const description = descElement ? descElement.textContent.trim() : '';

    // Skip deprecated images
    if (description.toUpperCase().includes('DEPRECATED')) {
      console.log(`   ⏭️  [${index + 1}] Skipping ${name} (DEPRECATED)`);
      skippedDeprecated++;
      return;
    }

    // Skip images that already exist
    if (existingImages.has(name)) {
      console.log(`   ⏭️  [${index + 1}] Skipping ${name} (already exists)`);
      skippedExisting++;
      return;
    }

    // Extract logo URL
    const logoImg = cardContainer.querySelector('[data-testid="repository-logo"]');
    const remoteLogoUrl = logoImg ? logoImg.src : '';

    // Check if using default Gravatar logo
    const isDefaultLogo = remoteLogoUrl.includes('gravatar.com') ||
      remoteLogoUrl.includes('?d=mm') ||
      remoteLogoUrl.includes('&d=mm');

    // Determine file extension
    let ext = 'png';
    if (remoteLogoUrl.includes('.jpg') || remoteLogoUrl.includes('.jpeg')) {
      ext = 'jpg';
    } else if (remoteLogoUrl.includes('.svg')) {
      ext = 'svg';
    }

    // Handle nested image names (e.g., python/pytorch -> python-pytorch)
    const safeName = name.replace(/\//g, '-');
    const localLogoUrl = `./icons/${safeName}.${ext}`;

    newImages.push({
      name,
      description,
      logo_url: localLogoUrl
    });

    imagesForDownload.push({
      name,
      safeName,
      description,
      remoteLogoUrl,
      ext,
      isDefaultLogo
    });

    const logoStatus = isDefaultLogo ? '⚠️  DEFAULT' : '✅ CUSTOM';
    console.log(`   ✨ [${index + 1}] NEW: ${name} ${logoStatus}`);
    addedNew++;
  });

  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✨ New images: ${addedNew}`);
  console.log(`   ⏭️  Skipped (existing): ${skippedExisting}`);
  console.log(`   ⏭️  Skipped (deprecated): ${skippedDeprecated}`);
  console.log('');

  if (newImages.length === 0) {
    console.log('✅ No new images found on this page!');
    return;
  }

  // Get current page number from URL
  const urlParams = new URLSearchParams(window.location.search);
  const pageNum = urlParams.get('page') || '1';

  // Generate new-list.json
  const jsonBlob = new Blob([JSON.stringify(newImages, null, 2)], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(jsonBlob);
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = `new-list-page${pageNum}.json`;
  jsonLink.click();
  console.log(`✅ Downloaded: new-list-page${pageNum}.json`);

  // Generate download-logos.sh
  let bashScript = `#!/bin/bash
# Docker Hub Logo Downloader - Page ${pageNum}
# Downloads logos for new images (${imagesForDownload.length} images)

set -e  # Exit on error

mkdir -p icons
cd icons

echo "📥 Downloading ${imagesForDownload.length} logos..."
echo ""

`;

  const defaultLogos = [];

  imagesForDownload.forEach((img, i) => {
    if (img.isDefaultLogo || !img.remoteLogoUrl) {
      // Add to list for Google search
      defaultLogos.push(img);
    } else {
      // Add download command
      bashScript += `echo "[${i + 1}/${imagesForDownload.length}] Downloading ${img.name}..."\n`;
      bashScript += `curl -L "${img.remoteLogoUrl}" -o "${img.safeName}.${img.ext}" 2>/dev/null || echo "   ⚠️  Failed to download"\n`;
      bashScript += `\n`;
    }
  });

  bashScript += `cd ..\n\n`;

  // Generate google-search-list.txt for default logos
  if (defaultLogos.length > 0) {
    bashScript += `echo ""\n`;
    bashScript += `echo "⚠️  ${defaultLogos.length} images are using default logos"\n`;
    bashScript += `echo "📝 Creating google-search-list.txt for manual download..."\n`;
    bashScript += `echo ""\n\n`;

    bashScript += `cat > google-search-list.txt << 'EOF'\n`;
    bashScript += `# Images with default logos - Search and download manually\n`;
    bashScript += `# For each image, search Google Images and download to icons/ folder\n`;
    bashScript += `#\n`;
    bashScript += `# Format: image-name | Google Search URL\n`;
    bashScript += `#\n\n`;

    defaultLogos.forEach(img => {
      const searchQuery = encodeURIComponent(`${img.name} logo`);
      const googleUrl = `https://www.google.com/search?tbm=isch&q=${searchQuery}`;
      bashScript += `${img.safeName}.png | ${googleUrl}\n`;
    });

    bashScript += `EOF\n\n`;
    bashScript += `echo "✅ Created google-search-list.txt"\n`;
    bashScript += `echo "   Open this file and click the links to download logos manually"\n`;
  }

  bashScript += `\necho ""\n`;
  bashScript += `echo "✅ Done! Downloaded logos to icons/ directory"\n`;
  if (defaultLogos.length > 0) {
    bashScript += `echo "⚠️  ${defaultLogos.length} images need manual download (see google-search-list.txt)"\n`;
  }

  const scriptBlob = new Blob([bashScript], { type: 'text/plain' });
  const scriptUrl = URL.createObjectURL(scriptBlob);
  const scriptLink = document.createElement('a');
  scriptLink.href = scriptUrl;
  scriptLink.download = `download-logos-page${pageNum}.sh`;
  scriptLink.click();
  console.log(`✅ Downloaded: download-logos-page${pageNum}.sh`);

  console.log('');
  console.log('🎉 Done! Next steps:');
  console.log('   1. Run: bash download-logos-page' + pageNum + '.sh');
  console.log('   2. If google-search-list.txt is created, download those logos manually');
  console.log('   3. Merge new-list-page' + pageNum + '.json with list.json');
  console.log('');
})();

