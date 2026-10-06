// Le catalogue des ressources : UNE liste typée, dérivée des registres (exercices, affiches), de l'index des fiches prêtes
// et du programme. Toutes les pages de la structure (matière, programme, compétence, fiches prêtes) et la recherche la lisent.
// Pur : aucune entrée-sortie, aucune dépendance à Vue ; les registres, l'index et le site sont des arguments (testables avec de
// petits jeux de données). `useRessources.ts` charge les vrais et appelle `construireCatalogue`.
//
// Règles de dérivation
//   - Une ressource par exercice (badges `jeu` si l'exercice se joue, `imprimable` toujours : son générateur de fiche), une par
//     affiche (toutes ses variantes : classes et compétences en union), une par fiche prête (entrée de l'index). `id` stable :
//     `exercice:<id>`, `affiche:<id>`, `fiche:<slug>`. Une ressource n'y est qu'une fois (premier arrivé).
//   - Classes : les niveaux de l'exercice, les classes des variantes de l'affiche, les niveaux de la fiche.
//   - Domaine et matière : on part des compétences. Si toutes sont d'un même domaine, la ressource y est rangée. Sinon (un
//     exercice qui travaille aussi un autre domaine : `autresDomaines`), c'est le domaine déclaré par la ressource, à défaut le
//     domaine de la première compétence. La matière est celle du domaine (`programme.ts`). Une fiche sans domaine (hors
//     programme : culture générale) n'entre pas au catalogue : elle n'a pas de place dans une page de domaine.
//   - Compétences d'une fiche prête : l'index n'en porte pas ; on les retrouve par le slug dans les registres (le slug d'un
//     exercice est `exercices-<id>-<classe>[-<fiche>]`, celui d'une affiche `affiche-<id>-<variante>`, suivis de `-<langue>`).
//     Une fiche inconnue des registres (écrite à la main) n'a pas de compétence.
//   - Langues : celles du contenu (exercice de français : le français seul ; sinon les langues de ses textes ; affiche : ses
//     langues ; fiche : celles de l'entrée), restreintes à celles du site (interface et langues régionales). Une ressource sans
//     aucune langue du site (ou, pour une fiche, dont une langue n'est pas au site) n'y entre pas.
//   - Exemples : jamais hors développement (`enDeveloppement`). Un exemple est une entrée marquée `exemple`, ou rangée dans un
//     domaine fictif (`devSeulement`).
//   - Textes : le titre d'un exercice est `<section>.titre` de l'interface, où la section porte l'identifiant en camelCase
//     (`exemple-corpus` → `exempleCorpus`, comme `npm run nouveau` la crée) ; sa description `<section>.description`, si elle
//     existe (sinon aucune). Une section manquante est une erreur de déclaration (levée ici). Affiche : son `titre` d'affiche,
//     dans chaque langue ; fiche : titre et description de l'index.
import { NIVEAUX } from '../data/classes.ts'
import { COMPETENCES, COMPETENCES_EXEMPLE, competenceDe, domaineDe } from '../data/programme.ts'
import { slugDe, languesDuSite } from '../affiches/catalogue.ts'
import type { ModuleAffiche } from '../affiches/types.ts'
import { traducteurAffiche } from '../affiches/textes.ts'
import type { EntreeRegistre } from '../exercices/index.ts'
import { LANGUE_SOURCE, LANGUES, CODES, estLangue } from '../langues/registre.ts'
import { languesDe } from '../langues/catalogue.ts'
import { lireFeuille } from '../langues/traduire.ts'
import type { CleTexte } from '../langues/traduire.ts'
import type { Site } from '../sites.ts'
import { aUnJeu } from '../noyau/reglages.ts'
import type { IndexFiches } from '../telechargements/types.ts'
import type { Texte } from '../telechargements/types.ts'
import { EMOJI_DOMAINE } from './emojis.ts'
import type { Classe, CompetenceId, DomaineId, Langue, RessourceAffiche, RessourceCompetence, RessourceDeContenu, RessourceExercice, RessourceFiche } from './types.ts'

/** Ce que lit `construireCatalogue`. */
export interface SourcesCatalogue {
  /** le registre des exercices (exemples compris : ils portent `exemple: true`) */
  exercices: readonly EntreeRegistre[]
  /** le registre des affiches (exemples compris : leur domaine est fictif) */
  affiches: readonly ModuleAffiche[]
  /** l'index des fiches prêtes ; `null` s'il est absent ou illisible : le catalogue n'a alors que les exercices et les affiches */
  fiches: IndexFiches | null
  /** le site : ses langues filtrent les ressources */
  site: Pick<Site, 'languesInterface' | 'languesRegionales'>
  /** les exemples n'entrent qu'en développement */
  enDeveloppement: boolean
}

