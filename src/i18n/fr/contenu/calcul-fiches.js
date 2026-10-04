// Fiches de calcul toutes prêtes (PDF générés au build, pages de téléchargement) — français.
// Pour chaque fiche (identifiant = slug de la version française) : titre court (liens), titre de la page
// et description (balise meta, référencement). Utilisé par TELECHARGEMENTS_CALCUL dans src/impression/calcul.js.
// Clés partagées avec src/i18n/br/contenu/calcul-fiches.js (vérifier avec `npm run i18n`).
export default {
  // fiche d'une seule table : {t} = la table, {produit} = t × 6 (exemple de facteur manquant)
  tableSeule_court: 'Table de {t}',
  tableSeule_titre: 'Fiche de calcul : la table de multiplication de {t}',
  tableSeule_description: 'Fiche gratuite à imprimer pour réviser la table de {t} : produits ({t} × 7, 7 × {t}) et facteurs manquants ({t} × … = {produit}), avec corrigé. Calcul mental CE1, CE2, CM1.',
  // fiche-tables-de-multiplication-2-a-5
  'fiche-tables-de-multiplication-2-a-5_court': 'Tables de 2 à 5 mélangées',
  'fiche-tables-de-multiplication-2-a-5_titre': 'Fiche de calcul : tables de multiplication de 2, 3, 4 et 5 mélangées',
  'fiche-tables-de-multiplication-2-a-5_description': 'Fiche de calcul mental à imprimer : 40 multiplications mélangées des tables de 2, 3, 4 et 5, avec facteurs manquants et corrigé. Idéal pour le CE1 et le CE2.',
  // fiche-tables-de-multiplication-6-a-9
  'fiche-tables-de-multiplication-6-a-9_court': 'Tables de 6 à 9 mélangées',
  'fiche-tables-de-multiplication-6-a-9_titre': 'Fiche de calcul : tables de multiplication de 6, 7, 8 et 9 mélangées',
  'fiche-tables-de-multiplication-6-a-9_description': 'Les tables les plus difficiles : 40 multiplications mélangées des tables de 6, 7, 8 et 9, avec facteurs manquants. Fiche gratuite avec corrigé, CE2, CM1, CM2.',
  // fiche-toutes-les-tables-de-multiplication
  'fiche-toutes-les-tables-de-multiplication_court': 'Toutes les tables (60 calculs)',
  'fiche-toutes-les-tables-de-multiplication_titre': 'Fiche de calcul : toutes les tables de multiplication (60 calculs)',
  'fiche-toutes-les-tables-de-multiplication_description': 'Grande révision des tables de multiplication de 2 à 10 : 60 multiplications mélangées sur une page, avec corrigé. Pour le CE2, le CM1 et le CM2.',
  // affiche-tables-de-multiplication-a4
  'affiche-tables-de-multiplication-a4_court': 'Affiche tables × (A4)',
  'affiche-tables-de-multiplication-a4_titre': 'Affiche des tables de multiplication de 1 à 10 (A4)',
  'affiche-tables-de-multiplication-a4_description': 'Affiche gratuite des tables de multiplication de 1 à 10 sur une page A4, en couleurs, à afficher ou coller dans le cahier. À imprimer en PDF.',
  // affiche-tables-de-multiplication-a3
  'affiche-tables-de-multiplication-a3_court': 'Affiche tables × (A3)',
  'affiche-tables-de-multiplication-a3_titre': 'Affiche des tables de multiplication pour la classe (A3)',
  'affiche-tables-de-multiplication-a3_description': 'Grande affiche A3 des tables de multiplication de 1 à 10 pour le mur de la classe, en couleurs. Gratuite à imprimer en PDF.',
  // affiches-une-table-de-multiplication-par-page
  'affiches-une-table-de-multiplication-par-page_court': 'Une table × par page',
  'affiches-une-table-de-multiplication-par-page_titre': 'Les tables de multiplication : une grande affiche par table',
  'affiches-une-table-de-multiplication-par-page_description': 'Dix affiches A4, une par table de multiplication (de 1 à 10), en gros caractères pour la classe ou la chambre. PDF gratuit.',
  // table-de-pythagore-multiplication
  'table-de-pythagore-multiplication_court': 'Table de Pythagore',
  'table-de-pythagore-multiplication_titre': 'Table de Pythagore : tableau des multiplications de 1 à 10',
  'table-de-pythagore-multiplication_description': 'Tableau à double entrée des multiplications de 1 × 1 à 10 × 10 (table de Pythagore), les carrés en couleur. Affiche gratuite à imprimer.',
  // affiche-tables-d-addition
  'affiche-tables-d-addition_court': "Affiche tables d'addition",
  'affiche-tables-d-addition_titre': "Affiche des tables d'addition de 1 à 10",
  'affiche-tables-d-addition_description': "Affiche gratuite des tables d'addition de 1 à 10 (de 1 + 1 à 10 + 10) en couleurs, pour apprendre les résultats par cœur au CP et au CE1.",
  // tableau-des-additions-0-a-10
  'tableau-des-additions-0-a-10_court': 'Tableau des additions',
  'tableau-des-additions-0-a-10_titre': 'Tableau à double entrée des additions de 0 à 10',
  'tableau-des-additions-0-a-10_description': 'Tableau des additions de 0 + 0 à 10 + 10, doubles en couleur : un outil mémo pour le CP et le CE1. Gratuit à imprimer.',
  // fiche-tables-d-addition-cp
  'fiche-tables-d-addition-cp_court': "Tables d'addition (≤ 10)",
  'fiche-tables-d-addition-cp_titre': "Fiche de calcul : tables d'addition, résultats jusqu'à 10",
  'fiche-tables-d-addition-cp_description': "30 additions des tables d'addition (résultats jusqu'à 10) et termes manquants, en gros chiffres, avec corrigé. Calcul mental CP.",
  // fiche-complements-a-10
  'fiche-complements-a-10_court': 'Compléments à 10',
  'fiche-complements-a-10_titre': 'Fiche de calcul : les compléments à 10',
  'fiche-complements-a-10_description': 'Fiche gratuite pour apprendre les compléments à 10 (7 + … = 10) : les « amoureux de 10 », en gros chiffres, avec corrigé. CP et CE1.',
  // fiche-complements-a-100
  'fiche-complements-a-100_court': 'Compléments à 100',
  'fiche-complements-a-100_titre': 'Fiche de calcul : les compléments à 100',
  'fiche-complements-a-100_description': 'Compléments à 100 avec des dizaines entières (30 + … = 100) puis des nombres quelconques (37 + … = 100) : fiche de calcul mental avec corrigé, CE1 et CE2.',
  // fiche-complements-dizaine-superieure
  'fiche-complements-dizaine-superieure_court': 'Compléments à la dizaine',
  'fiche-complements-dizaine-superieure_titre': 'Fiche de calcul : compléter à la dizaine supérieure',
  'fiche-complements-dizaine-superieure_description': 'Atteindre la dizaine supérieure (37 + … = 40) : la stratégie clé pour calculer avec passage de dizaine. Fiche à imprimer avec corrigé, CE1.',
  // fiche-doubles-et-moities-cp
  'fiche-doubles-et-moities-cp_court': 'Doubles et moitiés CP',
  'fiche-doubles-et-moities-cp_titre': 'Fiche de calcul : doubles et moitiés (CP)',
  'fiche-doubles-et-moities-cp_description': "Les doubles des nombres jusqu'à 10 et les moitiés des nombres pairs jusqu'à 20, comme demandé au CP. Fiche gratuite en gros chiffres avec corrigé.",
  // fiche-doubles-et-moities-ce1
  'fiche-doubles-et-moities-ce1_court': 'Doubles et moitiés CE1',
  'fiche-doubles-et-moities-ce1_titre': 'Fiche de calcul : doubles et moitiés (CE1)',
  'fiche-doubles-et-moities-ce1_description': "Doubles jusqu'à 20 et moitiés jusqu'à 40, puis nombres ronds (double de 25, moitié de 50, de 30…). Fiche de calcul mental CE1 avec corrigé.",
  // fiche-additions-jusqu-a-20
  'fiche-additions-jusqu-a-20_court': "Additions jusqu'à 20",
  'fiche-additions-jusqu-a-20_titre': "Fiche de calcul : additions jusqu'à 20",
  'fiche-additions-jusqu-a-20_description': '30 additions dont le résultat ne dépasse pas 20, en gros chiffres : fiche de calcul gratuite avec corrigé pour le CP et le CE1.',
  // fiche-additions-soustractions-ce1
  'fiche-additions-soustractions-ce1_court': 'Additions / soustractions CE1',
  'fiche-additions-soustractions-ce1_titre': "Fiche de calcul : additions et soustractions jusqu'à 100 (CE1)",
  'fiche-additions-soustractions-ce1_description': "Additions et soustractions jusqu'à 100 sans et avec passage de dizaine, mélangées. Fiche de calcul CE1 gratuite à imprimer, avec corrigé.",
  // fiche-ajouter-retirer-10
  'fiche-ajouter-retirer-10_court': '+ 10 / − 10',
  'fiche-ajouter-retirer-10_titre': 'Fiche de calcul : ajouter 10 et retirer 10',
  'fiche-ajouter-retirer-10_description': "Ajouter ou retirer 10 à un nombre jusqu'à 100 : fiche de calcul mental CP et CE1 pour comprendre les dizaines, avec corrigé.",
  // fiche-multiplier-par-10-et-100
  'fiche-multiplier-par-10-et-100_court': '× 10 et × 100',
  'fiche-multiplier-par-10-et-100_titre': 'Fiche de calcul : multiplier par 10 et par 100',
  'fiche-multiplier-par-10-et-100_description': 'Multiplier un nombre entier par 10 et par 100 : fiche de calcul mental CE2 et CM1, avec corrigé. Gratuite à imprimer.',
  // fiche-ajouter-retirer-9-11
  'fiche-ajouter-retirer-9-11_court': '+ 9 / − 9 / + 11 / − 11',
  'fiche-ajouter-retirer-9-11_titre': 'Fiche de calcul : ajouter et retirer 9 et 11',
  'fiche-ajouter-retirer-9-11_description': "La stratégie « + 10 − 1 » : ajouter et retirer 9 et 11 à des nombres jusqu'à 100. Fiche de calcul mental CE1, CE2 avec corrigé.",
  // fiche-divisions-combien-de-fois
  'fiche-divisions-combien-de-fois_court': 'Combien de fois ? (CE2)',
  'fiche-divisions-combien-de-fois_titre': 'Fiche de calcul : combien de fois ? (divisions CE2)',
  'fiche-divisions-combien-de-fois_description': 'Premières divisions au CE2 : « combien de fois 6 dans 42 ? » à partir des tables de multiplication. Fiche gratuite à imprimer avec corrigé.',
  // fiche-divisions-tables-cm1
  'fiche-divisions-tables-cm1_court': 'Divisions CM1',
  'fiche-divisions-tables-cm1_titre': 'Fiche de calcul : divisions avec le signe ÷ (CM1)',
  'fiche-divisions-tables-cm1_description': 'Divisions exactes dans les tables de multiplication (42 ÷ 6 = …) pour le CM1 et le CM2. Fiche de calcul mental à imprimer avec corrigé.',
  // fiche-suites-de-nombres
  'fiche-suites-de-nombres_court': 'Suites de nombres',
  'fiche-suites-de-nombres_titre': 'Fiche de calcul : compléter des suites de nombres',
  'fiche-suites-de-nombres_description': 'Compléter des suites de nombres de 2 en 2, de 5 en 5, de 10 en 10, en avançant et à reculons. Fiche gratuite CP et CE1 avec corrigé.',
  // fiche-calcul-mental-ce1
  'fiche-calcul-mental-ce1_court': 'Calcul mental CE1 (mélange)',
  'fiche-calcul-mental-ce1_titre': 'Fiche de calcul mental CE1 : révisions mélangées',
  'fiche-calcul-mental-ce1_description': 'Une fiche complète de calcul mental pour le CE1 : tables de 2 à 5, additions, soustractions, compléments et doubles mélangés, avec corrigé.',
}
