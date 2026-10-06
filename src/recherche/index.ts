// Index et moteur de recherche : purs, sans dépendance, lisibles par node. Chercher dans les ressources (exercices, affiches,
// fiches prêtes), les compétences du programme et les pages du site, avec un classement simple et prévisible.
//   const index = construireIndexRecherche(catalogue, competences, pages, langue)
//   const { groupes, masques } = chercher(index, 'fractions', { classes: ['ce1'], toutesLesClasses: false })
//
// Normalisation (`normaliser`) : minuscules, sans accents (« é » → « e », « ñ » → « n »), ligatures dépliées, « c'h » (lettre
// bretonne) écrit « ch », les autres apostrophes et tirets (droits, courbes, longs) et la ponctuation deviennent des espaces :
// « l’eau » → « l eau », « c’hwec’h » → « chwech ». Le texte et la requête passent par la même fonction.
//
// Classement : chaque mot de la requête doit être trouvé (ET). Un mot vaut 0 s'il est un mot entier du texte, 1 s'il en est le
// début, 2 s'il est ailleurs dans un mot (sous-chaîne) ; trouvé dans le titre il compte tel quel, ailleurs (description, domaine,
// compétences, classes) il vaut 3 de plus. Plus la somme est petite, mieux c'est ; à égalité, le titre (ordre alphabétique des
// titres normalisés), puis l'ordre de l'index.
import { texteDe } from '../ressources/textes.ts'
import { TYPES_RESSOURCE } from '../ressources/types.ts'
import type { Classe, Langue, Ressource, RessourceCompetence, RessourcePage, TypeRessource } from '../ressources/types.ts'
import { LANGUE_SOURCE, LANGUES } from '../langues/registre.ts'
import { lireFeuille } from '../langues/traduire.ts'
import { competenceDe, domaineDe } from '../data/programme.ts'

/** Minuscules, sans accents ; apostrophes, tirets et ponctuation en espaces ; espaces simples ; « c'h » → « ch ». */
export function normaliser(texte: string): string {
  return texte.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '')
    .replace(/œ/g, 'oe').replace(/æ/g, 'ae')
    .replace(/c['’‘ʼ`´]h/g, 'ch')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim()
}

/** Une ressource prête à chercher. */
export interface EntreeRecherche {
  readonly id: string
  readonly type: TypeRessource
  /** titre dans la langue de l'index */
  readonly titre: string
  readonly classes: readonly Classe[]
  readonly route: string
  readonly titreNormalise: string
  /** titre, description, domaine, compétences et classes, normalisés */
  readonly texteNormalise: string
}

/** Le nom d'un domaine dans une langue (section `domaines` de l'interface) ; le nom du programme à défaut. */
function nomDomaine(id: string, langue: Langue): string {
  const nom = lireFeuille(LANGUES[langue].textes, `domaines.${id}`) ?? lireFeuille(LANGUES[LANGUE_SOURCE].textes, `domaines.${id}`)
  return typeof nom === 'string' ? nom : domaineDe(id)?.court ?? ''
}

/**
 * L'index de recherche, dans l'ordre des arguments. Le texte cherché contient la langue de l'interface ET le français (on
 * trouve « fractions » en breton comme en français). Les compétences et les pages viennent de `ressourcesCompetences()` et de la
 * table des routes.
 */
export function construireIndexRecherche(
  catalogue: readonly Ressource[], competences: readonly RessourceCompetence[], pages: readonly RessourcePage[], langue: Langue,
): readonly EntreeRecherche[] {
  const langues: Langue[] = [...new Set<Langue>([langue, LANGUE_SOURCE])]
  return [...catalogue, ...competences, ...pages].map(r => {
    const titre = texteDe(r.titre, langue)
    const domaine = 'domaine' in r ? langues.map(l => nomDomaine(r.domaine, l)) : []
    const libelles = r.type === 'competence' ? [] : r.competences.map(k => competenceDe(k)?.libelle ?? '')
    const texte = [...langues.flatMap(l => [texteDe(r.titre, l), r.description ? texteDe(r.description, l) : '']), ...domaine, ...libelles, ...r.classes]
    return { id: r.id, type: r.type, titre, classes: r.classes, route: r.route, titreNormalise: normaliser(titre), texteNormalise: normaliser(texte.join(' ')) }
  })
}

/** Les résultats d'un type, du meilleur au moins bon. */
export interface GroupeResultats {
  readonly type: TypeRessource
  readonly resultats: readonly EntreeRecherche[]
  /** résultats de ce type cachés par le filtre de classe */
  readonly masques: number
}

export interface ResultatsRecherche {
  /** un groupe par type qui a des résultats visibles, dans l'ordre de TYPES_RESSOURCE */
  readonly groupes: readonly GroupeResultats[]
  /** tous types confondus : résultats cachés par le filtre de classe (« + 4 dans les autres classes ») */
  readonly masques: number
}

export interface OptionsRecherche {
  /** classes courantes : seuls les résultats de ces classes (ou sans classe : une page) sont montrés */
  readonly classes: readonly Classe[]
  /** vrai : aucun filtre de classe (« toutes les classes ») */
  readonly toutesLesClasses: boolean
}

/** 0 : mot entier ; 1 : début de mot ; 2 : sous-chaîne ; `null` : absent. `texte` est normalisé. */
function rang(texte: string, mot: string): number | null {
  const entourage = ` ${texte} `
  if (entourage.includes(` ${mot} `)) return 0
  if (entourage.includes(` ${mot}`)) return 1
  return texte.includes(mot) ? 2 : null
}

/** Le score d'une entrée pour les mots de la requête (plus petit = meilleur), `null` si un mot manque. */
function score(e: EntreeRecherche, mots: readonly string[]): number | null {
  let total = 0
  for (const mot of mots) {
    const dansTitre = rang(e.titreNormalise, mot)
    const ailleurs = dansTitre === null ? rang(e.texteNormalise, mot) : null
    if (dansTitre !== null) total += dansTitre
    else if (ailleurs !== null) total += ailleurs + 3
    else return null
  }
  return total
}

/** Cherche `requete` dans l'index : résultats groupés par type, classés, filtrés par classe (voir l'en-tête). Requête vide : rien. */
export function chercher(index: readonly EntreeRecherche[], requete: string, { classes, toutesLesClasses }: OptionsRecherche): ResultatsRecherche {
  const mots = normaliser(requete).split(' ').filter(Boolean)
  if (!mots.length) return { groupes: [], masques: 0 }
  const filtrer = !toutesLesClasses && classes.length > 0
  const trouves = index.flatMap((e, ordre) => {
    const s = score(e, mots)
    return s === null ? [] : [{ e, s, ordre, visible: !filtrer || e.classes.length === 0 || e.classes.some(c => classes.includes(c)) }]
  })
  const groupes = TYPES_RESSOURCE.flatMap((type): GroupeResultats[] => {
    const duType = trouves.filter(t => t.e.type === type)
    const visibles = duType.filter(t => t.visible)
      .sort((a, b) => a.s - b.s || (a.e.titreNormalise < b.e.titreNormalise ? -1 : a.e.titreNormalise > b.e.titreNormalise ? 1 : 0) || a.ordre - b.ordre)
    return visibles.length ? [{ type, resultats: visibles.map(t => t.e), masques: duType.length - visibles.length }] : []
  })
  return { groupes, masques: trouves.filter(t => !t.visible).length }
}
