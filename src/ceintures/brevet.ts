// Le brevet papier d'une ceinture : un assemblage (src/impression/assemblage.ts). Un en-tête de ceinture et sa consigne, le fragment de la fiche de l'EXERCICE de la piste
// (ses vrais `questionsFiche` et `fiche`, avec les réglages de la ceinture), le cadre du résultat, et le corrigé de l'exercice. Pur (lisible par node). plans/15-ceintures.md §19.
//   brevetPapier(demande) → le document HTML complet
//   tirageDuBrevet(demande) → ce que la fiche contient (réglages de l'exercice, nombre de questions, seuil) : pour les tests et l'aperçu
import { estLangue, LANGUE_SOURCE } from '../langues/registre.ts'
import { traduire } from '../langues/traduire.ts'
import { reglagesDuNiveau } from '../noyau/reglages.ts'
import { assemblerFiches } from '../impression/assemblage.ts'
import { estAssemblable, fragmentDeExercice } from '../exercices/fragment.ts'
import type { ModuleQuelconque } from '../exercices/index.ts'
import type { Fragment } from '../impression/fragment.ts'
import type { Classe } from '../data/classes.ts'
import { blocsDe, ceintureDisponible } from './pistes.ts'
import type { Piste } from './pistes.ts'
import { nbCeinturesDe } from './reglages.ts'
import { CSS_CEINTURES, ceinturesDe, enteteBrevetHtml, resultatBrevetHtml } from './supports.ts'
import type { DonneesSupport } from './supports.ts'
import type { ReglagesCeintures } from './types.ts'

export interface DemandeBrevet {
  /** les exercices du registre (le brevet y prend ceux de ses blocs) */
  modules: readonly ModuleQuelconque[]
  piste: Piste
  /** 0 pour la première ceinture */
  indice: number
  niveau: Classe
  graine: number
  langue: string
  /** les réglages communs des ceintures (palette, dessin, seuil, nombre de questions) */
  ceintures: ReglagesCeintures
  /** ParamsFiche.extensions : ce que les extensions donnent à la fiche de l'exercice */
  extensions?: Readonly<Record<string, unknown>>
  /** réglages de l'exercice de la piste qui l'emportent sur ceux de la ceinture (les tables choisies, jusqu'où multiplier…) */
  reglages?: Readonly<Record<string, unknown>>
  /** polices choisies dans « Sur la fiche » */
  police?: string
  cssPolices?: string
}

/** Un bloc du brevet : le fragment de la fiche d'un exercice. */
export interface BlocTire {
  exercice: string
  fragment: Fragment
  /** réglages de l'exercice utilisés (défauts du niveau, ceinture, surcharges) */
  config: Readonly<Record<string, unknown>>
  /** questions réellement posées dans ce bloc (au plus le nombre voulu : un exercice peut en tirer moins) */
  nbQuestions: number
}

/** Ce que contient un brevet : ses blocs, le total des questions et le seuil. */
export interface TirageBrevet {
  blocs: BlocTire[]
  nbQuestions: number
  /** « {bonnes} bonnes réponses sur n » : le seuil des réglages communs, arrondi au-dessus */
  bonnes: number
}

/** Les questions d'un tirage (un tableau, ou un objet qui a `questions`) ; `null` si on ne sait pas le lire. */
function questionsDuTirage(tirage: unknown): unknown[] | null {
  if (Array.isArray(tirage)) return tirage
  const q = (tirage as { questions?: unknown } | null)?.questions
  return Array.isArray(q) ? q : null
}

/** Le tirage coupé à ses `n` premières questions. */
function couper(tirage: unknown, n: number): unknown {
  if (Array.isArray(tirage)) return tirage.slice(0, n)
  const questions = questionsDuTirage(tirage)
  if (!questions) throw new Error('brevet : le tirage de la fiche de l’exercice n’a pas de questions à couper')
  return { ...(tirage as object), questions: questions.slice(0, n) }
}

/**
 * Un exercice peut-il faire un bloc de brevet dans cette classe ? Sa fiche doit se rendre ici, et son tirage avoir des questions que l'on peut compter et couper (un tableau, ou `questions`) :
 * les fiches en plusieurs parties (monnaie : compter, puis entourer) ou sans questions (écriture) ne conviennent pas.
 */
export function brevetPossible(module: ModuleQuelconque, niveau: Classe): boolean {
  if (!estAssemblable(module) || !(niveau in (module.definition.niveaux as object))) return false
  let compte = 0
  try {
    fragmentDeExercice(module, { niveau, graine: 1, langue: LANGUE_SOURCE, ajuster: tirage => { compte = questionsDuTirage(tirage)?.length ?? 0; return tirage } })
  } catch {
    return false
  }
  return compte > 0
}

/** Le plus petit choix offert par l'exercice pour `nbFiche` qui contient au moins `n` questions (à défaut, le plus grand). */
function nbFicheOffert(m: ModuleQuelconque, niveau: Classe, n: number): number | null {
  const d = m.definition as { options?: Record<string, readonly unknown[]>, niveaux: Record<string, { options?: Record<string, readonly unknown[]> }> }
  const offerts = (d.niveaux[niveau]?.options?.nbFiche ?? d.options?.nbFiche ?? []).filter((v): v is number => typeof v === 'number' && v > 0).sort((a, b) => a - b)
  if (!offerts.length) return null
  return offerts.find(v => v >= n) ?? offerts[offerts.length - 1]
}

