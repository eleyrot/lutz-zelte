/* ==========================================================================
   verleih-detail.js — Lutz Zelte GmbH
   Zweck: Detail-Dialog für Mietzelt-Karten auf verleih.html.
   Öffnet natives <dialog> mit Bildergalerie, Specs und WhatsApp-CTA.
   ========================================================================== */

const PROJECT_ID = '5ndwm7ob';
const DATASET    = 'production';

function sanityImageUrl(asset, w = 1200) {
  if (!asset?.asset?._ref) return null;
  const ref   = asset.asset._ref;
  const parts = ref.replace('image-', '').split('-');
  const ext   = parts.pop();
  const id    = parts.join('-');
  return `https://cdn.sanity.io/images/${PROJECT_ID}/${DATASET}/${id}.${ext}?w=${w}&auto=format`;
}

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
   Spezifikations-HTML für den Dialog-Body
   -------------------------------------------------------------------------- */
function specsHTML(p) {
  const items = [];
  let groesse = p.groesse_m || '';
  if (!groesse && p.groesse_b_m && p.groesse_l_m) groesse = `${p.groesse_b_m} × ${p.groesse_l_m} m`;
  if (groesse) items.push(['Grösse', groesse + (p.besonderheit ? ` (${p.besonderheit})` : '')]);

  const hoehenTeile = [];
  if (p.hoehe_1_m) hoehenTeile.push(`H1: ${p.hoehe_1_m} m`);
  if (p.hoehe_2_m) hoehenTeile.push(`H2: ${p.hoehe_2_m} m`);
  if (p.hoehe_3_m) hoehenTeile.push(`H3: ${p.hoehe_3_m} m`);
  if (hoehenTeile.length) items.push(['Höhe', hoehenTeile.join(' · ')]);
  if (p.gewicht_kg) items.push(['Gewicht', `${p.gewicht_kg} kg`]);
  if (p.kapazitaet_personen) items.push(['Kapazität', `bis ${p.kapazitaet_personen} Personen`]);

  const specsListHTML = items.length
    ? `<ul class="mietzelt-specs">${items.map(([l, v]) =>
        `<li><span class="mietzelt-specs__label">${l}</span><span>${v}</span></li>`
      ).join('')}</ul>` : '';

  const farbenHTML = p.farben?.length
    ? `<div class="mietzelt-specs__farben">${p.farben.map(f => {
        const info = FARB_LABELS[f] || { label: f, hex: '#ccc' };
        return `<span class="produkt__farbchip" style="background:${info.hex}" title="${info.label}"></span>`;
      }).join('')}</div>` : '';

  const beschreibungHTML = p.beschreibung
    ? `<p class="mietzelt-specs__beschreibung">${p.beschreibung}</p>` : '';

  const ausstattungHTML = p.ausstattung?.length
    ? `<ul class="produkt__liste mietzelt-specs__liste">${p.ausstattung.map(a => `<li>${a}</li>`).join('')}</ul>` : '';

  const zubehoerHTML = p.zubehoer?.length
    ? `<div class="produkt__zubehoer mietzelt-specs__zubehoer">
        <p class="produkt__zubehoer-titel">Optionales Zubehör</p>
        <table class="produkt__zubehoer-tabelle">
          ${p.zubehoer.map(z => `<tr>
            <td class="produkt__zubehoer-name">${z.bezeichnung}</td>
            <td class="produkt__zubehoer-preis">${z.preis_chf ? formatPreis(z.preis_chf) : 'auf Anfrage'}</td>
          </tr>`).join('')}
        </table>
      </div>` : '';

  return `<div class="mietzelt-specs__wrapper">${specsListHTML}${farbenHTML}${beschreibungHTML}${ausstattungHTML}${zubehoerHTML}</div>`;
}

/* --------------------------------------------------------------------------
   Haupt-Export: Dialog öffnen
   -------------------------------------------------------------------------- */
