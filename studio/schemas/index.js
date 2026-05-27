/* ==========================================================================
   schemas/index.js — Lutz Zelte GmbH
   Zweck: Alle Sanity-Schemas zusammenführen.
   Neues Schema? Hier importieren und in schemaTypes eintragen.
   ========================================================================== */

import zelt    from './zelt.js';
import projekt from './projekt.js';

export const schemaTypes = [
  zelt,
  projekt,
];
