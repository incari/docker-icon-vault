#!/usr/bin/env node

/**
 * Update README.md with the list of icons from docker-images-list.json
 */

const fs = require('fs');
const path = require('path');

console.log('📝 Updating README.md with icon list...\n');

// Read the JSON file
const jsonPath = path.join(__dirname, 'docker-images-list.json');
if (!fs.existsSync(jsonPath)) {
  console.log('❌ docker-images-list.json not found');
  process.exit(1);
}

const images = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
console.log(`📊 Found ${images.length} images in docker-images-list.json\n`);

// Generate the markdown table
let tableMarkdown = '| Name | Icon | Description | URL |\n';
tableMarkdown += '|------|------|-------------|-----|\n';

images.forEach(img => {
  const name = img.name || '';
  const description = (img.description || '').replace(/\|/g, '\\|'); // Escape pipes in description
  const logoUrl = img.logo_url || '';
  const iconMarkdown = logoUrl ? `![${name}](${logoUrl})` : '';
  
  tableMarkdown += `| ${name} | ${iconMarkdown} | ${description} | \`${logoUrl}\` |\n`;
});

// Create the new README content
const readmeContent = `# Docker Icon Vault

A curated collection of icons for Docker official images.

## Icons

Total: **${images.length} Docker images**

${tableMarkdown}

## Contributing

To add a new icon:
1. Add your icon image to the \`icons/\` directory
2. Update the \`docker-images-list.json\` file
3. Run \`node update-readme.js\` to regenerate this README
4. Use consistent naming: lowercase with hyphens (e.g., \`my-app.png\`)

## Icon Guidelines

- **Format**: PNG or SVG preferred
- **Size**: 512x512px recommended for PNG files
- **Naming**: Use lowercase with hyphens (e.g., \`postgres.png\`, \`redis.png\`)
- **Quality**: High-quality, transparent backgrounds preferred

## Source

Icons are sourced from:
- Official Docker Hub images
- Official project websites
- Community contributions

All icons are property of their respective owners.
`;

// Write the README
const readmePath = path.join(__dirname, 'README.md');
fs.writeFileSync(readmePath, readmeContent, 'utf8');

console.log('✅ README.md updated successfully!');
console.log(`📄 Total images in table: ${images.length}`);
console.log('\n💡 You can now view the updated README.md');

