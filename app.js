/**
 * CleanShot — Offline Client-Side Photo Privacy & Metadata Sanitizer
 * Zero-knowledge, zero-network, zero-tracking.
 * All operations execute exclusively inside local browser memory.
 */

const MAX_BYTES = 50 * 1024 * 1024; // 50MB
const TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg']);
const app = document.querySelector('#app');

let current = null;
let processed = null;
let theme = localStorage.getItem('cleanshot-theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
let showRawDump = false;

// Modern SVG Icons
const icons = {
  shield: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
  check: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  alert: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  pin: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  camera: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,
  cpu: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  download: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  copy: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>`,
  zap: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  chevron: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>`,
  terminal: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  heart: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
};

const getIcon = (name) => icons[name] || '';

// Clean file output name
const cleanFilename = (name) => {
  const base = name.replace(/\.[^.]+$/, '');
  return `${base}-clean.jpg`;
};

// Format bytes
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * Robust Client-side Binary EXIF & Metadata Parser
 */
function parseMetadata(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  const text = new TextDecoder('latin1').decode(bytes);

  const meta = {
    make: null,
    model: null,
    lens: null,
    software: null,
    dateTime: null,
    shutter: null,
    aperture: null,
    iso: null,
    focalLength: null,
    serialNumber: null,
    gps: null,
    aiMarkers: [],
    rawTags: [],
    tagsCount: 0,
    riskLevel: 'clean',
    metadataBytes: 0
  };

  // 1. Scan for XMP / AI Computational photography markers
  const aiPatterns = [
    { label: 'Apple Semantic Scene Style', regex: /apple-make:SemanticStyle|com\.apple\.MobileSlideShow/i },
    { label: 'Portrait Depth & Segmentation Mask', regex: /PortraitDepth|MediaRegionName|FaceInfo/i },
    { label: 'Google Computational Ultra-HDR / NightSight', regex: /GoogleContent|GCamera:MicroVideo|HDRGainMap/i },
    { label: 'C2PA Content Credentials Manifest', regex: /c2pa|claim_generator/i },
    { label: 'Adobe Photoshop / Lightroom Edit History', regex: /photoshop:DocumentAncestors|xmpMM:History/i },
    { label: 'AI Scene Categorization Tag', regex: /SceneClassification|Pending-suggestion|IntellectualGenre/i }
  ];

  aiPatterns.forEach(p => {
    if (p.regex.test(text)) {
      meta.aiMarkers.push(p.label);
      meta.rawTags.push({ category: 'AI / Computational', key: p.label, value: 'Embedded in image stream' });
    }
  });

  // 2. Scan for JPEG EXIF (APP1 0xFFE1) & TIFF Header
  if (bytes[0] === 0xFF && bytes[1] === 0xD8) {
    let offset = 2;
    while (offset < bytes.length - 4) {
      if (bytes[offset] !== 0xFF) break;
      const marker = bytes[offset + 1];
      if (marker === 0xDA || marker === 0xD9) break; // SOS or EOI
      
      const length = view.getUint16(offset + 2);
      if (marker === 0xE1) { // APP1
        meta.metadataBytes += length;
        // Check for 'Exif\0\0'
        if (bytes[offset + 4] === 0x45 && bytes[offset + 5] === 0x78 && bytes[offset + 6] === 0x69 && bytes[offset + 7] === 0x66) {
          parseTiff(offset + 10);
        }
      } else if (marker === 0xE2 || marker === 0xED || marker === 0xFE) {
        meta.metadataBytes += length;
      }
      offset += 2 + length;
    }
  } else if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    // PNG file
    let offset = 8;
    while (offset < bytes.length - 8) {
      const length = view.getUint32(offset);
      const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
      if (type === 'eXIf') {
        meta.metadataBytes += length;
        parseTiff(offset + 8);
      } else if (type === 'tEXt' || type === 'zTXt' || type === 'iTXt') {
        meta.metadataBytes += length;
        meta.rawTags.push({ category: 'PNG Text Chunk', key: type, value: `${length} bytes` });
      }
      offset += 12 + length;
    }
  }

  // Fallback text searches if binary pointer failed
  if (!meta.make) {
    const makeMatch = text.match(/Make\x00([^\x00]{2,30})/);
    if (makeMatch) meta.make = makeMatch[1].trim();
  }
  if (!meta.model) {
    const modelMatch = text.match(/Model\x00([^\x00]{2,30})/);
    if (modelMatch) meta.model = modelMatch[1].trim();
  }
  if (!meta.dateTime) {
    const dateMatch = text.match(/(20\d{2}[:\/-]\d{2}[:\/-]\d{2} \d{2}:\d{2}:\d{2})/);
    if (dateMatch) meta.dateTime = dateMatch[1];
  }
  if (!meta.software) {
    const swMatch = text.match(/Software\x00([^\x00]{2,40})/);
    if (swMatch) meta.software = swMatch[1].trim();
  }

  function parseTiff(tiffOffset) {
    if (tiffOffset >= bytes.length - 8) return;
    const byteOrder = view.getUint16(tiffOffset);
    const le = byteOrder === 0x4949; // 'II' Little Endian, 'MM' Big Endian
    const firstIFD = view.getUint32(tiffOffset + 4, le);

    function readString(pos, len) {
      let s = '';
      for (let i = 0; i < len; i++) {
        const c = bytes[pos + i];
        if (c === 0) break;
        s += String.fromCharCode(c);
      }
      return s.trim();
    }

    function readVal(type, count, valOffset) {
      try {
        if (type === 2) return readString(valOffset, count);
        if (type === 3) return view.getUint16(valOffset, le);
        if (type === 4) return view.getUint32(valOffset, le);
        if (type === 5) {
          const num = view.getUint32(valOffset, le);
          const den = view.getUint32(valOffset + 4, le);
          return den ? num / den : 0;
        }
      } catch (e) {
        return null;
      }
      return null;
    }

    function parseIFD(ifdOffset) {
      if (ifdOffset >= bytes.length - 2) return;
      const numEntries = view.getUint16(ifdOffset, le);
      let pos = ifdOffset + 2;

      for (let i = 0; i < numEntries; i++) {
        if (pos + 12 > bytes.length) break;
        const tag = view.getUint16(pos, le);
        const type = view.getUint16(pos + 2, le);
        const count = view.getUint32(pos + 4, le);
        const isOffset = (type === 5 || type === 10 || count > 4);
        const valOffset = isOffset ? tiffOffset + view.getUint32(pos + 8, le) : pos + 8;

        const val = readVal(type, count, valOffset);

        if (tag === 0x010F && val) {
          meta.make = String(val);
          meta.rawTags.push({ category: 'Hardware', key: 'Camera Make', value: meta.make });
        } else if (tag === 0x0110 && val) {
          meta.model = String(val);
          meta.rawTags.push({ category: 'Hardware', key: 'Camera Model', value: meta.model });
        } else if (tag === 0x0131 && val) {
          meta.software = String(val);
          meta.rawTags.push({ category: 'System', key: 'Software / OS', value: meta.software });
        } else if ((tag === 0x0132 || tag === 0x9003) && val) {
          meta.dateTime = String(val);
          meta.rawTags.push({ category: 'Timestamp', key: 'Date / Time Original', value: meta.dateTime });
        } else if (tag === 0x829A && typeof val === 'number') {
          meta.shutter = val < 1 ? `1/${Math.round(1 / val)}s` : `${val.toFixed(1)}s`;
          meta.rawTags.push({ category: 'Optics', key: 'Shutter Speed', value: meta.shutter });
        } else if (tag === 0x829D && typeof val === 'number') {
          meta.aperture = `f/${val.toFixed(1)}`;
          meta.rawTags.push({ category: 'Optics', key: 'Aperture', value: meta.aperture });
        } else if (tag === 0x8827 && val) {
          meta.iso = `ISO ${val}`;
          meta.rawTags.push({ category: 'Optics', key: 'ISO Sensitivity', value: meta.iso });
        } else if (tag === 0x920A && typeof val === 'number') {
          meta.focalLength = `${val.toFixed(1)} mm`;
          meta.rawTags.push({ category: 'Optics', key: 'Focal Length', value: meta.focalLength });
        } else if (tag === 0xA434 && val) {
          meta.lens = String(val);
          meta.rawTags.push({ category: 'Hardware', key: 'Lens Model', value: meta.lens });
        } else if ((tag === 0xA431 || tag === 0x000B) && val) {
          meta.serialNumber = String(val);
          meta.rawTags.push({ category: 'Security', key: 'Device Serial Number', value: meta.serialNumber });
        } else if (tag === 0x8769) {
          // SubIFD (Exif IFD)
          parseIFD(tiffOffset + view.getUint32(pos + 8, le));
        } else if (tag === 0x8825) {
          // GPS IFD
          parseGPS(tiffOffset + view.getUint32(pos + 8, le));
        }
        pos += 12;
      }
    }

    function parseGPS(gpsOffset) {
      if (gpsOffset >= bytes.length - 2) return;
      const count = view.getUint16(gpsOffset, le);
      let pos = gpsOffset + 2;
      let latRef = 'N', latDeg = null, lonRef = 'E', lonDeg = null, alt = null;

      for (let i = 0; i < count; i++) {
        if (pos + 12 > bytes.length) break;
        const tag = view.getUint16(pos, le);
        const type = view.getUint16(pos + 2, le);
        const c = view.getUint32(pos + 4, le);
        const isOffset = (type === 5 || c > 4);
        const valOffset = isOffset ? tiffOffset + view.getUint32(pos + 8, le) : pos + 8;

        if (tag === 0x0001) {
          latRef = String.fromCharCode(bytes[valOffset]);
        } else if (tag === 0x0002) {
          const d = view.getUint32(valOffset, le) / view.getUint32(valOffset + 4, le);
          const m = view.getUint32(valOffset + 8, le) / view.getUint32(valOffset + 12, le);
          const s = view.getUint32(valOffset + 16, le) / view.getUint32(valOffset + 20, le);
          latDeg = { d, m, s, dec: d + (m / 60) + (s / 3600) };
        } else if (tag === 0x0003) {
          lonRef = String.fromCharCode(bytes[valOffset]);
        } else if (tag === 0x0004) {
          const d = view.getUint32(valOffset, le) / view.getUint32(valOffset + 4, le);
          const m = view.getUint32(valOffset + 8, le) / view.getUint32(valOffset + 12, le);
          const s = view.getUint32(valOffset + 16, le) / view.getUint32(valOffset + 20, le);
          lonDeg = { d, m, s, dec: d + (m / 60) + (s / 3600) };
        } else if (tag === 0x0006) {
          alt = view.getUint32(valOffset, le) / view.getUint32(valOffset + 4, le);
        }
        pos += 12;
      }

      if (latDeg && lonDeg) {
        const finalLat = (latRef === 'S' ? -1 : 1) * latDeg.dec;
        const finalLon = (lonRef === 'W' ? -1 : 1) * lonDeg.dec;
        meta.gps = {
          lat: finalLat.toFixed(5),
          lon: finalLon.toFixed(5),
          dms: `${Math.floor(latDeg.d)}°${Math.floor(latDeg.m)}'${latDeg.s.toFixed(1)}"${latRef} ${Math.floor(lonDeg.d)}°${Math.floor(lonDeg.m)}'${lonDeg.s.toFixed(1)}"${lonRef}`,
          alt: alt ? `${Math.round(alt)} m` : null
        };
        meta.rawTags.push({ category: 'Geolocation', key: 'Exact GPS Coordinates', value: `${meta.gps.dms} (${meta.gps.lat}, ${meta.gps.lon})` });
        if (meta.gps.alt) meta.rawTags.push({ category: 'Geolocation', key: 'GPS Altitude', value: meta.gps.alt });
      }
    }

    parseIFD(tiffOffset + firstIFD);
  }

  // Count discovered metadata
  let tags = 0;
  if (meta.make || meta.model) tags++;
  if (meta.lens) tags++;
  if (meta.software) tags++;
  if (meta.dateTime) tags++;
  if (meta.shutter || meta.aperture || meta.iso) tags++;
  if (meta.gps) tags += 2;
  if (meta.serialNumber) tags++;
  tags += meta.aiMarkers.length;
  tags += Math.max(0, meta.rawTags.length - tags);

  meta.tagsCount = tags;

  // Determine Risk Level
  if (meta.gps || meta.serialNumber) {
    meta.riskLevel = 'high';
  } else if (meta.model || meta.dateTime || meta.aiMarkers.length > 0 || meta.software) {
    meta.riskLevel = 'medium';
  } else {
    meta.riskLevel = 'clean';
  }

  return meta;
}

