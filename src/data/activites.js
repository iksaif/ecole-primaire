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
  { id: 'imprimer', titre: '🖨️ Fiches à imprimer', classe: 'imprimer' },
  { id: 'maths',    titre: '🔢 Mathématiques',     classe: 'maths' },
  { id: 'francais', titre: '📝 Français',          classe: 'francais' },
  { id: 'lecture',  titre: '📖 Lecture & Compréhension', classe: 'lecture' },
  { id: 'autres',   titre: '🌍 Culture générale',  classe: 'autres' },
]

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

// « CE1 → CM2 », « MS / GS »…
export function etiquetteNiveaux(niveaux) {
  const lab = id => CLASSES.find(c => c.id === id)?.label ?? id
  if (niveaux.length === 1) return lab(niveaux[0])
  if (niveaux.length === 2) return `${lab(niveaux[0])} / ${lab(niveaux[1])}`
  return `${lab(niveaux[0])} → ${lab(niveaux.at(-1))}`
}