export function openMietzeltDetail(p) {
  const bilder = p.bilder || [];

  const verfuegbarBadge = p.verfuegbar
    ? `<span class="produkt__badge produkt__badge--ok">Verfügbar</span>`
    : `<span class="produkt__badge produkt__badge--nein">Vergeben</span>`;

  const preisHTML = p.preis_pro_tag
    ? `<span class="mietzelt-detail__preis">${formatPreis(p.preis_pro_tag)} <small>/ Tag</small></span>` : '';

  const hauptSrc = bilder.length ? sanityImageUrl(bilder[0], 1200) : null;

  const thumbsHTML = bilder.length > 1
    ? `<div class="projekt-detail__thumbnails">${bilder.map((b, i) => {
        const src = sanityImageUrl(b, 200);
        return src ? `<button class="projekt-detail__thumb${i === 0 ? ' is-active' : ''}" data-idx="${i}">
          <img src="${src}" alt="${p.name} ${i + 1}" loading="lazy" /></button>` : '';
      }).join('')}</div>` : '';

  const waText = encodeURIComponent(`Hallo Lutz Zelte, ich interessiere mich für das Mietzelt: ${p.name}`);

  const dlg = document.createElement('dialog');
  dlg.className = 'projekt-detail';
  dlg.innerHTML = `
    <button class="projekt-detail__close" aria-label="Schliessen">✕</button>
    <div class="projekt-detail__inner">
      <div class="projekt-detail__header">
        <h2 class="projekt-detail__title">${p.name}</h2>
        <div class="projekt-detail__meta">
          <span class="projekt-detail__kategorie">${verfuegbarBadge}</span>
          ${preisHTML}
        </div>
      </div>
      <div class="projekt-detail__main">
        ${hauptSrc
          ? `<img class="projekt-detail__main-img" src="${hauptSrc}" alt="${p.name}" />`
          : `<div class="mietzelt-detail__no-img">⛺</div>`}
      </div>
      ${thumbsHTML}
      ${specsHTML(p)}
      <a class="mietzelt-detail__wa-btn" href="https://wa.me/41787445329?text=${waText}"
         target="_blank" rel="noopener noreferrer">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.524 5.855L.057 23.215a.75.75 0 0 0 .921.921l5.36-1.467A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.693-.513-5.228-1.407l-.374-.222-3.878 1.061 1.061-3.878-.222-.374A9.953 9.953 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
        Jetzt anfragen auf WhatsApp
      </a>
    </div>`;

  /* --- Bild wechseln (Thumbnail, Tastatur, Swipe) --- */
  const mainImg = dlg.querySelector('.projekt-detail__main-img');
  const thumbs  = dlg.querySelectorAll('.projekt-detail__thumb');
  let aktiv = 0;   /* Index des aktuell sichtbaren Bildes */

  function wechsleBild(idx) {
    if (!bilder.length) return;
    aktiv = (idx + bilder.length) % bilder.length;   /* Wrap-around */
    const src = sanityImageUrl(bilder[aktiv], 1200);
    if (mainImg && src) mainImg.src = src;
    thumbs.forEach(b => b.classList.toggle('is-active', parseInt(b.dataset.idx) === aktiv));
    /* Aktives Thumb in Sicht scrollen */
    const aktThumb = dlg.querySelector(`.projekt-detail__thumb[data-idx="${aktiv}"]`);
    if (aktThumb) aktThumb.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  /* Thumbnail-Klick */
  thumbs.forEach(btn => btn.addEventListener('click', () => wechsleBild(parseInt(btn.dataset.idx))));

  /* Pfeiltasten (PC) — auf window, greift unabhängig von Fokus */
  const onKey = e => {
    if (!dlg.open) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); wechsleBild(aktiv + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); wechsleBild(aktiv - 1); }
  };
  window.addEventListener('keydown', onKey);

  /* Swipe (Mobile) */
  const mainEl = dlg.querySelector('.projekt-detail__main');
  let touchX = 0;
  mainEl?.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  mainEl?.addEventListener('touchend',   e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) wechsleBild(aktiv + (diff > 0 ? 1 : -1));
  }, { passive: true });

  /* Schliessen: X-Button, Backdrop-Klick, Escape */
  dlg.querySelector('.projekt-detail__close').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { window.removeEventListener('keydown', onKey); dlg.remove(); });

  document.body.appendChild(dlg);
  dlg.showModal();
  dlg.focus();  /* Fokus auf Dialog setzen damit Pfeiltasten sofort greifen */
}
