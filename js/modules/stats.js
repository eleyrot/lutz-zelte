/* ==========================================================================
   stats.js — Lutz Zelte GmbH
   Zweck: Zahlen zählen von 0 auf den Zielwert hoch (2 Sekunden).
   Startet sobald die Sektion sichtbar wird (IntersectionObserver).
   Zahlen werden im Schweizer Format formatiert (6'270 statt 6270).
   ========================================================================== */

export function initStats() {
  const numbers = document.querySelectorAll('.stats__number');
  if (!numbers.length) return;

  const DURATION = 2000; // ms

  /* Schweizer Tausendertrennzeichen: 6270 → 6'270 */
  function formatCH(n) {
    return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '’');
  }

  function animateCount(el) {
    const target   = parseInt(el.dataset.target, 10);
    const prefix   = el.dataset.prefix  || '';
    const suffix   = el.dataset.suffix  || '';
    const start    = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3); /* cubic ease-out */
    }

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      const current  = easeOut(progress) * target;

      el.textContent = prefix + formatCH(current) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + formatCH(target) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  /* Startet Animation sobald Stats-Sektion im Viewport sichtbar wird */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          numbers.forEach(el => animateCount(el));
          observer.disconnect(); /* nur einmal abspielen */
        }
      });
    },
    { threshold: 0.3 }
  );

  const section = document.querySelector('.hero__stats');
  if (section) observer.observe(section);
}
