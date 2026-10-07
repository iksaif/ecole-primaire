// Dictée — définition : QUI peut faire quoi (modèle : ../exemple-corpus/definition.ts, exercice de français à corpus).
// Programme (src/data/programme.ts : compétences dictee et orthographe-lexicale, du CP au CM2) ; audit : plans/09, étape 2.
// Mots et catégories : src/data/dicteeMots.js.
//   CP  : mots fréquents, déterminants, pronoms, « je mange » (le CP observe les formes verbales fréquentes et régulières) ;
//   CE1 : corpus thématiques, mots invariables, adjectifs ; CE2 : mots invariables, -tion, -eur, adverbes en -ment ;
//   CM1 et CM2 : vocabulaire des disciplines, connecteurs, mots savants (un seul corpus pour les deux classes).
// Tout ce qu'un niveau propose est au programme, et toutes ses catégories sont cochées par défaut.
// Mode « mots » (défaut : l'élève entend le mot) ou « phrases » (un mot dans une phrase) ; en mots seuls, les mots ambigus
// (homophones, graphies multiples valides) sont écartés.
// Phrases générées par Mistral : facultatif, seulement avec la clé que l'utilisateur saisit lui-même (mistral.ts, décision du 2026-10-06).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.
// Les valeurs des réglages (cats, mode, nb…) sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, cases, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'
import { NIVEAUX } from '../../data/dicteeMots.js'

/** Un corpus de src/data/dicteeMots.js : les mots par catégorie, et ceux qui sont ambigus sans phrase. */
export interface Corpus { categories: Record<string, string[]>, ambigus: Set<string> }

// CM1 et CM2 partagent le corpus « CM »
const CORPUS_DE: Readonly<Record<string, keyof typeof NIVEAUX>> = { cp: 'CP', ce1: 'CE1', ce2: 'CE2', cm1: 'CM', cm2: 'CM' }
/** Le corpus d'une classe. */
export const corpusDe = (niveau: Classe): Corpus => NIVEAUX[CORPUS_DE[niveau] ?? 'CP'] as Corpus

const categoriesDe = (niveau: Classe): string[] => Object.keys(corpusDe(niveau).categories)
const niveau = (n: Classe) => ({ reglages: { cats: cases(categoriesDe(n)), mode: choix(['mots', 'phrases'], { defaut: 'mots' }) } })

export default definir({
  id: 'dictee',
  route: '/francais/dictee',
  domaine: D.ecriture,
  autresDomaines: [D.vocabulaire],
  contenu: 'fr',
  emoji: '🖊️',
  niveauDefaut: 'cp',
  competences: [K.dictee, K.orthographeLexicale],

  // nb : 0 = tous les mots ; vitesse : de la voix ; liste, dictee : pages de la fiche (mots à apprendre, dictée)
  reglages: { nb: choix([5, 10, 15, 0], { defaut: 10 }), vitesse: 0.75 as number, liste: true as boolean, dictee: true as boolean },

  niveaux: { cp: niveau('cp'), ce1: niveau('ce1'), ce2: niveau('ce2'), cm1: niveau('cm1'), cm2: niveau('cm2') },

  fiches: [],
})
