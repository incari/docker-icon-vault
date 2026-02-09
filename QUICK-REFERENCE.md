# Quick Reference Guide

## 🚀 Quick Start (First Time)

```bash
# 1. Open Docker Hub in browser
# https://hub.docker.com/search?badges=official&page=1

# 2. Open browser console (F12) and paste scraper.js content

# 3. Download logos
chmod +x download-logos-page1.sh
./download-logos-page1.sh

# 4. Merge into list.json
node merge-new-images.js

# 5. Cleanup
rm new-list-page*.json download-logos-page*.sh
```

## 🔄 Regular Updates

```bash
# Same as above - the scraper automatically skips existing images
```

## 📝 File Descriptions

| File | Purpose |
|------|---------|
| `scraper.js` | Browser scraper - run in console on Docker Hub |
| `merge-new-images.js` | Merge new images into list.json |
| `list.json` | Master list of all Docker images |
| `icons/` | Directory containing all logo files |
| `update-readme.js` | Generate README table (optional) |

## 🎯 Key Features

- ✅ Automatically fetches existing images from GitHub Pages
- ✅ Skips deprecated images
- ✅ Handles nested image names (e.g., `python/pytorch`)
- ✅ Generates download script for logos
- ✅ Creates Google search list for default logos

## 📦 Nested Image Names

The scraper handles nested names automatically:

| Docker Hub Name | Saved As |
|----------------|----------|
| `python/pytorch` | `python-pytorch.png` |
| `atlassian/confluence` | `atlassian-confluence.png` |

The `list.json` stores the original name, but the file uses the safe name.

## 🔍 Troubleshooting

**Q: Scraper doesn't find any new images**
- A: All images on that page are already in list.json or deprecated

**Q: Download script fails**
- A: Some images may have moved or been removed. Check google-search-list.txt

**Q: How do I handle default logos?**
- A: The download script creates google-search-list.txt with search links

## 📚 Full Documentation

See [NEW-WORKFLOW.md](NEW-WORKFLOW.md) for complete documentation.

