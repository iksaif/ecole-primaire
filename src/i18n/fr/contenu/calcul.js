// Textes des fiches et affiches de calcul (titres, consignes, en-tête) — français.
// Utilisé par src/impression/calcul.js avec la langue du document (config.langue).
// Clés partagées avec src/i18n/br/contenu/calcul.js (vérifier avec `npm run i18n`).
// « § » marque une case réponse dans un calcul.
export default {
  // « et » devant le dernier élément d'une liste de nombres (« Tables de 2, 3 et 4 »)
  etNombre: 'et',
  calculMental: 'Calcul mental',
  prenom: 'Prénom', date: 'Date', corrige: 'Corrigé',
  // titre d'une fiche sur une seule table / plusieurs tables ({l} : liste « 2, 3 et 4 »)
  table: 'Table de {t}',
  tables: 'Tables de {l}',
  tablesAdd: "Tables d'addition (résultats jusqu'à {m})",
  // plages de nombres, insérées dans « Additions {s} », « Soustractions {s} »
  plage_10: "jusqu'à 10", plage_20: "jusqu'à 20", plage_100s: "jusqu'à 100 (sans retenue)", plage_100r: "jusqu'à 100 (avec retenue)", plage_1000: "jusqu'à 1 000",
  additions: 'Additions {s}',
  soustractions: 'Soustractions {s}',
  complements: 'Compléments {s}',
  // cibles des compléments, insérées dans « Compléments {s} »
  cible_10: 'à 10', cible_20: 'à 20', cible_dizaine: 'à la dizaine', cible_100d: 'à 100', cible_100: 'à 100', cible_1000: 'à 1 000',
  doubles_doubles: 'Doubles', doubles_moities: 'Moitiés', doubles_les2: 'Doubles et moitiés',
  // calcul : « double de 7 = § »
  doubleDe: 'double de {n}',
  moitieDe: 'moitié de {n}',
  // titre : « Calculer + 10, − 10 et × 10 »
  calculer: 'Calculer {l}',
  neufOnze: 'Ajouter et retirer 9 et 11',
  divReste: 'Divisions avec reste', divisions: 'Divisions', combienTitre: 'Combien de fois ?',
  combien: 'Combien de fois {t} dans {n} ? §',
  partage: '{n} partagé en {t} → § chacun',
  reste: '{a} ÷ {t} = § reste §',
  suites: 'Suites de nombres',
  afficheMult: 'Les tables de multiplication',
  afficheAdd: "Les tables d'addition",
  // titre d'un bloc de l'affiche des tables
  tableAffiche: 'Table de {t}',
}
