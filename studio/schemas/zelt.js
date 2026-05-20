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
      description: 'z.B. «ProfiLine Faltzelt 3×3» oder «Faltzelt 6×6 (6-eckig)»',
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
      name:        'serie',
      title:       'Serie',
      type:        'string',
      description: 'z.B. «Serie 1» oder «Serie 2»',
      options: {
        list: ['Serie 1', 'Serie 2'],
      },
    },
    {
      name:        'groesse_m',
      title:       'Grösse (Anzeige-Text)',
      type:        'string',
      description: 'Anzeige auf Website, z.B. «3 × 3 m» — wird automatisch aus Breite/Länge generiert wenn leer',
    },
    {
      name:        'groesse_b_m',
      title:       'Breite (m)',
      type:        'number',
      description: 'Breite in Meter, z.B. 3',
    },
    {
      name:        'groesse_l_m',
      title:       'Länge (m)',
      type:        'number',
      description: 'Länge in Meter, z.B. 6',
    },
    {
      name:        'besonderheit',
      title:       'Besonderheit',
      type:        'string',
      description: 'z.B. «6-eckig» oder «Sonderform»',
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
      name:        'preis_gestell',
      title:       'Preis Gestell (CHF, exkl. MwSt.)',
      type:        'number',
      description: 'Gestell-Preis aus Preisliste, z.B. 400',
    },
    {
      name:        'preis_dach',
      title:       'Preis Dach (CHF, exkl. MwSt.)',
      type:        'number',
      description: 'Dach-Preis aus Preisliste, z.B. 200',
    },
    {
      name:        'preis_pro_tag',
      title:       'Mietpreis pro Tag (CHF)',
      type:        'number',
      description: 'Nur für Vermietung ausfüllen',
    },
    {
      name:        'preis_chf',
      title:       'Kaufpreis gesamt (CHF)',
      type:        'number',
      description: 'Gesamtpreis für Occasion — bei Neuware wird Gestell+Dach verwendet',
    },

    /* -----------------------------------------------------------------------
       Technische Daten
       ----------------------------------------------------------------------- */
    {
      name:        'gewicht_kg',
      title:       'Gewicht (kg)',
      type:        'number',
      description: 'Gesamtgewicht inkl. Gestell und Dach',
    },
    {
      name:        'hoehe_1_m',
      title:       'Höhe 1 — Seite unten (m)',
      type:        'number',
      description: 'Untere Seitenhöhe, z.B. 2.01',
    },
    {
      name:        'hoehe_2_m',
      title:       'Höhe 2 — Seite oben (m)',
      type:        'number',
      description: 'Obere Seitenhöhe, z.B. 2.29',
    },
    {
      name:        'hoehe_3_m',
      title:       'Höhe 3 — First / Spitze (m)',
      type:        'number',
      description: 'Höchster Punkt, z.B. 3.25',
    },
    {
      name:  'farben',
      title: 'Verfügbare Farben',
      type:  'array',
      of:    [{ type: 'string' }],
      options: {
        list: [
          { title: '⬜ Weiss',    value: 'weiss'   },
          { title: '🟦 Blau',    value: 'blau'    },
          { title: '🟥 Rot',     value: 'rot'     },
          { title: '🟨 Gelb',    value: 'gelb'    },
          { title: '🟩 Grün',    value: 'gruen'   },
          { title: '⬛ Schwarz', value: 'schwarz' },
        ],
        layout: 'grid',
      },
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
      description: 'z.B. «Seitenwand Standard», «Seitenwand mit Türe»',
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
      name:         'highlight',
      title:        'Auf Startseite anzeigen',
      type:         'boolean',
      description:  'Dieses Zelt als Highlight auf der Startseite zeigen (max. 3 empfohlen)',
      initialValue: false,
    },
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
