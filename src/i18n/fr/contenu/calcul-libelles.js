// Libellés des réglages des fiches de calcul (types, options, tailles, affiches) — français.
// Ce sont des textes d'INTERFACE (boutons de la page « Fiches de calcul ») mais ils sont définis avec les
// types de calcul dans src/impression/calcul.js : `label` y est une clé de ce catalogue, que
// `libelle(cle, langue)` traduit. Un libellé sans clé ici (« 7 × 6 = … », « + 10 ») s'affiche tel quel.
// Clés partagées avec src/i18n/br/contenu/calcul-libelles.js (vérifier avec `npm run i18n`).
export default {
  lesDeux: 'Les deux',
  calcul: 'Calcul',
  calculs: 'Calculs',
  nombres: 'Nombres',
  jusqua_10: "jusqu'à 10", jusqua_20: "jusqu'à 20", jusqua_100: "jusqu'à 100", jusqua_1000: "jusqu'à 1 000", jusqua_10000: "jusqu'à 10 000",
  // ── types de calcul ──
  type_tables: '✖️ Tables de multiplication',
  type_tablesAdd: "➕ Tables d'addition",
  type_addition: '➕ Additions',
  type_soustraction: '➖ Soustractions',
  type_complements: '🎯 Compléments',
  type_doubles: '👯 Doubles et moitiés',
  type_division: '➗ Divisions et partages',
  type_suites: '🔢 Suites de nombres',
  // ── réglages des types ──
  tables: 'Tables',
  facteurManquant: 'Facteur manquant 7 × … = 42',
  ordre: 'Ordre',
  melangees: 'Mélangées',
  dansOrdre: "Dans l'ordre",
  resultats: 'Résultats',
  jusqua20_10plus10: "jusqu'à 20 (10 + 10)",
  termeManquant: 'Terme manquant 4 + … = 7',
  plage_100s: "jusqu'à 100 sans passage de dizaine",
  plage_100r: "jusqu'à 100 avec passage de dizaine",
  complements: 'Compléments',
  cible_10: 'à 10', cible_20: 'à 20',
  cible_dizaine: 'à la dizaine (37 + … = 40)',
  cible_100d: 'à 100 (dizaines : 30 + … = 100)',
  cible_100: 'à 100 (37 + … = 100)',
  cible_1000: 'à 1 000 (centaines)',
  doubles: 'Doubles', moities: 'Moitiés',
  doubles_10: "Doubles jusqu'à 10, moitiés jusqu'à 20",
  doubles_20: "Doubles jusqu'à 20, moitiés jusqu'à 40",
  doubles_ronds: 'Nombres ronds (15, 25, 30, 50…)',
  doubles_100: "Doubles jusqu'à 50, moitiés jusqu'à 100",
  division_combien: 'Combien de fois 6 dans 42 ?',
  division_partage: '42 partagé en 6',
  division_reste: '45 ÷ 6 = … reste …',
  // suites : « de 2 en 2 »…
  pas: 'De … en …',
  pas_2: '2 en 2', pas_5: '5 en 5', pas_10: '10 en 10', pas_25: '25 en 25', pas_50: '50 en 50', pas_100: '100 en 100',
  sens: 'Sens',
  croissant: 'En avançant', decroissant: 'À reculons',
  // ── mise en page et affiches ──
  taille_grande: 'Grande', taille_moyenne: 'Moyenne', taille_petite: 'Petite',
  affiche_multiplication: '✖️ Tables de multiplication',
  affiche_addition: "➕ Tables d'addition",
  disposition_toutes: 'Toutes les tables sur une page',
  disposition_une: 'Une table par page',
  disposition_grille: 'Tableau à double entrée (Pythagore)',
}
