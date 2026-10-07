// Logique pure des pages « fiches toutes prêtes » (liste d'une matière, index /telechargements) et « feuille d'une fiche » :
// filtres, langues proposées, entrées sœurs (même fiche dans une autre langue), formats de PDF, fiches voisines. Aucune
// dépendance à Vue : lisible par node (tests/fiches-pages.test.mjs). La page branche ces fonctions au contexte et à l'index.
import { LANGUE_SOURCE } from '../langues/registre.ts'
import type { Langue } from '../langues/registre.ts'
import type { Mode } from '../contexte/types.ts'
import { languesUtilisables, voisines } from '../ressources/filtres.ts'
import type { RessourceDeContenu, RessourceFiche } from '../ressources/types.ts'
import { normaliser } from './recherche.ts'
import type { Classe, Entree, EntreeIndex, Format, IndexFiches, Matiere, Orientation, Usage, Variante } from './types.ts'

// ── Filtres de la liste ──

/** Valeur du filtre de langue pour « une fiche qui porte plusieurs langues » ; les autres valeurs sont des codes de langue. */
export const LANGUE_BILINGUE = 'bilingue'

/** Ce que la page filtre. Une valeur vide ('' ou liste vide) ne filtre pas. */
export interface CriteresPage {
  texte: string
  /** classes montrées ; vide : toutes */
  classes: readonly Classe[]
  usage: Usage | ''
  /** `DomaineId` de l'index, 'hors-programme', ou '' */
  domaine: string
  /** code de langue, `LANGUE_BILINGUE`, ou '' */
  langue: string
}

export const CRITERES_PAGE_VIDES: CriteresPage = { texte: '', classes: [], usage: '', domaine: '', langue: '' }

/** La matière d'une entrée, d'après le domaine de l'index (hors programme : le monde, comme l'index le range). */
export function matiereDe(e: Pick<EntreeIndex, 'domaine'>, index: Pick<IndexFiches, 'filtres'>): Matiere {
  return index.filtres.domaines.find(d => d.id === e.domaine)?.matiere ?? 'monde'
}

/** Les matières d'une entrée (un index plus ancien n'a pas `matieres` : celle de son domaine). */
export const matieresDe = (e: Pick<EntreeIndex, 'domaine' | 'matieres'>, index: Pick<IndexFiches, 'filtres'>): readonly Matiere[] =>
  e.matieres ?? [matiereDe(e, index)]

/** Les fiches de la langue régionale sont dans cette langue (seule ou avec le français) : pas l'affiche de la météo en français seul. */
const estDansLaLangue = (e: Pick<EntreeIndex, 'langues'>, regionale: Langue | null): boolean => !!regionale && e.langues.includes(regionale)

/** Une fiche se lit dans une des langues de l'entrée : celle du mode doit en faire partie (mode français : fiches françaises seulement). */
export function dansLeMode(e: Pick<EntreeIndex, 'langues'>, mode: Mode, regionale: Langue | null): boolean {
  const utilisables: readonly string[] = languesUtilisables(mode, regionale)
  return e.langues.some(l => utilisables.includes(l))
}

/** La valeur de filtre de langue (`'fr'`, `'br'`, `LANGUE_BILINGUE`) qui retient cette entrée ? */
export const correspondALangue = (e: Pick<EntreeIndex, 'langues'>, valeur: string): boolean =>
  !valeur || (valeur === LANGUE_BILINGUE ? e.langues.length > 1 : e.langues.length === 1 && e.langues[0] === valeur)

/**
 * Les fiches d'une matière (ou de toutes : `matiere` null) qui répondent aux critères, dans l'ordre de l'index. Les fiches par
 * compétence (`parent`) n'y sont pas : elles sont voisines de leur bilan. Chaque mot du texte doit être trouvé.
 */
export function filtrerFiches(index: IndexFiches, matiere: Matiere | null, c: CriteresPage, contexte: { mode: Mode, regionale: Langue | null }): EntreeIndex[] {
  const mots = normaliser(c.texte).split(/\s+/).filter(Boolean)
  return index.entrees.filter(e =>
    e.parent === null
    && (matiere === null || matieresDe(e, index).includes(matiere))
    && (matiere !== 'regionale' || estDansLaLangue(e, contexte.regionale))
    && dansLeMode(e, contexte.mode, contexte.regionale)
    && (!c.classes.length || e.niveaux.some(n => c.classes.includes(n)))
    && (!c.usage || e.usage === c.usage)
    && (!c.domaine || (c.domaine === 'hors-programme' ? e.domaine === null : e.domaine === c.domaine))
    && correspondALangue(e, c.langue)
    && mots.every(m => e.recherche.includes(m)))
}

