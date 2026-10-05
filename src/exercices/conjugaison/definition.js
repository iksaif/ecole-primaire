// @ts-check
// Conjugaison — définition (format : src/exercices/README.md). Programme : src/data/programme.js (CONTRAINTES.conjugaison)
//   CP  : être et avoir au présent (bo41 p. 92) ;
//   CE1 : + verbes du 1er groupe ; présent, imparfait, futur, passé composé (p. 93) ; radical et terminaison ;
//   CE2 : + les 8 verbes irréguliers : faire, aller, dire, venir, pouvoir, voir, vouloir, prendre (p. 94) ;
//   CM1 : + 2e groupe (c3francais p. 18) ; CM2 : + passé simple et plus-que-parfait (p. 19).
// Tout ce qu'un niveau propose est au programme, et tout est coché par défaut. Verbes et temps : src/data/conjugaison.js.
// Mode : « lacunes » (radical donné, l'élève écrit la terminaison) par défaut, sauf au CP : radical et terminaison sont
// une compétence du CE1 ; le CP écrit la forme entière (« complet »), « lacunes » y reste proposé en bonus
// (décision du 2026-10-05).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.

const ETRE_AVOIR = ['etre', 'avoir']
const PREMIER = ['chanter', 'jouer', 'parler', 'aimer']
const DEUXIEME = ['finir', 'grandir', 'choisir']
const IRREGULIERS = ['aller', 'faire', 'dire', 'venir', 'pouvoir', 'voir', 'vouloir', 'prendre']
const TEMPS_CYCLE = ['present', 'imparfait', 'futur', 'passe-compose']
const MODES = ['lacunes', 'complet']

// niveau où tout est coché : options = défauts
const niveau = (competences, verbes, temps, mode = 'lacunes') => ({
  competences,
  options: { verbes, temps, mode: MODES },
  reglages: { verbes: [...verbes], temps: [...temps], mode },
})
// compétences : dans l'ordre du catalogue (src/data/activites.js les lit ici) ; radical-terminaison : le mode « lacunes »
const C = [
  'conjugaison-present-etre-avoir', 'conjugaison-4-temps', 'conjugaison-irreguliers', 'conjugaison-2e-groupe', 'conjugaison-passe-simple',
]
const jusqua = (n, ...autres) => [...C.slice(0, n), ...autres]

/** @type {import('../index.js').DefinitionExercice} */
export default {
  id: 'conjugaison',
  route: '/francais/conjugaison',
  domaine: 'grammaire',
  contenu: 'fr',
  niveauDefaut: 'ce1',
  niveaux: {
    cp: { ...niveau(jusqua(1), ETRE_AVOIR, ['present'], 'complet'), bonus: { mode: ['lacunes'] } },
    ce1: niveau(jusqua(2, 'radical-terminaison'), [...ETRE_AVOIR, ...PREMIER], TEMPS_CYCLE),
    ce2: niveau(jusqua(3, 'radical-terminaison'), [...ETRE_AVOIR, ...PREMIER, ...IRREGULIERS], TEMPS_CYCLE),
    cm1: niveau(jusqua(4, 'radical-terminaison'), [...ETRE_AVOIR, ...PREMIER, ...DEUXIEME, ...IRREGULIERS], TEMPS_CYCLE),
    cm2: niveau(jusqua(5, 'radical-terminaison'), [...ETRE_AVOIR, ...PREMIER, ...DEUXIEME, ...IRREGULIERS], [...TEMPS_CYCLE, 'passe-simple', 'plus-que-parfait']),
  },
  // fiches par temps, avec tous les verbes du niveau (décision de l'utilisateur) ; au CP, le présent seul : le bilan
  // suffit. Mêmes fiches que src/impression/exercices.js, qui les produit encore en cliquant (appel direct : phase 4)
  fiches: [
    ...['ce1', 'ce2', 'cm1', 'cm2'].flatMap(niveau => TEMPS_CYCLE.map(temps => ({ id: temps, competence: 'conjugaison-4-temps', niveau, reglages: { temps: [temps] } }))),
    ...['passe-simple', 'plus-que-parfait'].map(temps => ({ id: temps, competence: 'conjugaison-passe-simple', niveau: 'cm2', reglages: { temps: [temps] } })),
  ],
}
