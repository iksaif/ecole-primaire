// @ts-check
// Calcul posé — définition (format : src/exercices/README.md). Niveaux déduits de src/data/programme.js
// (operationsPosees, nombreMax) ; l'exercice n'en avait pas, il offrait 4 « tailles » de nombres :
//   CP  : additions posées, nombres ≤ 100 (c2maths p. 5) ; la soustraction posée n'est pas au programme (hors programme) ;
//   CE1 : additions et soustractions en colonnes, nombres ≤ 1 000 (p. 13) ;
//   CE2 : + − jusqu'à 10 000 (p. 21), et la multiplication d'un nombre par un nombre à 1 chiffre (le programme va
//         jusqu'à 2 chiffres : sous le programme) ;
//   CM1, CM2 : mêmes opérations, nombres jusqu'à 4 chiffres (le programme va jusqu'à 6 ; la division posée n'est pas
//         proposée : il faudrait un autre agencement, quotient et reste).
// taille : nombre de chiffres des nombres posés ('1' à '4', chaînes) ; retenue : 'non' | 'oui' | 'mix'.

const RETENUE = ['non', 'oui', 'mix']
const LIMITE_CP = 'La soustraction posée commence au CE1 (programme du cycle 2)'

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'calcul-pose',
  route: '/maths/calcul-pose',
  domaine: 'nombres-calcul',
  contenu: 'interface',
  niveauDefaut: 'ce1',
  // nbQ : exercices à l'écran ; nbFiche : exercices sur la fiche
  reglages: { nbQ: 5, nbFiche: 10 },
  options: { nbQ: [3, 5, 10, 20], nbFiche: [5, 10, 15, 20, 30] },
  niveaux: {
    cp: {
      competences: ['addition-posee'],
      options: { op: ['add', 'sou', 'mix'], taille: ['1', '2'], retenue: RETENUE },
      reglages: { op: 'add', taille: '2', retenue: 'non' },
      horsProgramme: [{ reglage: 'op', option: 'sou', raison: LIMITE_CP }, { reglage: 'op', option: 'mix', raison: LIMITE_CP }],
    },
    ce1: {
      competences: ['addition-posee', 'soustraction-posee'],
      options: { op: ['add', 'sou', 'mix'], taille: ['1', '2', '3'], retenue: RETENUE },
      reglages: { op: 'mix', taille: '3', retenue: 'mix' },
    },
    ce2: {
      competences: ['addition-posee', 'soustraction-posee', 'multiplication-posee'],
      options: { op: ['add', 'sou', 'mix', 'mul'], taille: ['2', '3', '4'], retenue: RETENUE },
      reglages: { op: 'mix', taille: '4', retenue: 'mix' },
    },
    cm1: {
      competences: ['addition-posee', 'soustraction-posee', 'multiplication-posee'],
      options: { op: ['add', 'sou', 'mix', 'mul'], taille: ['2', '3', '4'], retenue: RETENUE },
      reglages: { op: 'mix', taille: '4', retenue: 'mix' },
    },
    cm2: {
      competences: ['addition-posee', 'soustraction-posee', 'multiplication-posee'],
      options: { op: ['add', 'sou', 'mix', 'mul'], taille: ['2', '3', '4'], retenue: RETENUE },
      reglages: { op: 'mix', taille: '4', retenue: 'mix' },
    },
  },
  // fiches par compétence (la taille est celle du niveau) ; publiées avant : CP, CE1 et CM1 ; CE2 et CM2 s'ajoutent
  fiches: ['cp', 'ce1', 'ce2', 'cm1', 'cm2'].flatMap(niveau => [
    { id: 'addition', competence: 'addition-posee', niveau, reglages: { op: 'add', retenue: 'mix' } },
    ...(niveau === 'cp' ? [] : [{ id: 'soustraction', competence: 'soustraction-posee', niveau, reglages: { op: 'sou', retenue: 'mix' } }]),
  ]),
}