/** `exemple-corpus` → `exempleCorpus` : le nom de la section de textes d'un exercice. */
const sectionDe = (id: string): string => id.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())

const union = <T>(listes: readonly (readonly T[])[]): T[] => [...new Set(listes.flat())]
const classesDans = (classes: readonly Classe[]): Classe[] => NIVEAUX.filter(n => classes.includes(n))

/** Le domaine d'une ressource d'après ses compétences (voir « Règles de dérivation ») ; `null` si rien ne le dit. */
export function domaineDes(competences: readonly CompetenceId[], declare: DomaineId | null): DomaineId | null {
  const domaines = union([competences.flatMap(k => competenceDe(k)?.domaine ?? [])])
  return domaines.length === 1 ? domaines[0] : declare ?? domaines[0] ?? null
}

const estExemple = (declare: boolean, domaine: DomaineId): boolean => declare || !!domaineDe(domaine)?.devSeulement

/** Les langues d'une ressource qui sont celles du site, dans l'ordre du registre. */
const languesDuSiteParmi = (langues: readonly string[], site: SourcesCatalogue['site']): Langue[] => {
  const siteLangues = languesDuSite(site)
  return CODES.filter(l => langues.includes(l) && siteLangues.includes(l))
}

function ressourceExercice({ definition, textes, exemple }: EntreeRegistre, site: SourcesCatalogue['site']): RessourceExercice | null {
  const classes = NIVEAUX.filter(n => definition.niveaux[n])
  const competences = union(classes.map(n => definition.niveaux[n]?.competences ?? []))
  const domaine = domaineDes(competences, definition.domaine) ?? definition.domaine
  const langues = languesDuSiteParmi(definition.contenu === 'fr' ? [LANGUE_SOURCE] : languesDe(textes), site)
  if (!langues.length) return null
  const section = sectionDe(definition.id)
  const cle = (champ: string): string => `${section}.${champ}`
  if (typeof lireFeuille(LANGUES[LANGUE_SOURCE].textes, cle('titre')) !== 'string') {
    throw new Error(`exercice « ${definition.id} » : le texte « ${cle('titre')} » manque à l'interface (src/langues/fr/textes/${section}.ts)`)
  }
  const description = typeof lireFeuille(LANGUES[LANGUE_SOURCE].textes, cle('description')) === 'string' ? { cle: cle('description') as CleTexte } : null
  return {
    id: `exercice:${definition.id}`, type: 'exercice', titre: { cle: cle('titre') as CleTexte }, description,
    emoji: EMOJI_DOMAINE[domaine], matiere: domaineDe(domaine)?.matiere ?? 'monde', domaine, classes, competences,
    badges: { jeu: aUnJeu(definition), imprimable: true }, usage: 'sentrainer', langues, route: definition.route,
    exemple: estExemple(exemple === true, domaine),
  }
}

function ressourceAffiche({ definition: d, textes }: ModuleAffiche, site: SourcesCatalogue['site']): RessourceAffiche | null {
  const variantes = Object.values(d.variantes)
  const classes = classesDans(variantes.flatMap(v => v.classes))
  const competences = union(variantes.map(v => v.competences))
  const domaine = domaineDes(competences, d.domaine) ?? d.domaine
  const langues = languesDuSiteParmi(d.langues, site)
  if (!langues.length) return null
  // le titre de l'affiche dans chaque langue (une langue sans texte retombe sur le français : voir traducteurAffiche)
  const texte = Object.fromEntries(CODES.map(l => [l, traducteurAffiche(textes, l)('titre')])) as Texte
  return {
    id: `affiche:${d.id}`, type: 'affiche', titre: { texte }, description: null,
    emoji: EMOJI_DOMAINE[domaine], matiere: domaineDe(domaine)?.matiere ?? 'monde', domaine, classes, competences,
    badges: { jeu: false, imprimable: true }, usage: 'apprendre', langues, route: `${d.route}?affiche=${d.id}`,
    exemple: estExemple(false, domaine),
  }
}

