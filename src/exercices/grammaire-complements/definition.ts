// Les compléments (grammaire) — définition : QUI peut faire quoi. Un des cinq exercices de grammaire, un par compétence du programme
// (K.complements) ; le moteur (types de questions, générateur, fiche) est commun : src/moteurs/grammaire/. Contenu toujours en français
// (exercice de français), même avec l'interface en breton. Les valeurs de `types` et la clé `nb` sont aussi celles des réglages mémorisés
// des visiteurs. Défaut : le premier type du niveau. Pas de bilan par classe : les fiches, une par compétence et niveau, couvrent les types.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'
import { typesDe } from '../../moteurs/grammaire/types.ts'

const NIVEAUX = ['cm1', 'cm2'] as const satisfies readonly Classe[]
const niveau = (n: Classe) => ({ reglages: { types: cases(typesDe('complements', n), { defaut: [typesDe('complements', n)[0]] }) } })

export default definir({
  id: 'grammaire-complements',
  route: '/francais/grammaire-complements',
  domaine: D.grammaire,
  contenu: 'fr',
  emoji: '📍',
  niveauDefaut: 'cm1',
  competences: [K.complements],
  bilanParClasse: false,

  reglages: { nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: { cm1: niveau('cm1'), cm2: niveau('cm2') },

  fiches: NIVEAUX.map(n => ({ id: 'complements', competence: K.complements, niveau: n, reglages: { types: typesDe('complements', n) } })),
})
