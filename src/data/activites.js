// Catalogue de toutes les activités : sert aux pages d'accueil/matières et au filtre par classe.
import { RESUMES, RESUMES_VISIBLES } from '../impression/affiches/catalogue.js'
import { CLASSES, classesEntre } from './classes.js'
// exercices au format « définition » (src/exercices/) : niveaux et compétences viennent de leur définition
import CONJUGAISON from '../exercices/conjugaison/definition.js'
import GRAMMAIRE from '../exercices/grammaire/definition.js'
import VOCABULAIRE from '../exercices/vocabulaire/definition.js'
import ORTHOGRAPHE from '../exercices/orthographe/definition.js'
import DICTEE from '../exercices/dictee/definition.js'
import LETTRES from '../exercices/lettres/definition.js'

// classes : src/data/classes.js (réexportées pour les vues qui les lisent avec le catalogue)
export { CLASSES }
const de = classesEntre

export const MATIERES = [
  { id: 'imprimer', titre: '🖨️ Fiches à imprimer', br: '🖨️ Fichennoù da voullañ' },
  { id: 'maths',    titre: '🔢 Mathématiques',     br: '🔢 Matematik' },
  { id: 'francais', titre: '📝 Français',          br: '📝 Galleg' },
  { id: 'autres',   titre: '🌍 Le monde',          br: '🌍 Ar bed' }, // br: à relire
]

// Rubriques des pages matières (`rubrique` d'une activité, titres de groupes) — breton à faire relire
export const DOMAINES_BR = {
  'Nombres et calcul': 'Niveroù ha jediñ',
  'Résoudre des problèmes': 'Diskoulmañ kudennoù',
  'Grandeurs et mesures': 'Mentoù ha muzulioù',
  'Espace et géométrie': 'Egor ha mentoniezh',
  'Lettres et sons': 'Lizherennoù ha sonioù',
  'Lecture': 'Lenn', // br: à relire
  'Orthographe': 'Reizhskrivañ',
  'Grammaire et conjugaison': 'Yezhadur ha displegañ',
  'Vocabulaire': 'Geriaoueg',
}

// `descRegionale` : description quand une langue régionale est active (sinon `desc`)
// `domaine` : id d'un domaine du programme (src/data/programme.js) ; il range les activités sur la page « À imprimer »
//   et dans le catalogue des téléchargements. Pas de domaine : hors programme (culture générale).
// `rubrique` regroupe les exercices dans les pages matières (titres plus fins que les domaines)
export const ACTIVITES = [
  // ── À imprimer ── (genre : 'affiche' pour apprendre, 'fiche' pour s'entraîner)
  { to: '/imprimer/ecriture', matiere: 'imprimer', domaine: 'ecriture', genre: 'fiche', icon: '✏️', titre: "Fiches d'écriture", desc: 'Script et attaché, majuscules et minuscules, sur lignes Seyès', niveaux: de('gs', 'ce2') },

  // Affiches du programme : une carte par famille, dans son domaine, seulement sur la page « À imprimer » (`detail`)
  { to: '/imprimer/affiches?affiche=conjugaison', matiere: 'imprimer', domaine: 'grammaire', genre: 'affiche', detail: true, icon: '✍️', titre: 'Affiches de conjugaison', desc: 'Être, avoir, 1er et 2e groupes, verbes irréguliers', niveaux: de('cp', 'cm2'),
    br: { titre: 'Skritelloù displegañ', desc: 'Bezañ, kaout, 1añ ha 2l strollad, verboù direizh' } }, // br: à relire

  // « Ce que je sais faire » : une carte par domaine du programme qui a des affiches résumé
  ...[...new Set(RESUMES_VISIBLES ? RESUMES.map(r => r.domaine) : [])].map(domaine => ({
    to: `/imprimer/affiches?affiche=resume&domaine=${domaine}`, matiere: 'imprimer', domaine, genre: 'affiche', detail: true, icon: '✅',
    titre: 'Ce que je sais faire', desc: 'Une case à cocher par compétence du programme, classe par classe',
    niveaux: RESUMES.filter(r => r.domaine === domaine).map(r => r.niveau),
    br: { titre: 'Ar pezh a ouzon ober', desc: 'Ur boest da groaziañ evit pep barregezh eus ar programm, klas dre glas' }, // br: à relire
  })),

  // ── Maths ──

  // ── Français ──
  { fiche: true, to: '/maternelle/lettres',   matiere: 'francais', domaine: 'lecture', rubrique: 'Lettres et sons', icon: '🔡', titre: 'Les lettres', desc: 'Reconnaître et associer majuscules et minuscules', niveaux: Object.keys(LETTRES.niveaux) },
  { fiche: true, to: '/lecture', matiere: 'francais', domaine: 'lecture', rubrique: 'Lecture', icon: '📖', titre: 'Lecture & Syllabes', desc: 'Syllabes, reconstitution de mots et textes interactifs', niveaux: de('cp', 'ce2') },
  { fiche: true, to: '/francais/dictee',      matiere: 'francais', domaine: 'ecriture', rubrique: 'Orthographe', icon: '🖊️', titre: 'Dictée', desc: 'Écoute et écris les mots — synthèse vocale', niveaux: Object.keys(DICTEE.niveaux) },
  { fiche: true, to: '/francais/orthographe', matiere: 'francais', domaine: 'vocabulaire', rubrique: 'Orthographe', icon: '🔤', titre: 'Orthographe', desc: 'Homophones, accords, lettres manquantes', niveaux: Object.keys(ORTHOGRAPHE.niveaux) },
  { fiche: true, to: '/francais/grammaire',   matiere: 'francais', domaine: 'grammaire', rubrique: 'Grammaire et conjugaison', icon: '🧱', titre: 'Grammaire', desc: 'Phrase, nature des mots, sujet, accords', niveaux: Object.keys(GRAMMAIRE.niveaux) },
  { fiche: true, to: '/francais/conjugaison', matiere: 'francais', domaine: 'grammaire', rubrique: 'Grammaire et conjugaison', icon: '✍️', titre: 'Conjugaison', desc: 'Conjugue les verbes aux bons temps', niveaux: Object.keys(CONJUGAISON.niveaux) },
  { fiche: true, to: '/francais/vocabulaire', matiere: 'francais', domaine: 'vocabulaire', rubrique: 'Vocabulaire', icon: '📚', titre: 'Vocabulaire', desc: 'Ordre alphabétique, contraires, familles de mots', niveaux: Object.keys(VOCABULAIRE.niveaux) },


  // ── Culture générale ──
  { fiche: true, to: '/autres', matiere: 'autres', icon: '🗺️', titre: 'Quiz culture générale', desc: 'Géographie, histoire, sciences, animaux', niveaux: de('cp', 'cm2') },
]