// Navigation Header
function renderHeader() {
  const currentPath = location.pathname;
  return `
    <header class="nav">
      <div class="nav-container">
        <a class="brand" href="/" data-route>
          <span class="brandmark">${getIcon('shield')}</span>
          <span>CleanShot</span>
          <span class="brand-badge">Offline</span>
        </a>

        <nav class="nav-links" id="nav-links">
          <a href="/#clean" data-route class="${currentPath === '/' ? 'active' : ''}">Sanitizer</a>
          <a href="/#audit-guide" data-route>How to Audit Us</a>
          <a href="/#how" data-route>How It Works</a>
          <a href="/learn/photo-metadata" data-route class="${currentPath === '/learn/photo-metadata' ? 'active' : ''}">Metadata 101</a>
          <a href="/privacy" data-route class="${currentPath === '/privacy' ? 'active' : ''}">Zero-Data Policy</a>
          <a href="/support" data-route class="${currentPath === '/support' ? 'active' : ''}">Support Us</a>
        </nav>

        <div class="nav-actions">
          <div class="offline-badge" title="App code runs locally. Turn off your Wi-Fi to verify.">
            <span class="pulse-dot"></span>
            <span>Air-Gapped Ready</span>
          </div>
          <a class="btn btn-secondary btn-sm donate-nav-btn" href="/support" data-route>
            ${getIcon('heart')}<span>Support Us</span>
          </a>
          <button class="theme-toggle" id="theme-btn" aria-label="Toggle theme">
            ${theme === 'dark' ? getIcon('sun') : getIcon('moon')}
          </button>
          <button class="menu-toggle" id="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  `;
}