/**
 * Les choix du filtre de langue : seulement en mode bilingue (sinon la langue est imposée par le mode) ; les langues des
 * entrées montrables, dans l'ordre de l'index, puis « bilingue » s'il existe une fiche à plusieurs langues. Moins de deux
 * choix : aucun filtre (vide).
 */
export function languesProposees(entrees: readonly Pick<EntreeIndex, 'langues'>[], mode: Mode): string[] {
  if (mode !== 'bilingue') return []
  const seules = [...new Set(entrees.filter(e => e.langues.length === 1).map(e => e.langues[0]))]
    .sort((a, b) => (a === LANGUE_SOURCE ? -1 : b === LANGUE_SOURCE ? 1 : a.localeCompare(b)))
  const choix = entrees.some(e => e.langues.length > 1) ? [...seules, LANGUE_BILINGUE] : seules
  return choix.length > 1 ? choix : []
}

/** Les domaines de la matière qui ont au moins une fiche montrable (pour le menu « Domaine »), dans l'ordre de l'index. */
export function domainesProposes(index: IndexFiches, matiere: Matiere | null, entrees: readonly Pick<EntreeIndex, 'domaine'>[]): IndexFiches['filtres']['domaines'] {
  return index.filtres.domaines.filter(d => (matiere === null || d.matiere === matiere) && entrees.some(e => e.domaine === d.id))
}

/** Les fiches triées par titre (A→Z, sans tenir compte des accents ni de la casse) dans la langue donnée. */
export function parTitre<T extends Pick<EntreeIndex, 'titre'>>(entrees: readonly T[], langue: string): T[] {
  const cle = (e: T): string => normaliser(e.titre[langue] || e.titre.fr)
  return [...entrees].sort((a, b) => cle(a).localeCompare(cle(b)))
}

/** Les fiches de l'index regroupées par matière (dans l'ordre donné), A→Z ; les matières sans fiche sont omises. */
export function grouperParMatiere(index: IndexFiches, entrees: readonly EntreeIndex[], matieres: readonly Matiere[], langue: string): { matiere: Matiere, entrees: EntreeIndex[] }[] {
  return matieres
    .map(matiere => ({ matiere, entrees: parTitre(entrees.filter(e => matiereDe(e, index) === matiere), langue) }))
    .filter(g => g.entrees.length)
}

// ── Feuille d'une fiche ──

/**
 * Le slug sans le suffixe de langue : une entrée dans une autre langue que le français ajoute `-<langues>` (`-br`, `-fr-br`).
 * Les langues viennent de l'entrée, jamais d'une liste ici.
 */
export function slugDeBase(e: Pick<EntreeIndex, 'slug' | 'langues'>): string {
  const suffixe = e.langues.length === 1 && e.langues[0] === LANGUE_SOURCE ? '' : `-${e.langues.join('-')}`
  return suffixe && e.slug.endsWith(suffixe) ? e.slug.slice(0, -suffixe.length) : e.slug
}

/** Ordre des entrées d'une même fiche : une langue avant plusieurs, le français avant les autres, puis les codes. */
const parLangues = (a: Pick<EntreeIndex, 'langues'>, b: Pick<EntreeIndex, 'langues'>): number =>
  a.langues.length - b.langues.length
  || Number(b.langues.includes(LANGUE_SOURCE)) - Number(a.langues.includes(LANGUE_SOURCE))
  || a.langues.join().localeCompare(b.langues.join())

/** Les entrées sœurs : la même fiche dans d'autres langues (même slug de base, autres langues), français d'abord. */
export function entreesSoeurs(e: EntreeIndex, entrees: readonly EntreeIndex[]): EntreeIndex[] {
  const base = slugDeBase(e)
  return entrees
    .filter(x => x.slug !== e.slug && slugDeBase(x) === base && x.langues.join() !== e.langues.join())
    .sort(parLangues)
}

/** Les formats de papier d'une variante, sans doublon, dans l'ordre de ses PDF (le premier est celui par défaut). */
export const formatsDe = (v: Pick<Variante, 'pdfs'>): Format[] => [...new Set(v.pdfs.map(p => p.format))]

/** Les sens (portrait, paysage) d'une variante, sans doublon, dans l'ordre de ses PDF. */
export const orientationsDe = (v: Pick<Variante, 'pdfs'>): Orientation[] => [...new Set(v.pdfs.map(p => p.orientation))]

