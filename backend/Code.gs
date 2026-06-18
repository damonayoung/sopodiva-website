/**
 * Sopodiva Development — backend (Google Apps Script Web App)
 * ---------------------------------------------------------------------------
 * One free serverless endpoint that:
 *   • receives every form submission from the website (doPost)
 *   • writes each lead to its per-type tab AND to a consolidated "Pipeline" tab
 *   • emails dev@sopodiva.com a notification for each new lead
 *   • serves the verified-artisan directory to the site (doGet ?type=artisans)
 *
 * Security hardening:
 *   • Formula-injection (CSV-injection) neutralisation on every stored value
 *   • Per-field length caps (stops oversized/abusive payloads)
 *   • Honeypot field — silently drops obvious bot submissions
 *   • Optional shared token (SHARED_SECRET) to reject unsolicited POSTs
 *
 * SETUP (one time):
 *   1. Create a Google Sheet (signed in as the Sopodiva Google account). Copy
 *      its ID from the URL. Keep the Sheet PRIVATE — share only with staff.
 *   2. Add a tab named "Artisans" with header row:
 *        id | name | trade | city | rating | reviews | years | jobs | tags | active | featured
 *   3. Extensions → Apps Script. Paste this file. Set SHEET_ID below.
 *   4. Deploy → New deployment → "Web app". Execute as: Me · Access: Anyone.
 *   5. Copy the Web App URL into CONFIG.API_URL in /assets/app.js.
 *
 * The per-type lead tabs and the "Pipeline" tab are created automatically on the
 * first matching submission. The team works the "Pipeline" tab; the website never
 * touches its right-hand tracking columns (Owner, Status, Notes, …).
 */

const SHEET_ID      = "PASTE_YOUR_SHEET_ID_HERE";
const NOTIFY_EMAIL  = "dev@sopodiva.com";   // <-- all alerts/updates go here

/* Optional: set a random string here AND in CONFIG.API_TOKEN in app.js to
   reject POSTs that don't carry it. Leave "" to stay open (still protected by
   the honeypot + sanitisation below). Not a true secret — it lives in client
   JS — but it stops casual/scripted abuse of the public endpoint. */
const SHARED_SECRET = "";

const MAX_FIELD = 2000;        // hard length cap per field (chars)
const HONEYPOT  = "company_url"; // must stay EMPTY; bots fill it, humans never see it

const SCHEMAS = {
  project:             ["submittedAt","name","phone","email","city","projectType","budget","timeline","artisan","details","source"],
  urgent:              ["submittedAt","name","phone","city","address","issue","details","source"],
  inspection:          ["submittedAt","name","phone","email","city","propertyType","preferredDate","address","purpose","source"],
  artisan_application: ["submittedAt","name","phone","email","city","trade","years","team","skills","about","source"],
  contact:             ["submittedAt","name","email","phone","subject","message","source"]
};
const TAB_NAMES = {
  project:"Project Requests", urgent:"Urgent Repairs", inspection:"Site Inspections",
  artisan_application:"Artisan Applications", contact:"Contact Messages"
};

/* Consolidated working tab. Columns A–H are written by the website; the columns
   from "Owner" onward are left blank for the team to manage. */
const PIPELINE_TAB = "Pipeline";
const PIPELINE_HEADERS = [
  "submittedAt","type","name","phone","email","city","summary","source",
  "Owner","Status","Last contact","Next step","Next step date","Notes"
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // 1) shared-token gate (only if configured)
    if (SHARED_SECRET && data.token !== SHARED_SECRET) {
      return json_({ ok:false, error:"unauthorized" });
    }
    // 2) honeypot — pretend success, save nothing
    if (data[HONEYPOT]) return json_({ ok:true });

    const type = data.formType;
    const schema = SCHEMAS[type];
    if (!schema) return json_({ ok:false, error:"Unknown form type" });

    // 3) sanitise every value, then write to the per-type tab AND the Pipeline
    const ss  = SpreadsheetApp.openById(SHEET_ID);
    const tab = getOrCreateTab_(ss, TAB_NAMES[type], schema);
    tab.appendRow(schema.map(k => clean_(data[k])));

    getOrCreatePipeline_(ss).appendRow(pipelineRow_(data));

    notify_(type, data);
    return json_({ ok:true });
  } catch (err) {
    return json_({ ok:false, error:String(err) });
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.type === "artisans") {
    return json_(readArtisans_());
  }
  return json_({ ok:true, service:"Sopodiva Development API" });
}

