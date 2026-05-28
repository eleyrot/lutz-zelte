/* ==========================================================================
   products.js — Lutz Zelte GmbH
   Zweck: Produkt-Listings aus Sanity CMS laden und rendern.
   Modi:
     - Startseite (index.html): bis zu 3 Highlight-Zelte als Teaser
     - Produkte-Seite (produkte.html): alle Zelte mit Filter-Tabs
   ========================================================================== */

const PROJECT_ID = '5ndwm7ob';
const DATASET    = 'production';
const API_URL    = `https://${PROJECT_ID}.apicdn.sanity.io/v2021-10-21/data/query/${DATASET}`;

const QUERY = encodeURIComponent('*[_type == "zelt"] | order(reihenfolge asc)');

/* --------------------------------------------------------------------------
   Sanity Bild-URL aus Asset-Referenz bauen
   -------------------------------------------------------------------------- */
function sanityImageUrl(asset, width = 800) {
  if (!asset?.asset?._ref) return null;
  const ref   = asset.asset._ref;
  const parts = ref.replace('image-', '').split('-');
  const ext   = parts.pop();
  const id    = parts.join('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}.${ext}?w=${width}&auto=format`;
}

/* --------------------------------------------------------------------------
   Hilfsfunktionen
   -------------------------------------------------------------------------- */
function formatPreis(preis) {
  return 'CHF ' + Math.round(preis).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\'') + '.–';
}

const FARB_LABELS = {
  weiss:   { label: 'Weiss',   hex: '#f5f5f5' },
  blau:    { label: 'Blau',    hex: '#2563eb' },
  rot:     { label: 'Rot',     hex: '#dc2626' },
  gelb:    { label: 'Gelb',    hex: '#eab308' },
  gruen:   { label: 'Grün',    hex: '#16a34a' },
  schwarz: { label: 'Schwarz', hex: '#1f2937' },
};

/* --------------------------------------------------------------------------
   Produkt-Karte rendern (vollständig)
   -------------------------------------------------------------------------- */
