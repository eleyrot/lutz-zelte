/* ==========================================================================
   products.js — Lutz Zelte GmbH
   Zweck: Produkt-Listings dynamisch aus JSON laden und rendern.
   Kategorien: 'vermietung' → #produkte-vermietung
               'neu'        → #produkte-verkauf
               'occasion'   → #produkte-occasion
   Später: fetch() Ziel durch Sanity-API ersetzen.
   ========================================================================== */

const DATA_URL = 'data/produkte.json';

/* --------------------------------------------------------------------------
   Hilfsfunktionen
   -------------------------------------------------------------------------- */

/* Preis formatieren: 1290 → «CHF 1'290.–» */
function formatPreis(preis) {
  const formatted = preis.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  return `CHF ${formatted}.–`;
}

/* Einzelne Produkt-Karte als HTML-String */
function renderKarte(p) {
  const istVermietung = p.kategorie === 'vermietung';
  const preisBadge = istVermietung
    ? `<span class="produkt__preis">${formatPreis(p.preis_pro_tag)} <small>/ Tag</small></span>`
    : `<span class="produkt__preis">${formatPreis(p.preis_chf)}</span>`;

  const verfuegbarBadge = p.verfuegbar
    ? `<span class="produkt__badge produkt__badge--ok">Verfügbar</span>`
    : `<span class="produkt__badge produkt__badge--nein">Vergeben</span>`;

  const occasionBadge = p.kategorie === 'occasion'
    ? `<span class="produkt__badge produkt__badge--occasion">Occasion</span>`
    : '';

  /* Bild oder Platzhalter */
  const bildHTML = p.bilder && p.bilder.length > 0
    ? `<img src="${p.bilder[0]}" alt="${p.name}" class="produkt__bild" loading="lazy" />`
    : `<div class="produkt__bild-placeholder" aria-hidden="true">⛺</div>`;

  /* Ausstattung-Liste */
  const ausstattungHTML = p.ausstattung && p.ausstattung.length > 0
    ? `<ul class="produkt__liste">${p.ausstattung.map(a => `<li>${a}</li>`).join('')}</ul>`
    : '';

  /* Kapazität */
  const kapHTML = p.kapazitaet_personen
    ? `<span class="produkt__meta-item">👥 bis ${p.kapazitaet_personen} Personen</span>`
    : '';

  return `
    <article class="produkt-karte">
      <div class="produkt__bild-wrapper">
        ${bildHTML}
        <div class="produkt__badges">${verfuegbarBadge}${occasionBadge}</div>
      </div>
      <div class="produkt__body">
        <h3 class="produkt__name">${p.name}</h3>
        <div class="produkt__meta">
          <span class="produkt__meta-item">📐 ${p.groesse_m}</span>
          ${kapHTML}
        </div>
        <p class="produkt__beschreibung">${p.beschreibung}</p>
        ${ausstattungHTML}
        <div class="produkt__footer">
          ${preisBadge}
          <a class="btn btn--primary produkt__btn" href="#kontakt">Anfragen</a>
        </div>
      </div>
    </article>`;
}

/* Container mit Karten befüllen */
function renderInContainer(containerId, produkte) {
  const el = document.getElementById(containerId);
  if (!el) return;

  if (produkte.length === 0) {
    el.innerHTML = '';
    el.hidden = true;
    return;
  }

  el.hidden = false;
  el.innerHTML = `<div class="produkte__grid">${produkte.map(renderKarte).join('')}</div>`;
}

/* --------------------------------------------------------------------------
   Hauptfunktion
   -------------------------------------------------------------------------- */
export async function initProducts() {
  let alle;
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    alle = await res.json();
  } catch (err) {
    console.warn('Produkte konnten nicht geladen werden:', err);
    return;
  }

  /* Sortieren nach reihenfolge */
  alle.sort((a, b) => (a.reihenfolge ?? 99) - (b.reihenfolge ?? 99));

  /* In Kategorien aufteilen */
  const vermietung = alle.filter(p => p.kategorie === 'vermietung');
  const neu        = alle.filter(p => p.kategorie === 'neu');
  const occasion   = alle.filter(p => p.kategorie === 'occasion');

  renderInContainer('produkte-vermietung', vermietung);
  renderInContainer('produkte-verkauf',    neu);
  renderInContainer('produkte-occasion',   occasion);
}
