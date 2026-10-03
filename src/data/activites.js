// Catalogue de toutes les activités : sert aux pages d'accueil/matières et au filtre par classe.

export const CLASSES = [
  { id: 'ms',  label: 'MS' },
  { id: 'gs',  label: 'GS' },
  { id: 'cp',  label: 'CP' },
  { id: 'ce1', label: 'CE1' },
  { id: 'ce2', label: 'CE2' },
  { id: 'cm1', label: 'CM1' },
  { id: 'cm2', label: 'CM2' },
]
const ordre = CLASSES.map(c => c.id)
const de = (a, b) => ordre.slice(ordre.indexOf(a), ordre.indexOf(b) + 1)

export const MATIERES = [
  { id: 'imprimer', titre: '🖨️ Fiches à imprimer', br: '🖨️ Fichennoù da voullañ' },
  { id: 'maths',    titre: '🔢 Mathématiques',     br: '🔢 Matematik' },
  { id: 'francais', titre: '📝 Français',          br: '📝 Galleg' },
  { id: 'lecture',  titre: '📖 Lecture & Compréhension', br: '📖 Lenn ha kompren' },
  { id: 'autres',   titre: '🌍 Culture générale',  br: '🌍 Sevenadur hollek' },
]

// Domaines du programme (titres de groupes dans les pages matières) — breton à faire relire
export const DOMAINES_BR = {
  'Nombres et calcul': 'Niveroù ha jediñ',
  'Résoudre des problèmes': 'Diskoulmañ kudennoù',
  'Grandeurs et mesures': 'Mentoù ha muzulioù',
  'Espace et géométrie': 'Egor ha mentoniezh',
  'Lettres et sons': 'Lizherennoù ha sonioù',
  'Orthographe': 'Reizhskrivañ',
  'Grammaire et conjugaison': 'Yezhadur ha displegañ',
  'Vocabulaire': 'Geriaoueg',
}

