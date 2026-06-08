/* ==========================================================================
   gallery.js — Lutz Zelte GmbH
   Zweck: Projekt-Galerie aus Sanity laden.
   Modi:
     - Startseite (#gallery-grid): max. 3 Projekte als Teaser + «Alle»-Button
     - Galerie-Seite (#gallery-grid-alle): alle Projekte
   ========================================================================== */

const PROJECT_ID = '5ndwm7ob';
const DATASET    = 'production';
const API_URL    = `https://${PROJECT_ID}.apicdn.sanity.io/v2021-10-21/data/query/${DATASET}`;

const QUERY = encodeURIComponent(
  '*[_type == "projekt"] | order(reihenfolge asc) { name, datum, kategorie, bilder[] { asset, alt } }'
);

const KAT_LABELS = {
  event:         '🎉 Event',
  hochzeit:      '💍 Hochzeit',
  firmenprojekt: '🏢 Firmenprojekt',
  sonstiges:     '📦 Sonstiges',
};

/* --------------------------------------------------------------------------
   Sanity Bild-URL aus Asset-Referenz
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
   Datum formatieren: «2024-06-15» → «Juni 2024»
   -------------------------------------------------------------------------- */
function formatDatum(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  return d.toLocaleDateString('de-CH', { year: 'numeric', month: 'long' });
}

/* --------------------------------------------------------------------------
   Detail-Overlay — natives <dialog> mit Pfeiltasten + Swipe
   -------------------------------------------------------------------------- */
function createDetail() {
  const dialog = document.createElement('dialog');
  dialog.className = 'projekt-detail';
  dialog.setAttribute('aria-label', 'Projekt-Detailansicht');
  dialog.innerHTML = `
    <button class="projekt-detail__close" aria-label="Schliessen">✕</button>
    <div class="projekt-detail__inner">
      <header class="projekt-detail__header">
        <h3 class="projekt-detail__title"></h3>
        <div class="projekt-detail__meta">
          <span class="projekt-detail__datum"></span>
          <span class="projekt-detail__kategorie"></span>
        </div>
      </header>
      <div class="projekt-detail__main">
        <img class="projekt-detail__main-img" src="" alt="" />
      </div>
      <div class="projekt-detail__thumbnails" role="list"></div>
    </div>`;
  document.body.appendChild(dialog);

  const titleEl  = dialog.querySelector('.projekt-detail__title');
  const datumEl  = dialog.querySelector('.projekt-detail__datum');
  const katEl    = dialog.querySelector('.projekt-detail__kategorie');
  const mainImg  = dialog.querySelector('.projekt-detail__main-img');
  const thumbsEl = dialog.querySelector('.projekt-detail__thumbnails');
  const mainEl   = dialog.querySelector('.projekt-detail__main');

  let bilder = [];
  let aktiv  = 0;

  function setMain(idx) {
    aktiv = (idx + bilder.length) % bilder.length;
    mainImg.src = sanityImageUrl(bilder[aktiv], 1600);
    mainImg.alt = bilder[aktiv].alt || '';
    thumbsEl.querySelectorAll('.projekt-detail__thumb').forEach((t, i) => {
      t.classList.toggle('is-active', i === aktiv);
    });
    const aktThumb = thumbsEl.querySelector(`[data-idx="${aktiv}"]`);
    if (aktThumb) aktThumb.scrollIntoView({ inline: 'nearest', block: 'nearest' });
  }

  /* Pfeiltasten (PC) — auf window, greift unabhängig vom Fokus */
  window.addEventListener('keydown', e => {
    if (!dialog.open) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); setMain(aktiv + 1); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); setMain(aktiv - 1); }
  });

  /* Swipe (Mobile) */
  let touchX = 0;
  mainEl.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  mainEl.addEventListener('touchend', e => {
    const diff = touchX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setMain(aktiv + (diff > 0 ? 1 : -1));
  }, { passive: true });

  function open(p) {
    bilder = (p.bilder || []).filter(b => sanityImageUrl(b));
    aktiv  = 0;
    if (!bilder.length) return;

    titleEl.textContent = p.name;
    const datum = formatDatum(p.datum);
    datumEl.textContent = datum;
    datumEl.hidden      = !datum;
    const katLabel = KAT_LABELS[p.kategorie] || '';
    katEl.textContent = katLabel;
    katEl.hidden      = !katLabel;

    thumbsEl.innerHTML = bilder.map((b, i) => `
      <button class="projekt-detail__thumb" type="button" role="listitem"
              data-idx="${i}" aria-label="Bild ${i + 1}">
        <img src="${sanityImageUrl(b, 200)}" alt="${b.alt || p.name}" loading="lazy" />
      </button>`).join('');

    thumbsEl.querySelectorAll('.projekt-detail__thumb').forEach(btn => {
      btn.addEventListener('click', () => setMain(parseInt(btn.dataset.idx, 10)));
    });

    thumbsEl.hidden = bilder.length <= 1;
    setMain(0);
    dialog.showModal();
  }

  dialog.querySelector('.projekt-detail__close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  return { open };
}

