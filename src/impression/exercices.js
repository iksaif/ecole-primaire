// Fiches d'exercices pré-générées (pages /telechargements/exercices-…) : pour chaque exercice et chaque classe,
// NB_VARIANTES fiches différentes. Le script de build ouvre la page de l'exercice en mode impression
// (?mode=imprimer), clique le bouton de niveau (`bouton`, expression régulière sur son texte), puis
// enregistre l'aperçu en PDF — c'est exactement la fiche que l'app produit. Fichier lu aussi par node : il
// n'importe que des données pures.
import { ACTIVITES } from '../data/activites.js'
import { classesEntre } from '../data/classes.js'
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
