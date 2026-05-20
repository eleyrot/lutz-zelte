/* ==========================================================================
   sanity.config.js — Lutz Zelte GmbH
   Zweck: Sanity Studio Konfiguration.
   Studio-URL: https://lutz-zelte.sanity.studio
   ========================================================================== */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemas/index.js';

export default defineConfig({
  name:    'lutz-zelte',
  title:   'Lutz Zelte — Inhaltsverwaltung',

  projectId: '5ndwm7ob',
  dataset:   'production',

  plugins: [
    structureTool(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});
