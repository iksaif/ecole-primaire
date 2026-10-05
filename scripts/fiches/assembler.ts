// Des fiches rendues aux données publiées : l'index et une entrée par fiche. Pur (aucune entrée-sortie, aucun navigateur) :
// testé par tests/fiches-ecriture.test.mjs avec de fausses fiches rendues.
import { NIVEAUX } from '../../src/data/classes.ts'
import { DOMAINES, DOMAINES_EXEMPLE, domaineDe, lienProgramme, nomOfficiel } from '../../src/data/programme.ts'
import domainesBr from '../../src/i18n/br/domaines.js'
import { texteDeRecherche } from '../../src/telechargements/recherche.ts'
import { USAGES, VERSION_SCHEMA, usageDe } from '../../src/telechargements/types.ts'
import type { Classe, DomaineDeFiche, DomaineId, Entree, EntreeIndex, IndexFiches, LienProgramme, Texte } from '../../src/telechargements/types.ts'
import type { FicheRendue } from './types.ts'

const NB_VOISINES = 8
const HORS_PROGRAMME: Texte = { fr: 'Culture générale', br: 'Sevenadur hollek' }   // br: à relire

// matières dans l'ordre d'affichage : les maths, puis le français, puis le reste ; exemples en dernier
const ORDRE_MATIERES = ['maths', 'francais', 'autres']
const DOMAINES_TRIES = [...[...DOMAINES].sort((a, b) => ORDRE_MATIERES.indexOf(a.matiere) - ORDRE_MATIERES.indexOf(b.matiere)), ...DOMAINES_EXEMPLE]
const rangDomaine = (id: DomaineId | null): number => (id === null ? DOMAINES_TRIES.length : DOMAINES_TRIES.findIndex(d => d.id === id))

/** Liens du programme officiel d'un domaine pour des classes : un lien par adresse (un cycle, ou deux cycles voisins). */
function liensProgramme(domaine: DomaineId, classes: readonly Classe[]): LienProgramme[] {
  const parUrl = new Map<string, { classes: Classe[], noms: Set<string> }>()
  for (const c of classes) {
    const url = lienProgramme(domaine, c)
    if (!url) continue
    const g = parUrl.get(url) ?? { classes: [], noms: new Set<string>() }
    g.classes.push(c)
    g.noms.add(nomOfficiel(domaine, c) ?? '')
    parUrl.set(url, g)
  }
  return [...parUrl].map(([url, g]) => ({ classes: g.classes, nom: [...g.noms].join(' / '), url }))
}

function domaineDeFiche(id: DomaineId | null, classes: readonly Classe[]): DomaineDeFiche {
  if (id === null) return { id, nom: HORS_PROGRAMME, matiere: 'autres', rang: rangDomaine(null), programme: [] }
  const d = domaineDe(id)
  if (!d) throw new Error(`domaine « ${id} » inconnu de programme.ts`)
  const br = (domainesBr as Record<string, string>)[id]
  return { id, nom: br ? { fr: d.court, br } : { fr: d.court }, matiere: d.matiere, rang: rangDomaine(id), programme: liensProgramme(id, classes) }
}

/** Entrées voisines : celles du même bilan, sinon la même famille (autres classes), puis le même domaine et usage. */
function voisinesDe(e: EntreeIndex, famille: Map<string, string>, tous: readonly EntreeIndex[]): string[] {
  const autres = tous.filter(x => x.slug !== e.slug && x.langues.join() === e.langues.join())
  if (e.parent) return [e.parent, ...autres.filter(x => x.parent === e.parent).map(x => x.slug)].slice(0, NB_VOISINES)
  const racines = autres.filter(x => x.parent === null)
  const memeFamille = racines.filter(x => famille.get(x.slug) === famille.get(e.slug))
  const memeDomaine = racines.filter(x => x.domaine === e.domaine && x.usage === e.usage && !memeFamille.includes(x))
  return [...memeFamille, ...memeDomaine].slice(0, NB_VOISINES).map(x => x.slug)
}

/** Ce que l'index garde d'une entrée (liste explicite : un champ de plus dans EntreeIndex ne compile pas sans être ajouté ici). */
const enEntreeIndex = (e: Entree): EntreeIndex => ({
  slug: e.slug, titre: e.titre, titreCourt: e.titreCourt, description: e.description, niveaux: e.niveaux, domaine: e.domaine,
  genre: e.genre, usage: e.usage, langues: e.langues, nbPages: e.nbPages, nbVariantes: e.nbVariantes, taillePdf: e.taillePdf,
  miniature: e.miniature, parent: e.parent, personnaliser: e.personnaliser, exemple: e.exemple, recherche: e.recherche,
})

/** L'index et les entrées de fiches rendues. `genereLe` : date ISO (paramètre pour des données reproductibles). */
export function assembler(rendues: readonly FicheRendue[], { site, genereLe }: { site: string, genereLe: string }): { index: IndexFiches, entrees: Entree[] } {
  const base = rendues.map((r): { entree: Entree, famille: string } => {
    const { meta } = r.source
    const premier = r.variantes[0].pdfs[0]
    const domaine = domaineDeFiche(meta.domaine, meta.niveaux)
    const { famille, ...publie } = meta
    const entree: Entree = {
      ...publie,
      usage: usageDe(meta.genre),
      nbPages: premier.nbPages, nbVariantes: r.variantes.length, taillePdf: premier.taille, miniature: r.miniature,
      variantes: r.variantes, voisines: [],
      recherche: texteDeRecherche(meta, [
        ...Object.values(domaine.nom), ...meta.competences.map(k => k.libelle), ...Object.values(meta.descriptionLongue),
      ]),
    }
    return { entree, famille }
  })

  // tri stable : domaine, puis usage (apprendre d'abord), puis ordre des registres
  const trie = base.map((b, i) => ({ ...b, i })).sort((a, b) =>
    rangDomaine(a.entree.domaine) - rangDomaine(b.entree.domaine)
    || USAGES.indexOf(a.entree.usage) - USAGES.indexOf(b.entree.usage) || a.i - b.i)
  const entrees = trie.map(t => t.entree)
  const famille = new Map(trie.map(t => [t.entree.slug, t.famille]))
  for (const e of entrees) e.voisines = voisinesDe(e, famille, entrees)

  const classes = NIVEAUX.filter(n => entrees.some(e => e.niveaux.includes(n)))
  const domaines = [...new Set(entrees.map(e => e.domaine))]
    .map(id => domaineDeFiche(id, NIVEAUX.filter(n => entrees.some(e => e.domaine === id && e.niveaux.includes(n)))))
    .sort((a, b) => a.rang - b.rang)
  const langues = [...new Set(entrees.flatMap(e => e.langues))].sort((a, b) => (a === 'fr' ? -1 : b === 'fr' ? 1 : a.localeCompare(b)))
  const usages = USAGES.filter(u => entrees.some(e => e.usage === u))

  const index: IndexFiches = {
    version: VERSION_SCHEMA, genereLe, site,
    filtres: { classes, langues, usages, domaines },
    entrees: entrees.map(enEntreeIndex),
  }
  return { index, entrees }
}

