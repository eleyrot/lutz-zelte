/* ==========================================================================
   gallery.js — Lutz Zelte GmbH
   Zweck: Projekt-Galerie aus Sanity laden.
   Grid: 1 Karte pro Projekt (Cover-Bild + Name + Kategorie).
   Klick: öffnet Detail-Overlay mit grossem Hauptbild + Thumbnail-Strip.
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
   Detail-Overlay — natives <dialog>
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

  function open(p) {
    const bilder = (p.bilder || []).filter(b => sanityImageUrl(b));
    if (!bilder.length) return;

    titleEl.textContent = p.name;
    const datum = formatDatum(p.datum);
    datumEl.textContent = datum;
    datumEl.hidden      = !datum;
    const katLabel = KAT_LABELS[p.kategorie] || '';
    katEl.textContent = katLabel;
    katEl.hidden      = !katLabel;

    const setMain = (idx) => {
      const b = bilder[idx];
      mainImg.src = sanityImageUrl(b, 1600);
      mainImg.alt = b.alt || p.name;
      thumbsEl.querySelectorAll('.projekt-detail__thumb').forEach((t, i) => {
        t.classList.toggle('is-active', i === idx);
      });
    };

    thumbsEl.innerHTML = bilder.map((b, i) => `
      <button class="projekt-detail__thumb" type="button" role="listitem" data-idx="${i}" aria-label="Bild ${i + 1}">
        <img src="${sanityImageUrl(b, 200)}" alt="${b.alt || p.name}" loading="lazy" />
      </button>
    `).join('');

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
      ? `<span class="gallery__count-badge">📷 ${anzahl} Fotos</span>`
      : '';
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
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  const detail = createDetail();

  let projekte;
  try {
    const res  = await fetch(`${API_URL}?query=${QUERY}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    projekte   = json.result ?? [];
  } catch (err) {
    console.warn('Galerie konnte nicht geladen werden:', err);
    container.innerHTML = '<p class="gallery__leer">Galerie momentan nicht verfügbar.</p>';
    return;
  }

  renderGrid(projekte, container, detail);
}
