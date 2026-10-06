// Calcul posé — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts, operationsPosees, nombreMax) ; l'exercice n'avait pas de niveau, il offrait 4 « tailles » de nombres :
//   CP  : additions posées, nombres ≤ 100 (c2maths p. 5) ; la soustraction posée n'est pas au programme (hors programme) ;
//   CE1 : additions et soustractions en colonnes, nombres ≤ 1 000 (p. 13) ;
//   CE2 : + − jusqu'à 10 000 (p. 21), et la multiplication d'un nombre par un nombre à 1 chiffre (le programme va
//         jusqu'à 2 chiffres : sous le programme) ;
//   CM1, CM2 : mêmes opérations, nombres jusqu'à 4 chiffres (le programme va jusqu'à 6). La DIVISION posée (K.divisionPosee, CM1 et
//         CM2) n'est pas proposée : elle demande un autre agencement (quotient, reste, étapes) ; cette compétence reste donc non
//         couverte par l'exercice (voir docs/TODO.md).
// Les valeurs des réglages (« add », « sou », « mul », « mix » ; la taille en chaîne « '1' » à « '4' » ; « non », « oui », « mix ») sont aussi
// celles des réglages mémorisés des visiteurs : elles ne changent pas (les libellés affichés sont dans l'interface).
//   taille : nombre de chiffres des nombres posés ; retenue : sans, avec, ou mélangée.
import { definir, choix, pourClasses, fichesPourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const RETENUE = choix(['non', 'oui', 'mix'], { defaut: 'mix' })
const LIMITE_CP = 'La soustraction posée commence au CE1 (programme du cycle 2)'
// CE2 → CM2 : les trois opérations
const cm = { reglages: { op: choix(['add', 'sou', 'mix', 'mul'], { defaut: 'mix' }), taille: choix(['2', '3', '4'], { defaut: '4' }), retenue: RETENUE } }

export default definir({
  id: 'calcul-pose',
  route: '/maths/calcul-pose',
  domaine: D.nombresCalcul,
  emoji: '📐',
  niveauDefaut: 'ce1',
  competences: [K.additionPosee, K.soustractionPosee, K.multiplicationPosee],

  // nbQ : exercices à l'écran ; nbFiche : exercices sur la fiche
  reglages: {
    nbQ: choix([3, 5, 10, 20], { defaut: 5 }),
    nbFiche: choix([5, 10, 15, 20, 30], { defaut: 10 }),
  },

  niveaux: {
    cp: {
      reglages: {
        op: choix(['add'], { horsProgramme: [{ option: 'sou', raison: LIMITE_CP }, { option: 'mix', raison: LIMITE_CP }] }),
        taille: choix(['1', '2'], { defaut: '2' }),
        retenue: choix(['non', 'oui', 'mix'], { defaut: 'non' }),
      },
    },
    ce1: { reglages: { op: choix(['add', 'sou', 'mix'], { defaut: 'mix' }), taille: choix(['1', '2', '3'], { defaut: '3' }), retenue: RETENUE } },
    ...pourClasses('ce2-cm2', cm),
  },

  // Fiches par compétence (la taille est celle du niveau). Publiées avant : addition (CP → CM2) et soustraction (CE1 → CM2) ;
  // la multiplication posée n'a pas de fiche publiée.
  fiches: [
    ...fichesPourClasses('cp-cm2', { id: 'addition', competence: K.additionPosee, reglages: { op: 'add', retenue: 'mix' } }),
    ...fichesPourClasses('ce1-cm2', { id: 'soustraction', competence: K.soustractionPosee, reglages: { op: 'sou', retenue: 'mix' } }),
  ],
})