// Traductions bretonnes des activités [titre, description] — à faire relire par un brittophone
const BR = {
  '/imprimer/ecriture': ['Fichennoù skrivañ', 'Skript hag a-stag, pennlizherennoù ha lizherennoù bihan, war linennoù Seyès'],
  '/maternelle/compter':  ['Kontañ an traoù', 'Kont ha kav an niver mat'],
  '/maternelle/lettres':   ['Al lizherennoù', 'Anaout ha liammañ ar pennlizherennoù hag al lizherennoù bihan'],
  '/francais/dictee':      ['Skrivadeg', 'Selaou ha skriv ar gerioù (e galleg)'],
  '/francais/orthographe': ['Reizhskrivañ', 'Heñvelsonioù, kenglotadurioù, lizherennoù a vank (e galleg)'],
  '/francais/grammaire':   ['Yezhadur', 'Frazenn, natur ar gerioù, sujed, kenglotadurioù (e galleg)'],
  '/francais/conjugaison': ['Displegañ', 'Displeg ar verboù (e galleg)'],
  '/francais/vocabulaire': ['Geriaoueg', 'Urzh al lizherenneg, gerioù enep, familhoù gerioù (e galleg)'],
  '/lecture': ['Lenn ha silabennoù', 'Silabennoù, adsevel gerioù ha testennoù (e galleg)'],
  '/autres':  ['Quiz sevenadur hollek', 'Douaroniezh, istor, skiantoù, loened'],
}
// Compétences de src/data/programme.js travaillées par chaque exercice ou générateur (rapport de couverture :
// `npm run couverture`, page /programme), seulement aux niveaux de l'activité. Une liste vaut pour tous ses niveaux ;
// un objet { classe: [...] } dit ce que l'exercice propose vraiment à chaque classe (options du niveau). Les affiches
// ont les leurs dans leur catalogue. Test : une compétence n'est déclarée qu'aux classes où elle est au programme.
const COMPETENCES_ROUTES = {
  '/imprimer/ecriture': ['geste-ecriture-maternelle', 'cursive', 'copie'],
  '/maternelle/lettres': Object.fromEntries(Object.entries(LETTRES.niveaux).map(([n, v]) => [n, v.competences])),
  // au CP : + et −, compléments à 10, doubles et moitiés (± dizaines, ± 9 et passage de dizaine sont désactivés)
  '/francais/dictee': Object.fromEntries(Object.entries(DICTEE.niveaux).map(([n, v]) => [n, v.competences])),
  // accents et lettres à plusieurs sons : aucune question aujourd'hui
  '/francais/orthographe': Object.fromEntries(Object.entries(ORTHOGRAPHE.niveaux).map(([n, v]) => [n, v.competences])),
  '/francais/grammaire': Object.fromEntries(Object.entries(GRAMMAIRE.niveaux).map(([n, v]) => [n, v.competences])),
  '/francais/conjugaison': Object.fromEntries(Object.entries(CONJUGAISON.niveaux).map(([n, v]) => [n, v.competences])),
  '/francais/vocabulaire': Object.fromEntries(Object.entries(VOCABULAIRE.niveaux).map(([n, v]) => [n, v.competences])),
  // compréhension : le mode « Lecture de textes » n'a pas encore de questions
  '/lecture': ['decodage'],
}
for (const a of ACTIVITES) {
  const [chemin] = a.to.split('?')
  a.competences = COMPETENCES_ROUTES[chemin] ?? []
}

for (const a of ACTIVITES) {
  const cle = a.to.split('?')[0]
  if (!a.br && BR[cle]) a.br = { titre: BR[cle][0], desc: BR[cle][1], descRegionale: BR[cle][2] }
}

// « CE1 → CM2 », « MS / GS »…
export function etiquetteNiveaux(niveaux) {
  const lab = id => CLASSES.find(c => c.id === id)?.label ?? id
  if (niveaux.length === 1) return lab(niveaux[0])
  if (niveaux.length === 2) return `${lab(niveaux[0])} / ${lab(niveaux[1])}`
  return `${lab(niveaux[0])} → ${lab(niveaux.at(-1))}`
}
