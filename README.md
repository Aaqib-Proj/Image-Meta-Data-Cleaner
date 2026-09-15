# 🛡️ Image Meta Data Cleaner

**Remove hidden metadata from your photos before sharing — entirely in your browser.**


Live Demo : https://exif-eraser-app.netlify.app

Strip GPS location, camera serial numbers, timestamps, AI computational tags, and more from your photos with a single click. Nothing is uploaded. Everything runs locally.

[![Live Demo](https://img.shields.io/badge/Live-Demo-7c3aed?style=for-the-badge)](https://image-meta-data-cleaner.netlify.app)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#license)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-blue?style=for-the-badge)](#contributing)

---

## 🔍 What It Does

Every photo you take with a smartphone or camera silently stores hidden metadata — your **exact GPS coordinates**, camera hardware details, timestamps, and even **AI-generated scene tags**. When you share photos online, anyone can extract this data.

**Image Meta Data Cleaner** inspects and removes all of it:

| Metadata Type | What's Exposed | Removed? |
|---|---|---|
| **GPS Coordinates** | Your exact location (home, work, school) | ✅ |
| **Camera & Device Info** | Make, model, lens, serial number | ✅ |
| **Timestamps** | Exact date & time of capture | ✅ |
| **Exposure Settings** | Shutter speed, aperture, ISO, focal length | ✅ |
| **AI / Computational Tags** | Apple Semantic Style, Portrait Depth Maps, Google HDR | ✅ |
| **Software History** | Photoshop edits, Lightroom adjustments, C2PA credentials | ✅ |
| **XMP & IPTC Data** | Copyright, keywords, descriptions | ✅ |

---

## ✨ Key Features

- **100% Client-Side** — Your photos never leave your browser. Zero uploads, zero servers, zero tracking.
- **Works Offline** — Load the page once, then disconnect. The tool works without internet.
- **Drag & Drop / Paste** — Drop a photo, browse files, or paste from clipboard (`Ctrl+V`).
- **Real EXIF Parser** — Binary-level JPEG/PNG metadata parsing (TIFF IFD0, SubIFD, GPS IFD, XMP).
- **Before & After Comparison** — See exactly what was found and what was removed.
- **Re-Verify Output** — Scan the cleaned file to confirm zero metadata remains.
- **Full Resolution** — Images are re-encoded at 94% JPEG quality with original dimensions preserved.
- **Copy to Clipboard** — One-click copy the clean image directly to your clipboard.
- **Mobile Responsive** — Works on phones, tablets, and desktops.

---

## 🚀 Quick Start

### Option 1: Use Online
Visit the live site — no installation needed.

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/Aaqib-Proj/Image-Meta-Data-Cleaner.git
cd Image-Meta-Data-Cleaner

# Serve with any static server
python -m http.server 3000
# or
npx serve .
```

Open **http://localhost:3000** in your browser. That's it.

> **No dependencies. No build step. No package.json.** It's a single HTML file with inline CSS and JavaScript.

---

## 🏗️ How It Works

```
1. You drop/select a photo
2. Browser reads the binary file into local memory (ArrayBuffer)
3. Client-side JavaScript parses EXIF/TIFF/GPS/XMP metadata segments
4. Results are displayed in a privacy audit view
5. On "Clean" → HTML5 Canvas re-renders raw pixels into a fresh JPEG
6. You download the clean copy — original file is never modified
```

### Technical Details

- **JPEG Parsing**: Scans APP markers (`0xFFE1` for EXIF, `0xFFE2` for ICC, `0xFFED` for IPTC)
- **TIFF IFD Traversal**: Reads IFD0 → SubIFD (Exif) → GPS IFD with proper endianness handling
- **XMP Detection**: Pattern-matches Apple, Google, Adobe, and C2PA computational markers
- **PNG Support**: Parses `eXIf`, `tEXt`, `zTXt`, and `iTXt` chunks
- **Sanitization**: Uses `canvas.toBlob()` to re-rasterize pixels, discarding all container metadata

---

## 📁 Project Structure

```
Image-Meta-Data-Cleaner/
├── index.html          # Complete app (HTML + CSS + JS — self-contained)
├── styles.css          # External stylesheet (legacy, styles are inline)
├── responsive.css      # Responsive breakpoints (legacy)
├── app.js              # External JS (legacy, logic is inline in index.html)
├── scanner.jpeg        # QR code asset
├── viewport-fix.css    # Mobile viewport fixes
├── netlify.toml        # Netlify deployment config (SPA routing)
└── README.md           # This file
```

> The entire app lives in `index.html`. The external CSS/JS files are from an earlier version and can be safely ignored.

---

## 🔒 Privacy & Security

- **No server-side processing** — All operations run in your browser's memory
- **No analytics or tracking** — Zero cookies, no Google Analytics, no telemetry
- **No file uploads** — Your images are never sent anywhere
- **Auditable** — Open DevTools (F12) → Network tab to verify zero outgoing requests
- **Works air-gapped** — Disconnect internet and the tool continues to function

### How to Verify

1. Press `F12` → Click the **Network** tab
2. Turn off your Wi-Fi or enable Airplane Mode
3. Drop a photo and clean it
4. You'll see exactly **0 outgoing requests**

---

## 🌐 Deployment

### Netlify (Recommended)

The repo includes a `netlify.toml` for SPA routing:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Just connect your GitHub repo to Netlify and deploy.

### GitHub Pages

1. Go to **Settings → Pages**
2. Set source to `main` branch, root directory
3. Save — your site will be live at `https://username.github.io/Image-Meta-Data-Cleaner/`

### Any Static Host

This is a static site. Upload the files to any web server (Vercel, Cloudflare Pages, Apache, Nginx, etc.).

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- [ ] Add HEIC/HEIF format support
- [ ] Batch processing (multiple photos at once)
- [ ] WebP metadata parsing improvements
- [ ] Dark mode toggle
- [ ] PWA support for true offline installation
- [ ] Localization (i18n)

```bash
# Fork the repo, make your changes, then submit a PR
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## ⭐ Star This Repo

If this tool helped protect your photo privacy, consider giving it a ⭐ on GitHub. It helps others discover the project.

---

<p align="center">
  <strong>Image Meta Data Cleaner</strong><br>
  100% client-side • Zero uploads • Open source
</p>
