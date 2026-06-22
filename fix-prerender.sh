#!/usr/bin/env bash
# Sopodiva — switch prerender from Puppeteer to jsdom (no browser / no arch issues).
# Run from the repo root (your sopodiva directory).
set -e

echo "==> replacing scripts/prerender.mjs (jsdom version)"
mkdir -p scripts
cat > scripts/prerender.mjs << 'EOF_SOPODIVA_FIX_8842_PRE'
/* =========================================================================
   Sopodiva Development — prerender build (jsdom, no browser required)
   Executes the SPA's own app.js against each route in a headless DOM and
   writes the fully-rendered HTML (with per-route <head>) to dist/<route>/.
   Also emits sitemap.xml and robots.txt.

   Pure Node — no Chrome, no Puppeteer, architecture-independent.
   Run:  npm install && npm run build   (output in ./dist)
   ========================================================================= */
import { readFile, rm, mkdir, cp, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { JSDOM, VirtualConsole } from "jsdom";

const ROOT   = process.cwd();
const OUT    = join(ROOT, "dist");
const ORIGIN = "https://www.sopodivadevelopment.com";

// Keep in sync with the ROUTES map in assets/app.js.
const ROUTES = [
  "/", "/marketplace", "/services", "/request",
  "/urgent", "/inspection", "/join", "/about", "/contact",
];

const html  = await readFile(join(ROOT, "index.html"), "utf8");
const appjs = await readFile(join(ROOT, "assets/app.js"), "utf8");

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });
await cp(join(ROOT, "assets"), join(OUT, "assets"), { recursive: true });

for (const route of ROUTES) {
  const url = ORIGIN + (route === "/" ? "/" : route);
  const vc = new VirtualConsole();              // swallow app console output
  const dom = new JSDOM(html, {
    url, runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc,
  });
  const { window } = dom;
  // stubs for APIs jsdom doesn't implement; the live artisan fetch is caught by the app
  window.scrollTo = () => {};
  window.fetch = () => Promise.reject(new Error("prerender: no network"));
  window.HTMLElement.prototype.scrollIntoView = () => {};

  window.eval(appjs);                            // boots app; renders this route synchronously

  const out = "<!DOCTYPE html>\n" + window.document.documentElement.outerHTML + "\n";
  const file = route === "/" ? join(OUT, "index.html") : join(OUT, route, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, out, "utf8");
  console.log("  prerendered", route, "->", file.replace(ROOT, "."));
  window.close();
}

// sitemap.xml
const today = new Date().toISOString().slice(0, 10);
const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  ROUTES.map(r => `  <url><loc>${ORIGIN}${r === "/" ? "/" : r}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
  `\n</urlset>\n`;
await writeFile(join(OUT, "sitemap.xml"), sitemap, "utf8");

// robots.txt (copy from source if present, else generate)
const robotsSrc = join(ROOT, "robots.txt");
const robots = existsSync(robotsSrc)
  ? await readFile(robotsSrc)
  : `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
await writeFile(join(OUT, "robots.txt"), robots);

console.log("\nBuild complete ->", OUT);
EOF_SOPODIVA_FIX_8842_PRE

echo "==> replacing package.json (jsdom instead of puppeteer)"
cat > package.json << 'EOF_SOPODIVA_FIX_8842_PKG'
{
  "name": "sopodiva-website",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "Sopodiva Development — static SPA with prerender + sitemap build for SEO",
  "scripts": {
    "build": "node scripts/prerender.mjs"
  },
  "devDependencies": {
    "jsdom": "^25.0.1"
  }
}
EOF_SOPODIVA_FIX_8842_PKG

echo "==> clean reinstall (removes puppeteer + Chrome download)"
rm -rf node_modules package-lock.json
npm install

echo "==> building"
npm run build

echo ""
echo "Spot check:"
grep -o '<title>[^<]*</title>' dist/marketplace/index.html
grep -c 'OfferCatalog' dist/services/index.html | sed 's/^/  OfferCatalog blocks in services: /'
echo ""
echo "Done. Preview locally:  npx serve dist   (then open the /marketplace URL)"