function renderKarte(p) {
  const istVermietung = p.kategorie === 'vermietung';

  let preis = '';
  if (istVermietung) {
    preis = p.preis_pro_tag
      ? `<span class="produkt__preis">${formatPreis(p.preis_pro_tag)} <small>/ Tag</small></span>` : '';
  } else if (p.preis_gestell) {
    preis = `<span class="produkt__preis">ab ${formatPreis(p.preis_gestell)}</span>`;
  } else if (p.preis_chf) {
    preis = `<span class="produkt__preis">${formatPreis(p.preis_chf)}</span>`;
  }

  const verfuegbarBadge = p.verfuegbar
    ? `<span class="produkt__badge produkt__badge--ok">Verfügbar</span>`
    : `<span class="produkt__badge produkt__badge--nein">Vergeben</span>`;

  const occasionBadge = p.kategorie === 'occasion'
    ? `<span class="produkt__badge produkt__badge--occasion">Occasion</span>` : '';

  const bildSrc = p.bilder?.length ? sanityImageUrl(p.bilder[0], 800) : null;
  const bildHTML = bildSrc
    ? `<img src="${bildSrc}" alt="${p.name}" class="produkt__bild" loading="lazy" />`
    : `<div class="produkt__bild-placeholder" aria-hidden="true">⛺</div>`;

  let groesse = p.groesse_m || '';
  if (!groesse && p.groesse_b_m && p.groesse_l_m) groesse = `${p.groesse_b_m} × ${p.groesse_l_m} m`;
  const groesseHTML = groesse
    ? `<span class="produkt__meta-item">📐 ${groesse}${p.besonderheit ? ` (${p.besonderheit})` : ''}</span>` : '';

  const gewichtHTML = p.gewicht_kg
    ? `<span class="produkt__meta-item">⚖️ ${p.gewicht_kg} kg</span>` : '';

  const kapHTML = p.kapazitaet_personen
    ? `<span class="produkt__meta-item">👥 bis ${p.kapazitaet_personen} Personen</span>` : '';

  const hoehenTeile = [];
  if (p.hoehe_1_m) hoehenTeile.push(`H1: ${p.hoehe_1_m} m`);
  if (p.hoehe_2_m) hoehenTeile.push(`H2: ${p.hoehe_2_m} m`);
  if (p.hoehe_3_m) hoehenTeile.push(`H3: ${p.hoehe_3_m} m`);
  const hoehenHTML = hoehenTeile.length
    ? `<div class="produkt__meta"><span class="produkt__meta-item">📏 ${hoehenTeile.join(' · ')}</span></div>` : '';

  let farbenHTML = '';
  if (p.farben?.length) {
    const chips = p.farben.map(f => {
      const info = FARB_LABELS[f] || { label: f, hex: '#ccc' };
      return `<span class="produkt__farbchip" style="background:${info.hex}" title="${info.label}"></span>`;
    }).join('');
    farbenHTML = `<div class="produkt__farben">${chips}</div>`;
  }

  const ausstattungHTML = p.ausstattung?.length
    ? `<ul class="produkt__liste">${p.ausstattung.map(a => `<li>${a}</li>`).join('')}</ul>` : '';

  const zubehoerHTML = p.zubehoer?.length
    ? `<div class="produkt__zubehoer">
        <p class="produkt__zubehoer-titel">Optionales Zubehör</p>
        <table class="produkt__zubehoer-tabelle">
          ${p.zubehoer.map(z => `
          <tr>
            <td class="produkt__zubehoer-name">${z.bezeichnung}</td>
            <td class="produkt__zubehoer-preis">${z.preis_chf ? formatPreis(z.preis_chf) : 'auf Anfrage'}</td>
          </tr>`).join('')}
        </table>
      </div>` : '';

  const serieHTML = p.serie
    ? `<span class="produkt__serie">${p.serie}</span>` : '';

  return `
    <article class="produkt-karte">
      <div class="produkt__bild-wrapper">
        ${bildHTML}
        <div class="produkt__badges">${verfuegbarBadge}${occasionBadge}</div>
        ${serieHTML}
      </div>
      <div class="produkt__body">
        <h3 class="produkt__name">${p.name}</h3>
        <div class="produkt__meta">${groesseHTML}${gewichtHTML}${kapHTML}</div>
        ${hoehenHTML}
        ${p.beschreibung ? `<p class="produkt__beschreibung">${p.beschreibung}</p>` : ''}
        ${ausstattungHTML}
        ${zubehoerHTML}
        ${farbenHTML}
        <div class="produkt__footer">
          ${preis}
          <a class="btn btn--primary produkt__btn" href="index.html#kontakt">Anfragen</a>
        </div>
      </div>
    </article>`;
}

/* --------------------------------------------------------------------------
   STARTSEITE — bis zu 3 Highlight-Zelte als Teaser
   -------------------------------------------------------------------------- */
function initTeaser(alle) {
  const el = document.getElementById('produkte-teaser');
  if (!el) return;

  const highlights = alle.filter(p => p.highlight).slice(0, 3);
  const zelte = highlights.length ? highlights : alle.slice(0, 3);

  if (!zelte.length) { el.hidden = true; return; }

  el.hidden = false;
  el.innerHTML = `
    <div class="produkte__grid produkte__grid--teaser">
      ${zelte.map(renderKarte).join('')}
    </div>
    <div class="produkte__mehr">
      <a class="btn btn--outline" href="verkauf.html">Alle Zelte ansehen →</a>
    </div>`;
}

/* --------------------------------------------------------------------------
   VERKAUFS-SEITE — alle Verkaufs-Zelte (Vermietung ausgeschlossen)
   -------------------------------------------------------------------------- */
