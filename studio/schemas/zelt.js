/* ==========================================================================
   schemas/zelt.js — Lutz Zelte GmbH
   Zweck: Sanity-Schema für ein einzelnes Zelt.
   Kategorien: vermietung | neu | occasion
   ========================================================================== */

export default {
  name:  'zelt',
  title: 'Zelt',
  type:  'document',

  fields: [
    /* -----------------------------------------------------------------------
       Grundinfos
       ----------------------------------------------------------------------- */
    {
      name:        'name',
      title:       'Name des Zelts',
      type:        'string',
      description: 'z.B. «Partyzelt Classic 6×12» oder «ProfiLine Faltzelt 3×6»',
      validation:  Rule => Rule.required(),
    },
    {
      name:    'kategorie',
      title:   'Kategorie',
      type:    'string',
      options: {
        list: [
          { title: '🏕️ Vermietung (Mietzelt)', value: 'vermietung' },
          { title: '🆕 Verkauf — Neu',          value: 'neu'        },
          { title: '♻️ Verkauf — Occasion',     value: 'occasion'   },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    },
    {
      name:        'groesse_m',
      title:       'Grösse',
      type:        'string',
      description: 'z.B. «6 × 12 m»',
      validation:  Rule => Rule.required(),
    },
    {
      name:        'kapazitaet_personen',
      title:       'Kapazität (Personen)',
      type:        'number',
      description: 'Maximale Personenzahl — leer lassen wenn nicht relevant',
    },

    /* -----------------------------------------------------------------------
       Preise (je nach Kategorie ausfüllen)
       ----------------------------------------------------------------------- */
    {
      name:        'preis_pro_tag',
      title:       'Mietpreis pro Tag (CHF)',
      type:        'number',
      description: 'Nur für Vermietung ausfüllen',
    },
    {
      name:        'preis_chf',
      title:       'Kaufpreis (CHF)',
      type:        'number',
      description: 'Nur für Verkauf (Neu oder Occasion) ausfüllen',
    },

    /* -----------------------------------------------------------------------
       Beschreibung & Ausstattung
       ----------------------------------------------------------------------- */
    {
      name:  'beschreibung',
      title: 'Beschreibung',
      type:  'text',
      rows:  3,
    },
    {
      name:  'ausstattung',
      title: 'Ausstattung / Inklusive',
      type:  'array',
      of:    [{ type: 'string' }],
      description: 'z.B. «Aufbau inklusive», «Seitenteile inklusive»',
    },

    /* -----------------------------------------------------------------------
       Bilder
       ----------------------------------------------------------------------- */
    {
      name:    'bilder',
      title:   'Bilder',
      type:    'array',
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
    },

    /* -----------------------------------------------------------------------
       Status & Sortierung
       ----------------------------------------------------------------------- */
    {
      name:         'verfuegbar',
      title:        'Verfügbar',
      type:         'boolean',
      description:  'Ist dieses Zelt aktuell verfügbar / lagernd?',
      initialValue: true,
    },
    {
      name:        'reihenfolge',
      title:       'Reihenfolge',
      type:        'number',
      description: 'Kleinere Zahl = weiter oben angezeigt',
    },
  ],

  /* Vorschau im Studio: Name + erstes Bild */
  preview: {
    select: {
      title:    'name',
      subtitle: 'kategorie',
      media:    'bilder.0',
    },
    prepare({ title, subtitle, media }) {
      const labels = { vermietung: '🏕️ Vermietung', neu: '🆕 Neu', occasion: '♻️ Occasion' };
      return {
        title,
        subtitle: labels[subtitle] || subtitle,
        media,
      };
    },
  },
};
