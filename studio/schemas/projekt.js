/* ==========================================================================
   schemas/projekt.js — Lutz Zelte GmbH
   Zweck: Sanity-Schema für ein Galerie-Projekt (Referenz-Event).
   ========================================================================== */

export default {
  name:  'projekt',
  title: 'Projekt',
  type:  'document',

  fields: [
    {
      name:       'name',
      title:      'Projektname',
      type:       'string',
      description: 'z.B. «Hochzeit Müller» oder «Firmenanlass Bosch 2024»',
      validation:  Rule => Rule.required(),
    },
    {
      name:    'datum',
      title:   'Datum / Jahr',
      type:    'date',
      options: { dateFormat: 'YYYY-MM' },
      description: 'Monat und Jahr des Events',
    },
    {
      name:    'kategorie',
      title:   'Kategorie',
      type:    'string',
      options: {
        list: [
          { title: '🎉 Event',          value: 'event'         },
          { title: '💍 Hochzeit',       value: 'hochzeit'      },
          { title: '🏢 Firmenprojekt',  value: 'firmenprojekt' },
          { title: '📦 Sonstiges',      value: 'sonstiges'     },
        ],
        layout: 'radio',
      },
    },
    {
      name:  'bilder',
      title: 'Bilder',
      type:  'array',
      of: [
        {
          type:    'image',
          options: { hotspot: true },
          fields: [
            {
              name:  'alt',
              title: 'Bildbeschreibung (Alt-Text)',
              type:  'string',
            },
          ],
        },
      ],
      validation: Rule => Rule.min(1),
    },
    {
      name:        'reihenfolge',
      title:       'Reihenfolge',
      type:        'number',
      description: 'Kleinere Zahl = weiter oben in der Galerie',
    },
  ],

  preview: {
    select: {
      title:    'name',
      subtitle: 'kategorie',
      media:    'bilder.0',
    },
    prepare({ title, subtitle, media }) {
      const labels = {
        event:         '🎉 Event',
        hochzeit:      '💍 Hochzeit',
        firmenprojekt: '🏢 Firmenprojekt',
        sonstiges:     '📦 Sonstiges',
      };
      return {
        title,
        subtitle: labels[subtitle] || subtitle,
        media,
      };
    },
  },
};