/** Le total des questions partagé entre `nb` blocs : parts égales, les premiers blocs prennent le reste. */
export const partsEgales = (total: number, nb: number): number[] => Array.from({ length: nb }, (_, k) => Math.floor(total / nb) + (k < total % nb ? 1 : 0))

export function tirageDuBrevet(d: DemandeBrevet): TirageBrevet {
  const ceinture = d.piste.ceintures[d.indice]
  const classesDe = (exercice: string): Classe[] => Object.keys(d.modules.find(m => m.definition.id === exercice)?.definition.niveaux ?? {}) as Classe[]
  // une ceinture au-delà de celles que la palette et le réglage montrent n'existe pas (le choix de la page ne les propose pas)
  const nbMontrees = nbCeinturesDe(d.ceintures, d.piste.ceintures.length)
  if (d.indice >= nbMontrees) throw new Error(`brevet : la ceinture ${d.indice + 1} n’existe pas avec cette palette (${nbMontrees} ceintures)`)
  if (!ceintureDisponible(d.piste, d.indice, d.niveau, classesDe)) throw new Error(`brevet : la ceinture ${d.indice + 1} de la piste « ${d.piste.id} » n’existe pas en ${d.niveau}`)
  const blocs = blocsDe(d.piste, d.indice)
  const total = ceinture.questions ?? d.ceintures.questions
  const parts = partsEgales(total, blocs.length)
  const tires = blocs.map((bloc, k): BlocTire => {
    const module = d.modules.find(m => m.definition.id === bloc.exercice)
    if (!module) throw new Error(`brevet : l’exercice « ${bloc.exercice} » n’est pas au registre`)
    const voulues = bloc.questions ?? parts[k]
    // les surcharges (les tables choisies…) ne valent que pour l'exercice de la piste
    const surcharges = bloc.exercice === d.piste.exercice ? d.reglages : undefined
    const demande: Record<string, unknown> = { ...(bloc.reglages?.(d.niveau) ?? {}), ...surcharges }
    // une fiche à nombre de calculs à choisir (calcul mental) : au moins autant que de questions voulues
    if (!('nbFiche' in demande)) {
      const nbFiche = nbFicheOffert(module, d.niveau, voulues)
      if (nbFiche !== null) demande.nbFiche = nbFiche
    }
    const config = reglagesDuNiveau(module.definition, { ...demande, niveau: d.niveau }) as Record<string, unknown>
    let nb = 0
    const fragment = fragmentDeExercice(module, {
      niveau: d.niveau, graine: d.graine, langue: d.langue, reglages: demande, extensions: d.extensions,
      ajuster: tirage => {
        const coupe = couper(tirage, voulues)
        nb = questionsDuTirage(coupe)!.length
        return coupe
      },
    })
    return { exercice: bloc.exercice, fragment, config, nbQuestions: nb }
  })
  const nbQuestions = tires.reduce((somme, b) => somme + b.nbQuestions, 0)
  return { blocs: tires, nbQuestions, bonnes: Math.ceil((nbQuestions * d.ceintures.seuil) / 100) }
}

/** Le titre de l'exercice d'une piste, dans la langue (section de l'interface de l'exercice, son identifiant en camelCase). */
const titreDeLExercice = (l: string, exercice: string): string => (traduire as (l: string, c: string) => string)(l, `${exercice.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())}.titre`)

export function brevetPapier(d: DemandeBrevet): string {
  const l = estLangue(d.langue) ? d.langue : LANGUE_SOURCE
  const i = (cle: string, params?: Record<string, string | number>): string => (traduire as (l: string, c: string, p?: unknown) => string)(l, `ceintures.${cle}`, params)
  const { blocs, nbQuestions, bonnes } = tirageDuBrevet(d)
  const ceinture = d.piste.ceintures[d.indice]
  const donnees: DonneesSupport = {
    // le titre de la piste : le sien, ou celui de son exercice (ou du premier bloc)
    titre: d.piste.titre ?? titreDeLExercice(l, d.piste.exercice ?? blocs[0].exercice),
    // un nom par ceinture de la piste (les objectifs ne sont pas écrits sur le brevet)
    ceintures: ceinturesDe(d.piste.ceintures.map(() => ''), couleur => i(`ceinture.${couleur.id}`), d.ceintures),
    reglages: d.ceintures,
    libelles: { prenom: '', classe: '', date: '', signature: '', livret: '', diplome: '', passeport: '', decerne: '', commentFaire: '' },
  }
  const consigne = ceinture.duree
    ? i('brevet.consigneDuree', { n: nbQuestions, minutes: ceinture.duree, bonnes })
    : i('brevet.consigne', { n: nbQuestions, bonnes })
  // un seul bloc : le titre de l'exercice est déjà dans l'en-tête ; plusieurs : chaque bloc (et son corrigé) porte le titre de son exercice
  const seul = blocs.length === 1
  return assemblerFiches({
    titre: `${i('brevet.titre')} — ${i(`ceinture.${donnees.ceintures[d.indice].couleur.id}`)}`,
    h1: null, langue: l, police: d.police, cssPolices: d.cssPolices, corrige: traduire(l, 'communs.corrige'),
    avant: enteteBrevetHtml(donnees, d.indice, i('brevet.titre'), consigne),
    apres: resultatBrevetHtml({ resultat: i('brevet.resultat'), validee: i('brevet.validee'), pasEncore: i('brevet.pasEncore') }, nbQuestions),
    css: CSS_CEINTURES,
    blocs: blocs.map(b => ({ sansTitre: seul, titre: titreDeLExercice(l, b.exercice), fragment: b.fragment })),
  })
}