/* ---------- helpers ---------- */

/** Trim, length-cap, and neutralise spreadsheet formula injection. */
function clean_(v) {
  let s = (v == null ? "" : String(v)).slice(0, MAX_FIELD).trim();
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;   // force text, defeats =CMD()/@import etc.
  return s;
}

function getOrCreateTab_(ss, name, schema) {
  let tab = ss.getSheetByName(name);
  if (!tab) {
    tab = ss.insertSheet(name);
    tab.appendRow(schema);
    tab.getRange(1, 1, 1, schema.length).setFontWeight("bold");
    tab.setFrozenRows(1);
  }
  return tab;
}

/** The consolidated pipeline tab (created on first lead). */
function getOrCreatePipeline_(ss) {
  let tab = ss.getSheetByName(PIPELINE_TAB);
  if (!tab) {
    tab = ss.insertSheet(PIPELINE_TAB);
    tab.appendRow(PIPELINE_HEADERS);
    tab.getRange(1, 1, 1, PIPELINE_HEADERS.length).setFontWeight("bold");
    tab.setFrozenRows(1);
  }
  return tab;
}

/** Normalise any submission into the 8 website-written Pipeline columns. */
function pipelineRow_(data) {
  const t = data.formType;
  const summary =
    t === "project"             ? [data.projectType, data.details].filter(Boolean).join(" — ") :
    t === "urgent"              ? [data.issue, data.details].filter(Boolean).join(" — ") :
    t === "inspection"          ? [data.propertyType, data.purpose].filter(Boolean).join(" — ") :
    t === "artisan_application" ? [data.trade, data.skills].filter(Boolean).join(" — ") :
    t === "contact"             ? [data.subject, data.message].filter(Boolean).join(" — ") : "";
  return [
    clean_(data.submittedAt), (TAB_NAMES[t] || t), clean_(data.name),
    clean_(data.phone), clean_(data.email), clean_(data.city),
    clean_(summary), clean_(data.source)
  ];
}

function readArtisans_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Artisans");
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const head = rows.shift().map(h => String(h).trim().toLowerCase());
  return rows
    .map(r => { const o = {}; head.forEach((h, i) => o[h] = r[i]); return o; })
    .filter(o => String(o.active).toUpperCase() !== "FALSE" && o.name)
    .map(o => ({
      id: Number(o.id) || 0,
      name: String(o.name), trade: String(o.trade), city: String(o.city),
      rating: Number(o.rating) || 0, reviews: Number(o.reviews) || 0,
      years: Number(o.years) || 0, jobs: Number(o.jobs) || 0,
      tags: String(o.tags || "").split(",").map(s => s.trim()).filter(Boolean),
      featured: String(o.featured).toUpperCase() === "TRUE"
    }));
}

function notify_(type, data) {
  try {
    const label = (TAB_NAMES[type] || type).replace(/s$/, "");
    const skip = ["formType","source","token", HONEYPOT];
    const lines = Object.keys(data)
      .filter(k => skip.indexOf(k) === -1 && data[k])
      .map(k => `${k}: ${clean_(data[k])}`).join("\n");
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New ${label} — ${clean_(data.name) || "website lead"}`,
      body: `A new ${label.toLowerCase()} came in from the website:\n\n${lines}\n\nSource: ${clean_(data.source)}`
    });
  } catch (err) { /* email is best-effort; the row is already saved */ }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}