// Catalogue de toutes les activités : sert aux pages d'accueil/matières et au filtre par classe.
import { RESUMES, RESUMES_VISIBLES } from '../impression/affiches/catalogue.js'
import { CLASSES, CE, CM, CYCLE_2, classesEntre } from './classes.js'

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
  { to: '/imprimer/alphabet', matiere: 'imprimer', domaine: 'lecture', genre: 'affiche', icon: '🔤', titre: "Affiche de l'alphabet", desc: 'Les 4 écritures, A4 ou A3', niveaux: de('ms', 'ce1') },
  { to: '/imprimer/calcul?mode=affiche', matiere: 'imprimer', domaine: 'nombres-calcul', genre: 'affiche', icon: '🧮', titre: 'Affiches des tables', desc: 'Tables de multiplication et d\'addition à afficher', niveaux: de('cp', 'cm2'),
    br: { titre: 'Skritelloù an taolennoù', desc: 'Taolennoù liesañ ha sammañ da stagañ' } }, // br: à relire
  { to: '/imprimer/calcul?mode=fiche', matiere: 'imprimer', domaine: 'nombres-calcul', genre: 'fiche', icon: '🧮', titre: 'Fiches de calcul', desc: 'Tables, compléments, doubles et moitiés… avec corrigé', niveaux: de('cp', 'cm2') },
  { to: '/imprimer/nombres?mise=affiches', matiere: 'imprimer', domaine: 'nombres-calcul', genre: 'affiche', icon: '🔢', titre: 'Nombres en lettres', desc: 'Unités, dizaines, centaines… en chiffres et en lettres', descRegionale: 'Unités, dizaines, centaines… en français et en breton', niveaux: de('gs', 'cm2') },

  // Affiches du programme : une carte par famille, dans son domaine, seulement sur la page « À imprimer » (`detail`)
  { to: '/imprimer/affiches?affiche=droite', matiere: 'imprimer', domaine: 'nombres-calcul', genre: 'affiche', detail: true, icon: '📏', titre: 'Droite numérique', desc: 'De 0 à 20, 100 ou 1 000, avec les nombres en lettres', niveaux: ['cp', 'ce1'],
    br: { titre: 'Linenn niverel', desc: 'Eus 0 da 20, 100 pe 1 000, gant an niveroù e lizherennoù' } }, // br: à relire
  { to: '/imprimer/affiches?affiche=numeration', matiere: 'imprimer', domaine: 'nombres-calcul', genre: 'affiche', detail: true, icon: '🔟', titre: 'Tableau de numération', desc: 'Unités, dizaines, centaines… et décimaux au CM', niveaux: ['ce1', 'cm1', 'cm2'],
    br: { titre: 'Taolenn niveriñ', desc: 'Unanennoù, degadoù, kantadoù… ha niveroù degedel er CM' } }, // br: à relire
  { to: '/imprimer/affiches?affiche=horloge', matiere: 'imprimer', domaine: 'grandeurs-mesures', genre: 'affiche', detail: true, icon: '🕐', titre: "L'horloge", desc: 'Heures entières, demies et quarts, minutes', niveaux: de('cp', 'ce2'),
    br: { titre: 'An horolaj', desc: 'Eurioù klok, hanterioù ha kardoù, munutennoù' } }, // br: à relire
  { to: '/imprimer/affiches?affiche=monnaie', matiere: 'imprimer', domaine: 'grandeurs-mesures', genre: 'affiche', detail: true, icon: '💶', titre: 'Pièces et billets', desc: "Les euros, puis les centimes", niveaux: de('cp', 'ce2'),
    br: { titre: 'Pezhioù ha bilhedoù', desc: 'An euroioù, ha goude ar santimoù' } }, // br: à relire
  { to: '/imprimer/affiches?affiche=formes', matiere: 'imprimer', domaine: 'espace-geometrie', genre: 'affiche', detail: true, icon: '🔷', titre: 'Figures et solides', desc: 'Formes planes, figures du cycle 3, solides', niveaux: de('gs', 'cm2'),
    br: { titre: 'Stummoù ha solidennoù', desc: 'Stummoù plaen, stummoù ar c\'helc\'hiad 3, solidennoù' } }, // br: à relire
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
  { fiche: true, to: '/maternelle/compter',  matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '🔢', titre: 'Compter les objets', desc: 'Compte et trouve le bon nombre', niveaux: ['ps', 'ms', 'gs'] },
  { fiche: true, to: '/maternelle/comparer', matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '⚖️', titre: 'Comparer les quantités', desc: 'Quel groupe a le plus ?', niveaux: ['ps', 'ms', 'gs'] },
  { fiche: true, to: '/maternelle/ordonner', matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '📶', titre: 'Ranger les nombres', desc: 'Du plus petit au plus grand', niveaux: ['ms', 'gs'] },
  { fiche: true, to: '/maths/numeration',    matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '💯', titre: 'Les nombres', desc: 'Jusqu\'à 1 000 (CE1) et 10 000 (CE2) : décomposer, comparer, ranger', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/calcul-mental', matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '🧮', titre: 'Calcul mental', desc: 'Additions, soustractions, doubles, moitiés, tables', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/maths/calcul-pose',   matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '📐', titre: 'Calcul posé', desc: 'Additions et soustractions en colonnes', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/maths/tables',        matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '✖️', titre: 'Tables de multiplication', desc: 'Entraîne-toi sur toutes les tables', niveaux: de('ce1', 'cm2') },
  { fiche: true, to: '/maths/fractions',     matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Nombres et calcul', icon: '🍕', titre: 'Les fractions', desc: 'Un demi, un tiers, un quart…', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/problemes',     matiere: 'maths', domaine: 'nombres-calcul', rubrique: 'Résoudre des problèmes', icon: '🧩', titre: 'Problèmes', desc: 'Lire, comprendre et calculer', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/heure',         matiere: 'maths', domaine: 'grandeurs-mesures', rubrique: 'Grandeurs et mesures', icon: '🕐', titre: "Lire l'heure", desc: 'Heures, demies, quarts sur une horloge', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/monnaie',       matiere: 'maths', domaine: 'grandeurs-mesures', rubrique: 'Grandeurs et mesures', icon: '💶', titre: 'La monnaie', desc: 'Compter et payer en euros', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/mesures',       matiere: 'maths', domaine: 'grandeurs-mesures', rubrique: 'Grandeurs et mesures', icon: '📏', titre: 'Mesures', desc: 'Longueurs, masses, contenances, calendrier', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maternelle/longueurs', matiere: 'maths', domaine: 'grandeurs-mesures', rubrique: 'Grandeurs et mesures', icon: '📏', titre: 'Plus long, plus court', desc: 'Comparer et ranger des crayons', niveaux: ['ps', 'ms', 'gs'] },
  { fiche: true, to: '/maternelle/motifs',   matiere: 'maths', domaine: 'motifs', rubrique: 'Motifs', icon: '🔁', titre: 'Les motifs', desc: 'Continuer un collier qui se répète', niveaux: ['ps', 'ms', 'gs'] },
  { fiche: true, to: '/maternelle/formes',   matiere: 'maths', domaine: 'espace-geometrie', rubrique: 'Espace et géométrie', icon: '🔷', titre: 'Les formes', desc: 'Trier, reconnaître puis nommer le disque, le carré, le triangle et le rectangle', niveaux: ['ps', 'ms', 'gs'] },
  { fiche: true, to: '/maths/geometrie',     matiere: 'maths', domaine: 'espace-geometrie', rubrique: 'Espace et géométrie', icon: '📐', titre: 'Géométrie', desc: 'Symétrie, quadrillage, figures et solides', niveaux: ['ce1', 'ce2'] },

  // ── Français ──
  { fiche: true, to: '/maternelle/lettres',   matiere: 'francais', domaine: 'lecture', rubrique: 'Lettres et sons', icon: '🔡', titre: 'Les lettres', desc: 'Reconnaître et associer majuscules et minuscules', niveaux: ['gs', 'cp'] },
  { fiche: true, to: '/lecture', matiere: 'francais', domaine: 'lecture', rubrique: 'Lecture', icon: '📖', titre: 'Lecture & Syllabes', desc: 'Syllabes, reconstitution de mots et textes interactifs', niveaux: de('cp', 'ce2') },
  { fiche: true, to: '/francais/dictee',      matiere: 'francais', domaine: 'ecriture', rubrique: 'Orthographe', icon: '🖊️', titre: 'Dictée', desc: 'Écoute et écris les mots — synthèse vocale', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/francais/orthographe', matiere: 'francais', domaine: 'vocabulaire', rubrique: 'Orthographe', icon: '🔤', titre: 'Orthographe', desc: 'Homophones, accords, lettres manquantes', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/francais/grammaire',   matiere: 'francais', domaine: 'grammaire', rubrique: 'Grammaire et conjugaison', icon: '🧱', titre: 'Grammaire', desc: 'Phrase, nature des mots, sujet, accords', niveaux: de('ce1', 'cm2') },
  { fiche: true, to: '/francais/conjugaison', matiere: 'francais', domaine: 'grammaire', rubrique: 'Grammaire et conjugaison', icon: '✍️', titre: 'Conjugaison', desc: 'Conjugue les verbes aux bons temps', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/francais/vocabulaire', matiere: 'francais', domaine: 'vocabulaire', rubrique: 'Vocabulaire', icon: '📚', titre: 'Vocabulaire', desc: 'Ordre alphabétique, contraires, familles de mots', niveaux: ['ce1', 'ce2'] },


  // ── Culture générale ──
  { fiche: true, to: '/autres', matiere: 'autres', icon: '🗺️', titre: 'Quiz culture générale', desc: 'Géographie, histoire, sciences, animaux', niveaux: de('cp', 'cm2') },
]

// Traductions bretonnes des activités [titre, description] — à faire relire par un brittophone
const BR = {
  '/imprimer/ecriture': ['Fichennoù skrivañ', 'Skript hag a-stag, pennlizherennoù ha lizherennoù bihan, war linennoù Seyès'],
  '/imprimer/alphabet': ['Skritell al lizherenneg', 'Ar 4 doare skrivañ, A4 pe A3'],
  '/imprimer/calcul':   ['Fichennoù jediñ', 'Taolennoù, klokaat, doubl hag hanter… gant ar reizhadenn'],
  '/imprimer/nombres':  ['An niveroù e lizherennoù', 'Unanennoù, degadoù, kantadoù… e sifroù hag e lizherennoù', 'Unanennoù, degadoù, kantadoù… e galleg hag e brezhoneg'],
  '/maternelle/compter':  ['Kontañ an traoù', 'Kont ha kav an niver mat'],
  '/maternelle/comparer': ["Keñveriañ ar c'hementadoù", 'Peseurt strollad en deus ar muiañ ?'],
  '/maternelle/ordonner': ['Renkañ an niveroù', "Eus ar bihanañ d'ar brasañ"],
  '/maths/numeration':    ['An niveroù', 'Betek 1 000 (CE1) ha 10 000 (CE2) : dispartiañ, keñveriañ, renkañ'],
  '/maths/calcul-mental': ['Jediñ e penn', 'Sammadennoù, lamadennoù, doubl, hanter, taolennoù'],
  '/maths/calcul-pose':   ['Jedadurioù lakaet', 'Sammadennoù ha lamadennoù e bannoù'],
  '/maths/tables':        ['Taolennoù liesañ', 'En em bleustr war an holl daolennoù'],
  '/maths/fractions':     ['An darnaouennoù', "An hanter, an trederenn, ar c'hard…"],
  '/maths/problemes':     ['Kudennoù', 'Lenn, kompren ha jediñ'],
  '/maths/heure':         ['Lenn an eur', 'Eurioù, hanterioù ha kardoù war un horolaj'],
  '/maths/monnaie':       ['Ar moneiz', 'Kontañ ha paeañ gant euroioù'],
  '/maths/mesures':       ['Muzulioù', "Hirderioù, pouezioù, endalc'hioù, deiziadur"],
  '/maternelle/longueurs': ['Hiroc’h, berroc’h', 'Keñveriañ ha renkañ kreionoù'], // br: à relire
  '/maternelle/motifs':   ['Ar patromoù', "Kenderc'hel ur c'holier a en em adlavar"], // br: à relire
  '/maternelle/formes':   ['Ar stummoù', "Rummañ, anavezout hag envel ar bladenn, ar c'harrez, an tric'horn hag an hirgarrez"], // br: à relire
  '/maths/geometrie':     ['Mentoniezh', 'Kemparzhded, karrezennoù, stummoù ha solidennoù'],
  '/maternelle/lettres':   ['Al lizherennoù', 'Anaout ha liammañ ar pennlizherennoù hag al lizherennoù bihan'],
  '/francais/dictee':      ['Skrivadeg', 'Selaou ha skriv ar gerioù (e galleg)'],
  '/francais/orthographe': ['Reizhskrivañ', 'Heñvelsonioù, kenglotadurioù, lizherennoù a vank (e galleg)'],
  '/francais/grammaire':   ['Yezhadur', 'Frazenn, natur ar gerioù, sujed, kenglotadurioù (e galleg)'],
  '/francais/conjugaison': ['Displegañ', 'Displeg ar verboù (e galleg)'],
  '/francais/vocabulaire': ['Geriaoueg', 'Urzh al lizherenneg, gerioù enep, familhoù gerioù (e galleg)'],
  '/lecture': ['Lenn ha silabennoù', 'Silabennoù, adsevel gerioù ha testennoù (e galleg)'],
  '/autres':  ['Quiz sevenadur hollek', 'Douaroniezh, istor, skiantoù, loened'],
}
// (les deux cartes de /imprimer/calcul n'ont pas le même sens : seule la carte « fiches » reprend la traduction)
// Compétences de src/data/programme.js travaillées par chaque exercice ou générateur (rapport de couverture :
// `npm run couverture`, page /programme), seulement aux niveaux de l'activité. Une liste vaut pour tous ses niveaux ;
// un objet { classe: [...] } dit ce que l'exercice propose vraiment à chaque classe (options du niveau). Les affiches
// ont les leurs dans leur catalogue. Test : une compétence n'est déclarée qu'aux classes où elle est au programme.
const parClasse = (classes, liste) => Object.fromEntries(classes.map(c => [c, liste]))
const COMPETENCES_ROUTES = {
  '/imprimer/ecriture': ['geste-ecriture-maternelle', 'cursive', 'copie'],
  '/imprimer/alphabet': ['nom-lettres'],
  '/imprimer/nombres': ['nombres-en-lettres', 'numeration-100', 'numeration-1000'],
  '/maternelle/compter': { ps: ['denombrer-3'], ms: ['denombrer-6'], gs: ['denombrer-10'] },
  '/maternelle/comparer': ['comparer-quantites'],
  '/maternelle/ordonner': ['bande-numerique'],
  '/maternelle/formes': ['formes-maternelle'],
  '/maternelle/motifs': ['motifs-maternelle'],
  '/maternelle/longueurs': ['comparer-longueurs-maternelle'],
  '/maternelle/lettres': ['nom-lettres'],
  '/maths/numeration': {
    ce1: ['numeration-1000', 'nombres-en-lettres', 'comparer-ranger', 'droite-graduee', 'suites-nombres'],
    ce2: ['numeration-10000', 'nombres-en-lettres', 'comparer-ranger', 'droite-graduee', 'suites-nombres'],
  },
  // au CP : + et −, compléments à 10, doubles et moitiés (± dizaines, ± 9 et passage de dizaine sont désactivés)
  '/maths/calcul-mental': {
    cp: ['tables-addition', 'complement-dizaine', 'doubles-moities'],
    ce1: ['tables-addition', 'tables-multiplication', 'complement-dizaine', 'ajouter-dizaines', 'ajouter-9', 'doubles-moities', 'multiplier-10-100'],
    ce2: ['tables-addition', 'tables-multiplication', 'sens-division', 'complement-dizaine', 'ajouter-dizaines', 'ajouter-9', 'doubles-moities', 'multiplier-10-100'],
    ...parClasse(CM, ['tables-multiplication', 'sens-division', 'complement-dizaine', 'ajouter-dizaines', 'ajouter-9', 'doubles-moities', 'multiplier-10-100']),
  },
  '/maths/calcul-pose': { cp: ['addition-posee'], ...parClasse(classesEntre('ce1', 'cm2'), ['addition-posee', 'soustraction-posee']) },
  '/maths/tables': ['tables-multiplication'],
  '/maths/fractions': { ce1: ['fractions-unitaires', 'fractions-inferieures-1'], ce2: ['fractions-unitaires', 'fractions-inferieures-1', 'fractions-egales', 'fractions-mesure'] },
  '/maths/problemes': ['problemes-additifs', 'problemes-multiplicatifs', 'problemes-etapes'],
  '/maths/heure': { ce1: ['heure-entiere', 'heure-demi-quart', 'durees'], ce2: ['heure-entiere', 'heure-demi-quart', 'heure-minutes', 'durees'] },
  '/maths/monnaie': parClasse(CE, ['monnaie-euros', 'monnaie-centimes']),
  '/maths/mesures': { ce1: ['longueurs', 'masses'], ce2: ['longueurs', 'masses', 'contenances'] },
  '/maths/geometrie': {
    ce1: ['figures-planes', 'solides', 'tracer-figures', 'reperage-deplacements'],
    ce2: ['figures-planes', 'solides', 'tracer-figures', 'reperage-deplacements', 'symetrie', 'angle-droit', 'patrons'],
  },
  '/francais/dictee': ['dictee', 'orthographe-lexicale'],
  // accents et lettres à plusieurs sons : aucune question aujourd'hui
  '/francais/orthographe': { ...parClasse(CYCLE_2, ['orthographe-lexicale', 'accords-gn']), ...parClasse(CM, ['accords-gn']) },
  '/francais/grammaire': { ...parClasse(CE, ['phrase', 'classes-mots', 'sujet-verbe', 'accords-gn']), ...parClasse(CM, ['phrase', 'classes-mots', 'sujet-verbe', 'accords-gn', 'complements']) },
  '/francais/conjugaison': {
    cp: ['conjugaison-present-etre-avoir'],
    ce1: ['conjugaison-present-etre-avoir', 'conjugaison-4-temps', 'radical-terminaison'],
    ce2: ['conjugaison-present-etre-avoir', 'conjugaison-4-temps', 'conjugaison-irreguliers', 'radical-terminaison'],
    cm1: ['conjugaison-present-etre-avoir', 'conjugaison-4-temps', 'conjugaison-irreguliers', 'conjugaison-2e-groupe', 'radical-terminaison'],
    cm2: ['conjugaison-present-etre-avoir', 'conjugaison-4-temps', 'conjugaison-irreguliers', 'conjugaison-2e-groupe', 'conjugaison-passe-simple', 'radical-terminaison'],
  },
  '/francais/vocabulaire': ['ordre-alphabetique', 'synonymes-antonymes', 'familles-mots'],
  // compréhension : le mode « Lecture de textes » n'a pas encore de questions
  '/lecture': ['decodage'],
}
const COMPETENCES_CALCUL = { affiche: ['tables-addition', 'tables-multiplication'], fiche: ['tables-addition', 'tables-multiplication', 'complement-dizaine', 'doubles-moities', 'ajouter-dizaines', 'ajouter-9', 'multiplier-10-100', 'sens-division', 'suites-nombres'] }
for (const a of ACTIVITES) {
  const [chemin, requete] = a.to.split('?')
  a.competences = chemin === '/imprimer/calcul' ? COMPETENCES_CALCUL[new URLSearchParams(requete).get('mode')] : COMPETENCES_ROUTES[chemin] ?? []
}

for (const a of ACTIVITES) {
  const cle = a.to.split('?')[0]
  if (!a.br && a.to !== '/imprimer/calcul?mode=affiche' && BR[cle]) a.br = { titre: BR[cle][0], desc: BR[cle][1], descRegionale: BR[cle][2] }
}

// « CE1 → CM2 », « MS / GS »…
export function etiquetteNiveaux(niveaux) {
  const lab = id => CLASSES.find(c => c.id === id)?.label ?? id
  if (niveaux.length === 1) return lab(niveaux[0])
  if (niveaux.length === 2) return `${lab(niveaux[0])} / ${lab(niveaux[1])}`
  return `${lab(niveaux[0])} → ${lab(niveaux.at(-1))}`
}
