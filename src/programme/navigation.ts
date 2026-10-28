// Se repérer dans le programme depuis une compétence : sa place dans le domaine pour une classe, les autres classes, et le texte
// officiel dont elle vient (ses voisines dans le PDF). Pur (lisible par node) : les données viennent de src/data/programme.ts.
import { NIVEAUX } from '../data/classes.ts'
import type { Classe } from '../data/classes.ts'
import { COMPETENCES, COMPETENCES_EXEMPLE, SOURCES, competencesDu } from '../data/programme.ts'
import type { Competence, SourceId } from '../data/programme.ts'

/** La classe dans laquelle on lit une compétence : la première classe demandée où elle existe, sinon son année d'introduction. */
export function classeDeLecture(competence: Competence, demandees: readonly Classe[]): Classe {
  const demandee = demandees.find(c => competence.niveaux.includes(c))
  return demandee ?? competence.niveaux[0]
}

export interface Position {
  classe: Classe
  /** toutes les compétences du domaine pour cette classe, dans l'ordre du programme */
  domaine: readonly Competence[]
  /** rang de la compétence (à partir de 1) dans `domaine` */
  rang: number
  precedente: Competence | null
  suivante: Competence | null
}

/** Sa place parmi les compétences du même domaine dans une classe. */
export function positionDansLeDomaine(competence: Competence, classe: Classe): Position {
  const domaine = competencesDu(competence.domaine, classe)
  const index = domaine.findIndex(k => k.id === competence.id)
  return {
    classe,
    domaine,
    rang: index + 1,
    precedente: index > 0 ? domaine[index - 1] : null,
    suivante: index >= 0 && index < domaine.length - 1 ? domaine[index + 1] : null,
  }
}

/** Les compétences d'un domaine qu'une classe INTRODUIT (pas celles qu'elle reprend). */
export interface IntroduitesEn {
  classe: Classe
  competences: readonly Competence[]
}

function introduitesEn(domaine: string, classe: Classe): IntroduitesEn {
  return { classe, competences: competencesDu(domaine, classe).filter(k => k.niveaux[0] === classe) }
}

export interface AutresClasses {
  /** la classe la plus proche avant `classe` où le domaine introduit quelque chose */
  avant: IntroduitesEn | null
  /** la classe la plus proche après */
  apres: IntroduitesEn | null
}

/** Ce que le même domaine introduit juste avant et juste après une classe. */
export function dansLesAutresClasses(domaine: string, classe: Classe): AutresClasses {
  const rang = NIVEAUX.indexOf(classe)
  const avant = NIVEAUX.slice(0, rang).reverse().map(c => introduitesEn(domaine, c)).find(g => g.competences.length > 0)
  const apres = NIVEAUX.slice(rang + 1).map(c => introduitesEn(domaine, c)).find(g => g.competences.length > 0)
  return { avant: avant ?? null, apres: apres ?? null }
}

/** Le nombre de ressources du catalogue pour chaque compétence (une seule passe). */
export function nombreDeRessources(catalogue: readonly { competences: readonly string[] }[]): ReadonlyMap<string, number> {
  const nombres = new Map<string, number>()
  for (const ressource of catalogue) {
    for (const id of ressource.competences) nombres.set(id, (nombres.get(id) ?? 0) + 1)
  }
  return nombres
}

// ── Le texte officiel ──

const TOUTES: readonly Competence[] = [...COMPETENCES, ...COMPETENCES_EXEMPLE]

/** Les compétences d'un texte officiel, dans l'ordre du PDF (page), puis du programme. */
export function competencesDuTexte(source: SourceId): Competence[] {
  const dansLeTexte = TOUTES.filter(k => k.source.texte === source)
  return dansLeTexte
    .map((k, ordre) => ({ k, ordre }))
    .sort((a, b) => a.k.source.page - b.k.source.page || a.ordre - b.ordre)
    .map(({ k }) => k)
}

export interface DansLeTexte {
  source: SourceId
  page: number
  /** les autres compétences de la même page du PDF */
  surLaPage: readonly Competence[]
  precedente: Competence | null
  suivante: Competence | null
}

/** Où une compétence se trouve dans son texte officiel : sa page, ses voisines de page, la précédente et la suivante dans le PDF. */
export function placeDansLeTexte(competence: Competence): DansLeTexte {
  const texte = competencesDuTexte(competence.source.texte)
  const index = texte.findIndex(k => k.id === competence.id)
  return {
    source: competence.source.texte,
    page: competence.source.page,
    surLaPage: texte.filter(k => k.source.page === competence.source.page && k.id !== competence.id),
    precedente: index > 0 ? texte[index - 1] : null,
    suivante: index >= 0 && index < texte.length - 1 ? texte[index + 1] : null,
  }
}

export interface PageDeTexte {
  page: number
  /** l'adresse du PDF à cette page */
  url: string
  competences: readonly Competence[]
}

export interface TexteOfficiel {
  source: SourceId
  titre: string
  /** page du site de l'éducation nationale qui présente le texte (certains textes n'en ont pas) */
  presentation: string | null
  /** les pages du PDF où une compétence du site s'appuie sur le texte */
  pages: readonly PageDeTexte[]
}

/** La page de présentation d'un texte, s'il en a une. */
function presentationDe(source: SourceId): string | null {
  const donnees: Readonly<Record<string, string>> = SOURCES[source]
  return donnees.page ?? null
}

/** Tous les textes officiels cités, avec, page du PDF par page, les compétences qui s'y appuient. */
export function textesOfficiels(): TexteOfficiel[] {
  const ids = (Object.keys(SOURCES) as SourceId[]).filter(id => competencesDuTexte(id).length > 0)
  return ids.map(source => {
    const pages = new Map<number, Competence[]>()
    for (const k of competencesDuTexte(source)) pages.set(k.source.page, [...(pages.get(k.source.page) ?? []), k])
    return {
      source,
      titre: SOURCES[source].titre,
      presentation: presentationDe(source),
      pages: [...pages].map(([page, competences]) => ({ page, url: competences[0].source.url, competences })),
    }
  })
}
