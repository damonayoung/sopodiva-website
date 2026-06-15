# Sopodiva Development — Website

Building Africa through technology and construction. This is the complete public
website and lead-capture system for **Sopodiva Development Company Ltd** — a
construction arm and a verified-artisan marketplace under one brand.

It runs today in **demo mode** (every feature works, forms validate and confirm
locally). Add one URL to switch on the live backend.

---

## What it does (the business functions)

| Function | Where | Backend route |
|---|---|---|
| Find & compare verified artisans (search, filter, sort) | `Find an Artisan` | `GET ?type=artisans` |
| Request a quote from a specific artisan | artisan card → project form | `project` |
| Start a construction / renovation project | `Start a Project` | `project` |
| Report an urgent repair (fast dispatch) | `Urgent Repair` | `urgent` |
| Request a site inspection | `Request a Site Inspection` | `inspection` |
| Apply to join the artisan network | `Join the Network` | `artisan_application` |
| General contact / tenders / partnerships | `Contact` | `contact` |

Every submission lands in a Google Sheet **and** emails `info@sopodiva.com`.

---

## Architecture — chosen for low cost and low maintenance

```
  Visitor ─▶  Static SPA (HTML/CSS/JS)            ─▶  Netlify  (free tier, global CDN)
                     │  forms POST / artisans GET
                     ▼
              Google Apps Script Web App           ─▶  free serverless endpoint
                     │
                     ├─▶ Google Sheet  (1 workbook, a tab per form)  ◀── staff review here = admin panel
                     └─▶ MailApp email to info@sopodiva.com           (instant lead alerts)
```

**Why this stack.** A construction/marketplace site is mostly read-heavy content
plus lead capture. It does **not** need a database server, a Node backend, or a
CMS to launch. A static front end on Netlify is fast, secure, and free; Google
Apps Script gives a $0 serverless backend; the Sheet doubles as the admin
console your team already knows how to use. No servers to patch, nothing to bill.

**Cost:** **$0/month** within free tiers. Only recurring cost is the domain
(~$12/yr). Scales to thousands of leads/month before any tier matters.

**Upgrade path** (only if/when needed): swap the Sheet for Airtable or Supabase,
or move artisan data to a real DB — the front end's `loadArtisans()` and
`submitLead()` are the only two touchpoints to repoint.

---

## Files

```
index.html            shell: nav, routed view, footer
assets/styles.css     design system (navy + steel + safety-amber; Roboto Slab + Inter)
assets/app.js         SPA router, marketplace, forms, validation, submission
assets/img/           real logo (logo-full / logo-mark / favicon) + optimized photos
backend/Code.gs       Google Apps Script backend (deploy separately)
netlify.toml          static deploy config + security headers
```

---

## Run locally

```bash
cd sopodiva
python3 -m http.server 8000      # then open http://localhost:8000
```

(Opening `index.html` directly works too, but a local server matches production.)

---

## Deploy the site (Netlify, ~3 min)

1. Push this folder to a GitHub repo (or drag-and-drop the folder into Netlify).
2. Netlify → **Add new site** → connect the repo. No build command; publish dir `.`.
3. Add your domain under **Domain settings**.

This matches your existing Sopodiva Netlify workflow.

---

## Turn on the backend (~10 min)

1. Create a Google Sheet; copy its **ID** from the URL.
2. Add a tab **`Artisans`** with this header row, then a few rows:
   `id | name | trade | city | rating | reviews | years | jobs | tags | active`
   (`tags` comma-separated; `active` = `TRUE`/`FALSE`)
3. In the Sheet: **Extensions → Apps Script**. Paste `backend/Code.gs`.
   Set `SHEET_ID` and `NOTIFY_EMAIL`.
4. **Deploy → New deployment → Web app.** Execute as **Me**; access **Anyone**.
   Authorize when prompted. Copy the **Web App URL**.
5. In `assets/app.js`, set `CONFIG.API_URL` to that URL. Redeploy the site.

Done — forms now write to the Sheet, email alerts fire, and the marketplace
reads live artisans from the `Artisans` tab. The other tabs
(`Project Requests`, `Urgent Repairs`, `Site Inspections`,
`Artisan Applications`, `Contact Messages`) are created automatically on first
submission.

---

## Managing the business day-to-day

- **New leads:** watch `info@sopodiva.com`, or open the Sheet — one tab per type.
- **Add / verify an artisan:** add a row to the `Artisans` tab (`active = TRUE`).
  It appears on the site automatically; no code change.
- **WhatsApp / phone:** set in `CONFIG` at the top of `assets/app.js`.

---

## Customizing

Brand tokens live at the top of `styles.css` (`--navy`, `--steel`, `--safety`).
Trades and cities are arrays near the top of `app.js`. Copy is inline in each
view function — search the route name (e.g. `function urgentForm`) to edit.
