# Docker Icon Vault - New Workflow

This is the simplified workflow for scraping Docker Hub images and managing their icons.

## 🎯 Overview

The new workflow:
1. ✅ Checks existing images from GitHub Pages (`https://incari.github.io/docker-icon-vault/list.json`)
2. ✅ Skips deprecated images automatically
3. ✅ Skips images already in the list
4. ✅ Handles nested image names (e.g., `python/pytorch` → `python-pytorch.png`)
5. ✅ Generates download script for logos
6. ✅ Creates a list of images with default logos for manual Google search

## 📋 Workflow Steps

### Step 1: Scrape Docker Hub

1. Open https://hub.docker.com/search?badges=official&page=1
2. Open browser console (F12)
3. Copy and paste the contents of `scraper.js`
4. Press Enter to run

The scraper will:
- Fetch existing images from GitHub Pages
- Skip deprecated images
- Skip images already in the list
- Download two files:
  - `new-list-page1.json` - New images found
  - `download-logos-page1.sh` - Script to download logos

### Step 2: Download Logos

Run the generated download script:

```bash
chmod +x download-logos-page1.sh
./download-logos-page1.sh
```

This will:
- Download all available logos to `icons/` folder
- Create `google-search-list.txt` if some images use default logos

### Step 3: Manual Download (if needed)

If `google-search-list.txt` was created:

1. Open `google-search-list.txt`
2. For each line, click the Google Images search URL
3. Download the best logo
4. Save to `icons/` folder with the exact filename shown (e.g., `python-pytorch.png`)

### Step 4: Merge New Images

Merge the new images into `list.json`:

```bash
node merge-new-images.js
```

This will:
- Read existing `list.json`
- Add new images from `new-list-page*.json` files
- Avoid duplicates
- Update `list.json`

### Step 5: Cleanup

Remove temporary files:

```bash
rm new-list-page*.json
rm download-logos-page*.sh
rm google-search-list.txt  # if it exists
```

### Step 6: Commit and Push

```bash
git add list.json icons/
git commit -m "Add new Docker images and logos"
git push
```

## 🔄 Scraping Multiple Pages

To scrape multiple pages:

1. Scrape page 1 (as above)
2. Go to https://hub.docker.com/search?badges=official&page=2
3. Run `scraper.js` again
4. Repeat for pages 3, 4, 5, etc.
5. Run all download scripts
6. Run `merge-new-images.js` once to merge all pages

## 📁 File Structure

```
docker-icon-vault/
├── scraper.js                  # Browser scraper (NEW)
├── merge-new-images.js         # Merge new images into list.json (NEW)
│
├── list.json                   # Master list of all images
├── icons/                      # All approved logos
│
├── new-list-page*.json         # Temporary: new images per page
├── download-logos-page*.sh     # Temporary: download scripts
└── google-search-list.txt      # Temporary: manual download list
```

## 🎨 Handling Nested Image Names

The scraper automatically handles nested image names:

- `python/pytorch` → saved as `python-pytorch.png`
- `atlassian/confluence` → saved as `atlassian-confluence.png`

The `list.json` stores the original name (`python/pytorch`), but the logo file uses the safe name (`python-pytorch.png`).

## 💡 Tips

- **Always scrape from page 1** to ensure you don't miss any new images
- **Check GitHub Pages** before scraping to see what's already there
- **Review logos** before committing to ensure quality
- **Use PNG format** for logos when possible (better transparency)

## 🆚 Differences from Old Workflow

| Old Workflow | New Workflow |
|--------------|--------------|
| Manual list management | Automatic from GitHub Pages |
| Multiple scripts | Single scraper.js |
| Complex merge process | Simple merge-new-images.js |
| No nested name handling | Automatic nested name handling |
| Separate Google search script | Integrated in download script |