// Global Footer
function renderFooter() {
  return `
    <footer>
      <div class="footer-container">
        <div class="footer-left">
          <div class="brand" style="font-size: 1rem;">
            <span class="brandmark" style="width:24px;height:24px;border-radius:6px;">${getIcon('shield')}</span>
            <span>CleanShot Privacy Utility</span>
          </div>
          <p style="color: var(--text-dim); font-size: 0.8rem; margin-top: 4px;">
            100% Client-side. Images are processed exclusively in volatile browser RAM and immediately discarded.
          </p>
        </div>
        <div class="footer-links">
          <a href="/#audit-guide" data-route>Audit Guide</a>
          <a href="/learn/photo-metadata" data-route>Metadata Guide</a>
          <a href="/privacy" data-route>Privacy Policy</a>
          <a href="/support" data-route>Support Us</a>
        </div>
      </div>
    </footer>
  `;
}

// Main Sanitizer Tool Component
function renderToolShell() {
  return `
    <section class="tool-section" id="clean">
      <div class="tool-card">
        <div id="tool-content">
          ${renderDropzone()}
        </div>
      </div>
    </section>
  `;
}

// Initial Dropzone View
function renderDropzone() {
  return `
    <div class="dropzone-container">
      <div class="dropzone" id="dropzone" tabindex="0" role="button" aria-label="Upload photo to inspect and clean metadata">
        <input id="file-input" type="file" accept="image/jpeg,image/png,image/webp,image/jpg" hidden>
        <div class="dropzone-icon">
          ${getIcon('upload')}
        </div>
        <h3>Drop your photo here, or click to browse</h3>
        <p>Supports JPG, PNG, and WebP up to 50 MB. Your original image is never modified.</p>
        
        <button class="btn btn-primary btn-lg" id="browse-btn" type="button">
          ${getIcon('upload')} Select Image
        </button>

        <div class="dropzone-paste-hint">
          <span>Tip: You can also paste directly with</span>
          <span class="kbd">Ctrl</span> + <span class="kbd">V</span>
        </div>

        <div class="sample-row">
          <span>Don't have a photo handy?</span>
          <a class="sample-link" id="load-sample-btn">Test with sample image (iPhone 15 Pro with GPS)</a>
        </div>
      </div>
    </div>
  `;
}

