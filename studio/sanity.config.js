/* ==========================================================================
   sanity.config.js — Lutz Zelte GmbH
   Zweck: Sanity Studio Konfiguration.
   Studio-URL: https://eleyrot.github.io/lutz-zelte/admin
   ========================================================================== */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas/index.js';
import { structure } from './structure.js';

export default defineConfig({
  name:    'lutz-zelte',
  title:   'Lutz Zelte — Inhaltsverwaltung',

  projectId: '5ndwm7ob',
  dataset:   'production',

  basePath: '/lutz-zelte/admin',

  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },

  /* Vorausgefüllte Werte je nach Ordner-Kontext */
  templates: (prev) => [
    ...prev,
    {
      id:         'zelt-serie1',
      title:      'Faltzelt Serie 1',
      schemaType: 'zelt',
      value:      { serie: 'Serie 1', kategorie: 'neu' },
    },
    {
      id:         'zelt-serie2',
      title:      'Faltzelt Serie 2',
      schemaType: 'zelt',
      value:      { serie: 'Serie 2', kategorie: 'neu' },
    },
    {
      id:         'zelt-occasion',
      title:      'Occasion-Zelt',
      schemaType: 'zelt',
      value:      { kategorie: 'occasion' },
    },
    {
      id:         'zelt-vermietung',
      title:      'Mietzelt',
      schemaType: 'zelt',
      value:      { kategorie: 'vermietung' },
    },
  ],
});
