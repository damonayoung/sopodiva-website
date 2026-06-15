/**
 * Sopodiva Development — backend (Google Apps Script Web App)
 * ---------------------------------------------------------------------------
 * One free serverless endpoint that:
 *   • receives every form submission from the website (doPost)
 *   • writes each lead to a dedicated tab in one Google Sheet
 *   • emails info@sopodiva.com a notification for each new lead
 *   • serves the verified-artisan directory to the site (doGet ?type=artisans)
 *
 * The Google Sheet IS the admin panel — staff review leads and manage the
 * artisan list there, no code required.
 *
 * SETUP (one time, ~10 min):
 *   1. Create a Google Sheet. Copy its ID from the URL.
 *   2. Add a tab named "Artisans" with header row:
 *        id | name | trade | city | rating | reviews | years | jobs | tags | active
 *      (tags = comma-separated; active = TRUE/FALSE)
 *   3. Extensions → Apps Script. Paste this file. Set SHEET_ID and NOTIFY_EMAIL below.
 *   4. Deploy → New deployment → type "Web app".
 *        Execute as: Me   ·   Who has access: Anyone
 *   5. Copy the Web App URL into CONFIG.API_URL in /assets/app.js.
 */

const SHEET_ID     = "PASTE_YOUR_SHEET_ID_HERE";
const NOTIFY_EMAIL = "info@sopodiva.com";

/** Column order written for each form type. */
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

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const type = data.formType;
    const schema = SCHEMAS[type];
    if (!schema) return json_({ ok:false, error:"Unknown form type" });

    const ss  = SpreadsheetApp.openById(SHEET_ID);
    const tab = getOrCreateTab_(ss, TAB_NAMES[type], schema);
    tab.appendRow(schema.map(k => data[k] != null ? data[k] : ""));

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

function readArtisans_() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName("Artisans");
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  const head = rows.shift().map(h => String(h).trim().toLowerCase());
  return rows
    .map(r => {
      const o = {}; head.forEach((h, i) => o[h] = r[i]);
      return o;
    })
    .filter(o => String(o.active).toUpperCase() !== "FALSE" && o.name)
    .map(o => ({
      id: Number(o.id) || 0,
      name: o.name, trade: o.trade, city: o.city,
      rating: Number(o.rating) || 0, reviews: Number(o.reviews) || 0,
      years: Number(o.years) || 0, jobs: Number(o.jobs) || 0,
      tags: String(o.tags || "").split(",").map(s => s.trim()).filter(Boolean)
    }));
}

function notify_(type, data) {
  try {
    const label = (TAB_NAMES[type] || type).replace(/s$/, "");
    const lines = Object.keys(data)
      .filter(k => !["formType","source"].includes(k) && data[k])
      .map(k => `${k}: ${data[k]}`).join("\n");
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: `New ${label} — ${data.name || "website lead"}`,
      body: `A new ${label.toLowerCase()} came in from the website:\n\n${lines}\n\nSource: ${data.source || ""}`
    });
  } catch (err) { /* email is best-effort; the row is already saved */ }
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