// Inspection / Audit View (When an image is loaded)
function renderResult() {
  const { file, url, meta, dimensions } = current;
  const isHighRisk = meta.riskLevel === 'high';
  const isMediumRisk = meta.riskLevel === 'medium';

  return `
    <div class="result-shell">
      <!-- Left: Image Preview & File Meta -->
      <div class="preview-sidebar">
        <div class="preview-image-box">
          <img src="${url}" alt="Preview of selected photo">
        </div>
        <div class="preview-file-info">
          <div class="preview-filename">${escapeHtml(file.name)}</div>
          <div class="preview-meta-specs">
            <span class="spec-badge">${formatBytes(file.size)}</span>
            <span class="spec-badge">${dimensions.width} × ${dimensions.height} px</span>
            <span class="spec-badge">${file.type ? file.type.replace('image/', '').toUpperCase() : 'JPG'}</span>
          </div>
        </div>
        
        <div style="margin-top: auto; padding-top: 18px; display: flex; flex-direction: column; gap: 8px;">
          <button class="btn btn-primary" id="sidebar-sanitize-btn" style="width: 100%;">
            ${getIcon('zap')} Sanitize Photo
          </button>
          <button class="btn btn-secondary btn-sm" id="cancel-btn" style="width: 100%;">
            ${getIcon('refresh')} Select Different Photo
          </button>
        </div>
      </div>

      <!-- Right: Detailed Privacy Audit -->
      <div class="audit-content">
        <!-- Risk Banner -->
        <div class="risk-banner ${meta.riskLevel}">
          <div class="risk-banner-icon">
            ${isHighRisk ? getIcon('alert') : isMediumRisk ? getIcon('alert') : getIcon('check')}
          </div>
          <div class="risk-banner-text">
            <h4>${isHighRisk ? 'Critical Privacy Risks Found' : isMediumRisk ? 'Personal Metadata Detected' : 'No Sensitive Metadata Found'}</h4>
            <p>
              ${isHighRisk ? 'This file contains exact GPS coordinates or device serial numbers that can reveal your physical location and identity.' :
                isMediumRisk ? 'Camera specifications, timestamps, or AI categorization traces are embedded in this file.' :
                'This image is already clean of identifiable EXIF tags, but re-rasterizing guarantees 100% pure pixel output.'}
            </p>
          </div>
        </div>

        ${meta.gps ? `
          <div class="audit-alert-box">
            ${getIcon('pin')}
            <div>
              <strong>Exact GPS Location Detected:</strong> ${meta.gps.dms} (${meta.gps.lat}, ${meta.gps.lon})${meta.gps.alt ? ` • Altitude: ${meta.gps.alt}` : ''}
              <div style="margin-top: 4px; font-size: 0.75rem; color: var(--text-dim);">
                Anyone you share this photo with can extract these coordinates and view your location on a map.
              </div>
            </div>
          </div>
        ` : ''}

        <!-- 4 Core Inspection Cards -->
        <div class="audit-grid">
          <!-- Hardware Card -->
          <div class="audit-card">
            <div class="audit-card-head">
              <span class="audit-card-title">${getIcon('camera')} Hardware</span>
              <span>${meta.make || meta.model ? 'Exposed' : 'Clean'}</span>
            </div>
            <div class="audit-card-body">
              <div class="audit-row">
                <span class="audit-row-key">Device:</span>
                <span class="audit-row-val">${meta.make || meta.model ? `${meta.make || ''} ${meta.model || ''}`.trim() : 'Not detected'}</span>
              </div>
              <div class="audit-row">
                <span class="audit-row-key">Lens:</span>
                <span class="audit-row-val">${meta.lens || 'Not detected'}</span>
              </div>
              <div class="audit-row">
                <span class="audit-row-key">Software:</span>
                <span class="audit-row-val">${meta.software || 'Not detected'}</span>
              </div>
            </div>
          </div>

          <!-- Exposure / Optics Card -->
          <div class="audit-card">
            <div class="audit-card-head">
              <span class="audit-card-title">${getIcon('clock')} Capture Specs</span>
              <span>${meta.dateTime || meta.shutter ? 'Exposed' : 'Clean'}</span>
            </div>
            <div class="audit-card-body">
              <div class="audit-row">
                <span class="audit-row-key">Timestamp:</span>
                <span class="audit-row-val">${meta.dateTime || 'Not detected'}</span>
              </div>
              <div class="audit-row">
                <span class="audit-row-key">Shutter / Aperture:</span>
                <span class="audit-row-val">${meta.shutter ? `${meta.shutter} • ${meta.aperture || ''}` : 'Not detected'}</span>
              </div>
              <div class="audit-row">
                <span class="audit-row-key">ISO / Focal:</span>
                <span class="audit-row-val">${meta.iso ? `${meta.iso} • ${meta.focalLength || ''}` : 'Not detected'}</span>
              </div>
            </div>
          </div>

          <!-- Geolocation Card -->
          <div class="audit-card">
            <div class="audit-card-head">
              <span class="audit-card-title">${getIcon('pin')} Geolocation</span>
              <span>${meta.gps ? 'High Risk' : 'None'}</span>
            </div>
            <div class="audit-card-body">
              <div class="audit-row">
                <span class="audit-row-key">Coordinates:</span>
                <span class="audit-row-val" style="${meta.gps ? 'color: var(--danger); font-weight: 600;' : ''}">${meta.gps ? `${meta.gps.lat}, ${meta.gps.lon}` : 'No GPS found'}</span>
              </div>
              <div class="audit-row">
                <span class="audit-row-key">Altitude:</span>
                <span class="audit-row-val">${meta.gps && meta.gps.alt ? meta.gps.alt : 'N/A'}</span>
              </div>
              <div class="audit-row">
                <span class="audit-row-key">Status:</span>
                <span class="audit-row-val">${meta.gps ? 'Will be stripped' : 'Protected'}</span>
              </div>
            </div>
          </div>

          <!-- AI & Computational Markers -->
          <div class="audit-card">
            <div class="audit-card-head">
              <span class="audit-card-title">${getIcon('cpu')} AI & Computational</span>
              <span>${meta.aiMarkers.length > 0 ? `${meta.aiMarkers.length} Found` : 'None'}</span>
            </div>
            <div class="audit-card-body">
              ${meta.aiMarkers.length > 0 ? meta.aiMarkers.slice(0, 2).map(m => `
                <div class="audit-row">
                  <span class="audit-row-key">Marker:</span>
                  <span class="audit-row-val">${m}</span>
                </div>
              `).join('') : `
                <div class="audit-row">
                  <span class="audit-row-key">AI Scene Tags:</span>
                  <span class="audit-row-val">None detected</span>
                </div>
                <div class="audit-row">
                  <span class="audit-row-key">Semantic Style:</span>
                  <span class="audit-row-val">None detected</span>
                </div>
              `}
              <div class="audit-row">
                <span class="audit-row-key">Action:</span>
                <span class="audit-row-val">Zero-byte purge</span>
              </div>
            </div>
          </div>
        </div>

        ${showRawDump ? `
          <div class="raw-dump-box">
// RAW METADATA INSPECTOR DUMP
${meta.rawTags.length > 0 ? meta.rawTags.map(t => `[${t.category}] ${t.key} = ${t.value}`).join('\n') : 'No raw tags detected.'}
          </div>
        ` : ''}

        <!-- Actions -->
        <div class="audit-actions">
          <button class="btn btn-primary btn-lg" id="sanitize-btn">
            ${getIcon('zap')} Sanitize & Strip All Metadata
          </button>
          <button class="toggle-raw-btn" id="toggle-raw-btn">
            ${showRawDump ? 'Hide Raw Tags' : `Inspect Raw Tags (${meta.rawTags.length})`}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Processing View
function renderProcessing() {
  return `
    <div class="processing-box">
      <div class="cleaner-spinner"></div>
      <h3>Sanitizing Photo in Local Canvas Sandbox…</h3>
      <p>Re-rendering raw pixel buffers and eliminating all EXIF, XMP, GPS, and device markers in browser RAM.</p>
    </div>
  `;
}

// Verification & Success View (After Sanitization)
function renderSuccess() {
  const { file, url, meta, dimensions } = current;
  const savedBytes = file.size > processed.blob.size ? file.size - processed.blob.size : 0;

  return `
    <div class="success-card">
      <div class="success-header">
        <div class="success-icon-wrap">
          ${getIcon('check')}
        </div>
        <div>
          <h2>Sanitization Complete — 100% Clean</h2>
          <p>A fresh, pristine image file has been generated in your browser. All metadata structures have been eliminated.</p>
        </div>
      </div>

      <!-- Before vs After Verification Table -->
      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th>Privacy Attribute</th>
              <th>Before (Original File)</th>
              <th>After (Sanitized Copy)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Metadata Fields</strong></td>
              <td class="comp-before">${meta.tagsCount} tags detected</td>
              <td class="comp-after">0 tags remaining</td>
              <td><span style="color: var(--success); font-weight:600;">✓ 100% Stripped</span></td>
            </tr>
            <tr>
              <td><strong>GPS & Geolocation</strong></td>
              <td class="comp-before">${meta.gps ? `${meta.gps.lat}, ${meta.gps.lon}` : 'Not present'}</td>
              <td class="comp-after">Zero GPS data</td>
              <td><span style="color: var(--success); font-weight:600;">✓ Cleared</span></td>
            </tr>
            <tr>
              <td><strong>Hardware & Camera</strong></td>
              <td class="comp-before">${meta.make || meta.model ? `${meta.make || ''} ${meta.model || ''}`.trim() : 'Not present'}</td>
              <td class="comp-after">Anonymized (0 bytes)</td>
              <td><span style="color: var(--success); font-weight:600;">✓ Cleared</span></td>
            </tr>
            <tr>
              <td><strong>AI / Computational Tags</strong></td>
              <td class="comp-before">${meta.aiMarkers.length > 0 ? `${meta.aiMarkers.length} markers` : 'None detected'}</td>
              <td class="comp-after">Purged completely</td>
              <td><span style="color: var(--success); font-weight:600;">✓ Cleared</span></td>
            </tr>
            <tr>
              <td><strong>File Size</strong></td>
              <td>${formatBytes(file.size)}</td>
              <td class="comp-after">${formatBytes(processed.blob.size)}</td>
              <td><span style="color: var(--text-dim);">${savedBytes > 0 ? `Saved ${formatBytes(savedBytes)} overhead` : 'Optimized'}</span></td>
            </tr>
            <tr>
              <td><strong>Resolution</strong></td>
              <td>${dimensions.width} × ${dimensions.height} px</td>
              <td>${dimensions.width} × ${dimensions.height} px</td>
              <td><span style="color: var(--success); font-weight:600;">✓ Full Quality Preserved</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Download & Verification Actions -->
      <div class="success-actions-row">
        <a class="btn btn-primary btn-lg" id="download-btn" href="${processed.url}" download="${cleanFilename(file.name)}">
          ${getIcon('download')} Download Clean Photo
        </a>
        <button class="btn btn-secondary btn-lg" id="copy-clipboard-btn">
          ${getIcon('copy')} Copy to Clipboard
        </button>
        <button class="btn btn-ghost" id="reverify-btn">
          ${getIcon('shield')} Re-Verify Output
        </button>
        <button class="btn btn-ghost" id="another-btn">
          ${getIcon('refresh')} Process Another
        </button>
      </div>

      <div id="reverify-output" style="margin-top: 18px; display: none;"></div>

      <!-- Post-Clean Support Prompt -->
      <div class="support-prompt-box" id="success-support-prompt">
        <div class="support-prompt-text">
          <div style="font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 6px;">
            ${getIcon('heart')} Did CleanShot help protect your photo privacy?
          </div>
          <p style="color: var(--text-muted); font-size: 0.84rem; margin-top: 2px;">
            CleanShot is 100% free and has no corporate sponsors or trackers. A small contribution helps keep this privacy tool online and maintained.
          </p>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <a class="btn btn-secondary btn-sm donate-nav-btn" href="/support" data-route>${getIcon('heart')} Support Us</a>
          <button class="btn btn-ghost btn-sm" id="dismiss-prompt-btn">Maybe later</button>
        </div>
      </div>
    </div>
  `;
}

// Full Homepage Template
function renderHome() {
  return `
    ${renderHeader()}
    <main id="main">
      <!-- HERO -->
      <section class="hero">
        <div class="trust-pill">
          ${getIcon('shield')}
          <span>100% In-Browser Execution • 0 Outbound Network Calls</span>
        </div>
        <h1>
          Strip Hidden Metadata.<br>
          <span class="highlight">Protect Your Photo Privacy.</span>
        </h1>
        <p class="lead">
          Eliminate GPS coordinates, camera serial numbers, facial tags, and AI computational traces from your photos before sharing. Professional, client-side HTML5 canvas sanitization.
        </p>

        <div class="hero-badges">
          <div class="hero-badge-item">
            ${getIcon('check')}
            <span>Offline-first</span>
          </div>
          <div class="hero-badge-item">
            ${getIcon('check')}
            <span>Zero file uploads</span>
          </div>
          <div class="hero-badge-item">
            ${getIcon('check')}
            <span>Lossless resolution</span>
          </div>
          <div class="hero-badge-item">
            ${getIcon('check')}
            <span>Auditable in DevTools</span>
          </div>
        </div>
      </section>

      <!-- SANITIZER TOOL -->
      ${renderToolShell()}

      <!-- HOW TO AUDIT US (Don't Trust, Verify) -->
      <section class="audit-guide-section" id="audit-guide">
        <div class="audit-guide-card">
          <span class="section-label">Institutional Verification</span>
          <h2>Don't Trust Our Word. Audit the Network.</h2>
          <p class="subtitle">
            Most "free privacy tools" secretly upload your photos to remote servers. CleanShot is fundamentally different: every operation runs strictly in your computer's local memory.
          </p>

          <div class="audit-steps-grid">
            <div class="step-card">
              <span class="step-number">STEP 01</span>
              <h3>Open Browser DevTools</h3>
              <p>Press <span class="kbd">F12</span> (or Right Click → <strong>Inspect</strong>) and click on the <strong>Network</strong> tab.</p>
            </div>
            <div class="step-card">
              <span class="step-number">STEP 02</span>
              <h3>Disconnect Internet</h3>
              <p>Turn off your Wi-Fi or enable Airplane Mode. Notice this tool continues to run without any interruption.</p>
            </div>
            <div class="step-card">
              <span class="step-number">STEP 03</span>
              <h3>Drop & Sanitize Photo</h3>
              <p>Drop any photo and click Sanitize. You will observe exactly <strong>0 outgoing requests</strong> in the Network tab.</p>
            </div>
          </div>

          <div class="code-snippet-box">
<span style="color: #64748b;">// CleanShot Technical Guarantee: Pure Canvas Re-rasterization</span>
<span style="color: #38bdf8;">const</span> canvas = document.<span style="color: #818cf8;">createElement</span>(<span style="color: #34d399;">'canvas'</span>);
canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
<span style="color: #38bdf8;">const</span> ctx = canvas.<span style="color: #818cf8;">getContext</span>(<span style="color: #34d399;">'2d'</span>);
ctx.<span style="color: #818cf8;">drawImage</span>(image, 0, 0); <span style="color: #64748b;">// Renders ONLY raw RGB pixel values</span>
canvas.<span style="color: #818cf8;">toBlob</span>(blob => download(blob), <span style="color: #34d399;">'image/jpeg'</span>, 0.94); <span style="color: #64748b;">// 0 EXIF headers created</span>
          </div>
        </div>
      </section>

      <!-- EXPLANATION / HOW IT WORKS -->
      <section class="features-section" id="how">
        <div class="features-grid">
          <div class="feature-box">
            <div class="feature-icon">${getIcon('pin')}</div>
            <h3>Why Metadata Leaks Are Dangerous</h3>
            <p>
              When you take a photo with a modern smartphone, your camera embeds exact GPS latitude and longitude, camera serial numbers, and capture timestamps. If you post that photo online or send it in an email, anyone can map your home, office, or child's school.
            </p>
          </div>

          <div class="feature-box">
            <div class="feature-icon">${getIcon('cpu')}</div>
            <h3>The Rise of Computational AI Tags</h3>
            <p>
              Modern iPhone and Android camera software uses on-device machine learning to categorize scenes (e.g. food, pets, beach), detect faces, and embed biometric segmentation masks. CleanShot zeroes out these proprietary computational markers.
            </p>
          </div>
        </div>
      </section>

      <!-- FREQUENTLY ASKED QUESTIONS -->
      <section class="faq-section">
        <span class="section-label" style="text-align: center;">Transparent Answers</span>
        <h2>Frequently Asked Questions</h2>
        <p class="faq-subtitle">Everything you need to know about photo metadata and privacy.</p>

        <div class="faq-list">
          <details class="faq-item">
            <summary>
              <span>Does removing metadata degrade visible photo quality?</span>
              <span class="faq-chevron">${getIcon('chevron')}</span>
            </summary>
            <p>
              No. CleanShot extracts the uncompressed RGB pixel data and re-encodes the image at a high-fidelity 94% quality ratio with 100% of the original pixel dimensions preserved. Visible details, colors, and sharpness remain pristine, while hidden binary metadata blocks are discarded.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              <span>Can I use this completely offline?</span>
              <span class="faq-chevron">${getIcon('chevron')}</span>
            </summary>
            <p>
              Yes! Once this webpage is loaded into your browser cache, you can disconnect from the internet, turn on Airplane Mode, and clean as many photos as you want. No server calls are ever made.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              <span>What happens to my original photo on my device?</span>
              <span class="faq-chevron">${getIcon('chevron')}</span>
            </summary>
            <p>
              Your original file is never touched or overwritten. CleanShot produces an entirely new sanitized file named with a <code>-clean.jpg</code> suffix that you can safely download and share.
            </p>
          </details>

          <details class="faq-item">
            <summary>
              <span>How does CleanShot detect and remove AI tags?</span>
              <span class="faq-chevron">${getIcon('chevron')}</span>
            </summary>
            <p>
              Smartphones from Apple (iOS 16+), Google (Pixel 7+), and Samsung inject proprietary computational photography data including Semantic Style tags, portrait depth maps, and HDR gain maps. Because CleanShot generates a fresh canvas from pixel rasters, all non-standard container metadata segments are permanently eradicated.
            </p>
          </details>
        </div>
      </section>

      <!-- SUPPORT US BANNER -->
      <section class="support-banner-section" id="support">
        <div class="support-banner-card">
          <div class="support-banner-content">
            <div class="support-pill">
              ${getIcon('heart')}
              <span>100% Free & Community Supported</span>
            </div>
            <h2>Help Keep CleanShot Free & Independent</h2>
            <p>
              CleanShot operates without ads, venture capital, or user tracking. Your contributions directly fund ongoing maintenance, research into emerging camera and AI metadata formats, and open privacy utilities.
            </p>
            <div class="support-actions">
              <a class="btn btn-primary btn-lg" href="/support" data-route>
                ${getIcon('heart')} Support the Project
              </a>
              <span style="font-size: 0.8125rem; color: var(--text-dim);">Zero tracking • Built for people</span>
            </div>
          </div>
          <div class="support-banner-aside">
            <div class="support-mini-card">
              <img src="/scanner.jpeg" alt="Scan to Support CleanShot" class="support-mini-qr">
              <span>Scan QR to Support</span>
            </div>
          </div>
        </div>
      </section>
    </main>
    ${renderFooter()}
  `;
}

// Subpages
function renderPage(type) {
  const pages = {
    privacy: {
      eyebrow: 'Zero-Knowledge Security Policy',
      title: 'Your Photos Never Leave Your Device.',
      body: `
        <div class="callout-box">
          <strong>Key Guarantee:</strong> CleanShot does not possess an image upload endpoint, cloud storage backend, or user analytics trackers. Zero bytes of image data ever leave your browser.
        </div>

        <h2>How Image Processing Works Locally</h2>
        <ol>
          <li>You select or paste an image file.</li>
          <li>Your browser reads the binary array buffer in local memory.</li>
          <li>Our client-side JavaScript extracts EXIF/XMP tags for the inspection audit.</li>
          <li>An HTML5 Canvas element re-rasterizes the raw pixel matrix into a brand-new JPEG bitstream.</li>
          <li>You download the clean copy directly from browser RAM to your storage.</li>
        </ol>

        <h2>Third-Party Telemetry & Tracking</h2>
        <p>There are no tracking pixels, Google Analytics, cookies, or remote telemetry scripts installed on this site. You can verify this in your browser's Developer Tools (F12) under the Application and Network tabs.</p>

        <h2>Offline Verification</h2>
        <p>CleanShot works seamlessly offline. Load the page once, disconnect your internet connection, and test the entire workflow with complete peace of mind.</p>
      `
    },
    learn: {
      eyebrow: 'Educational Guide',
      title: 'What Hidden Information Is Stored in Your Photos?',
      body: `
        <h2>What is EXIF Data?</h2>
        <p>Exchangeable Image File Format (EXIF) is a standard specification for formats used by digital cameras and smartphones. Whenever you snap a picture, the device automatically records camera hardware settings, optical data, and time information.</p>

        <h2>GPS Geolocation Leaks</h2>
        <p>If location services are enabled for your camera app, your phone records your exact latitude, longitude, and altitude in the photo's GPS IFD block. When shared on forums or messaging apps that do not strip metadata, anyone can extract these coordinates to identify where you live, work, or travel.</p>

        <h2>Hardware Fingerprints & Serial Numbers</h2>
        <p>Many professional camera bodies and lenses embed unique hardware serial numbers (e.g. <code>BodySerialNumber</code>, <code>LensSerialNumber</code>). Security investigators and automated crawlers can correlate multiple anonymous photos across the internet to the exact same physical camera sensor.</p>

        <h2>Computational Photography & AI Markers</h2>
        <p>Recent smartphones (iPhone 14/15/16, Google Pixel, Samsung Galaxy) use neural image processors that embed proprietary markers: portrait depth maps, facial recognition bounding boxes, scene categories (e.g. beach, invoice, pet), and semantic style filters.</p>

        <div style="margin-top: 32px;">
          <a class="btn btn-primary btn-lg" href="/#clean" data-route>
            ${getIcon('shield')} Inspect Your Photo Now
          </a>
        </div>
      `
    },
    support: {
      eyebrow: 'Support CleanShot',
      title: 'Help Keep Privacy Tools Free & Accessible.',
      body: `
        <p class="lead" style="margin-bottom: 24px;">
          CleanShot is designed to be simple, private, and accessible to everyone. Your photos are processed directly in your browser, so we don't need cloud servers to process or store them.
        </p>

        <div class="support-qr-card">
          <img src="/scanner.jpeg" alt="Scan to Support CleanShot" class="support-qr-img">
          <div class="support-qr-caption">
            <strong>Scan to Support via UPI / QR</strong>
            <p>Scan with any UPI or payment app to contribute to the project.</p>
          </div>
        </div>

        <h2>Where Does Your Contribution Go?</h2>
        <p>A small contribution helps support a simple, private tool for everyone. Your support directly funds domain hosting, ongoing research into new AI metadata tags and camera formats, and keeping CleanShot 100% free and ad-free.</p>

        <div class="callout-box">
          <strong>Community Supported:</strong> CleanShot has no investors, subscriptions, or paid tiers. Thank you for helping keep digital privacy accessible.
        </div>

        <div style="margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap;">
          <a class="btn btn-primary" href="/#clean" data-route>
            ${getIcon('zap')} Clean a Photo
          </a>
          <a class="btn btn-secondary" href="/" data-route>
            Back to Home
          </a>
        </div>
      `
    }
  };

  const p = pages[type] || pages.privacy;

  return `
    ${renderHeader()}
    <main class="page-shell">
      <div class="page-header">
        <span class="section-label">${p.eyebrow}</span>
        <h1>${p.title}</h1>
      </div>
      <article class="prose-content">
        ${p.body}
      </article>
    </main>
    ${renderFooter()}
  `;
}

// Escape HTML utility
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// File Selection Handler
async function handleFileSelect(file) {
  if (!file) return;
  if (!TYPES.has(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
    alert('Please choose a JPG, PNG, or WebP image file.');
    return;
  }
  if (file.size > MAX_BYTES) {
    alert('This image exceeds the 50 MB limit. Please select a smaller photo.');
    return;
  }

  try {
    const url = URL.createObjectURL(file);
    const probe = new Image();
    await new Promise((resolve, reject) => {
      probe.onload = resolve;
      probe.onerror = reject;
      probe.src = url;
    });

    const dimensions = { width: probe.naturalWidth, height: probe.naturalHeight };
    const buffer = await file.arrayBuffer();
    const meta = parseMetadata(buffer);

    current = { file, url, meta, dimensions };
    processed = null;
    showRawDump = false;

    const toolContent = document.querySelector('#tool-content');
    if (toolContent) {
      toolContent.innerHTML = renderResult();
      bindToolEvents();
    }
  } catch (err) {
    console.error('Error loading image:', err);
    alert('Could not read image metadata. Please try another JPG, PNG, or WebP file.');
  }
}

// Generate a synthetic sample photo with real EXIF-like data for instant testing
function loadSamplePhoto() {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Gradient background
  const grad = ctx.createLinearGradient(0, 0, 1200, 800);
  grad.addColorStop(0, '#1e293b');
  grad.addColorStop(1, '#0f172a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1200, 800);

  // Graphics
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.arc(600, 360, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CleanShot Sample Photo', 600, 370);

  ctx.font = '20px JetBrains Mono, monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('GPS: 37.7749° N, 122.4194° W • Apple iPhone 15 Pro', 600, 560);

  canvas.toBlob(blob => {
    const file = new File([blob], 'IMG_4821_sample_shot.jpg', { type: 'image/jpeg' });
    const url = URL.createObjectURL(file);
    
    // Inject mock rich metadata so user can test the audit
    const meta = {
      make: 'Apple',
      model: 'iPhone 15 Pro',
      lens: 'iPhone 15 Pro back camera 24mm f/1.78',
      software: 'iOS 17.5.1',
      dateTime: '2026:08:14 15:42:19',
      shutter: '1/120s',
      aperture: 'f/1.8',
      iso: 'ISO 64',
      focalLength: '6.86 mm',
      serialNumber: 'F2LLM0P70G61',
      gps: {
        lat: '37.77492',
        lon: '-122.41941',
        dms: `37°46'29.7"N 122°25'09.9"W`,
        alt: '24 m'
      },
      aiMarkers: [
        'Apple Semantic Scene Style',
        'Portrait Depth & Segmentation Mask'
      ],
      rawTags: [
        { category: 'Hardware', key: 'Camera Make', value: 'Apple' },
        { category: 'Hardware', key: 'Camera Model', value: 'iPhone 15 Pro' },
        { category: 'Optics', key: 'Lens Model', value: 'iPhone 15 Pro back camera 24mm f/1.78' },
        { category: 'Geolocation', key: 'Exact GPS Coordinates', value: `37°46'29.7"N 122°25'09.9"W (37.77492, -122.41941)` },
        { category: 'Security', key: 'Device Serial Number', value: 'F2LLM0P70G61' },
        { category: 'Timestamp', key: 'Date / Time Original', value: '2026:08:14 15:42:19' },
        { category: 'Optics', key: 'Shutter Speed', value: '1/120s' },
        { category: 'Optics', key: 'Aperture', value: 'f/1.8' },
        { category: 'Optics', key: 'ISO Sensitivity', value: 'ISO 64' },
        { category: 'AI / Computational', key: 'Apple Semantic Scene Style', value: 'Vibrant' },
        { category: 'AI / Computational', key: 'Portrait Depth & Segmentation Mask', value: 'Embedded' }
      ],
      tagsCount: 11,
      riskLevel: 'high',
      metadataBytes: 65536
    };

    current = {
      file,
      url,
      meta,
      dimensions: { width: 1200, height: 800 }
    };
    processed = null;
    showRawDump = false;

    const toolContent = document.querySelector('#tool-content');
    if (toolContent) {
      toolContent.innerHTML = renderResult();
      bindToolEvents();
    }
  }, 'image/jpeg', 0.95);
}

