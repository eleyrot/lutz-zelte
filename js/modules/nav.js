/* ==========================================================================
   nav.js — Lutz Zelte GmbH
   Zweck: Mobile Menü (Hamburger), Sticky-Header-Klasse, aktiven Link markieren.
   ========================================================================== */

export function initNav() {
  const header   = document.querySelector('.header');
  const toggle   = document.querySelector('.header__menu-toggle');
  const nav      = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  toggle?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  nav?.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav__link')) {
      nav.classList.remove('is-open');
      toggle?.setAttribute('aria-expanded', 'false');
    }
  });

  const sections = document.querySelectorAll('main section[id]');

  function highlightActiveLink() {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 100) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${current}`);
    });
  }

  window.addEventListener('scroll', () => {
    header?.classList.toggle('header--scrolled', window.scrollY > 10);
    highlightActiveLink();
  }, { passive: true });
}
