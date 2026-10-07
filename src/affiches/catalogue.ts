// Le catalogue des affiches toutes prêtes, dérivé des définitions : une entrée par variante et par ensemble de langues.
// Données pures, sérialisables (aucune fonction) : le build en écrit l'index et un fichier JSON par entrée (plan 11), et
// l'app les lit. Chaque site ne publie que les entrées dont toutes les langues sont les siennes (catalogueDe).
import type { Site } from '../sites.ts'
import type { Classe, CompetenceId, DomaineId, ValeurOption } from '../noyau/types.ts'
import { defautsDe } from '../noyau/politique.ts'
import { genererAffiche } from './generer.ts'
import { champsDe, ensemblesDeLangues, optionsDe, POLICES_LIVREES, reglagesDe, typesDePolice, varianteDe } from './outils.ts'
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

// ── L'adresse d'une affiche réglée (format documenté en tête de src/pages/AfficheView.vue) ──

/** Les clés de l'adresse qui ne sont pas des réglages de la définition : aucun réglage ne peut porter l'un de ces noms (le test le vérifie). */
export const CLES_DE_LA_FEUILLE: readonly string[] = ['affiche', 'variante', 'langues', 'langue', 'format', 'orientation', 'police', 'titre', 'graine']

/** La clé d'adresse d'un type de police : `police` en mode unique, `police.<type>` (script, attaché) sinon. */
export function clePoliceDansAdresse(type: string): string {
  if (type === 'unique') return 'police'
  return `police.${type}`
}

/**
 * Un paramètre de l'adresse en texte (vide compris) : le routeur donne une chaîne, une liste (paramètre répété : le premier
 * compte) ou null (`?cle` sans valeur) ; tout le reste donne undefined.
 */
function texteBrut(v: unknown): string | undefined {
  const premier = Array.isArray(v) ? v[0] : v
  if (typeof premier !== 'string') return undefined
  return premier
}

/** Un paramètre de l'adresse en texte non vide. */
function texteNonVide(v: unknown): string | undefined {
  const texte = texteBrut(v)
  if (!texte) return undefined
  return texte
}

/** Une valeur de réglage dans l'adresse : une liste (choix multiple) devient `a,b,c`, le reste son texte. */
function versAdresse(valeur: unknown): string {
  if (Array.isArray(valeur)) return valeur.map(String).join(',')
  return String(valeur)
}

/**
 * Une valeur lue dans l'adresse ramenée à l'une des valeurs proposées (`true` → true, `5` → 5) : celle qui s'écrit pareil ; aucune :
 * undefined (reglagesDe reprend alors le défaut). Un choix multiple garde les morceaux reconnus.
 */
function depuisAdresse(texte: string, valeurs: readonly ValeurOption[], multiple: boolean): ValeurOption | ValeurOption[] | undefined {
  const reconnue = (morceau: string): ValeurOption | undefined => valeurs.find(v => String(v) === morceau)
  if (!multiple) return reconnue(texte)
  const choisies = texte.split(',').map(reconnue).filter(v => v !== undefined)
  if (!choisies.length) return undefined
  return choisies
}

/** Une graine lue dans l'adresse : un entier positif écrit en chiffres, sinon undefined. */
function graineLue(texte: string | undefined): number | undefined {
  if (!texte || !/^\d{1,9}$/.test(texte)) return undefined
  const graine = Number(texte)
  if (graine < 1) return undefined
  return graine
}

/**
 * Les réglages que porte une adresse : l'inverse de queryDeReglages et de lienDe, pour le formulaire (`depart`). `query` : les
 * paramètres de l'adresse (chaîne ou liste, comme ceux du routeur). Sans `definition` : seulement la variante, les langues
 * (`langues`, liste séparée par des virgules, ou `langue`), le format et le sens. Avec elle : aussi les réglages à choix, les champs
 * libres, les polices livrées, le titre et la graine. Lu avec méfiance : une valeur inconnue est ignorée (reglagesDe valide le
 * reste et reprend les défauts), jamais d'exception.
 */
