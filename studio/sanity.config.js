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
});
