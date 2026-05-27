/* ==========================================================================
   structure.js — Lutz Zelte GmbH
   Zweck: Custom Desk Structure — 5 Ordner im Sanity Studio.
   Hinweis: Templates (Serie 1/2, Occasion, Vermietung) sind in
            sanity.config.js definiert und über die globale «+»-Schaltfläche
            oben im Studio-Header erreichbar.
   ========================================================================== */

export const structure = (S) =>
  S.list()
    .title('Inhalt')
    .items([

      /* -----------------------------------------------------------------------
         Faltzelte — aufgeteilt nach Serie und Kategorie
         ----------------------------------------------------------------------- */
      S.listItem()
        .title('🏕️ Faltzelte Serie 1')
        .child(
          S.documentList()
            .title('Faltzelte Serie 1')
            .filter('_type == "zelt" && serie == "Serie 1"')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
        ),

      S.listItem()
        .title('🏕️ Faltzelte Serie 2')
        .child(
          S.documentList()
            .title('Faltzelte Serie 2')
            .filter('_type == "zelt" && serie == "Serie 2"')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
        ),

      S.listItem()
        .title('♻️ Occasionen')
        .child(
          S.documentList()
            .title('Occasion-Zelte')
            .filter('_type == "zelt" && kategorie == "occasion"')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
        ),

      S.listItem()
        .title('🔄 Vermietung')
        .child(
          S.documentList()
            .title('Mietzelte')
            .filter('_type == "zelt" && kategorie == "vermietung"')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
        ),

      S.divider(),

      /* -----------------------------------------------------------------------
         Projekte / Galerie
         ----------------------------------------------------------------------- */
      S.listItem()
        .title('📷 Projekte / Galerie')
        .child(
          S.documentList()
            .title('Projekte')
            .filter('_type == "projekt"')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
        ),

      S.divider(),

      /* Alle Zelte — Übersicht für den Admin */
      S.listItem()
        .title('📋 Alle Zelte (Übersicht)')
        .child(
          S.documentList()
            .title('Alle Zelte')
            .filter('_type == "zelt"')
            .defaultOrdering([{ field: 'reihenfolge', direction: 'asc' }])
        ),

    ]);