export function lireLien(query: Record<string, unknown>, definition?: DefinitionAffiche): Record<string, unknown> {
  const lus: Record<string, unknown> = {}
  const variante = texteNonVide(query.variante)
  if (variante) lus.variante = variante
  const langues = (texteNonVide(query.langues) ?? texteNonVide(query.langue))?.split(',').filter(Boolean)
  if (langues?.length) lus.langues = langues
  // format et sens : relus tels quels ; reglagesDe garde seulement ceux que l'affiche permet
  const format = texteNonVide(query.format)
  if (format) lus.format = format
  const orientation = texteNonVide(query.orientation)
  if (orientation) lus.orientation = orientation
  if (!definition) return lus

  // réglages à choix : parmi les valeurs déclarées de la variante (reglagesDe restreint ensuite à celles proposées)
  const v = varianteDe(definition, variante)
  const defauts = defautsDe(definition.reglages, v)
  for (const [cle, valeurs] of Object.entries(optionsDe(definition, v))) {
    const texte = texteBrut(query[cle])
    if (texte === undefined) continue
    const valeur = depuisAdresse(texte, valeurs, Array.isArray(defauts[cle]))
    if (valeur !== undefined) lus[cle] = valeur
  }
  // champs libres : le texte tel quel (reglagesDe limite sa longueur, ramène un nombre à ses bornes, refuse ce qui n'en est pas un)
  for (const cle of Object.keys(champsDe(definition, v))) {
    const texte = texteBrut(query[cle])
    if (texte !== undefined) lus[cle] = texte
  }
  // polices : seulement celles livrées avec le site (une police de l'ordinateur ou d'un fichier n'existerait pas chez un autre)
  const polices: Record<string, string> = {}
  for (const type of typesDePolice(definition)) {
    const nom = texteNonVide(query[clePoliceDansAdresse(type)])
    if (nom && POLICES_LIVREES.includes(nom)) polices[type] = nom
  }
  if (Object.keys(polices).length) lus.polices = polices
  const titre = texteNonVide(query.titre)
  if (titre) lus.titre = titre
  // graine : seulement pour une affiche à hasard (sinon elle ne change rien et n'est jamais écrite)
  const graine = graineLue(texteNonVide(query.graine))
  if (definition.hasard && graine) lus.graine = graine
  return lus
}

/**
 * L'adresse (paramètres) qui rouvre le formulaire, à froid, sur ces réglages : l'affiche, la variante, puis ce qui s'écarte des
 * défauts de la variante, une clé par réglage, dans un ordre fixe : langues, format, sens, réglages de la définition (à choix et
 * champs libres, dans leur ordre), polices, titre, graine. Une police qui n'est pas livrée (ajoutée depuis un fichier, ou de
 * l'ordinateur) ne passe pas : l'adresse ouverte ailleurs prend la police par défaut.
 */
export function queryDeReglages(definition: DefinitionAffiche, config: Readonly<Record<string, unknown>>): Record<string, string> {
  const variante = String(config.variante)
  const defaut = reglagesDe(definition, { variante }) as Record<string, unknown>
  const query: Record<string, string> = { affiche: definition.id, variante }
  const langues = (config.langues as readonly string[] | undefined) ?? []
  if (langues.join() !== ((defaut.langues as readonly string[] | undefined) ?? []).join()) query.langues = langues.join(',')
  if (config.format !== defaut.format) query.format = String(config.format)
  if (config.orientation !== defaut.orientation) query.orientation = String(config.orientation)

  // les défauts des réglages dépendent de la feuille (valeurs proposées selon la langue…) : on compare à ceux de CETTE feuille,
  // ceux que reglagesDe donnera à la relecture si la clé est absente
  const base = reglagesDe(definition, { variante, langues, format: config.format, orientation: config.orientation }) as Record<string, unknown>
  const v = varianteDe(definition, variante)
  const reglables = new Set([...Object.keys(optionsDe(definition, v)), ...Object.keys(champsDe(definition, v))])
  for (const cle of Object.keys(base)) {
    if (!reglables.has(cle) || !(cle in config)) continue
    if (JSON.stringify(config[cle]) !== JSON.stringify(base[cle])) query[cle] = versAdresse(config[cle])
  }
  const polices = (config.polices ?? {}) as Readonly<Record<string, unknown>>
  const policesDefaut = base.polices as Readonly<Record<string, string>>
  for (const type of typesDePolice(definition)) {
    const nom = polices[type]
    if (typeof nom !== 'string' || nom === policesDefaut[type] || !POLICES_LIVREES.includes(nom)) continue
    query[clePoliceDansAdresse(type)] = nom
  }
  if (typeof config.titre === 'string' && config.titre) query.titre = config.titre
  if (definition.hasard && config.graine !== base.graine) query.graine = String(config.graine)
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
