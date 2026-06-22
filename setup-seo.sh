#!/usr/bin/env bash
# Sopodiva SEO setup — run from the repo root (your sopodiva directory).
# Writes the patch + new files directly and applies them. No downloads needed.
set -e

echo "==> writing & applying patch (index.html, assets/app.js, netlify.toml)"
cat > /tmp/seo-changes.patch << 'EOF_SOPODIVA_8842_PATCH'
diff --git a/assets/app.js b/assets/app.js
index 9221df7..3381976 100644
--- a/assets/app.js
+++ b/assets/app.js
@@ -681,22 +681,73 @@
      ROUTER
      ======================================================================= */
   const ROUTES = {
-    "/":            {render:home,           after:null,             title:"Sopodiva Development — Build & repair across Africa, with trust"},
-    "/marketplace": {render:marketplace,    after:bindMarketplace,  title:"Find a Verified Artisan · Sopodiva Development"},
-    "/services":    {render:services,       after:null,             title:"Services · Sopodiva Development"},
-    "/request":     {render:projectForm,    after:()=>bindForm(window._cfg), title:"Start a Project · Sopodiva Development"},
-    "/urgent":      {render:urgentForm,     after:()=>bindForm(window._cfg), title:"Urgent Repair · Sopodiva Development"},
-    "/inspection":  {render:inspectionForm, after:()=>bindForm(window._cfg), title:"Request a Site Inspection · Sopodiva Development"},
-    "/join":        {render:joinForm,       after:()=>bindForm(window._cfg), title:"Join the Artisan Network · Sopodiva Development"},
-    "/about":       {render:about,          after:null,             title:"About · Sopodiva Development"},
-    "/contact":     {render:contact,        after:()=>bindForm(window._cfg), title:"Contact · Sopodiva Development"}
+    "/":            {render:home,           after:null,             title:"Sopodiva Development — Build & repair across Africa, with trust",
+                     desc:"Sopodiva Development builds across Ghana and beyond — a full-service construction arm plus a verified-artisan marketplace under one trusted name. Find a vetted artisan, request a project, or book a site inspection."},
+    "/marketplace": {render:marketplace,    after:bindMarketplace,  title:"Find a Verified Artisan · Sopodiva Development",
+                     desc:"Browse vetted, rated artisans across Ghana — plumbing, electrical, masonry, carpentry, roofing, welding and more. Hire with confidence on the Sopodiva marketplace."},
+    "/services":    {render:services,       after:null,             title:"Services · Sopodiva Development",
+                     desc:"Construction and repair services across Ghana: civil works, site inspections, finishing trades and verified-artisan dispatch from Sopodiva Development.",
+                     jsonld:(url)=>({"@context":"https://schema.org","@type":"OfferCatalog","name":"Sopodiva Development Services","url":url,"itemListElement":TRADES.map(t=>({"@type":"Offer","itemOffered":{"@type":"Service","name":t,"areaServed":"GH","provider":{"@type":"GeneralContractor","name":"Sopodiva Development Company Ltd"}}}))})},
+    "/request":     {render:projectForm,    after:()=>bindForm(window._cfg), title:"Start a Project · Sopodiva Development",
+                     desc:"Start a construction or repair project with Sopodiva Development. Tell us the scope and we'll source the right verified team across Ghana."},
+    "/urgent":      {render:urgentForm,     after:()=>bindForm(window._cfg), title:"Urgent Repair · Sopodiva Development",
+                     desc:"Need an urgent repair in Ghana? Report it to Sopodiva for fast dispatch of a verified artisan — plumbing, electrical, roofing and more."},
+    "/inspection":  {render:inspectionForm, after:()=>bindForm(window._cfg), title:"Request a Site Inspection · Sopodiva Development",
+                     desc:"Request a professional site inspection from Sopodiva Development's construction team, serving Accra and across Ghana."},
+    "/join":        {render:joinForm,       after:()=>bindForm(window._cfg), title:"Join the Artisan Network · Sopodiva Development",
+                     desc:"Are you a skilled artisan in Ghana? Join Sopodiva's verified-artisan network and get matched to paid, vetted work."},
+    "/about":       {render:about,          after:null,             title:"About · Sopodiva Development",
+                     desc:"Sopodiva Development Company Ltd — building Africa through technology and construction. Trusted connections, quality execution."},
+    "/contact":     {render:contact,        after:()=>bindForm(window._cfg), title:"Contact · Sopodiva Development",
+                     desc:"Contact Sopodiva Development Company Ltd in Accra, Ghana — call, email or WhatsApp for construction, repairs and verified-artisan services.",
+                     jsonld:(url)=>({"@context":"https://schema.org","@type":"ContactPage","url":url,"about":{"@type":"GeneralContractor","name":"Sopodiva Development Company Ltd","telephone":["+233558244098","+233593868612"],"email":"dev@sopodiva.com","address":{"@type":"PostalAddress","addressLocality":"Accra","addressCountry":"GH"}}})}
   };
 
