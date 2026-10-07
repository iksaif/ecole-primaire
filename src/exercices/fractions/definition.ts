// Les fractions — définition : QUI peut faire quoi (modèle : ../exemple/definition.ts, qui commente chaque mécanisme).
// Programme (src/data/programme.ts), repris dans les compétences de chaque niveau :
//   CE1 : moitié, demi, quart, puis fractions de dénominateur 2, 3, 4, 5, 6, 8 ou 10, toujours ≤ 1 (c2maths p. 12) ;
//   CE2 : égalités de fractions ≤ 1, droite graduée en fractions d'unité (p. 20) ; dénominateur ≤ 12.
// Écart connu : au CE2 les dénominateurs 7, 9, 11 et 12 ne sont pas tirés (ils ne sont que la borne du programme : les tirer
// changerait les fiches publiées, un lot à part, voir docs/TODO.md) ; les fractions > 1, la comparaison à 1 et la fraction d'une
// quantité (tiers, quart) sont du CM1 : pas proposées.
// Les identifiants des types (« identifier »…) sont aussi les valeurs des réglages mémorisés des visiteurs (clé « fractions_config »).
import { definir, cases, choix, fichesPourClasses } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

const CE1 = ['identifier', 'colorier', 'lettres', 'partDe'] as const
const CE2 = [...CE1, 'egales', 'droite', 'placer'] as const

export default definir({
  id: 'fractions',
  route: '/maths/fractions',
  domaine: D.nombresCalcul,
  emoji: '🍕',
  niveauDefaut: 'ce1',
  competences: [K.fractionsUnitaires, K.fractionsInferieures1, K.fractionsEgales, K.fractionsMesure, K.doublesMoities],

  // réglages communs à tous les niveaux : nombre de questions à l'écran et sur la fiche
  reglages: {
    nbQ: choix([5, 10, 15, 20], { defaut: 10 }),
    nbFiche: choix([5, 10, 15, 20, 30], { defaut: 10 }),
  },

  // mode : 'unitaires' (1/2, 1/3…) ou 'toutes' (2/3, 3/4… aussi)
  niveaux: {
    ce1: { reglages: { types: cases(CE1), mode: choix(['unitaires', 'toutes'], { defaut: 'unitaires' }) } },
    ce2: { reglages: { types: cases(CE2), mode: choix(['unitaires', 'toutes'], { defaut: 'toutes' }) } },
  },

  // Fiches par compétence (adresses publiées : exercices-fractions-<niveau>-<fiche>)
  fiches: [
    ...fichesPourClasses('ce1-ce2', { id: 'unitaires', competence: K.fractionsUnitaires, reglages: { types: ['identifier', 'colorier', 'lettres'], mode: 'unitaires' } }),
    ...fichesPourClasses('ce1-ce2', { id: 'moitie', competence: K.doublesMoities, reglages: { types: ['partDe'] } }),
    { id: 'fractions-1', competence: K.fractionsInferieures1, niveau: 'ce2', reglages: { types: ['identifier', 'colorier', 'lettres'], mode: 'toutes' } },
    { id: 'egales', competence: K.fractionsEgales, niveau: 'ce2', reglages: { types: ['egales'] } },
    { id: 'droite', competence: K.fractionsMesure, niveau: 'ce2', reglages: { types: ['droite', 'placer'] } },
  ],
})