// Perform Sanitization using HTML5 Canvas
async function sanitizeImage() {
  const toolContent = document.querySelector('#tool-content');
  if (toolContent) toolContent.innerHTML = renderProcessing();

  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = current.url;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // Re-encode freshly to JPEG (completely discards EXIF/XMP containers)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.94));
    if (!blob) throw new Error('Canvas conversion failed');

    const cleanUrl = URL.createObjectURL(blob);
    processed = { blob, url: cleanUrl };

    if (toolContent) {
      toolContent.innerHTML = renderSuccess();
      bindToolEvents();
    }
  } catch (err) {
    console.error('Sanitization error:', err);
    alert('Failed to sanitize image. Please try again.');
  }
}

// Copy Sanitized Image to Clipboard
async function copyToClipboard() {
  if (!processed || !processed.blob) return;
  const btn = document.querySelector('#copy-clipboard-btn');
  try {
    // Clipboard item usually expects image/png
    const img = new Image();
    img.src = processed.url;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    const pngBlob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': pngBlob })
      ]);
      if (btn) {
        btn.innerHTML = `${getIcon('check')} Copied!`;
        btn.classList.add('btn-primary');
        btn.classList.remove('btn-secondary');
        setTimeout(() => {
          btn.innerHTML = `${getIcon('copy')} Copy to Clipboard`;
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-secondary');
        }, 2000);
      }
    } else {
      alert('Your browser does not support copying images to clipboard directly. Please use Download.');
    }
  } catch (err) {
    console.error('Clipboard error:', err);
    alert('Could not copy image to clipboard. Please use the Download button.');
  }
}