/** Les compétences de chaque fiche prête des registres, par slug sans suffixe de langue. */
function competencesParSlug(exercices: readonly EntreeRegistre[], affiches: readonly ModuleAffiche[]): Map<string, readonly CompetenceId[]> {
  const table = new Map<string, readonly CompetenceId[]>()
  for (const { definition: d } of exercices) {
    for (const n of NIVEAUX.filter(c => d.niveaux[c])) {
      table.set(`exercices-${d.id}-${n}`, d.niveaux[n]?.competences ?? [])
      for (const f of d.fiches.filter(x => x.niveau === n)) table.set(`exercices-${d.id}-${n}-${f.id}`, [f.competence])
    }
  }
  for (const { definition: d } of affiches) {
    for (const [id, v] of Object.entries(d.variantes)) table.set(slugDe(d, id, [LANGUE_SOURCE]), v.competences)
  }
  return table
}

function ressourcesFiches(index: IndexFiches, table: ReadonlyMap<string, readonly CompetenceId[]>, site: SourcesCatalogue['site']): RessourceFiche[] {
  const siteLangues = languesDuSite(site)
  const competencesDe = (slug: string): readonly CompetenceId[] => {
    // `-br`, `-fr-br` : on retire les suffixes de langue jusqu'à trouver le slug des registres
    for (let s = slug; ;) {
      const trouvees = table.get(s)
      const suffixe = /-([a-z]+)$/.exec(s)
      if (trouvees) return trouvees
      if (!suffixe || !estLangue(suffixe[1])) return []
      s = s.slice(0, -suffixe[0].length)
    }
  }
  return index.entrees.flatMap((e): RessourceFiche[] => {
    const competences = competencesDe(e.slug)
    const domaine = domaineDes(competences, e.domaine)
    const langues = CODES.filter(l => e.langues.includes(l))
    if (!domaine || !langues.length || !e.langues.every(l => siteLangues.includes(l))) return []
    return [{
      id: `fiche:${e.slug}`, type: 'fiche', slug: e.slug, parent: e.parent, titre: { texte: e.titre }, description: { texte: e.description },
      emoji: EMOJI_DOMAINE[domaine], matiere: domaineDe(domaine)?.matiere ?? 'monde', domaine, classes: classesDans(e.niveaux), competences,
      badges: { jeu: false, imprimable: true }, usage: e.usage, langues, route: `/telechargements/${e.slug}/`,
      exemple: estExemple(e.exemple, domaine),
    }]
  })
}

/**
 * Le catalogue : les exercices, puis les affiches, puis les fiches prêtes, chacun dans l'ordre de sa source, sans doublon
 * (un `id` n'y est qu'une fois) ; sans les exemples hors développement.
 */
export function construireCatalogue({ exercices, affiches, fiches, site, enDeveloppement }: SourcesCatalogue): readonly RessourceDeContenu[] {
  const toutes: (RessourceDeContenu | null)[] = [
    ...exercices.map(e => ressourceExercice(e, site)),
    ...affiches.map(a => ressourceAffiche(a, site)),
    ...(fiches ? ressourcesFiches(fiches, competencesParSlug(exercices, affiches), site) : []),
  ]
  const uniques = new Map<string, RessourceDeContenu>()
  for (const r of toutes) if (r && (enDeveloppement || !r.exemple) && !uniques.has(r.id)) uniques.set(r.id, r)
  return [...uniques.values()]
}

/**
 * Les compétences du programme comme ressources à chercher (`/competence/<id>`), dans l'ordre du programme ; les compétences
 * fictives des exemples seulement si `enDeveloppement`. Le libellé est le texte officiel (en français, quelle que soit la langue).
 */
export function ressourcesCompetences(enDeveloppement: boolean): readonly RessourceCompetence[] {
  return [...COMPETENCES, ...COMPETENCES_EXEMPLE].flatMap((k): RessourceCompetence[] => {
    const domaine = domaineDe(k.domaine)
    if (!domaine || (!enDeveloppement && (k.devSeulement || domaine.devSeulement))) return []
    return [{
      id: `competence:${k.id}`, type: 'competence', titre: { texte: { fr: k.libelle } }, description: null,
      emoji: EMOJI_DOMAINE[domaine.id as DomaineId], matiere: domaine.matiere, domaine: domaine.id as DomaineId,
      classes: classesDans(k.niveaux), competences: [k.id as CompetenceId], langues: [LANGUE_SOURCE], route: `/competence/${k.id}`,
      exemple: !!k.devSeulement || !!domaine.devSeulement,
    }]
  })
}
