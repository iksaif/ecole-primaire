// @ts-check
// Plus long, plus court — définition (format : src/exercices/README.md). Programme : src/data/programme.js,
// « comparer-longueurs-maternelle » (BO n° 41 p. 69-70) : PS longueurs très différentes (rapport ≥ 2), ranger 3 objets ;
// MS écarts plus petits, 4 objets ; GS écarts fins, 5 objets. Les crayons partent tous du même bord.

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'longueurs',
  route: '/maternelle/longueurs',
  domaine: 'grandeurs-mesures',
  contenu: 'interface',
  niveauDefaut: 'ms',
  // mode : 'comparer' (le plus long / le plus court de deux crayons) ou 'ranger' (du plus court au plus long)
  reglages: { mode: 'comparer', nbQ: 6 },
  options: { mode: ['comparer', 'ranger'] },
  niveaux: {
    ps: { competences: ['comparer-longueurs-maternelle'], reglages: {} },
    ms: { competences: ['comparer-longueurs-maternelle'], reglages: {} },
    gs: { competences: ['comparer-longueurs-maternelle'], reglages: {} },
  },
  // aucune fiche par compétence : le bilan d'une classe (réglages par défaut) est la seule fiche publiée
  fiches: [],
}
