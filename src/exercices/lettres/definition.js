// @ts-check
// Les lettres — définition (format : src/exercices/README.md). Programme : src/data/programme.js
//   nom-lettres (PS à CP) : « À partir de 5 ans : connaître le nom des lettres de l'alphabet (capitale, scripte, cursive) »
//   (BO n° 41 p. 52) : toutes les lettres de l'alphabet, associer capitale et scripte, à la GS ; au CP, la compétence
//   continue (reconnaître et nommer les lettres) ; audit : plans/09, étape 2. Rien ne dépasse le programme de ces deux niveaux :
//   l'exercice n'existe pas en PS (lettres du prénom, capitales) ni en MS (lettres du prénom) ; il reste proposé en GS et CP.
//   Manquent (audit) : la cursive, le son des lettres (GS-CP), les confusions b/d, p/q.
// Contenu : l'alphabet de la langue de l'interface (breton : lizherenneg peurunvan, ch et c'h sont des lettres ; pas de c, q, x),
// lu dans le catalogue de contenu (`alphabet`, `voyelles` : src/i18n/<langue>/contenu/lettres.js).
// Exercice : « Reconnaître » (retrouver la lettre montrée) ou « Majuscule / minuscule » ; lettres : voyelles, consonnes ou toutes.

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'lettres',
  route: '/maternelle/lettres',
  domaine: 'lecture',
  contenu: 'interface',
  niveauDefaut: 'gs',
  reglages: { mode: 'reconnaitre', groupe: 'toutes' },
  options: { mode: ['reconnaitre', 'majuscule'], groupe: ['voyelles', 'consonnes', 'toutes'] },
  niveaux: {
    gs: { competences: ['nom-lettres'], reglages: {} },
    cp: { competences: ['nom-lettres'], reglages: {} },
  },
  // la fiche publiée (exercices-lettres-gs-cp) est le bilan : relier majuscules et minuscules
  fiches: [],
}