function initProduktSeite(alle) {
  const container = document.getElementById('produkte-alle');
  const tabsEl    = document.getElementById('produkte-tabs');
  if (!container || !tabsEl) return;

  /* Nur Verkaufs-Zelte (Mietzelte sind auf verleih.html) */
  const verkaufsZelte = alle.filter(p => p.kategorie !== 'vermietung');

  const tabs = [
    { id: 'alle',     label: 'Alle',     filter: () => true },
    { id: 'serie1',   label: 'Serie 1',  filter: p => p.serie === 'Serie 1' },
    { id: 'serie2',   label: 'Serie 2',  filter: p => p.serie === 'Serie 2' },
    { id: 'occasion', label: 'Occasion', filter: p => p.kategorie === 'occasion' },
  ];

  /* Damit der Rest mit "alle" weiterarbeitet, ohne Vermietung */
  alle = verkaufsZelte;

  /* Tabs rendern — nur Tabs mit Einträgen anzeigen */
  const sichtbareTabs = tabs.filter(t => alle.some(t.filter));
  tabsEl.innerHTML = sichtbareTabs.map((t, i) =>
    `<button class="filter-tab${i === 0 ? ' filter-tab--active' : ''}" data-tab="${t.id}">${t.label}</button>`
  ).join('');

  function renderTab(tabId) {
    const tab = tabs.find(t => t.id === tabId) || tabs[0];
    const gefiltert = alle.filter(tab.filter);

    if (!gefiltert.length) {
      container.innerHTML = `<p class="produkte__leer">Keine Zelte in dieser Kategorie.</p>`;
      return;
    }
    container.innerHTML = `<div class="produkte__grid">${gefiltert.map(renderKarte).join('')}</div>`;
  }

  /* Tab-Klick */
  tabsEl.addEventListener('click', e => {
    const btn = e.target.closest('.filter-tab');
    if (!btn) return;
    tabsEl.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('filter-tab--active'));
    btn.classList.add('filter-tab--active');
    renderTab(btn.dataset.tab);
  });

  /* URL-Hash als initialen Filter verwenden (#serie1, #occasion, etc.) */
  const hash = location.hash.replace('#', '');
  const startTab = sichtbareTabs.find(t => t.id === hash) ? hash : sichtbareTabs[0]?.id;
  if (startTab) {
    const startBtn = tabsEl.querySelector(`[data-tab="${startTab}"]`);
    tabsEl.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('filter-tab--active'));
    if (startBtn) startBtn.classList.add('filter-tab--active');
    renderTab(startTab);
  } else {
    renderTab('alle');
  }
}

/* --------------------------------------------------------------------------
   VERLEIH-SEITE — nur Mietzelte (kategorie == 'vermietung')
   -------------------------------------------------------------------------- */
function initVerleihSeite(alle) {
  const container = document.getElementById('mietzelte-alle');
  if (!container) return;

  const mietzelte = alle.filter(p => p.kategorie === 'vermietung');

  if (!mietzelte.length) {
    container.innerHTML = '<p class="produkte__leer">Aktuell sind alle Mietzelte ausgebucht. Kontaktieren Sie uns gerne für Ihre Anfrage.</p>';
    return;
  }

  container.innerHTML = `<div class="produkte__grid">${mietzelte.map(renderKarte).join('')}</div>`;
}

/* --------------------------------------------------------------------------
   Hauptfunktion — lädt Daten, entscheidet Modus
   -------------------------------------------------------------------------- */
export async function initProducts() {
  let alle;
  try {
    const res = await fetch(`${API_URL}?query=${QUERY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    alle = json.result ?? [];
  } catch (err) {
    console.warn('Produkte konnten nicht geladen werden:', err);
    return;
  }

  /* Modus bestimmen — je nach DOM-Container */
  if (document.getElementById('produkte-teaser')) initTeaser(alle);
  if (document.getElementById('produkte-alle'))   initProduktSeite(alle);
  if (document.getElementById('mietzelte-alle'))  initVerleihSeite(alle);
}
