// La nature des mots (grammaire) — définition : QUI peut faire quoi. Un des cinq exercices de grammaire, un par compétence du programme
// (K.classesMots) ; le moteur (types de questions, générateur, fiche) est commun : src/moteurs/grammaire/. Contenu toujours en français
// (exercice de français), même avec l'interface en breton. Les valeurs de `types` et la clé `nb` sont aussi celles des réglages mémorisés
// des visiteurs. Défaut : le premier type du niveau. Pas de bilan par classe : les fiches, une par compétence et niveau, couvrent les types.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'
import { typesDe } from '../../moteurs/grammaire/types.ts'

const niveau = (n: Classe) => ({ reglages: { types: cases(typesDe('mots', n), { defaut: [typesDe('mots', n)[0]] }) } })

export default definir({
  id: 'grammaire-mots',
  route: '/francais/grammaire-mots',
  domaine: D.grammaire,
  contenu: 'fr',
  emoji: '🏷️',
  niveauDefaut: 'ce1',
  competences: [K.classesMots],
  bilanParClasse: false,

  reglages: { nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: { ce1: niveau('ce1'), ce2: niveau('ce2'), cm1: niveau('cm1'), cm2: niveau('cm2') },

  fiches: [
    { id: 'nature', competence: K.classesMots, niveau: 'ce1', reglages: { types: ['nom', 'det', 'adj', 'nature'] } },
    { id: 'pronoms', competence: K.classesMots, niveau: 'ce1', reglages: { types: ['pronom', 'pronomPersonne'] } },
    ...(['ce2', 'cm1', 'cm2'] as const).map(n => ({ id: 'nature', competence: K.classesMots, niveau: n, reglages: { types: typesDe('mots', n) } })),
  ],
})
