// La phrase (grammaire) — définition : QUI peut faire quoi. Un des cinq exercices de grammaire, un par compétence du programme
// (K.phrase) ; le moteur (types de questions, générateur, fiche) est commun : src/moteurs/grammaire/. Contenu toujours en français
// (exercice de français), même avec l'interface en breton. Les valeurs de `types` et la clé `nb` sont aussi celles des réglages mémorisés
// des visiteurs. Défaut : le premier type du niveau. Pas de bilan par classe : les fiches, une par compétence et niveau, couvrent les types.
import { definir, cases, choix, NB_LIBRE } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'
import type { Classe } from '../../data/classes.ts'
import { typesDe } from '../../moteurs/grammaire/types.ts'

const NIVEAUX = ['ce1', 'ce2', 'cm1', 'cm2'] as const satisfies readonly Classe[]
const niveau = (n: Classe) => ({ reglages: { types: cases(typesDe('phrase', n), { defaut: [typesDe('phrase', n)[0]] }) } })

export default definir({
  id: 'grammaire-phrase',
  route: '/francais/grammaire-phrase',
  domaine: D.grammaire,
  contenu: 'fr',
  emoji: '💬',
  niveauDefaut: 'ce1',
  competences: [K.phrase],
  bilanParClasse: false,

  reglages: { nb: choix([5, 10, 15], { defaut: 10, libre: NB_LIBRE }) },

  niveaux: { ce1: niveau('ce1'), ce2: niveau('ce2'), cm1: niveau('cm1'), cm2: niveau('cm2') },

  fiches: [
    { id: 'types-phrases', competence: K.phrase, niveau: 'ce1', reglages: { types: ['ponctuation', 'typePhrase'] } },
    ...NIVEAUX.map(n => ({ id: 'phrase', competence: K.phrase, niveau: n, reglages: { types: typesDe('phrase', n).filter(t => t !== 'typePhrase') } })),
  ],
})
