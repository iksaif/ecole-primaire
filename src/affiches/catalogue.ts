// Le catalogue des affiches toutes prêtes, dérivé des définitions : une entrée par variante et par ensemble de langues.
// Données pures, sérialisables (aucune fonction) : le build en écrit l'index et un fichier JSON par entrée (plan 11), et
// l'app les lit. Chaque site ne publie que les entrées dont toutes les langues sont les siennes (catalogueDe).
import type { Site } from '../sites.ts'
import type { Classe, CompetenceId, DomaineId } from '../noyau/types.ts'
import { genererAffiche } from './generer.ts'
import { ensemblesDeLangues, reglagesDe } from './outils.ts'
import { cleVariante, traducteurAffiche } from './textes.ts'
import type { DefinitionAffiche, ModuleAffiche } from './types.ts'

/** Une affiche toute prête du catalogue. */
export interface EntreeAffiche {
  slug: string
  /** nom court (carte), titre et description de la page de téléchargement, dans la première langue de l'entrée */
  court: string
  titre: string
  description: string
  /** classes de la variante */
  classes: readonly Classe[]
  domaine: DomaineId
  genre: 'affiche'
  competences: readonly CompetenceId[]
  /** langues de la feuille (une, ou plusieurs pour une affiche bilingue) ; l'entrée n'est publiée que par les sites qui les proposent toutes */
  langues: readonly string[]
  /** nombre de pages de la feuille */
  pages: number
  /** réglages qui produisent l'affiche : genererAffiche(module(config.affiche), reglagesDe(…, config)) */
  config: { affiche: string, variante: string, langue: string, langues: readonly string[] }
  /** lien « Personnaliser » : le formulaire ouvert sur cette affiche, cette variante et ces langues */
  lien: string
}

/**
 * Slug publié : celui de la variante s'il existe (affiche reportée : ses liens ne changent pas), sinon
 * `affiche-<id>-<variante>` ; une langue autre que le français seul ajoute `-<langue>` (`-fr-br` pour les deux).
 */
export const slugDe = (d: DefinitionAffiche, variante: string, langues: readonly string[]): string =>
  `${d.variantes[variante].slug ?? `affiche-${d.id}-${variante}`}${langues.join() === 'fr' ? '' : `-${langues.join('-')}`}`

/** Lien « Personnaliser » : la page de réglage ouverte sur cette affiche, cette variante et ces langues. */
export const lienDe = (d: DefinitionAffiche, variante: string, langue: string, langues: readonly string[] = [langue]): string =>
  `${d.route}?affiche=${d.id}&variante=${variante}${langues.join() === 'fr' ? '' : `&langues=${langues.join(',')}`}`

/**
 * Les réglages que porte un lien « Personnaliser » : l'inverse de lienDe, pour le formulaire (`depart`). `query` : les
 * paramètres de l'adresse (chaîne ou liste, comme ceux du routeur). `variante` ; `langues` (liste séparée par des virgules) ou
 * `langue` ; le reste est ignoré. Les valeurs ne sont pas validées ici : reglagesDe le fait.
 */
export function lireLien(query: Record<string, unknown>): { variante?: string, langues?: string[], format?: string, orientation?: string } {
  const texte = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : Array.isArray(v) && typeof v[0] === 'string' && v[0] ? v[0] : undefined)
  const variante = texte(query.variante)
  const langues = (texte(query.langues) ?? texte(query.langue))?.split(',').filter(Boolean)
  // format et sens : relus tels quels ; reglagesDe garde seulement ceux que l'affiche permet
  const format = texte(query.format)
  const orientation = texte(query.orientation)
  return {
    ...(variante ? { variante } : {}), ...(langues?.length ? { langues } : {}),
    ...(format ? { format } : {}), ...(orientation ? { orientation } : {}),
  }
}

/**
 * L'adresse (paramètres) qui rouvre le formulaire sur ces réglages : l'affiche, la variante, et ce qui s'écarte des défauts de la
 * variante parmi les langues, le format et le sens. Les autres réglages ne passent pas encore par l'adresse (ils restent mémorisés).
 */
export function queryDeReglages(definition: DefinitionAffiche, config: Readonly<Record<string, unknown>>): Record<string, string> {
  const variante = String(config.variante)
  const defaut = reglagesDe(definition, { variante }) as Record<string, unknown>
  const query: Record<string, string> = { affiche: definition.id, variante }
  const langues = (config.langues as readonly string[] | undefined) ?? []
  if (langues.join() !== ((defaut.langues as readonly string[] | undefined) ?? []).join()) query.langues = langues.join(',')
  if (config.format !== defaut.format) query.format = String(config.format)
  if (config.orientation !== defaut.orientation) query.orientation = String(config.orientation)
  return query
}

/** Les entrées de catalogue d'une affiche : une par variante et par ensemble de langues. */
export function entreesDe<R extends object>(module: ModuleAffiche<R>): EntreeAffiche[] {
  const d = module.definition as DefinitionAffiche
  return Object.entries(d.variantes).flatMap(([id, v]) => ensemblesDeLangues(d).map(langues => {
    const T = traducteurAffiche(module.textes, langues[0])
    const config = { variante: id, langues }
    return {
      slug: slugDe(d, id, langues),
      court: T(cleVariante(id, 'court')), titre: T(cleVariante(id, 'titre')), description: T(cleVariante(id, 'description')),
      classes: v.classes, domaine: d.domaine, genre: d.genre, competences: v.competences, langues,
      pages: genererAffiche(module, config).nbPages,
      config: { affiche: d.id, variante: id, langue: reglagesDe(d, config).langue, langues }, lien: lienDe(d, id, langues[0], langues),
    }
  }))
}

/** Les langues qu'un site publie : celles de son interface et ses langues régionales. */
export const languesDuSite = (site: Pick<Site, 'languesInterface' | 'languesRegionales'>): readonly string[] =>
  [...new Set<string>([...site.languesInterface, ...site.languesRegionales])]

/** Le catalogue d'une liste d'affiches pour un site : les entrées dont toutes les langues sont proposées par le site. */
export function catalogueDe(modules: readonly ModuleAffiche<never>[], site: Pick<Site, 'languesInterface' | 'languesRegionales'>): EntreeAffiche[] {
  const langues = languesDuSite(site)
  return modules.flatMap(m => entreesDe(m as ModuleAffiche)).filter(e => e.langues.every(l => langues.includes(l)))
}