// `domaine` regroupe les activités par grand domaine du programme dans les pages matières
export const ACTIVITES = [
  // ── À imprimer ──
  { to: '/imprimer/ecriture', matiere: 'imprimer', icon: '✏️', titre: "Fiches d'écriture", desc: 'Script et attaché, majuscules et minuscules, sur lignes Seyès', niveaux: de('gs', 'ce2') },
  { to: '/imprimer/alphabet', matiere: 'imprimer', icon: '🔤', titre: "Affiche de l'alphabet", desc: 'Les 4 écritures, A4 ou A3', niveaux: de('ms', 'ce1') },
  { to: '/imprimer/calcul',   matiere: 'imprimer', icon: '🧮', titre: 'Fiches de calcul', desc: 'Tables, compléments, doubles et moitiés… avec corrigé', niveaux: de('cp', 'cm2') },
  { to: '/imprimer/nombres',  matiere: 'imprimer', icon: '🔢', titre: 'Nombres en lettres', desc: 'Unités, dizaines, centaines… en français (et en breton si activé)', niveaux: de('gs', 'cm2') },

  // ── Maths ──
  { to: '/maternelle/compter',  matiere: 'maths', domaine: 'Nombres et calcul', icon: '🔢', titre: 'Compter les objets', desc: 'Compte et trouve le bon nombre', niveaux: ['ms', 'gs'] },
  { to: '/maternelle/comparer', matiere: 'maths', domaine: 'Nombres et calcul', icon: '⚖️', titre: 'Comparer les quantités', desc: 'Quel groupe a le plus ?', niveaux: ['ms', 'gs'] },
  { to: '/maternelle/ordonner', matiere: 'maths', domaine: 'Nombres et calcul', icon: '📶', titre: 'Ranger les nombres', desc: 'Du plus petit au plus grand', niveaux: ['ms', 'gs'] },
  { fiche: true, to: '/maths/numeration',    matiere: 'maths', domaine: 'Nombres et calcul', icon: '💯', titre: 'Les nombres', desc: 'Jusqu\'à 1 000 (CE1) et 10 000 (CE2) : décomposer, comparer, ranger', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/calcul-mental', matiere: 'maths', domaine: 'Nombres et calcul', icon: '🧮', titre: 'Calcul mental', desc: 'Additions, soustractions, doubles, moitiés, tables', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/maths/calcul-pose',   matiere: 'maths', domaine: 'Nombres et calcul', icon: '📐', titre: 'Calcul posé', desc: 'Additions et soustractions en colonnes', niveaux: de('gs', 'cm2') },
  { fiche: true, to: '/maths/tables',        matiere: 'maths', domaine: 'Nombres et calcul', icon: '✖️', titre: 'Tables de multiplication', desc: 'Entraîne-toi sur toutes les tables', niveaux: de('ce1', 'cm2') },
  { fiche: true, to: '/maths/fractions',     matiere: 'maths', domaine: 'Nombres et calcul', icon: '🍕', titre: 'Les fractions', desc: 'Un demi, un tiers, un quart…', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/problemes',     matiere: 'maths', domaine: 'Résoudre des problèmes', icon: '🧩', titre: 'Problèmes', desc: 'Lire, comprendre et calculer', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/heure',         matiere: 'maths', domaine: 'Grandeurs et mesures', icon: '🕐', titre: "Lire l'heure", desc: 'Heures, demies, quarts sur une horloge', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/monnaie',       matiere: 'maths', domaine: 'Grandeurs et mesures', icon: '💶', titre: 'La monnaie', desc: 'Compter et payer en euros', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/maths/mesures',       matiere: 'maths', domaine: 'Grandeurs et mesures', icon: '📏', titre: 'Mesures', desc: 'Longueurs, masses, contenances, calendrier', niveaux: ['ce1', 'ce2'] },
  { to: '/maternelle/formes',   matiere: 'maths', domaine: 'Espace et géométrie', icon: '🔷', titre: 'Les formes', desc: 'Reconnaître cercle, carré, triangle et plus', niveaux: ['ms', 'gs'] },
  { fiche: true, to: '/maths/geometrie',     matiere: 'maths', domaine: 'Espace et géométrie', icon: '📐', titre: 'Géométrie', desc: 'Symétrie, quadrillage, figures et solides', niveaux: ['ce1', 'ce2'] },

  // ── Français ──
  { to: '/maternelle/lettres',   matiere: 'francais', domaine: 'Lettres et sons', icon: '🔡', titre: 'Les lettres', desc: 'Reconnaître et associer majuscules et minuscules', niveaux: ['gs', 'cp'] },
  { to: '/francais/dictee',      matiere: 'francais', domaine: 'Orthographe', icon: '🖊️', titre: 'Dictée', desc: 'Écoute et écris les mots — synthèse vocale', niveaux: de('cp', 'cm2') },
  { to: '/francais/orthographe', matiere: 'francais', domaine: 'Orthographe', icon: '🔤', titre: 'Orthographe', desc: 'Homophones, accords, lettres manquantes', niveaux: de('cp', 'cm2') },
  { fiche: true, to: '/francais/grammaire',   matiere: 'francais', domaine: 'Grammaire et conjugaison', icon: '🧱', titre: 'Grammaire', desc: 'Phrase, nature des mots, sujet, accords', niveaux: ['ce1', 'ce2'] },
  { fiche: true, to: '/francais/conjugaison', matiere: 'francais', domaine: 'Grammaire et conjugaison', icon: '✍️', titre: 'Conjugaison', desc: 'Conjugue les verbes aux bons temps', niveaux: de('ce1', 'cm2') },
  { fiche: true, to: '/francais/vocabulaire', matiere: 'francais', domaine: 'Vocabulaire', icon: '📚', titre: 'Vocabulaire', desc: 'Ordre alphabétique, contraires, familles de mots', niveaux: ['ce1', 'ce2'] },

  // ── Lecture ──
  { fiche: true, to: '/lecture', matiere: 'lecture', icon: '📖', titre: 'Lecture & Syllabes', desc: 'Syllabes, reconstitution de mots et textes interactifs', niveaux: de('cp', 'ce2') },

  // ── Culture générale ──
  { to: '/autres', matiere: 'autres', icon: '🗺️', titre: 'Quiz culture générale', desc: 'Géographie, histoire, sciences, animaux', niveaux: de('cp', 'cm2') },
]

// Traductions bretonnes des activités [titre, description] — à faire relire par un brittophone
const BR = {
  '/imprimer/ecriture': ['Fichennoù skrivañ', 'Skript hag a-stag, pennlizherennoù ha lizherennoù bihan, war linennoù Seyès'],
  '/imprimer/alphabet': ['Skritell al lizherenneg', 'Ar 4 doare skrivañ, A4 pe A3'],
  '/imprimer/calcul':   ['Fichennoù jediñ', 'Taolennoù, klokaat, doubl hag hanter… gant ar reizhadenn'],
  '/imprimer/nombres':  ['An niveroù e lizherennoù', 'Unanennoù, degadoù, kantadoù… e galleg hag e brezhoneg'],
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
  '/maternelle/formes':   ['Ar stummoù', "Anaout ar c'helc'h, ar c'harrez, an tric'horn ha muioc'h"],
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
for (const a of ACTIVITES) if (BR[a.to]) a.br = { titre: BR[a.to][0], desc: BR[a.to][1] }

// « CE1 → CM2 », « MS / GS »…
export function etiquetteNiveaux(niveaux) {
  const lab = id => CLASSES.find(c => c.id === id)?.label ?? id
  if (niveaux.length === 1) return lab(niveaux[0])
  if (niveaux.length === 2) return `${lab(niveaux[0])} / ${lab(niveaux[1])}`
  return `${lab(niveaux[0])} → ${lab(niveaux.at(-1))}`
}
