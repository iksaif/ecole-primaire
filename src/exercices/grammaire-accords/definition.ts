// Genre, nombre et accords (grammaire) — définition : QUI peut faire quoi. Un des cinq exercices de grammaire, un par compétence du programme
// (K.accordsGn) ; le moteur (types de questions, générateur, fiche) est commun : src/moteurs/grammaire/. Contenu toujours en français
// (exercice de français), même avec l'interface en breton. Les valeurs de `types` et la clé `nb` sont aussi celles des réglages mémorisés
// des visiteurs. Défaut : le premier type du niveau. Pas de bilan par classe : les fiches, une par compétence et niveau, couvrent les types.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'
import { typesDe } from '../../moteurs/grammaire/types.ts'

const NIVEAUX = ['ce1', 'ce2', 'cm1', 'cm2'] as const satisfies readonly Classe[]
const niveau = (n: Classe) => ({ reglages: { types: cases(typesDe('accords', n), { defaut: [typesDe('accords', n)[0]] }) } })

export default definir({
  id: 'grammaire-accords',
  route: '/francais/grammaire-accords',
  domaine: D.grammaire,
  contenu: 'fr',
  emoji: '🤝',
  niveauDefaut: 'ce1',
  competences: [K.accordsGn],
  bilanParClasse: false,

  reglages: { nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: { ce1: niveau('ce1'), ce2: niveau('ce2'), cm1: niveau('cm1'), cm2: niveau('cm2') },

  fiches: NIVEAUX.map(n => ({ id: 'accords', competence: K.accordsGn, niveau: n, reglages: { types: typesDe('accords', n) } })),
})
