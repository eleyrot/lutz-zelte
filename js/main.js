/* ==========================================================================
   main.js — Lutz Zelte GmbH
   Zweck: Einstiegspunkt. Initialisiert alle JS-Module nach DOM-Laden.
   ========================================================================== */

import { initNav }     from './modules/nav.js';
import { initContact } from './modules/contact.js';
import { initStats }   from './modules/stats.js';

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initContact();
  initStats();
});
