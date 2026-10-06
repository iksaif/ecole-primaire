// @ts-check
// Dictée — définition (format : src/exercices/README.md). Programme : src/data/programme.js (compétences dictee et
// orthographe-lexicale, du CP au CM2) ; audit : plans/09, étape 2. Mots et catégories : src/data/dicteeMots.js.
//   CP  : mots fréquents, déterminants, pronoms, « je mange » (le CP observe les formes verbales fréquentes et régulières) ;
//   CE1 : corpus thématiques, mots invariables, adjectifs ; CE2 : mots invariables, -tion, -eur, adverbes en -ment ;
//   CM1 et CM2 : vocabulaire des disciplines, connecteurs, mots savants (un seul corpus pour les deux classes).
// Tout ce qu'un niveau propose est au programme, et toutes ses catégories sont cochées par défaut.
// Mode « mots » (défaut : l'élève entend le mot) ou « phrases » (un mot dans une phrase) ; en mots seuls, les mots ambigus
// (homophones, graphies multiples valides) sont écartés.
// Contenu toujours en français (exercice de français), même avec l'interface en breton.
import { NIVEAUX } from '../../data/dicteeMots.js'

/** Corpus d'un niveau (src/data/dicteeMots.js : CP, CE1, CE2, CM). */
const CORPUS = { cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM', cm2: 'CM' }
/** @param {string} niveau */
export const corpusDe = niveau => NIVEAUX[CORPUS[niveau] ?? CORPUS.cp]

const COMPETENCES = ['dictee', 'orthographe-lexicale']
const niveau = n => {
  const cats = Object.keys(corpusDe(n).categories)
  return { competences: COMPETENCES, options: { cats, mode: ['mots', 'phrases'] }, reglages: { cats: [...cats], mode: 'mots' } }
}

/** @type {import('../ancien.js').DefinitionExercice} */
export default {
  id: 'dictee',
  route: '/francais/dictee',
  domaine: 'ecriture',
  contenu: 'fr',
  niveauDefaut: 'cp',
  // nb : 0 = tous les mots ; vitesse : de la voix ; liste, dictee : pages de la fiche (mots à apprendre, dictée)
  reglages: { nb: 10, vitesse: 0.75, liste: true, dictee: true },
  options: { nb: [5, 10, 15, 0] },
  niveaux: { cp: niveau('cp'), ce1: niveau('ce1'), ce2: niveau('ce2'), cm1: niveau('cm1'), cm2: niveau('cm2') },
  fiches: [],
}
