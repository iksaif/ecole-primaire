// Fiches d'exercices pré-générées (pages /telechargements/exercices-…) : pour chaque exercice et chaque classe,
// NB_VARIANTES fiches différentes. Le script de build ouvre la page de l'exercice en mode impression
// (?mode=imprimer), clique le bouton de niveau (`bouton`, expression régulière sur son texte), puis
// enregistre l'aperçu en PDF — c'est exactement la fiche que l'app produit. Fichier lu aussi par node : il
// n'importe que des données pures.
import { ACTIVITES } from '../data/activites.js'

export const NB_VARIANTES = 4

// bouton : niveau à choisir ; clics : réglages à activer en plus (texte des boutons, expressions régulières)
const C = (classe, bouton, clics = []) => ({ classe, bouton, clics })

const LISTE = [
  // ── Maths ──
  { id: 'calcul-mental', route: '/maths/calcul-mental', groupe: 'maths', titre: { fr: 'Calcul mental', br: 'Jediñ e penn' },
    classes: [
      C('cp', '^CP$', ['^Compléments à 10$|^Klokadurioù da 10$', '^Doubles$|^Doubloù$']),
      C('ce1', '^CE1$', ['^×$', '^Doubles$|^Doubloù$', '^Moitiés$|^Hanterioù$']),
      C('ce2', '^CE2$', ['^×$', '^÷$', '^Compléments à 100$|^Klokadurioù da 100$']),
      C('cm1', '^CM1$', ['^×$', '^÷$']),
      C('cm2', '^CM2$', ['^×$', '^÷$']),
    ] },
  { id: 'calcul-pose', route: '/maths/calcul-pose', groupe: 'maths', titre: { fr: 'Calcul posé', br: 'Jedadurioù lakaet' },
    classes: [C('cp', '^2'), C('ce1', '^3'), C('cm1', '^4')] },
  { id: 'nombres', route: '/maths/numeration', groupe: 'maths', titre: { fr: 'Les nombres', br: 'An niveroù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'problemes', route: '/maths/problemes', groupe: 'maths', titre: { fr: 'Problèmes', br: 'Kudennoù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'fractions', route: '/maths/fractions', groupe: 'maths', titre: { fr: 'Les fractions', br: 'An darnaouennoù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'heure', route: '/maths/heure', groupe: 'maths', titre: { fr: "Lire l'heure", br: 'Lenn an eur' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'monnaie', route: '/maths/monnaie', groupe: 'maths', titre: { fr: 'La monnaie', br: 'Ar moneiz' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'mesures', route: '/maths/mesures', groupe: 'maths', titre: { fr: 'Mesures', br: 'Muzulioù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'geometrie', route: '/maths/geometrie', groupe: 'maths', titre: { fr: 'Géométrie', br: 'Mentoniezh' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  // ── Français (contenu en français, consignes traduites) ──
  { id: 'dictee', route: '/francais/dictee', groupe: 'francais', titre: { fr: 'Dictée', br: 'Skrivadeg' },
    classes: [C('cp', '^CP$'), C('ce1', '^CE1$'), C('ce2', '^CE2$'), C('cm1-cm2', '^CM$')] },
  { id: 'grammaire', route: '/francais/grammaire', groupe: 'francais', titre: { fr: 'Grammaire', br: 'Yezhadur' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$'), C('cm1', '^CM1$'), C('cm2', '^CM2$')] },
  { id: 'conjugaison', route: '/francais/conjugaison', groupe: 'francais', titre: { fr: 'Conjugaison', br: 'Displegañ' },
    classes: [C('cp', '^CP$'), C('ce1', '^CE1$'), C('ce2', '^CE2$'), C('cm1', '^CM1$'), C('cm2', '^CM2$')] },
  { id: 'vocabulaire', route: '/francais/vocabulaire', groupe: 'francais', titre: { fr: 'Vocabulaire', br: 'Geriaoueg' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  { id: 'orthographe', route: '/francais/orthographe', groupe: 'francais', titre: { fr: 'Orthographe', br: 'Reizhskrivañ' },
    // cp-cm2 : tous les niveaux, homophones (fiche publiée avant les niveaux) ; puis une fiche « Accords » par niveau
    classes: [C('cp-cm2', '^CP → CM2$'), C('cp', '^CP$'), C('ce1', '^CE1$'), C('ce2', '^CE2$')] },
  // ── Maternelle ──
  { id: 'compter', route: '/maternelle/compter', groupe: 'maternelle', titre: { fr: 'Compter les objets', br: 'Kontañ an traoù' },
    classes: [C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'comparer', route: '/maternelle/comparer', groupe: 'maternelle', titre: { fr: 'Comparer les quantités', br: "Keñveriañ ar c'hementadoù" },
    classes: [C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'ranger', route: '/maternelle/ordonner', groupe: 'maternelle', titre: { fr: 'Ranger les nombres', br: 'Renkañ an niveroù' },
    classes: [C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'lettres', route: '/maternelle/lettres', groupe: 'maternelle', titre: { fr: 'Les lettres', br: 'Al lizherennoù' },
    classes: [C('gs-cp', null)] },
  { id: 'formes', route: '/maternelle/formes', groupe: 'maternelle', titre: { fr: 'Les formes', br: 'Ar stummoù' },
    classes: [C('ms-gs', null)] },
  // ── Culture générale ──
  { id: 'quiz', route: '/autres', groupe: 'autres', titre: { fr: 'Quiz culture générale', br: 'Quiz sevenadur hollek' },
    classes: [C('cp-cm2', null)] },
]

// domaine du programme : celui de l'activité de même route (activites.js) ; null hors programme (culture générale)
export const EXERCICES = LISTE.map(ex => ({ ...ex, genre: 'exercice', domaine: ACTIVITES.find(a => a.to === ex.route)?.domaine ?? null }))

// « ce1 » → ['ce1'] ; « cp-cm2 » → toutes les classes de CP à CM2
const ORDRE = ['ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2']
export function classesDe(code) {
  const [a, b] = code.split('-')
  if (!b) return [a]
  return ORDRE.slice(ORDRE.indexOf(a), ORDRE.indexOf(b) + 1)
}
export const etiquetteClasse = code => code.split('-').map(c => c.toUpperCase()).join(' → ')