/* --------------------------------------------------------------------------
   Grid rendern — 1 Karte pro Projekt
   -------------------------------------------------------------------------- */
function renderGrid(projekte, container, detail) {
  const sichtbare = projekte.filter(p => (p.bilder || []).some(b => sanityImageUrl(b)));

  if (!sichtbare.length) {
    container.innerHTML = '<p class="gallery__leer">Noch keine Projekte vorhanden.</p>';
    return;
  }

  container.innerHTML = sichtbare.map((p, i) => {
    const bilder   = (p.bilder || []).filter(b => sanityImageUrl(b));
    const cover    = sanityImageUrl(bilder[0], 800);
    const katLabel = KAT_LABELS[p.kategorie] || '';
    const anzahl   = bilder.length;
    const countBadge = anzahl > 1
      ? `<span class="gallery__count-badge">📷 ${anzahl} Fotos</span>` : '';
    return `
      <div class="gallery__item" role="listitem" data-idx="${i}" tabindex="0"
           aria-label="${p.name}${katLabel ? ' — ' + katLabel : ''}">
        <img src="${cover}" alt="${bilder[0].alt || p.name}" loading="lazy" />
        ${countBadge}
        <div class="gallery__caption">
          <span class="gallery__caption-name">${p.name}</span>
          ${katLabel ? `<span class="gallery__caption-kat">${katLabel}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  container.querySelectorAll('.gallery__item').forEach(el => {
    const p = sichtbare[parseInt(el.dataset.idx, 10)];
    const trigger = () => detail.open(p);
    el.addEventListener('click', trigger);
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
    });
  });
}

/* --------------------------------------------------------------------------
   Hauptfunktion
   -------------------------------------------------------------------------- */
export async function initGallery() {
  const teaserEl = document.getElementById('gallery-grid');
  const alleEl   = document.getElementById('gallery-grid-alle');
  if (!teaserEl && !alleEl) return;

  const detail = createDetail();

  let projekte;
  try {
    const res  = await fetch(`${API_URL}?query=${QUERY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    projekte   = json.result ?? [];
  } catch (err) {
    console.warn('Galerie konnte nicht geladen werden:', err);
    const el = teaserEl || alleEl;
    el.innerHTML = '<p class="gallery__leer">Galerie momentan nicht verfügbar.</p>';
    return;
  }

  if (teaserEl) {
    /* Teaser: max. 3 sichtbare Projekte auf der Startseite */
    const sichtbare = projekte.filter(p => (p.bilder || []).some(b => sanityImageUrl(b)));
    renderGrid(sichtbare.slice(0, 3), teaserEl, detail);
    if (sichtbare.length > 3) {
      const mehr = document.createElement('div');
      mehr.className = 'galerie__mehr';
      mehr.innerHTML = `<a class="btn btn--outline" href="galerie.html">Alle Projekte ansehen →</a>`;
      teaserEl.insertAdjacentElement('afterend', mehr);
    }
  }

  if (alleEl) {
    /* Vollansicht: alle Projekte auf galerie.html */
    renderGrid(projekte, alleEl, detail);
  }
}