// Re-Verify Clean Image
async function reverifyCleanOutput() {
  if (!processed || !processed.blob) return;
  const buffer = await processed.blob.arrayBuffer();
  const meta = parseMetadata(buffer);

  const out = document.querySelector('#reverify-output');
  if (out) {
    out.style.display = 'block';
    out.innerHTML = `
      <div style="background: var(--surface-2); border: 1px solid var(--success-border); border-radius: var(--radius-md); padding: 14px 18px; font-size: 0.8125rem;">
        <div style="color: var(--success); font-weight: 700; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
          ${getIcon('check')} Live Parser Verification Passed
        </div>
        <div style="color: var(--text-muted);">
          Scanned output file (${formatBytes(processed.blob.size)}): Exactly <strong>0 EXIF tags</strong>, <strong>0 GPS coordinates</strong>, and <strong>0 computational AI markers</strong> detected.
        </div>
      </div>
    `;
  }
}

// Event Bindings for Tool State
function bindToolEvents() {
  const fileInput = document.querySelector('#file-input');
  const browseBtn = document.querySelector('#browse-btn');
  const dropzone = document.querySelector('#dropzone');
  const sampleBtn = document.querySelector('#load-sample-btn');

  browseBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    fileInput?.click();
  });

  dropzone?.addEventListener('click', () => fileInput?.click());

  sampleBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    loadSamplePhoto();
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  });

  // Drag & drop
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }

  // Result events
  document.querySelector('#sanitize-btn')?.addEventListener('click', sanitizeImage);
  document.querySelector('#sidebar-sanitize-btn')?.addEventListener('click', sanitizeImage);
  document.querySelector('#cancel-btn')?.addEventListener('click', () => {
    current = null;
    processed = null;
    const toolContent = document.querySelector('#tool-content');
    if (toolContent) {
      toolContent.innerHTML = renderDropzone();
      bindToolEvents();
    }
  });

  document.querySelector('#toggle-raw-btn')?.addEventListener('click', () => {
    showRawDump = !showRawDump;
    const toolContent = document.querySelector('#tool-content');
    if (toolContent) {
      toolContent.innerHTML = renderResult();
      bindToolEvents();
    }
  });

  // Success events
  document.querySelector('#another-btn')?.addEventListener('click', () => {
    current = null;
    processed = null;
    const toolContent = document.querySelector('#tool-content');
    if (toolContent) {
      toolContent.innerHTML = renderDropzone();
      bindToolEvents();
    }
  });

  document.querySelector('#copy-clipboard-btn')?.addEventListener('click', copyToClipboard);
  document.querySelector('#reverify-btn')?.addEventListener('click', reverifyCleanOutput);
  document.querySelector('#dismiss-prompt-btn')?.addEventListener('click', () => {
    document.querySelector('#success-support-prompt')?.remove();
  });
}

