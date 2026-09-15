# CleanShot Preview Run Doc

## How to reproduce the artifacts

The preview uses a **self-contained inlined version** of `index.html` — all CSS and JS are embedded directly in the HTML file. This is required because the HTML preview server only serves a single file and cannot resolve external `styles.css`, `responsive.css`, `viewport-fix.css`, or `app.js` references.

### Files

- `index.html` — Self-contained inlined version (CSS + JS embedded). This is the file served by the preview.
- `styles.css` — Original separate stylesheet (for production use)
- `responsive.css` — Original separate responsive breakpoints
- `viewport-fix.css` — Original viewport fix
- `app.js` — Original separate JavaScript (for production use)
- `preview.html` — Backup of the inlined version (can be deleted)

### To restore original index.html

If you need the original `index.html` that references external files (for production/Netlify deploy), the original structure uses `<link rel="stylesheet" href="styles.css">` and `<script type="module" src="app.js">`. To rebuild the inlined version:

1. Concatenate the CSS from `styles.css`, `responsive.css`, `viewport-fix.css` into `<style>` tags
2. Embed the JS from `app.js` into a `<script type="module">` tag
3. Remove external `<link>` and `<script src>` references

## How to run the server

This is a static site — no build step or dependencies needed.

### For preview (current)

The preview is registered as the HTML file:
```
C:\Users\aaqib\Downloads\cleanshot\index.html
```

### For local development

If you want to serve the original multi-file version:

```bash
# Any static file server will work:
npx serve .
# or
python3 -m http.server 8080
# or
node -e "require('http').createServer((req,res)=>{require('fs').createReadStream('.'+req.url).pipe(res)}).listen(8080)"
```
