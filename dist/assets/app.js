/* =========================================================================
   Sopodiva Development — single-page app (vanilla JS, no build step)
   Routing · marketplace · lead-capture forms · backend submission
   ========================================================================= */
(function () {
  "use strict";

  /* ----- CONFIG -------------------------------------------------------------
     Paste your Google Apps Script Web App URL here after deploying backend/Code.gs.
     While empty, the site runs in DEMO MODE: forms validate and "succeed"
     locally so you can click through everything before the backend is live. */
  const CONFIG = {
    API_URL: "https://script.google.com/macros/s/AKfycbzNgo33N896rX4YaUDSzFrmWIWaivJCa5PhUswtnKrwzOVUU23od9rV3CULODhbJSD9/exec", // e.g. "https://script.google.com/macros/s/AKfy.../exec"
    EMAIL: "dev@sopodiva.com",
    PHONE_1: "+233 558 244 098",
    PHONE_2: "+233 593 868 612",
    WHATSAPP: "233558244098"
  };

  /* ----- ICONS (inline, single stroke style) ------------------------------ */
  const I = {
    bolt: '<path d="M13 2 4 14h6l-1 8 9-12h-6z"/>',
    build: '<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-6h6v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4V3h6v1M9 11l2 2 4-4"/>',
    tools: '<path d="M14 7a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 0-2-2zM6 16l-3 3 2 2 3-3"/>',
    check: '<path d="m5 13 4 4L19 7"/>',
    shield: '<path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/><path d="m9 12 2 2 4-4"/>',
    star: '<path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1.1 6L12 17.8 6.6 19.6l1-6L3.3 9.4l6-.9z"/>',
    phone: '<path d="M5 3h4l2 5-3 2a14 14 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    home: '<path d="m3 11 9-7 9 7M5 10v10h14V10"/>',
    bank: '<path d="M3 10 12 4l9 6M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18"/>',
    case: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/>',
    link: '<path d="M9 15 15 9M10 7l1-1a4 4 0 0 1 6 6l-1 1M14 17l-1 1a4 4 0 0 1-6-6l1-1"/>',
    cup: '<path d="M6 4h12v4a6 6 0 0 1-12 0zM6 6H4v1a3 3 0 0 0 2 3M18 6h2v1a3 3 0 0 1-2 3M9 16h6M8 20h8M12 16v4"/>',
    people: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 6a3 3 0 0 1 0 6M21 20a5 5 0 0 0-4-5"/>',
    eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    phoneDevice: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    server: '<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
    chart: '<path d="M4 20V4M4 20h16M8 16v-4m4 4V8m4 8v-6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    wa: '<path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3z"/><path d="M8.5 8.5c0 4 3 7 7 7 .6 0 1-.6.8-1.1l-.6-1.3-1.6.5a5 5 0 0 1-3.2-3.2l.5-1.6-1.3-.6c-.5-.2-1.1.2-1.1.8z" fill="#fff" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'
  };
  const svg = (p, cls) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" ${cls?`class="${cls}"`:""} aria-hidden="true">${p}</svg>`;

  /* ----- SEED DATA: verified artisans -------------------------------------
     In production these load from the Google Sheet via the API (doGet),
     so non-technical staff add/verify artisans without touching code. */
  const TRADES = ["Plumbing","Electrical","Masonry & Tiling","Carpentry","Painting","Roofing","Welding & Metalwork","General Contractor"];
  const CITIES = ["Accra","Tema","Kumasi","Takoradi","Cape Coast"];
  const SEED = [
    {id:1, name:"Kwame Mensah", trade:"Plumbing", city:"Accra", rating:4.9, reviews:128, years:12, jobs:340, tags:["Leak repair","Water systems","Drainage"]},
    {id:2, name:"Akosua Boateng", trade:"Electrical", city:"Accra", rating:4.8, reviews:96, years:9, jobs:210, tags:["Wiring","Faults","Solar prep"]},
    {id:3, name:"Yaw Ofori", trade:"Masonry & Tiling", city:"Tema", rating:4.7, reviews:74, years:15, jobs:280, tags:["Tiling","Block work","Plaster"]},
    {id:4, name:"Ama Asante", trade:"Painting", city:"Accra", rating:4.9, reviews:151, years:7, jobs:190, tags:["Interior","Exterior","Finishing"]},
    {id:5, name:"Kofi Darko", trade:"Roofing", city:"Kumasi", rating:4.6, reviews:58, years:11, jobs:160, tags:["Roof repair","Ceiling","Waterproofing"]},
    {id:6, name:"Esi Owusu", trade:"General Contractor", city:"Accra", rating:5.0, reviews:64, years:18, jobs:120, tags:["Turnkey","Renovation","Supervision"]},
    {id:7, name:"Ibrahim Adams", trade:"Welding & Metalwork", city:"Tema", rating:4.7, reviews:41, years:10, jobs:150, tags:["Gates","Railings","Frames"]},
    {id:8, name:"Abena Sarpong", trade:"Carpentry", city:"Kumasi", rating:4.8, reviews:88, years:14, jobs:230, tags:["Doors & locks","Cabinetry","Furniture"]},
    {id:9, name:"Kojo Annan", trade:"Plumbing", city:"Takoradi", rating:4.5, reviews:37, years:8, jobs:110, tags:["Sanitation","Pipework","Boreholes"]},
    {id:10, name:"Nana Adjei", trade:"Electrical", city:"Tema", rating:4.9, reviews:113, years:13, jobs:260, tags:["Commercial","Inspection","Faults"]},
    {id:11, name:"Adwoa Frimpong", trade:"Masonry & Tiling", city:"Cape Coast", rating:4.6, reviews:52, years:9, jobs:140, tags:["Tiling","Fencing","Repairs"]},
    {id:12, name:"Samuel Tetteh", trade:"General Contractor", city:"Accra", rating:4.8, reviews:79, years:16, jobs:130, tags:["Commercial build","Civil works","Drainage"]}
  ];
  const AVATAR_COLORS = ["#16324F","#1E4A6E","#5B7C99","#CF6E26","#2C5B7C","#3E6488"];
  const initials = n => n.split(" ").map(s=>s[0]).slice(0,2).join("").toUpperCase();
  const avatarColor = id => AVATAR_COLORS[id % AVATAR_COLORS.length];

  let artisans = SEED.slice();

  /* ----- helpers ----------------------------------------------------------- */
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const view = $("#view");
  const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const toast = (msg) => {
    const t = $("#toast");
    t.innerHTML = svg(I.check) + "<span>" + esc(msg) + "</span>";
    t.classList.add("show");
    clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove("show"), 3200);
  };
  const ic = (p, cls="ic") => `<span class="${cls}">${svg(p)}</span>`;
  const stars = r => `<span class="stars">${svg(I.star,"")} ${r.toFixed(1)}</span>`;

  /* =======================================================================
     SHARED PARTIALS
     ======================================================================= */
  const ctaBand = () => `
    <section class="section"><div class="wrap">
      <div class="cta-band">
        <h2>Ready to build, repair, or get verified?</h2>
        <p>Tell us what you need. We match you with a verified artisan, or take the whole project off your hands.</p>
        <div class="hero__cta">
          <a class="btn btn--amber" data-route="/request">Start a project ${svg(I.arrow)}</a>
          <a class="btn btn--on-dark" data-route="/marketplace">Find an artisan</a>
        </div>
      </div>
    </div></section>`;

  const pageIntro = (eyebrow, title, sub, media) => `
    <section class="page-intro ${media?"page-intro--media":""}"><div class="wrap page-intro__in fade-in">
      <div>
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>${sub?`<p>${sub}</p>`:""}
      </div>
      ${media?`<div class="pi-media"><img src="${media}" alt="" loading="lazy"/></div>`:""}
    </div></section>`;

  /* =======================================================================
     HOME
     ======================================================================= */
  const doorDefs = [
    {r:"/urgent",      t:"Urgent Repairs<br>& Maintenance", i:I.bolt,  urgent:true},
    {r:"/request",     t:"Construction<br>& Renovation",    i:I.build},
    {r:"/marketplace", t:"Find a Verified<br>Artisan",       i:I.search},
    {r:"/inspection",  t:"Request a Site<br>Inspection",     i:I.clipboard},
    {r:"/join",        t:"Join Our<br>Artisan Network",      i:I.tools}
  ];

  function home() {
    return `
    <section class="hero"><div class="wrap hero__in fade-in">
      <p class="eyebrow">Construction · Marketplace · Development</p>
      <h1>Building Africa through technology and construction</h1>
      <p class="hero__lead">A full-service construction arm and a verified-artisan marketplace, under one trusted name — so quality building and reliable repairs are within everyone's reach.</p>
      <div class="hero__cta">
        <a class="btn btn--amber" data-route="/request">Start a project ${svg(I.arrow)}</a>
        <a class="btn btn--on-dark" data-route="/marketplace">Find an artisan</a>
      </div>
      <div class="hero__trust">
        <span><b>Verified</b> Every artisan screened first</span>
        <span><b>One roof</b> Discovery + delivery</span>
        <span><b>Pan-African</b> Built for the continent</span>
      </div>
      <div class="doors" role="navigation" aria-label="Get started">
        ${doorDefs.map(d=>`
          <div class="door ${d.urgent?"door--urgent":""}" data-route="${d.r}" role="link" tabindex="0">
            <span class="door__ic">${svg(d.i)}</span>
            <span class="door__t">${d.t}</span>
          </div>`).join("")}
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="section__head">
        <p class="eyebrow">Who we are</p>
        <h2>A builder and a marketplace, under one trusted brand</h2>
        <p class="lead">Sopodiva blends technology, construction, and service aggregation across African markets — bridging digital discovery with real-world execution.</p>
      </div>
      <div class="grid grid-3">
        <div class="card card--hover">${ic(I.phoneDevice)}<h3>Technology</h3><p>A mobile-first platform for discovery, booking, and trust — built for the phones people actually use.</p></div>
        <div class="card card--hover">${ic(I.build)}<h3>Construction</h3><p>A full-service build arm for private clients and public works, from drawing to delivery.</p></div>
        <div class="card card--hover">${ic(I.shield)}<h3>Aggregation</h3><p>Verified artisans, real ratings, and transparent pricing before any work begins.</p></div>
      </div>
    </div></section>

    <section class="section section--mist"><div class="wrap">
      <div class="section__head"><p class="eyebrow">Our model</p><h2>One company, two doors</h2>
      <p class="lead">Find the right professional yourself — or hand us the whole project.</p></div>
      <div class="model">
        <div class="card model__card">
          <div class="model__h">${ic(I.search)}<div><span class="model__tag">Door 1 · Marketplace</span><h3 class="mb-0">Find &amp; hire</h3></div></div>
          <ul>
            <li>Africa's structured directory for building &amp; repairs</li>
            <li>Verified contractors, handymen &amp; builders</li>
            <li>Ratings, reviews &amp; transparent pricing</li>
          </ul>
          <a class="btn btn--ghost btn--wide" data-route="/marketplace">Browse verified artisans</a>
        </div>
        <div class="card model__card">
          <div class="model__h">${ic(I.build)}<div><span class="model__tag">Door 2 · Construction</span><h3 class="mb-0">Build &amp; deliver</h3></div></div>
          <ul>
            <li>Residential &amp; commercial construction</li>
            <li>Public infrastructure &amp; civil works</li>
            <li>Turnkey, end-to-end project delivery</li>
          </ul>
          <a class="btn btn--ghost btn--wide" data-route="/request">Hand us a project</a>
        </div>
      </div>
    </div></section>

    <section class="section"><div class="wrap">
      <div class="split feature">
        <div>
          <p class="eyebrow">Technology</p>
          <h2>A mobile-first platform that scales with the continent</h2>
          <p class="lead">Discovery and trust on the devices people already carry — search, filter, and match in a few taps, with quality scored from real outcomes on real jobs.</p>
          <div class="hero__cta" style="margin:18px 0 0"><a class="btn" data-route="/marketplace">Explore the marketplace ${svg(I.arrow)}</a></div>
        </div>
        <div class="split__media"><img src="assets/img/tech-tablet.jpg" alt="Site team reviewing plans on a tablet on an Accra build" loading="lazy"/></div>
      </div>
    </div></section>

    <section class="section section--mist"><div class="wrap">
      <div class="section__head"><p class="eyebrow">Who we serve</p><h2>Built for everyone shaping Africa's spaces</h2></div>
      <div class="serve-photo"><img src="assets/img/team-five.jpg" alt="A team of African professionals" loading="lazy"/></div>
      <div class="grid grid-2">
        ${[
          [I.home,"Homeowners & developers","Families and property developers building or maintaining homes."],
          [I.bank,"Government & public sector","Agencies delivering infrastructure and civic works."],
          [I.case,"SMEs & corporates","Businesses needing reliable build and facility services."],
          [I.globe,"Diaspora investors","Africans abroad building back home, with trusted oversight."]
        ].map(([i,t,d])=>`<div class="card aud">${ic(i)}<div><h3>${t}</h3><p>${d}</p></div></div>`).join("")}
      </div>
    </div></section>

    <section class="section section--navy"><div class="wrap">
      <div class="section__head"><p class="eyebrow" style="color:var(--steel-200)">Why we win</p>
      <h2>The only player that finds the artisan and does the work</h2></div>
      <div class="grid grid-4">
        ${[
          [I.link,"Marketplace + execution","Discovery and delivery under one accountable roof."],
          [I.cup,"First-mover advantage","A structured contractor-aggregation platform for Africa."],
          [I.people,"The Sopodiva name","A trusted brand committed to quality and accountability."],
          [I.shield,"Local + global standards","Local expertise, executed to international quality bars."]
        ].map(([i,t,d])=>`<div class="card aud" style="background:rgba(255,255,255,.04);border-color:rgba(159,180,198,.22)">${ic(i,"ic ic--steel")}<div><h3 style="color:#fff">${t}</h3><p style="color:#CDD9E3">${d}</p></div></div>`).join("")}
      </div>
    </div></section>

    ${ctaBand()}`;
  }

  /* =======================================================================
     MARKETPLACE
     ======================================================================= */
  let mkState = { q:"", trade:"", city:"", sort:"rating" };

  function marketplace() {
    return pageIntro("Door 1 · The Marketplace",
      "Find a verified artisan you can trust",
      "Discover vetted professionals, compare them on real reviews, and hire with confidence. Every artisan is screened before they appear.",
      "assets/img/marketplace-woman.jpg") + `
    <section class="section"><div class="wrap">
      <div class="mk__bar">
        <div class="field"><label for="mk-q">Search</label>
          <input id="mk-q" type="search" placeholder="Name, trade or skill…" value="${esc(mkState.q)}"/></div>
        <div class="field"><label for="mk-trade">Trade</label>
          <select id="mk-trade"><option value="">All trades</option>${TRADES.map(t=>`<option ${mkState.trade===t?"selected":""}>${t}</option>`).join("")}</select></div>
        <div class="field"><label for="mk-city">City</label>
          <select id="mk-city"><option value="">All cities</option>${CITIES.map(c=>`<option ${mkState.city===c?"selected":""}>${c}</option>`).join("")}</select></div>
        <div class="field"><label for="mk-sort">Sort by</label>
          <select id="mk-sort">
            <option value="rating" ${mkState.sort==="rating"?"selected":""}>Highest rated</option>
            <option value="reviews" ${mkState.sort==="reviews"?"selected":""}>Most reviewed</option>
            <option value="years" ${mkState.sort==="years"?"selected":""}>Most experienced</option>
          </select></div>
      </div>
      <p class="mk__count" id="mk-count"></p>
      <div class="grid grid-3" id="mk-grid"></div>
    </div></section>`;
  }

  function renderArtisans() {
    let list = artisans.filter(a => {
      const q = mkState.q.trim().toLowerCase();
      const hay = (a.name+" "+a.trade+" "+a.city+" "+a.tags.join(" ")).toLowerCase();
      return (!q || hay.includes(q)) &&
             (!mkState.trade || a.trade===mkState.trade) &&
             (!mkState.city || a.city===mkState.city);
    });
    const key = mkState.sort;
    list.sort((a,b)=> (b.featured?1:0)-(a.featured?1:0) || b[key]-a[key]);

    const grid = $("#mk-grid"), count = $("#mk-count");
    if (!grid) return;
    count.textContent = `${list.length} verified ${list.length===1?"artisan":"artisans"} available`;
    grid.innerHTML = list.length ? list.map(a=>`
      <article class="card card--hover artisan">
        <div class="artisan__top">
          <div class="avatar" style="background:${avatarColor(a.id)}">${initials(a.name)}</div>
          <div>
            <div class="artisan__name">${esc(a.name)}
              <span class="verified">${svg(I.check)} Verified</span></div>
            <div class="artisan__trade">${esc(a.trade)} · ${esc(a.city)}</div>
          </div>
        </div>
        <div class="artisan__meta">
          ${a.reviews>0 ? `<span>${stars(a.rating)} <span style="color:var(--muted)">(${a.reviews})</span></span>` : ""}
          ${a.years>0 ? `<span>${a.years} yrs exp</span>` : ""}
          ${a.jobs>0 ? `<span>${a.jobs}+ jobs</span>` : ""}
        </div>
        <div class="artisan__tags">${a.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
        <div class="artisan__foot">
          <button class="btn" data-hire="${a.id}">Request quote</button>
          <a class="btn btn--ghost" href="https://wa.me/${CONFIG.WHATSAPP}" target="_blank" rel="noopener">${svg(I.wa)} Chat</a>
        </div>
      </article>`).join("")
      : `<div class="card center" style="grid-column:1/-1">
          <p class="mb-0"><strong>No artisans match those filters yet.</strong></p>
          <p style="color:var(--muted)">Clear your filters, or <a data-route="/request" style="color:var(--navy);font-weight:600">request a project</a> and we'll source the right person.</p>
        </div>`;
  }

  function bindMarketplace() {
    const on = (id, ev, fn)=>{const e=$(id); if(e) e.addEventListener(ev,fn);};
    on("#mk-q","input", e=>{mkState.q=e.target.value; renderArtisans();});
    on("#mk-trade","change", e=>{mkState.trade=e.target.value; renderArtisans();});
    on("#mk-city","change", e=>{mkState.city=e.target.value; renderArtisans();});
    on("#mk-sort","change", e=>{mkState.sort=e.target.value; renderArtisans();});
    renderArtisans();
    view.addEventListener("click", e=>{
      const b = e.target.closest("[data-hire]");
      if (b) { const a = artisans.find(x=>x.id==b.dataset.hire);
        sessionStorage.setItem("sopodiva_artisan", a ? a.name+" ("+a.trade+", "+a.city+")" : "");
        navigate("/request"); }
    });
  }

  /* =======================================================================
     SERVICES
     ======================================================================= */
  function services() {
    const urgent = ["Plumbing & water leakage","Drainage issues","Roof & ceiling repairs","Electrical faults","Tiling & masonry repairs","Painting","Door & lock repairs","Fence repairs"];
    const dev = ["Residential construction","Commercial construction","Renovation & improvement","Drainage works","Sanitation facilities","Civil works","Project supervision","Turnkey delivery"];
    return pageIntro("What we handle","From an urgent leak to a finished building",
      "Two service lines, one accountable team. Pick a verified artisan for a single job, or hand us a full build.") + `
    <section class="section"><div class="wrap"><div class="svc">
      <div class="card">
        <div class="imgcard__media" style="aspect-ratio:16/7;margin:-24px -24px 18px;border-radius:var(--r) var(--r) 0 0"><img src="assets/img/svc-roofers.jpg" alt="Roofers at work in Accra" loading="lazy"/></div>
        <div class="model__h">${ic(I.bolt,"ic ic--steel")}<h3 class="mb-0">Urgent repairs &amp; maintenance</h3></div>
        <ul class="svc__list">${urgent.map(s=>`<li>${s}</li>`).join("")}</ul>
        <a class="btn btn--amber btn--wide" data-route="/urgent" style="margin-top:14px">Report an urgent repair</a>
      </div>
      <div class="card">
        <div class="imgcard__media" style="aspect-ratio:16/7;margin:-24px -24px 18px;border-radius:var(--r) var(--r) 0 0"><img src="assets/img/svc-mason.jpg" alt="Mason plastering a wall" loading="lazy"/></div>
        <div class="model__h">${ic(I.build)}<h3 class="mb-0">Construction &amp; development</h3></div>
        <ul class="svc__list">${dev.map(s=>`<li>${s}</li>`).join("")}</ul>
        <a class="btn btn--wide" data-route="/request" style="margin-top:14px">Start a project</a>
      </div>
    </div></div></section>

    <section class="section section--mist"><div class="wrap">
      <div class="section__head section__head"><p class="eyebrow">How a project runs</p><h2>A structured approach to quality delivery</h2></div>
      <div class="steps">
        ${[
          ["Needs assessment & feasibility","We scope the work, site, and budget before anything is committed."],
          ["Design & engineering planning","Clear drawings, materials, and a costed plan you approve."],
          ["Execution with quality control","Verified crews build to spec, checked at every stage."],
          ["Monitoring & evaluation","Progress tracked and reported, with no surprises."],
          ["Delivery & post-construction support","Handover, snagging, and support after the keys change hands."]
        ].map(([t,d])=>`<div class="step"><span class="step__n"></span><div><h3>${t}</h3><p>${d}</p></div></div>`).join("")}
      </div>
    </div></section>
    ${ctaBand()}`;
  }

  /* =======================================================================
     FORMS — generic engine
     ======================================================================= */
  // field spec: {name,label,type,required,placeholder,options,half,help}
  function buildForm(cfg) {
    const fieldHTML = f => {
      const req = f.required ? ` <span class="req" aria-hidden="true">*</span>` : "";
      const id = "f_"+f.name;
      let control;
      if (f.type==="select") {
        control = `<select id="${id}" name="${f.name}" ${f.required?"required":""}>
          <option value="">${f.placeholder||"Select…"}</option>
          ${f.options.map(o=>`<option>${o}</option>`).join("")}</select>`;
      } else if (f.type==="textarea") {
        control = `<textarea id="${id}" name="${f.name}" placeholder="${f.placeholder||""}" ${f.required?"required":""}>${f.value||""}</textarea>`;
      } else {
        control = `<input id="${id}" name="${f.name}" type="${f.type||"text"}" placeholder="${f.placeholder||""}" value="${esc(f.value||"")}" ${f.required?"required":""}/>`;
      }
      return `<div class="field ${f.half?"":"col-2"}" data-field="${f.name}">
        <label for="${id}">${f.label}${req}</label>${control}
        ${f.help?`<span class="field__err" style="color:var(--muted)">${f.help}</span>`:`<span class="field__err"></span>`}
      </div>`;
    };
    return `
    <section class="section"><div class="wrap form-wrap">
      <div class="form-card fade-in" id="form-card">
        <form id="lead-form" novalidate>
          ${cfg.intro?`<p class="lead mb-0" style="margin-bottom:20px">${cfg.intro}</p>`:""}
          ${cfg.chips?`<div class="field col-2"><label>${cfg.chips.label} <span class="req">*</span></label>
            <div class="chip-row" id="chip-row">${cfg.chips.options.map(o=>`<button type="button" class="chip ${cfg.chips.urgent?"chip--urgent":""}" data-chip="${o}" aria-pressed="false">${o}</button>`).join("")}</div>
            <input type="hidden" name="${cfg.chips.name}" id="chip-val"/>
            <span class="field__err" id="chip-err"></span></div>`:""}
          <div class="form-grid">
            ${cfg.fields.map(fieldHTML).join("")}
          </div>
          ${cfg.note?`<div class="note col-2" style="margin:6px 0 18px">${svg(I.info)}<span>${cfg.note}</span></div>`:""}
          <button class="btn ${cfg.urgent?"btn--amber":""} btn--wide" type="submit" style="margin-top:8px">${cfg.submit||"Submit request"}</button>
        </form>
      </div>
    </div></section>`;
  }

  const successHTML = (title, msg) => `
    <div class="success fade-in">
      <div class="success__ic">${svg(I.check)}</div>
      <h2>${title}</h2>
      <p class="lead" style="margin:8px auto 22px">${msg}</p>
      <div class="hero__cta" style="justify-content:center">
        <a class="btn" data-route="/">Back to home</a>
        <a class="btn btn--ghost" data-route="/marketplace">Browse artisans</a>
      </div>
    </div>`;

  function validateAndCollect(form, cfg) {
    let ok = true; const data = {};
    // chips
    if (cfg.chips) {
      const val = $("#chip-val").value;
      const err = $("#chip-err");
      if (!val) { err.textContent = "Please choose an option."; ok=false; }
      else { err.textContent=""; data[cfg.chips.name]=val; }
    }
    cfg.fields.forEach(f=>{
      const wrap = form.querySelector(`[data-field="${f.name}"]`);
      const input = wrap.querySelector("input,select,textarea");
      const errEl = wrap.querySelector(".field__err");
      const v = (input.value||"").trim();
      let msg = "";
      if (f.required && !v) msg = "This field is required.";
      else if (f.type==="email" && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Enter a valid email address.";
      else if (f.type==="tel" && v && v.replace(/\D/g,"").length < 7) msg = "Enter a valid phone number.";
      if (msg) { ok=false; wrap.classList.add("field--err"); if(!f.help) errEl.textContent=msg; }
      else { wrap.classList.remove("field--err"); if(!f.help) errEl.textContent=""; }
      data[f.name]=v;
    });
    return ok ? data : null;
  }

  async function submitLead(formType, data, btn) {
    const original = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = "Sending…";
    const payload = { formType, submittedAt: new Date().toISOString(), source: location.href, ...data };
    try {
      if (CONFIG.API_URL) {
        // Apps Script web apps accept simple POST; text/plain avoids CORS preflight.
        await fetch(CONFIG.API_URL, {
          method:"POST", mode:"no-cors",
          headers:{"Content-Type":"text/plain;charset=utf-8"},
          body: JSON.stringify(payload)
        });
      } else {
        await new Promise(r=>setTimeout(r, 650)); // demo mode
        console.info("[DEMO] Lead captured (no backend configured):", payload);
      }
      return true;
    } catch (err) {
      console.error("Submit failed:", err);
      return false;
    } finally {
      btn.disabled = false; btn.innerHTML = original;
    }
  }

  function bindForm(cfg) {
    const form = $("#lead-form"); if (!form) return;
    // chips
    if (cfg.chips) {
      $$("#chip-row .chip").forEach(c=>c.addEventListener("click", ()=>{
        $$("#chip-row .chip").forEach(x=>x.setAttribute("aria-pressed","false"));
        c.setAttribute("aria-pressed","true");
        $("#chip-val").value = c.dataset.chip;
        $("#chip-err").textContent="";
      }));
    }
    form.addEventListener("submit", async e=>{
      e.preventDefault();
      const data = validateAndCollect(form, cfg);
      if (!data) { const f = form.querySelector(".field--err, #chip-err"); if(f) f.scrollIntoView({behavior:"smooth",block:"center"}); return; }
      const btn = form.querySelector('button[type="submit"]');
      const okSubmit = await submitLead(cfg.formType, data, btn);
      const card = $("#form-card");
      if (okSubmit) {
        card.innerHTML = successHTML(cfg.successTitle, cfg.successMsg);
        toast("Request received");
        card.scrollIntoView({behavior:"smooth",block:"center"});
      } else {
        toast("Couldn't send — please try again or call us.");
      }
    });
  }

  /* ----- form configs ------------------------------------------------------ */
  const prefillArtisan = () => {
    const a = sessionStorage.getItem("sopodiva_artisan");
    sessionStorage.removeItem("sopodiva_artisan");
    return a || "";
  };

  function projectForm() {
    const pre = prefillArtisan();
    const cfg = {
      formType:"project",
      intro:"Tell us about the build or renovation. We'll come back with next steps and, where useful, a verified team.",
      chips:{name:"projectType", label:"What are you building?", options:["Residential","Commercial","Renovation","Civil works","Other"]},
      fields:[
        {name:"name",label:"Full name",required:true,half:true,placeholder:"e.g. Adwoa Mensah"},
        {name:"phone",label:"Phone",type:"tel",required:true,half:true,placeholder:"+233 …"},
        {name:"email",label:"Email",type:"email",half:true,placeholder:"you@email.com"},
        {name:"city",label:"City / location",type:"select",required:true,half:true,options:CITIES.concat(["Other"])},
        {name:"budget",label:"Approx. budget (optional)",type:"select",half:true,options:["Under ₵50,000","₵50,000 – ₵250,000","₵250,000 – ₵1M","Over ₵1M","Not sure yet"]},
        {name:"timeline",label:"Ideal start",type:"select",half:true,options:["As soon as possible","Within 1 month","1–3 months","Just planning"]},
        {name:"artisan",label:"Requested artisan (optional)",half:false,value:pre,placeholder:"Leave blank to let us match you"},
        {name:"details",label:"Project details",type:"textarea",required:true,placeholder:"Describe the scope, site, and anything we should know…"}
      ],
      note:`Prefer to talk? Call ${CONFIG.PHONE_1} or email ${CONFIG.EMAIL}.`,
      submit:"Submit project request",
      successTitle:"Project request received",
      successMsg:"Thank you — our team will review the scope and reach out within one business day to confirm next steps."
    };
    return pageIntro("Door 2 · Build & Deliver","Start a project",
      "From drawing to delivery, for private clients and public works alike.",
      "assets/img/project-scaffolding.jpg") + buildForm(cfg) + (window._cfg = cfg, "");
  }

  function urgentForm() {
    const cfg = {
      formType:"urgent", urgent:true,
      intro:"Got a leak, fault, or breakage that can't wait? Log it here and we'll dispatch a verified artisan fast.",
      chips:{name:"issue", label:"What's the problem?", urgent:true, options:["Plumbing / leak","Electrical fault","Roof / ceiling","Drainage","Door / lock","Other"]},
      fields:[
        {name:"name",label:"Full name",required:true,half:true,placeholder:"Your name"},
        {name:"phone",label:"Phone",type:"tel",required:true,half:true,placeholder:"+233 …"},
        {name:"city",label:"City",type:"select",required:true,half:true,options:CITIES.concat(["Other"])},
        {name:"address",label:"Address / area",required:true,half:true,placeholder:"Neighbourhood or landmark"},
        {name:"details",label:"Describe the issue",type:"textarea",required:true,placeholder:"What's happening, and how urgent is it?"}
      ],
      note:`For emergencies, call now: ${CONFIG.PHONE_1} / ${CONFIG.PHONE_2}.`,
      submit:"Send urgent request",
      successTitle:"Help is on the way",
      successMsg:"We've logged your request and a coordinator will call you shortly to dispatch a verified artisan. For emergencies, call us directly."
    };
    return pageIntro("Urgent repairs","Report an urgent repair",
      "Fast dispatch of verified artisans for repairs that can't wait.") + buildForm(cfg) + (window._cfg = cfg, "");
  }

  function inspectionForm() {
    const cfg = {
      formType:"inspection",
      intro:"Book a site visit. We'll assess the property, scope the work, and give you a clear plan and quote.",
      fields:[
        {name:"name",label:"Full name",required:true,half:true,placeholder:"Your name"},
        {name:"phone",label:"Phone",type:"tel",required:true,half:true,placeholder:"+233 …"},
        {name:"email",label:"Email",type:"email",half:true,placeholder:"you@email.com"},
        {name:"city",label:"City / location",type:"select",required:true,half:true,options:CITIES.concat(["Other"])},
        {name:"propertyType",label:"Property type",type:"select",required:true,half:true,options:["Residential","Commercial","Land / plot","Public / civic"]},
        {name:"preferredDate",label:"Preferred date",type:"date",half:true},
        {name:"address",label:"Site address",required:true,placeholder:"Where should we visit?"},
        {name:"purpose",label:"What's the inspection for?",type:"textarea",required:true,placeholder:"e.g. pre-purchase check, renovation scope, structural concern…"}
      ],
      note:`Diaspora investor? We can send photos and video walkthroughs after the visit.`,
      submit:"Request inspection",
      successTitle:"Inspection requested",
      successMsg:"Thanks — we'll confirm your site visit by phone or email and assign an engineer to the assessment."
    };
    return pageIntro("Site inspection","Request a site inspection",
      "An on-the-ground assessment before you commit — ideal for buyers, developers, and diaspora investors.",
      "assets/img/accra-aerial.jpg") + buildForm(cfg) + (window._cfg = cfg, "");
  }

  function joinForm() {
    const cfg = {
      formType:"artisan_application",
      intro:"Join the verified network and get a steady pipeline of work, a public reputation, and customers who trust the Sopodiva name.",
      chips:{name:"trade", label:"Your primary trade", options:TRADES},
      fields:[
        {name:"name",label:"Full name",required:true,half:true,placeholder:"Your name"},
        {name:"phone",label:"Phone",type:"tel",required:true,half:true,placeholder:"+233 …"},
        {name:"email",label:"Email",type:"email",half:true,placeholder:"you@email.com"},
        {name:"city",label:"Base city",type:"select",required:true,half:true,options:CITIES.concat(["Other"])},
        {name:"years",label:"Years of experience",type:"select",required:true,half:true,options:["1–3","4–6","7–10","10+"]},
        {name:"team",label:"Work solo or with a team?",type:"select",half:true,options:["Solo","Small team (2–5)","Crew (6+)"]},
        {name:"skills",label:"Key skills / specialties",required:true,placeholder:"e.g. leak repair, water systems, drainage"},
        {name:"about",label:"Tell us about your work",type:"textarea",required:true,placeholder:"Recent jobs, references, certifications, anything that shows your quality…"}
      ],
      note:`Every applicant is screened before going live. We'll be in touch about verification.`,
      submit:"Apply to join",
      successTitle:"Application received",
      successMsg:"Thank you for applying. Our team will review your details and contact you to begin verification — the step that earns you the Verified badge."
    };
    return pageIntro("Join the network","Become a verified artisan",
      "Get discovered, build a reputation, and win more work through the platform.",
      "assets/img/crew-rebar.jpg") + buildForm(cfg) + (window._cfg = cfg, "");
  }

  /* =======================================================================
     ABOUT
     ======================================================================= */
  function about() {
    const values = [
      ["Quality first","No compromise on standards."],
      ["Integrity","Transparent, ethical operations."],
      ["Innovation","Modern solutions to engineering challenges."],
      ["Sustainability","Environmentally responsible construction."],
      ["Partnership","Strong collaboration with clients and stakeholders."]
    ];
    return pageIntro("About us","Engineering excellence. Delivering impact.",
      "Sopodiva Development Company Ltd is a forward-looking construction and infrastructure company, committed to high-quality, sustainable, and innovative engineering across Ghana and beyond.",
      "assets/img/about-office.jpg") + `
    <section class="section"><div class="wrap">
      <div class="grid grid-2">
        <div class="card"><div class="model__h">${ic(I.eye)}<h3 class="mb-0">Vision</h3></div>
          <p>To become a leading infrastructure and real estate development company in West Africa — recognized for excellence, reliability, and innovation.</p></div>
        <div class="card"><div class="model__h">${ic(I.build)}<h3 class="mb-0">Mission</h3></div>
          <p>To design and deliver high-quality construction and engineering solutions that improve lives, empower communities, and support sustainable development.</p></div>
      </div>
    </div></section>

    <section class="section section--mist"><div class="wrap">
      <div class="section__head"><p class="eyebrow">Core values</p><h2>What we stand on</h2></div>
      <div class="grid grid-3">
        ${values.map(([t,d])=>`<div class="card"><h3>${t}</h3><p>${d}</p></div>`).join("")}
      </div>
    </div></section>

    <section class="section"><div class="wrap form-wrap">
      <div class="md-msg">
        <p class="eyebrow">From the Managing Director</p>
        <p>Infrastructure is the backbone of development. Our commitment is to deliver projects that meet technical standards and improve lives — building long-lasting partnerships while ensuring every project reflects excellence, reliability, and impact.</p>
        <p>As we expand across Ghana and beyond, our ambition is clear: to become a trusted name in infrastructure development across Africa.</p>
        <p class="sig mb-0">— Managing Director, Sopodiva Development Company Ltd</p>
      </div>
    </div></section>

    <section class="section section--navy"><div class="wrap">
      <div class="split">
        <div class="split__media"><img src="assets/img/impact-tema.jpg" alt="Aerial view of a growing African city" loading="lazy"/></div>
        <div>
          <p class="eyebrow" style="color:var(--steel-200)">Our impact</p>
          <h2>Trust that builds livelihoods — and cityscapes</h2>
          <div class="grid grid-2" style="margin-top:22px">
            ${[
              [I.eye,"Transparency","Reviews and verification clean up an opaque industry."],
              [I.people,"Jobs & visibility","Skilled artisans gain reputation and a steady pipeline."],
              [I.shield,"Safer delivery","Accountability raises quality and safety on every build."],
              [I.build,"Urban development","Reliable execution supports Africa's fast-growing cities."]
            ].map(([i,t,d])=>`<div class="aud" style="gap:12px"><span class="ic ic--steel" style="width:42px;height:42px;margin:0">${svg(i)}</span><div><h3 style="color:#fff;font-size:1.02rem">${t}</h3><p style="color:#CDD9E3;font-size:.9rem">${d}</p></div></div>`).join("")}
          </div>
        </div>
      </div>
    </div></section>
    ${ctaBand()}`;
  }

  /* =======================================================================
     CONTACT
     ======================================================================= */
  function contact() {
    const cfg = {
      formType:"contact",
      fields:[
        {name:"name",label:"Full name",required:true,half:true,placeholder:"Your name"},
        {name:"email",label:"Email",type:"email",required:true,half:true,placeholder:"you@email.com"},
        {name:"phone",label:"Phone (optional)",type:"tel",half:true,placeholder:"+233 …"},
        {name:"subject",label:"Subject",required:true,half:true,placeholder:"How can we help?"},
        {name:"message",label:"Message",type:"textarea",required:true,placeholder:"Write your message…"}
      ],
      submit:"Send message",
      successTitle:"Message sent",
      successMsg:"Thanks for reaching out — we'll reply by email or phone as soon as we can."
    };
    return pageIntro("Contact","Let's talk about your build",
      "Questions, quotes, partnerships, or public-sector tenders — we're listening.") + `
    <section class="section"><div class="wrap">
      <div class="contact-grid">
        <div>
          <div class="card">
            <div class="contact-line">${ic(I.mail)}<div><b>Email</b><a href="mailto:${CONFIG.EMAIL}"><span>${CONFIG.EMAIL}</span></a></div></div>
            <div class="contact-line">${ic(I.phone)}<div><b>Phone</b><span>${CONFIG.PHONE_1} · ${CONFIG.PHONE_2}</span></div></div>
            <div class="contact-line">${ic(I.wa)}<div><b>WhatsApp</b><a href="https://wa.me/${CONFIG.WHATSAPP}" target="_blank" rel="noopener"><span>Chat with us</span></a></div></div>
            <div class="contact-line">${ic(I.pin)}<div><b>Location</b><span>Accra, Ghana</span></div></div>
          </div>
          <div class="note" style="margin-top:16px">${svg(I.info)}<span>For urgent repairs, use the <a data-route="/urgent" style="color:var(--navy);font-weight:600">urgent request</a> form for fastest dispatch.</span></div>
        </div>
        <div>${buildForm(cfg)}</div>
      </div>
    </div></section>${(window._cfg = cfg, "")}`;
  }

  /* =======================================================================
     ROUTER
     ======================================================================= */
  const ROUTES = {
    "/":            {render:home,           after:null,             title:"Sopodiva Development — Build & repair across Africa, with trust",
                     desc:"Sopodiva Development builds across Ghana and beyond — a full-service construction arm plus a verified-artisan marketplace under one trusted name. Find a vetted artisan, request a project, or book a site inspection."},
    "/marketplace": {render:marketplace,    after:bindMarketplace,  title:"Find a Verified Artisan · Sopodiva Development",
                     desc:"Browse vetted, rated artisans across Ghana — plumbing, electrical, masonry, carpentry, roofing, welding and more. Hire with confidence on the Sopodiva marketplace."},
    "/services":    {render:services,       after:null,             title:"Services · Sopodiva Development",
                     desc:"Construction and repair services across Ghana: civil works, site inspections, finishing trades and verified-artisan dispatch from Sopodiva Development.",
                     jsonld:(url)=>({"@context":"https://schema.org","@type":"OfferCatalog","name":"Sopodiva Development Services","url":url,"itemListElement":TRADES.map(t=>({"@type":"Offer","itemOffered":{"@type":"Service","name":t,"areaServed":"GH","provider":{"@type":"GeneralContractor","name":"Sopodiva Development Company Ltd"}}}))})},
    "/request":     {render:projectForm,    after:()=>bindForm(window._cfg), title:"Start a Project · Sopodiva Development",
                     desc:"Start a construction or repair project with Sopodiva Development. Tell us the scope and we'll source the right verified team across Ghana."},
    "/urgent":      {render:urgentForm,     after:()=>bindForm(window._cfg), title:"Urgent Repair · Sopodiva Development",
                     desc:"Need an urgent repair in Ghana? Report it to Sopodiva for fast dispatch of a verified artisan — plumbing, electrical, roofing and more."},
    "/inspection":  {render:inspectionForm, after:()=>bindForm(window._cfg), title:"Request a Site Inspection · Sopodiva Development",
                     desc:"Request a professional site inspection from Sopodiva Development's construction team, serving Accra and across Ghana."},
    "/join":        {render:joinForm,       after:()=>bindForm(window._cfg), title:"Join the Artisan Network · Sopodiva Development",
                     desc:"Are you a skilled artisan in Ghana? Join Sopodiva's verified-artisan network and get matched to paid, vetted work."},
    "/about":       {render:about,          after:null,             title:"About · Sopodiva Development",
                     desc:"Sopodiva Development Company Ltd — building Africa through technology and construction. Trusted connections, quality execution."},
    "/contact":     {render:contact,        after:()=>bindForm(window._cfg), title:"Contact · Sopodiva Development",
                     desc:"Contact Sopodiva Development Company Ltd in Accra, Ghana — call, email or WhatsApp for construction, repairs and verified-artisan services.",
                     jsonld:(url)=>({"@context":"https://schema.org","@type":"ContactPage","url":url,"about":{"@type":"GeneralContractor","name":"Sopodiva Development Company Ltd","telephone":["+233558244098","+233593868612"],"email":"dev@sopodiva.com","address":{"@type":"PostalAddress","addressLocality":"Accra","addressCountry":"GH"}}})}
  };

  /* ----- SEO: per-route <head> management --------------------------------- */
  const ORIGIN = "https://www.sopodivadevelopment.com";
  function headMeta(sel, attr, key){
    let el = document.head.querySelector(sel);
    if (!el){ el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
    return el;
  }
  function setName(n, c){ headMeta(`meta[name="${n}"]`, "name", n).setAttribute("content", c||""); }
  function setProp(p, c){ headMeta(`meta[property="${p}"]`, "property", p).setAttribute("content", c||""); }
  function setCanonical(href){
    let el = document.head.querySelector('link[rel="canonical"]');
    if (!el){ el = document.createElement("link"); el.setAttribute("rel","canonical"); document.head.appendChild(el); }
    el.setAttribute("href", href);
  }
  function setJsonLd(obj){
    let el = document.getElementById("ld-page");
    if (!el){ el = document.createElement("script"); el.type = "application/ld+json"; el.id = "ld-page"; document.head.appendChild(el); }
    el.textContent = obj ? JSON.stringify(obj) : "";
  }
  function setHead(path, route){
    const url = ORIGIN + (path === "/" ? "/" : path);
    document.title = route.title;
    setName("description", route.desc);
    setCanonical(url);
    setProp("og:title", route.title);
    setProp("og:description", route.desc);
    setProp("og:url", url);
    setProp("og:type", "website");
    setName("twitter:card", "summary_large_image");
    setJsonLd(route.jsonld ? route.jsonld(url) : null);
  }
  // give SPA anchors real href values so crawlers can follow them and no-JS users can navigate
  function hydrateRouteLinks(scope){
    (scope||document).querySelectorAll('a[data-route]:not([href])')
      .forEach(a=>a.setAttribute("href", a.dataset.route));
  }

  function currentPath(){
    const p = location.pathname.replace(/\/+$/, "") || "/";
    return ROUTES[p] ? p : "/";
  }

  function navigate(path){
    if (location.pathname !== path) history.pushState({}, "", path);
    render();
  }

  function setActive(path){
    $$(".nav__links a[data-route]").forEach(a=>{
      a.classList.toggle("is-active", a.dataset.route===path && path!=="/");
    });
  }

  function render(){
    const path = currentPath();
    const route = ROUTES[path];
    setHead(path, route);
    view.innerHTML = route.render();
    hydrateRouteLinks(view);
    setActive(path);
    if (route.after) route.after();
    window.scrollTo({top:0, behavior:"instant" in window ? "instant" : "auto"});
    view.focus({preventScroll:true});
    // close mobile menu
    $(".nav__links").classList.remove("open");
    $(".burger").setAttribute("aria-expanded","false");
  }

  /* ----- global event wiring ---------------------------------------------- */
  // delegate any [data-route] click
  document.addEventListener("click", e=>{
    const link = e.target.closest("[data-route]");
    if (link){ e.preventDefault(); navigate(link.dataset.route); }
  });
  // keyboard activate for role=link
  document.addEventListener("keydown", e=>{
    if ((e.key==="Enter"||e.key===" ") && e.target.matches('[data-route][role="link"]')){
      e.preventDefault(); navigate(e.target.dataset.route);
    }
  });
  // burger
  $(".burger").addEventListener("click", ()=>{
    const links = $(".nav__links"), b=$(".burger");
    const open = links.classList.toggle("open");
    b.setAttribute("aria-expanded", String(open));
  });

  window.addEventListener("popstate", render);

  // optional: pull live artisans from the backend if configured
  async function loadArtisans(){
    if (!CONFIG.API_URL) return;
    try{
      const res = await fetch(CONFIG.API_URL + "?type=artisans");
      const data = await res.json();
      if (Array.isArray(data) && data.length){ artisans = data; if (currentPath()==="/marketplace") renderArtisans(); }
    }catch(err){ /* fall back to seed silently */ }
  }

  // boot
  $("#yr").textContent = new Date().getFullYear();
  hydrateRouteLinks(document);   // give static nav/footer anchors real, crawlable href
  render();
  loadArtisans();
})();