/**
 * Le PDF d'une variante pour un format et un sens ; à défaut le même format (ou le même sens), sinon le premier : jamais de lien
 * cassé, et choisir un format garde le sens déjà choisi quand il existe dans ce format.
 */
export function pdfDe(v: Pick<Variante, 'pdfs'>, format: Format | null, orientation: Orientation | null = null): Variante['pdfs'][number] {
  const { pdfs } = v
  return pdfs.find(p => p.format === format && p.orientation === orientation)
    ?? pdfs.find(p => p.format === format) ?? pdfs.find(p => p.orientation === orientation) ?? pdfs[0]
}

/** Un choix de format n'est proposé que si l'entrée en déclare plusieurs (rien à choisir sinon). */
export const proposeUnChoixDeFormat = (v: Pick<Variante, 'pdfs'>): boolean => formatsDe(v).length > 1

/** Idem pour le sens (portrait / paysage). */
export const proposeUnChoixDeSens = (v: Pick<Variante, 'pdfs'>): boolean => orientationsDe(v).length > 1

/** Le numéro de page voisin, borné : jamais en dehors de 0..nb-1. */
export const pageVoisine = (courante: number, delta: number, nb: number): number => Math.min(Math.max(courante + delta, 0), Math.max(nb - 1, 0))

/** L'entrée du catalogue qui est cette fiche (même slug), ou `undefined` : une fiche hors programme n'y est pas. */
export const ressourceDeLaFiche = (slug: string, catalogue: readonly RessourceDeContenu[]): RessourceFiche | undefined =>
  catalogue.find((r): r is RessourceFiche => r.type === 'fiche' && r.slug === slug)

/** Les fiches voisines, en deux listes : même compétence, puis même domaine. La classe n'entre pas en compte. */
export interface VoisinesDeFiche {
  competence: RessourceFiche[]
  domaine: RessourceFiche[]
}

/**
 * Voisines d'une fiche (voisines de src/ressources/filtres.ts) parmi les fiches du catalogue qui sont dans les mêmes langues
 * (pas la même fiche en breton : elle est dans « Même fiche »), séparées en même compétence / même domaine.
 */
export function voisinesDeFiche(entree: Pick<Entree, 'slug' | 'langues'>, catalogue: readonly RessourceDeContenu[], limite = 6): VoisinesDeFiche {
  const ressource = ressourceDeLaFiche(entree.slug, catalogue)
  if (!ressource) return { competence: [], domaine: [] }
  const memesLangues = catalogue.filter((r): r is RessourceFiche => r.type === 'fiche' && r.langues.join() === ressource.langues.join())
  const proches = voisines(ressource, memesLangues)
  const partage = (r: RessourceFiche): boolean => r.competences.some(k => ressource.competences.includes(k))
  return { competence: proches.filter(partage).slice(0, limite), domaine: proches.filter(r => !partage(r)).slice(0, limite) }
}

/** L'exercice en ligne lié à une fiche : celui dont la route est la cible de « Personnaliser » et qui se joue à l'écran. */
export function jeuDeLaFiche(entree: Pick<Entree, 'personnaliser'>, catalogue: readonly RessourceDeContenu[]): RessourceDeContenu | undefined {
  const route = entree.personnaliser?.route
  return route ? catalogue.find(r => r.type === 'exercice' && r.badges.jeu && r.route === route) : undefined
}

/**
 * La même fiche dans toutes ses langues, la fiche elle-même comprise : les français d'abord (une langue, puis plusieurs), les
 * autres dans l'ordre alphabétique des codes. Moins de deux entrées : pas de « Même fiche ».
 */
export function memeFiche(e: EntreeIndex, entrees: readonly EntreeIndex[]): EntreeIndex[] {
  const soeurs = entreesSoeurs(e, entrees)
  return soeurs.length ? [e, ...soeurs].sort(parLangues) : []
}

/** Adresses de la page d'une matière et de ses fiches prêtes ; la langue régionale n'a pas de page de fiches (`null`). */
const FICHES_DE: Readonly<Record<Matiere, string | null>> = { maths: '/maths/fiches', francais: '/francais/fiches', monde: '/monde/fiches', regionale: null }
const PAGE_DE: Readonly<Record<Matiere, string | null>> = { maths: '/maths', francais: '/francais', monde: '/monde', regionale: null }
export const cheminFiches = (matiere: Matiere): string | null => FICHES_DE[matiere]
export const cheminMatiere = (matiere: Matiere): string | null => PAGE_DE[matiere]
