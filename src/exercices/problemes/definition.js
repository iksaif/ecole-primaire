// @ts-check
// Problèmes — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   problemes-additifs (parties-tout ; comparaison au CE1), problemes-multiplicatifs (CE2 : « fois plus »),
//   problemes-etapes (CE1 : deux étapes ; CE2 : deux ou trois étapes). Champ numérique : celui du niveau, jusqu'à 1 000
//   au CE1 et 10 000 au CE2 (numeration-10000) ; les produits restent dans les tables du niveau.
// plage : plus grand nombre des données ('petits' 20, 'moyens' 100, 'grands' 1 000, 'tresGrands' 10 000), voir PLAGES.

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'problemes',
  route: '/maths/problemes',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  reglages: { nbQ: 5 },
  options: { nbQ: [3, 5, 10, 15] },
  niveaux: {
    ce1: {
      competences: ['problemes-additifs', 'problemes-multiplicatifs', 'problemes-etapes'],
      options: {
        categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'deuxEtapes'],
        plage: ['petits', 'moyens', 'grands'],
      },
      reglages: { categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'deuxEtapes'], plage: 'moyens' },
    },
    ce2: {
      competences: ['problemes-additifs', 'problemes-multiplicatifs', 'problemes-etapes'],
      options: {
        categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'foisPlus', 'deuxEtapes'],
        plage: ['moyens', 'grands', 'tresGrands'],
      },
      reglages: { categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'foisPlus', 'deuxEtapes'], plage: 'moyens' },
    },
  },
  // fiches par compétence (le bilan d'une classe : réglages par défaut du niveau)
  fiches: ['ce1', 'ce2'].flatMap(niveau => [
    { id: 'additifs', competence: 'problemes-additifs', niveau, reglages: { categories: ['ajoutRetrait', 'comparaison', 'partiesTout'] } },
    { id: 'multiplicatifs', competence: 'problemes-multiplicatifs', niveau, reglages: { categories: ['multiplication', 'partage'] } },
    { id: 'etapes', competence: 'problemes-etapes', niveau, reglages: { categories: ['deuxEtapes'] } },
  ]),
}