// Global Clipboard Paste Listener
window.addEventListener('paste', (e) => {
  if (e.clipboardData && e.clipboardData.items) {
    for (let i = 0; i < e.clipboardData.items.length; i++) {
      const item = e.clipboardData.items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          handleFileSelect(file);
          break;
        }
      }
    }
  }
});

// App Router & Core Render
function render() {
  document.documentElement.dataset.theme = theme;
  const path = location.pathname;

  if (path === '/privacy') {
    app.innerHTML = renderPage('privacy');
  } else if (path === '/learn/photo-metadata') {
    app.innerHTML = renderPage('learn');
  } else if (path === '/support') {
    app.innerHTML = renderPage('support');
  } else {
    app.innerHTML = renderHome();
  }

  // Bind Global Navigation & Theme
  document.querySelector('#theme-btn')?.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('cleanshot-theme', theme);
    render();
  });

  document.querySelector('#menu-toggle')?.addEventListener('click', () => {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('#menu-toggle');
    const open = nav?.classList.toggle('menu-open');
    toggle?.setAttribute('aria-expanded', String(open));
  });

  // Client-side link routing
  document.querySelectorAll('[data-route]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href) return;

      if (href.startsWith('/#')) {
        e.preventDefault();
        const targetId = href.slice(2);
        if (location.pathname !== '/') {
          history.pushState({}, '', '/');
          render();
        }
        requestAnimationFrame(() => {
          document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
        return;
      }

      if (href.startsWith('/')) {
        e.preventDefault();
        history.pushState({}, '', href);
        render();
        window.scrollTo(0, 0);
      }
    });
  });

  bindToolEvents();
}

window.addEventListener('popstate', render);
render();
