/* ==========================================================================
   gallery.js — Lutz Zelte GmbH
   Zweck: Galerie-Grid aus Sanity laden + Lightbox.
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
   Lightbox — natives <dialog>
   -------------------------------------------------------------------------- */
let lightboxImages = [];  /* { src, alt, caption } */
let lightboxIndex  = 0;

function createLightbox() {
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Bild-Vollansicht');
  dialog.innerHTML = `
    <button class="lightbox__close" aria-label="Schliessen">✕</button>
    <button class="lightbox__prev"  aria-label="Zurück">&#8249;</button>
    <div class="lightbox__stage">
      <img class="lightbox__img" src="" alt="" />
      <p  class="lightbox__caption"></p>
    </div>
    <button class="lightbox__next" aria-label="Weiter">&#8250;</button>`;
  document.body.appendChild(dialog);

  const img     = dialog.querySelector('.lightbox__img');
  const caption = dialog.querySelector('.lightbox__caption');

  function show(index) {
    lightboxIndex = (index + lightboxImages.length) % lightboxImages.length;
    const entry = lightboxImages[lightboxIndex];
    img.src         = entry.src;
    img.alt         = entry.alt || entry.caption;
    caption.textContent = entry.caption;

    /* Prev/Next nur anzeigen wenn mehr als 1 Bild */
    const multi = lightboxImages.length > 1;
    dialog.querySelector('.lightbox__prev').hidden = !multi;
    dialog.querySelector('.lightbox__next').hidden = !multi;
  }

  dialog.querySelector('.lightbox__close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lightbox__prev').addEventListener('click', () => show(lightboxIndex - 1));
  dialog.querySelector('.lightbox__next').addEventListener('click', () => show(lightboxIndex + 1));

  /* Klick ausserhalb Bild schliesst */
  dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });

  /* Tastatur: Pfeile + Escape */
  dialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  show(lightboxIndex - 1);
    if (e.key === 'ArrowRight') show(lightboxIndex + 1);
  });

  return { dialog, show };
}

/* --------------------------------------------------------------------------
   Grid rendern
   -------------------------------------------------------------------------- */
function renderGrid(projekte, container, lightbox) {
  /* Alle Bilder flach sammeln, mit Projekt-Kontext */
  lightboxImages = [];
  projekte.forEach(p => {
    (p.bilder || []).forEach(b => {
      const src = sanityImageUrl(b, 1200);
      if (src) lightboxImages.push({ src, alt: b.alt || p.name, caption: p.name });
    });
  });

  if (!lightboxImages.length) {
    container.innerHTML = '<p class="gallery__leer">Noch keine Projekte vorhanden.</p>';
    return;
  }

  let globalIndex = 0;
  const items = projekte.flatMap(p => {
    const katLabel = KAT_LABELS[p.kategorie] || p.kategorie || '';
    const bilder   = (p.bilder || []).filter(b => sanityImageUrl(b));

    return bilder.map(b => {
      const src   = sanityImageUrl(b, 800);
      const idx   = globalIndex++;
      return `
        <div class="gallery__item" role="listitem" data-index="${idx}" tabindex="0"
             aria-label="${p.name}${katLabel ? ' — ' + katLabel : ''}">
          <img src="${src}" alt="${b.alt || p.name}" loading="lazy" />
          <div class="gallery__caption">
            <span class="gallery__caption-name">${p.name}</span>
            ${katLabel ? `<span class="gallery__caption-kat">${katLabel}</span>` : ''}
          </div>
        </div>`;
    });
  });

  container.innerHTML = items.join('');

  /* Klick-Handler */
  container.querySelectorAll('.gallery__item').forEach(el => {
    const open = () => {
      lightbox.show(parseInt(el.dataset.index, 10));
      lightbox.dialog.showModal();
    };
    el.addEventListener('click', open);
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') open(); });
  });
}

/* --------------------------------------------------------------------------
   Hauptfunktion
   -------------------------------------------------------------------------- */
export async function initGallery() {
  const container = document.getElementById('gallery-grid');
  if (!container) return;

  const lightbox = createLightbox();

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

  renderGrid(projekte, container, lightbox);
}
