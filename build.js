const fs = require('fs');

const styles = fs.readFileSync('styles.css', 'utf8');
const responsive = fs.readFileSync('responsive.css', 'utf8');
const appJs = fs.readFileSync('app.js', 'utf8');

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Offline Client-Side Photo Privacy &amp; Metadata Sanitizer. Strip GPS location, camera serial numbers, and AI tags with zero network calls." />
  <meta name="theme-color" content="#090d16" />
  <title>CleanShot — Offline Photo Privacy &amp; Metadata Sanitizer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;family=JetBrains+Mono:wght@400;500;600&amp;display=swap" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="responsive.css" />
  <style>
${styles}
${responsive}
  </style>
</head>
<body>
  <a class="skip-link" href="#clean">Skip to photo sanitizer</a>
  <div id="app"></div>
  <script type="module">
${appJs}
  </script>
</body>
</html>
`;

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully generated self-contained index.html! Size:', html.length, 'bytes');
