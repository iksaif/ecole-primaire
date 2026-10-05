// Recherche et filtres de la page /telechargements : purs, partagés par le build (texte de recherche de chaque entrée) et
// par la page (useFiches). Lisibles par node.
import type { Classe, EntreeIndex, Genre, IndexFiches, Texte, Usage } from './types.ts'

/** Minuscules, sans accents ni ligatures simples : « Écriture » et « ecriture » se valent. */
export const normaliser = (texte: string): string =>
  texte.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/œ/g, 'oe').replace(/æ/g, 'ae')

/** Le texte dans la langue demandée, sinon en français. */
export const texteDe = (t: Texte, langue: string): string => t[langue] || t.fr

/** Texte cherché d'une entrée : toutes les langues de ses titres et descriptions, ses classes, des mots en plus. */
export function texteDeRecherche(e: Pick<EntreeIndex, 'slug' | 'titre' | 'titreCourt' | 'description' | 'niveaux'>, motsEnPlus: string[] = []): string {
  const textes = [e.titre, e.titreCourt, e.description].flatMap(t => Object.values(t))
  const mots = normaliser([...textes, ...e.niveaux, e.slug.replace(/-/g, ' '), ...motsEnPlus].join(' ')).split(/\s+/)
  return [...new Set(mots)].join(' ')
}

/** Critères de la page. Une valeur vide ('' ou liste vide) ne filtre pas. */
export interface Criteres {
  texte: string
  classe: Classe | ''
  langue: string
  usage: Usage | ''
  domaine: string
  genre: Genre | ''
  /** montrer aussi les fiches par compétence (sinon elles sont sur la page de leur bilan) */
  avecCompetences: boolean
}

export const CRITERES_VIDES: Criteres = { texte: '', classe: '', langue: '', usage: '', domaine: '', genre: '', avecCompetences: false }

/** Entrées qui répondent à tous les critères, dans l'ordre de l'index. Chaque mot du texte doit être trouvé. */
export function filtrer(entrees: readonly EntreeIndex[], c: Criteres): EntreeIndex[] {
  const mots = normaliser(c.texte).split(/\s+/).filter(Boolean)
  return entrees.filter(e =>
    (c.avecCompetences || e.parent === null)
    && (!c.classe || e.niveaux.includes(c.classe))
    && (!c.langue || e.langues.includes(c.langue))
    && (!c.usage || e.usage === c.usage)
    && (!c.genre || e.genre === c.genre)
    && (!c.domaine || (c.domaine === 'hors-programme' ? e.domaine === null : e.domaine === c.domaine))
    && mots.every(m => e.recherche.includes(m)))
}

/** Entrées regroupées par domaine, dans l'ordre des domaines de l'index ; les domaines sans entrée sont omis. */
export function parDomaine(index: IndexFiches, entrees: readonly EntreeIndex[]): { domaine: IndexFiches['filtres']['domaines'][number], entrees: EntreeIndex[] }[] {
  return index.filtres.domaines
    .map(domaine => ({ domaine, entrees: entrees.filter(e => e.domaine === domaine.id) }))
    .filter(g => g.entrees.length)
}

/** Libellé d'un ensemble de classes : « CE1 », « GS · CP », « CE1 → CM2 » (au-delà de deux classes qui se suivent). */
export function etiquetteClasses(classes: readonly Classe[], ordre: readonly Classe[]): string {
  const rangs = classes.map(c => ordre.indexOf(c)).sort((a, b) => a - b)
  const suivies = rangs.every((r, i) => i === 0 || r === rangs[i - 1] + 1)
  const nom = (r: number) => ordre[r].toUpperCase()
  if (rangs.length > 2 && suivies) return `${nom(rangs[0])} → ${nom(rangs[rangs.length - 1])}`
  return rangs.map(nom).join(' · ')
}

/** La langue dans laquelle `texteDe` rend le texte (attribut `lang`) : celle demandée si le texte l'a, sinon le français. */
export const langueDuTexte = (t: Texte, langue: string): string => (t[langue] ? langue : 'fr')