-  function currentPath(){ const h = location.hash.replace(/^#/,""); return ROUTES[h] ? h : "/"; }
+  /* ----- SEO: per-route <head> management --------------------------------- */
+  const ORIGIN = "https://www.sopodivadevelopment.com";
+  function headMeta(sel, attr, key){
+    let el = document.head.querySelector(sel);
+    if (!el){ el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
+    return el;
+  }
+  function setName(n, c){ headMeta(`meta[name="${n}"]`, "name", n).setAttribute("content", c||""); }
+  function setProp(p, c){ headMeta(`meta[property="${p}"]`, "property", p).setAttribute("content", c||""); }
+  function setCanonical(href){
+    let el = document.head.querySelector('link[rel="canonical"]');
+    if (!el){ el = document.createElement("link"); el.setAttribute("rel","canonical"); document.head.appendChild(el); }
+    el.setAttribute("href", href);
+  }
+  function setJsonLd(obj){
+    let el = document.getElementById("ld-page");
+    if (!el){ el = document.createElement("script"); el.type = "application/ld+json"; el.id = "ld-page"; document.head.appendChild(el); }
+    el.textContent = obj ? JSON.stringify(obj) : "";
+  }
+  function setHead(path, route){
+    const url = ORIGIN + (path === "/" ? "/" : path);
+    document.title = route.title;
+    setName("description", route.desc);
+    setCanonical(url);
+    setProp("og:title", route.title);
+    setProp("og:description", route.desc);
+    setProp("og:url", url);
+    setProp("og:type", "website");
+    setName("twitter:card", "summary_large_image");
+    setJsonLd(route.jsonld ? route.jsonld(url) : null);
+  }
+  // give SPA anchors real href values so crawlers can follow them and no-JS users can navigate
+  function hydrateRouteLinks(scope){
+    (scope||document).querySelectorAll('a[data-route]:not([href])')
+      .forEach(a=>a.setAttribute("href", a.dataset.route));
+  }
+
+  function currentPath(){
+    const p = location.pathname.replace(/\/+$/, "") || "/";
+    return ROUTES[p] ? p : "/";
+  }
 
   function navigate(path){
-    if (location.hash !== "#"+path) location.hash = path;
-    else render();
+    if (location.pathname !== path) history.pushState({}, "", path);
+    render();
   }
 
   function setActive(path){
@@ -708,8 +759,9 @@
   function render(){
     const path = currentPath();
     const route = ROUTES[path];
-    document.title = route.title;
+    setHead(path, route);
     view.innerHTML = route.render();
+    hydrateRouteLinks(view);
     setActive(path);
     if (route.after) route.after();
     window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
@@ -738,7 +790,7 @@
     b.setAttribute("aria-expanded", String(open));
   });
 
-  window.addEventListener("hashchange", render);
+  window.addEventListener("popstate", render);
 
   // optional: pull live artisans from the backend if configured
   async function loadArtisans(){
@@ -752,6 +804,7 @@
 
   // boot
   $("#yr").textContent = new Date().getFullYear();
+  hydrateRouteLinks(document);   // give static nav/footer anchors real, crawlable href
   render();
   loadArtisans();
 })();
diff --git a/index.html b/index.html
index 87b6df5..393cb86 100644
--- a/index.html
+++ b/index.html
@@ -2,12 +2,20 @@
 <html lang="en">
 <head>
 <meta charset="UTF-8"/>
+<base href="/"/>
 <meta name="viewport" content="width=device-width, initial-scale=1"/>
 <title>Sopodiva Development — Build & repair across Africa, with trust</title>
 <meta name="description" content="Sopodiva Development Company Ltd builds across Ghana and beyond — a full-service construction arm and a verified-artisan marketplace under one trusted name. Find a vetted artisan, request a project, or book a site inspection."/>
+<link rel="canonical" href="https://www.sopodivadevelopment.com/"/>
 <meta property="og:title" content="Sopodiva Development — Engineering Excellence. Delivering Impact."/>
 <meta property="og:description" content="Construction · Verified-Artisan Marketplace · Development. Trusted connections. Quality execution."/>
 <meta property="og:type" content="website"/>
+<meta property="og:url" content="https://www.sopodivadevelopment.com/"/>
+<meta property="og:image" content="https://www.sopodivadevelopment.com/assets/img/hero-accra.jpg"/>
+<meta name="twitter:card" content="summary_large_image"/>
+<script type="application/ld+json" id="ld-org">
+{"@context":"https://schema.org","@type":"GeneralContractor","name":"Sopodiva Development Company Ltd","url":"https://www.sopodivadevelopment.com","logo":"https://www.sopodivadevelopment.com/assets/img/logo-full.png","image":"https://www.sopodivadevelopment.com/assets/img/hero-accra.jpg","description":"A full-service construction arm and a verified-artisan marketplace under one trusted name, serving Ghana and beyond.","areaServed":"GH","slogan":"Engineering Excellence. Delivering Impact.","email":"dev@sopodiva.com","telephone":"+233558244098","address":{"@type":"PostalAddress","addressLocality":"Accra","addressCountry":"GH"},"knowsAbout":["Verified artisans","Civil works","Construction delivery","Plumbing","Electrical","Masonry","Roofing"]}
+</script>
 <link rel="icon" href="assets/img/favicon.png" type="image/png"/>
 <link rel="preload" as="image" href="assets/img/hero-accra.jpg"/>
 <link rel="preconnect" href="https://fonts.googleapis.com"/>
@@ -39,6 +47,18 @@
 <!-- ROUTED VIEW -->
 <main id="view" tabindex="-1"></main>
 
+<noscript>
+  <nav aria-label="Site">
+    <a href="/marketplace">Find an Artisan</a> ·
+    <a href="/services">Services</a> ·
+    <a href="/request">Start a Project</a> ·
+    <a href="/inspection">Request a Site Inspection</a> ·
+    <a href="/join">Join the Network</a> ·
+    <a href="/about">About</a> ·
+    <a href="/contact">Contact</a>
+  </nav>
+</noscript>
+
 <!-- FOOTER -->
 <footer class="footer">
   <div class="wrap">
diff --git a/netlify.toml b/netlify.toml
index 565048b..70a4c49 100644
--- a/netlify.toml
+++ b/netlify.toml
@@ -1,9 +1,10 @@
-# Netlify config — static site, no build step
+# Netlify config — static SPA with prerender build (see scripts/prerender.mjs)
 [build]
-  publish = "."
-  command = ""
+  publish = "dist"
+  command = "npm install && npm run build"
 
-# SPA fallback so deep links (#routes are client-side; this covers /index)
+# Deep-link fallback. Netlify serves a matching prerendered file first
+# (e.g. /marketplace/index.html); only unknown paths fall through to the shell.
 [[redirects]]
   from = "/*"
   to = "/index.html"
@@ -15,3 +16,9 @@
     X-Frame-Options = "SAMEORIGIN"
     X-Content-Type-Options = "nosniff"
     Referrer-Policy = "strict-origin-when-cross-origin"
+
+# Long-cache fingerprinted-able static assets (safe; HTML stays uncached)
+[[headers]]
+  for = "/assets/*"
+  [headers.values]
+    Cache-Control = "public, max-age=31536000"
EOF_SOPODIVA_8842_PATCH

git apply --check /tmp/seo-changes.patch
git apply /tmp/seo-changes.patch

echo "==> writing new files (scripts/prerender.mjs, package.json, robots.txt)"
mkdir -p scripts
cat > scripts/prerender.mjs << 'EOF_SOPODIVA_8842_PRE'
/* =========================================================================
   Sopodiva Development — prerender build
   Serves the source SPA locally, loads each route in headless Chrome, and
   writes the fully-rendered DOM (with per-route <head>) to dist/<route>/index.html.
   Also emits sitemap.xml and robots.txt. No framework, no rewrite of the app.

   Run:  npm install && npm run build   (output in ./dist)
   ========================================================================= */
import { createServer } from "node:http";
import { readFile, rm, mkdir, cp, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import puppeteer from "puppeteer";

const ROOT   = process.cwd();
const OUT    = join(ROOT, "dist");
const ORIGIN = "https://www.sopodivadevelopment.com";
const PORT   = 5050;

// Keep in sync with the ROUTES map in assets/app.js.
// When you add programmatic pages (per-artisan / per-service), generate these
// from the same data source and the sitemap below updates automatically.
const ROUTES = [
  "/", "/marketplace", "/services", "/request",
  "/urgent", "/inspection", "/join", "/about", "/contact",
];

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",   ".json": "application/json",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".gif": "image/gif", ".woff2": "font/woff2", ".txt": "text/plain; charset=utf-8",
};

// Static server over the SOURCE tree, with SPA fallback to index.html.
function startServer() {
  return new Promise((resolve) => {
    const srv = createServer(async (req, res) => {
      try {
        const url = decodeURIComponent(req.url.split("?")[0]);
        let file = join(ROOT, url);
        if (url.endsWith("/")) file = join(file, "index.html");
        // any path with no real file / no extension -> serve the app shell
        if (!existsSync(file) || !extname(file)) file = join(ROOT, "index.html");
        const body = await readFile(file);
        res.writeHead(200, { "Content-Type": MIME[extname(file)] || "application/octet-stream" });
        res.end(body);
      } catch {
        res.writeHead(404); res.end("not found");
      }
    });
    srv.listen(PORT, () => resolve(srv));
  });
}

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await cp(join(ROOT, "assets"), join(OUT, "assets"), { recursive: true });

  const srv = await startServer();
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const route of ROUTES) {
    const page = await browser.newPage();
    await page.goto(`http://localhost:${PORT}${route}`, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForSelector("#view *", { timeout: 10000 }).catch(() => {});
    const html = "<!DOCTYPE html>\n" + await page.evaluate(() => document.documentElement.outerHTML);
    const outFile = route === "/" ? join(OUT, "index.html") : join(OUT, route, "index.html");
    await mkdir(dirname(outFile), { recursive: true });
    await writeFile(outFile, html, "utf8");
    console.log("  prerendered", route, "->", outFile.replace(ROOT, "."));
    await page.close();
  }

  await browser.close();
  srv.close();

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
}

main().catch(err => { console.error(err); process.exit(1); });
EOF_SOPODIVA_8842_PRE

cat > package.json << 'EOF_SOPODIVA_8842_PKG'
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
    "puppeteer": "^23.6.0"
  }
}
EOF_SOPODIVA_8842_PKG

cat > robots.txt << 'EOF_SOPODIVA_8842_ROB'
User-agent: *
Allow: /

# AI answer engines — your prerendered HTML is what they can read
User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://www.sopodivadevelopment.com/sitemap.xml
EOF_SOPODIVA_8842_ROB

echo "==> verifying"
node --check assets/app.js && echo "    app.js syntax OK"
git status --short
echo ""
echo "Done. Next:  npm install && npm run build"