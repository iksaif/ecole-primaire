// Fiches d'exercices pré-générées (pages /telechargements/exercices-…) : pour chaque exercice et chaque classe,
// NB_VARIANTES fiches différentes. Le script de build ouvre la page de l'exercice en mode impression
// (?mode=imprimer), clique le bouton de niveau (`bouton`, expression régulière sur son texte), puis
// enregistre l'aperçu en PDF — c'est exactement la fiche que l'app produit. Fichier lu aussi par node : il
// n'importe que des données pures.
import { ACTIVITES } from '../data/activites.js'
import { classesEntre } from '../data/classes.js'
import CONJUGAISON from '../exercices/conjugaison/definition.js'
import GRAMMAIRE from '../exercices/grammaire/definition.js'
import CALCUL_POSE from '../exercices/calcul-pose/definition.js'

export const NB_VARIANTES = 4

// bouton : niveau à choisir ; clics : réglages à activer en plus (texte des boutons, expressions régulières)
const C = (classe, bouton, clics = []) => ({ classe, bouton, clics })

// Fiches par compétence (plan 09, étape 5) : pour une classe, on ne coche que les options `seul` et on décoche les
// autres options de `choix` (celles de l'exercice) ; `clics` règle le reste. Les options sont des expressions
// régulières sur le libellé français du bouton, éventuellement précédées de la section (« Retenue › Mélangé »). Le
// build les retrouve sur la page en français et réutilise leur position pour les consignes en breton.
// classes : classes concernées (toutes celles de l'exercice si absent) ; competence : id de src/data/programme.js, ou
// { classe: id } quand il dépend de la classe
export const NB_VARIANTES_COMPETENCE = 2
const F = (id, titre, competence, seul, o = {}) => ({ id, titre, competence, seul, ...o })
// classes qui ont la fiche `id` dans la définition d'un exercice
const classesFiche = (definition, id) => definition.fiches.filter(f => f.id === id).map(f => f.niveau)

const LISTE = [
  // ── Maths ──
  { id: 'calcul-pose', route: '/maths/calcul-pose', groupe: 'maths', titre: { fr: 'Calcul posé', br: 'Jedadurioù lakaet' },
    // classes et fiches : celles de la définition ; chaque niveau a la taille des nombres de son programme par défaut
    classes: Object.keys(CALCUL_POSE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    fiches: [
      F('addition', "l'addition posée", 'addition-posee', ['Opération › Addition'], { clics: ['Retenue › ^Mélangé$'], classes: classesFiche(CALCUL_POSE, 'addition') }),
      F('soustraction', 'la soustraction posée', 'soustraction-posee', ['Opération › Soustraction'], { clics: ['Retenue › ^Mélangé$'], classes: classesFiche(CALCUL_POSE, 'soustraction') }),
    ] },
  // ── Français (contenu en français, consignes traduites) ──
  { id: 'dictee', route: '/francais/dictee', groupe: 'francais', titre: { fr: 'Dictée', br: 'Skrivadeg' },
    // classes : celles de la définition (src/exercices/dictee/definition.js) ; CM1 et CM2 ont un même corpus : une seule
    // fiche publiée (exercices-dictee-cm1-cm2), faite au CM1
    classes: [...['cp', 'ce1', 'ce2'].map(n => C(n, `^${n.toUpperCase()}$`)), C('cm1-cm2', '^CM1$')] },
  { id: 'grammaire', route: '/francais/grammaire', groupe: 'francais', titre: { fr: 'Grammaire', br: 'Yezhadur' },
    // classes et fiches : celles de la définition (src/exercices/grammaire/definition.js)
    classes: Object.keys(GRAMMAIRE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Mots dans l', 'Phrase ou pas', 'Majuscule et point', 'Types de phrases', 'forme négative', 'Affirmative ou négative', 'Phrase simple',
      'Trouver le verbe', 'Trouver les noms', 'Trouver les déterminants', 'Trouver les adjectifs', "Nature d'un mot", 'Nom principal',
      'Trouver le sujet', 'Il, elle', 'complément de phrase', 'Où \\? Quand', 'Complément du verbe', 'Masculin', 'Singulier', 'Mettre au pluriel', "Accorder l'adjectif", 'Il chante'],
    fiches: [
      ['phrase', 'la phrase', ['Mots dans l', 'Phrase ou pas', 'Majuscule et point', 'Types de phrases', 'forme négative', 'Affirmative ou négative', 'Phrase simple']],
      ['nature', 'la nature des mots', ['Trouver les noms', 'Trouver les déterminants', 'Trouver les adjectifs', "Nature d'un mot", 'Nom principal']],
      ['sujet-verbe', 'le verbe et son sujet', ['Trouver le verbe', 'Trouver le sujet', 'Il, elle', 'Il chante']],
      ['accords', 'genre, nombre et accords', ['Masculin', 'Singulier', 'Mettre au pluriel', "Accorder l'adjectif"]],
      ['complements', 'les compléments', ['complément de phrase', 'Où \\? Quand', 'Complément du verbe']],
    ].map(([id, titre, seul]) => {
      const fiches = GRAMMAIRE.fiches.filter(f => f.id === id)
      return F(id, titre, fiches[0].competence, seul, { classes: fiches.map(f => f.niveau) })
    }) },
  { id: 'conjugaison', route: '/francais/conjugaison', groupe: 'francais', titre: { fr: 'Conjugaison', br: 'Displegañ' },
    // classes et fiches : celles de la définition (src/exercices/conjugaison/definition.js) ; par temps, avec les
    // verbes du niveau (décision de l'utilisateur) ; au CP, le présent seul : le bilan suffit
    classes: Object.keys(CONJUGAISON.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['^Présent$', '^Imparfait$', '^Futur$', '^Passé composé$', '^Passé simple$', '^Plus-que-parfait$'],
    fiches: [['present', 'le présent', '^Présent$'], ['imparfait', "l'imparfait", '^Imparfait$'], ['futur', 'le futur', '^Futur$'],
      ['passe-compose', 'le passé composé', '^Passé composé$'], ['passe-simple', 'le passé simple', '^Passé simple$'],
      ['plus-que-parfait', 'le plus-que-parfait', '^Plus-que-parfait$']]
      .map(([id, titre, re]) => {
        const fiches = CONJUGAISON.fiches.filter(f => f.id === id)
        return F(id, titre, fiches[0].competence, [re], { classes: fiches.map(f => f.niveau) })
      }) },
  // ── Culture générale ──
  { id: 'quiz', route: '/autres', groupe: 'autres', titre: { fr: 'Quiz culture générale', br: 'Quiz sevenadur hollek' },
    classes: [C('cp-cm2', null)] },
]

// domaine du programme : celui de l'activité de même route (activites.js) ; null hors programme (culture générale)
export const EXERCICES = LISTE.map(ex => ({ ...ex, genre: 'exercice', domaine: ACTIVITES.find(a => a.to === ex.route)?.domaine ?? null }))

// fiches par compétence d'une classe d'un exercice
export const fichesDe = (ex, classe) => (ex.fiches ?? []).filter(f => !f.classes || f.classes.includes(classe))
  .map(f => ({ ...f, competence: typeof f.competence === 'object' ? f.competence[classe] : f.competence }))

// « ce1 » → ['ce1'] ; « cp-cm2 » → toutes les classes de CP à CM2
export function classesDe(code) {
  const [a, b] = code.split('-')
  return b ? classesEntre(a, b) : [a]
}
export const etiquetteClasse = code => code.split('-').map(c => c.toUpperCase()).join(' → ')
