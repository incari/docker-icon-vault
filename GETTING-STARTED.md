# Getting Started with Docker Icon Vault

## 🎯 What is This?

Docker Icon Vault is a collection of Docker Hub official image logos. This tool helps you scrape Docker Hub and download logos automatically.

## 🚀 How to Use (Simple 4-Step Process)

### Step 1: Scrape Docker Hub

1. Open https://hub.docker.com/search?badges=official&page=1 in your browser
2. Press `F12` to open the browser console
3. Open the `scraper.js` file in this repository
4. Copy all the content and paste it into the browser console
5. Press Enter

**What happens:**
- The scraper fetches existing images from GitHub Pages
- Skips deprecated images automatically
- Skips images you already have
- Downloads 2 files:
  - `new-list-page1.json` - List of new images found
  - `download-logos-page1.sh` - Script to download their logos

### Step 2: Download Logos

In your terminal:

```bash
chmod +x download-logos-page1.sh
./download-logos-page1.sh
```

**What happens:**
- Downloads all available logos to `icons/` folder
- Creates `google-search-list.txt` if some images use default logos

### Step 3: Manual Downloads (if needed)

If `google-search-list.txt` was created:

1. Open the file
2. Click each Google Images search link
3. Download the best logo
4. Save to `icons/` folder with the exact filename shown

### Step 4: Merge and Cleanup

```bash
# Merge new images into list.json
node merge-new-images.js

# Remove temporary files
rm new-list-page*.json download-logos-page*.sh google-search-list.txt
```

## 🎉 Done!

Your `list.json` is now updated with new images and their logos are in the `icons/` folder.

## 📚 Need More Help?

- **Quick commands:** See [QUICK-REFERENCE.md](QUICK-REFERENCE.md)
- **Full workflow:** See [NEW-WORKFLOW.md](NEW-WORKFLOW.md)
- **What changed:** See [MIGRATION-SUMMARY.md](MIGRATION-SUMMARY.md)

## 💡 Tips

- **Multiple pages:** Repeat Step 1 for pages 2, 3, 4, etc., then run all download scripts before merging
- **Nested names:** Images like `python/pytorch` are automatically saved as `python-pytorch.png`
- **Updates:** Just run the same process - the scraper automatically skips existing images

## 🔧 Requirements

- Node.js (for running the merge script)
- curl (for downloading logos - usually pre-installed)
- A modern web browser (Chrome, Firefox, Safari, Edge)

## 📝 File Structure

```
docker-icon-vault/
├── scraper.js              # Browser scraper
├── merge-new-images.js     # Merge script
├── list.json               # Master list
└── icons/                  # All logos
```

## ❓ Common Questions

**Q: Do I need to install anything?**
A: Just Node.js. Everything else runs in the browser.

**Q: How often should I update?**
A: Whenever you want to check for new Docker images. Once a month is usually enough.

**Q: What if the scraper finds nothing?**
A: That means all images on that page are already in your list or deprecated. Try the next page!

**Q: Can I contribute?**
A: Yes! Feel free to submit pull requests with new logos or improvements.

