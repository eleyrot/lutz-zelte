/* ==========================================================================
   products.js — Lutz Zelte GmbH
   Zweck: Produkt-Listings aus Sanity CMS laden und rendern.
   Kategorien: 'vermietung' → #produkte-vermietung
               'neu'        → #produkte-verkauf
               'occasion'   → #produkte-occasion
   ========================================================================== */

const PROJECT_ID = '5ndwm7ob';
const DATASET    = 'production';
const API_URL    = `https://${PROJECT_ID}.apicdn.sanity.io/v2021-10-21/data/query/${DATASET}`;

/* GROQ-Query: alle Zelte, sortiert nach Reihenfolge */
const QUERY = encodeURIComponent('*[_type == "zelt"] | order(reihenfolge asc)');

/* --------------------------------------------------------------------------
   Sanity Bild-URL aus Asset-Referenz bauen
   Ref-Format: image-abc123-800x600-jpg
   -------------------------------------------------------------------------- */
function sanityImageUrl(asset, width = 800) {
  if (!asset?.asset?._ref) return null;
  const ref   = asset.asset._ref;                     // image-abc123-800x600-jpg
  const parts = ref.replace('image-', '').split('-'); // [abc123, 800x600, jpg]
  const ext   = parts.pop();                          // jpg
  const id    = parts.join('-');                      // abc123-800x600
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}.${ext}?w=${width}&auto=format`;
}

/* --------------------------------------------------------------------------
   Hilfsfunktionen
   -------------------------------------------------------------------------- */
function formatPreis(preis) {
  return 'CHF ' + Math.round(preis).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’') + '.–';
}

const FARB_LABELS = {
  weiss: { label: 'Weiss',   hex: '#f5f5f5' },
  blau:  { label: 'Blau',    hex: '#2563eb' },
  rot:   { label: 'Rot',     hex: '#dc2626' },
  gelb:  { label: 'Gelb',    hex: '#eab308' },
  gruen: { label: 'Grün',    hex: '#16a34a' },
  schwarz:{ label: 'Schwarz',hex: '#1f2937' },
};

function renderKarte(p) {
  const istVermietung = p.kategorie === 'vermietung';

  /* Preis-Logik: Gestell-Preis als Einstieg, Gesamt auf Anfrage */
  let preis = '';
  if (istVermietung) {
    preis = p.preis_pro_tag
      ? `<span class="produkt__preis">${formatPreis(p.preis_pro_tag)} <small>/ Tag</small></span>` : '';
  } else if (p.preis_gestell) {
    preis = `<span class="produkt__preis">ab ${formatPreis(p.preis_gestell)} <small>Gestell</small></span>`;
  } else if (p.preis_chf) {
    preis = `<span class="produkt__preis">${formatPreis(p.preis_chf)}</span>`;
  }

  const verfuegbarBadge = p.verfuegbar
    ? `<span class="produkt__badge produkt__badge--ok">Verfügbar</span>`
    : `<span class="produkt__badge produkt__badge--nein">Vergeben</span>`;

  const occasionBadge = p.kategorie === 'occasion'
    ? `<span class="produkt__badge produkt__badge--occasion">Occasion</span>` : '';

  /* Bild */
  const bildSrc = p.bilder && p.bilder.length > 0 ? sanityImageUrl(p.bilder[0], 800) : null;
  const bildHTML = bildSrc
    ? `<img src="${bildSrc}" alt="${p.name}" class="produkt__bild" loading="lazy" />`
    : `<div class="produkt__bild-placeholder" aria-hidden="true">⛺</div>`;

  /* Grösse: aus Textfeld oder aus numerischen Feldern */
  let groesse = p.groesse_m || '';
  if (!groesse && p.groesse_b_m && p.groesse_l_m) {
    groesse = `${p.groesse_b_m} × ${p.groesse_l_m} m`;
  } else if (!groesse && p.groesse_b_m) {
    groesse = `${p.groesse_b_m} m`;
  }
  const groesseHTML = groesse
    ? `<span class="produkt__meta-item">📐 ${groesse}${p.besonderheit ? ` (${p.besonderheit})` : ''}</span>` : '';

  const kapHTML = p.kapazitaet_personen
    ? `<span class="produkt__meta-item">👥 bis ${p.kapazitaet_personen} Personen</span>` : '';

  const gewichtHTML = p.gewicht_kg
    ? `<span class="produkt__meta-item">⚖️ ${p.gewicht_kg} kg</span>` : '';

  /* Höhen-Zeile */
  const hoehenTeile = [];
  if (p.hoehe_1_m) hoehenTeile.push(`H1: ${p.hoehe_1_m} m`);
  if (p.hoehe_2_m) hoehenTeile.push(`H2: ${p.hoehe_2_m} m`);
  if (p.hoehe_3_m) hoehenTeile.push(`H3 (First): ${p.hoehe_3_m} m`);
  const hoehenHTML = hoehenTeile.length
    ? `<span class="produkt__meta-item">📏 ${hoehenTeile.join(' · ')}</span>` : '';

  /* Farbchips */
  let farbenHTML = '';
  if (p.farben && p.farben.length) {
    const chips = p.farben.map(f => {
      const info = FARB_LABELS[f] || { label: f, hex: '#ccc' };
      return `<span class="produkt__farbchip" style="background:${info.hex}" title="${info.label}"></span>`;
    }).join('');
    farbenHTML = `<div class="produkt__farben">${chips}</div>`;
  }

  const ausstattungHTML = p.ausstattung?.length
    ? `<ul class="produkt__liste">${p.ausstattung.map(a => `<li>${a}</li>`).join('')}</ul>` : '';

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
        <div class="produkt__meta">${groesseHTML}${kapHTML}${gewichtHTML}</div>
        ${hoehenHTML ? `<div class="produkt__meta">${hoehenHTML}</div>` : ''}
        ${p.beschreibung ? `<p class="produkt__beschreibung">${p.beschreibung}</p>` : ''}
        ${ausstattungHTML}
        ${farbenHTML}
        <div class="produkt__footer">
          ${preis}
          <a class="btn btn--primary produkt__btn" href="#kontakt">Anfragen</a>
        </div>
      </div>
    </article>`;
}

function renderInContainer(containerId, produkte) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!produkte.length) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = `<div class="produkte__grid">${produkte.map(renderKarte).join('')}</div>`;
}

/* --------------------------------------------------------------------------
   Hauptfunktion — lädt Daten aus Sanity API
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

  renderInContainer('produkte-vermietung', alle.filter(p => p.kategorie === 'vermietung'));
  renderInContainer('produkte-verkauf',    alle.filter(p => p.kategorie === 'neu'));
  renderInContainer('produkte-occasion',   alle.filter(p => p.kategorie === 'occasion'));
}
