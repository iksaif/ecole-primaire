// Le brevet papier d'une ceinture : un assemblage (src/impression/assemblage.ts). Un en-tête de ceinture et sa consigne, le fragment de la fiche de l'EXERCICE de la piste
// (ses vrais `questionsFiche` et `fiche`, avec les réglages de la ceinture), le cadre du résultat, et le corrigé de l'exercice. Pur (lisible par node). plans/15-ceintures.md §19.
//   brevetPapier(demande) → le document HTML complet
//   tirageDuBrevet(demande) → ce que la fiche contient (réglages de l'exercice, nombre de questions, seuil) : pour les tests et l'aperçu
import { estLangue, LANGUE_SOURCE } from '../langues/registre.ts'
import { traduire } from '../langues/traduire.ts'
import { reglagesDuNiveau } from '../noyau/reglages.ts'
import { assemblerFiches } from '../impression/assemblage.ts'
import { fragmentDeExercice } from '../exercices/fragment.ts'
import type { ModuleQuelconque } from '../exercices/index.ts'
import type { Fragment } from '../impression/fragment.ts'
import type { Classe } from '../data/classes.ts'
import { ceintureDisponible } from './pistes.ts'
import type { Piste } from './pistes.ts'
import { nbCeinturesDe } from './reglages.ts'
import { CSS_CEINTURES, ceinturesDe, enteteBrevetHtml, resultatBrevetHtml } from './supports.ts'
import type { DonneesSupport } from './supports.ts'
import type { ReglagesCeintures } from './types.ts'

export interface DemandeBrevet {
  module: ModuleQuelconque
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
  /** réglages de l'exercice qui l'emportent sur ceux de la ceinture (les tables choisies, jusqu'où multiplier…) */
  reglages?: Readonly<Record<string, unknown>>
  /** polices choisies dans « Sur la fiche » */
  police?: string
  cssPolices?: string
}

/** Ce que contient un brevet : le fragment de l'exercice, ses réglages et les nombres de l'en-tête. */
export interface TirageBrevet {
  fragment: Fragment
  /** réglages de l'exercice utilisés (défauts du niveau, ceinture, surcharges) */
  config: Readonly<Record<string, unknown>>
  /** questions réellement posées (au plus le nombre voulu : un exercice peut en tirer moins) */
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

/** Le plus petit choix offert par l'exercice pour `nbFiche` qui contient au moins `n` questions (à défaut, le plus grand). */
function nbFicheOffert(m: ModuleQuelconque, niveau: Classe, n: number): number | null {
  const d = m.definition as { options?: Record<string, readonly unknown[]>, niveaux: Record<string, { options?: Record<string, readonly unknown[]> }> }
  const offerts = (d.niveaux[niveau]?.options?.nbFiche ?? d.options?.nbFiche ?? []).filter((v): v is number => typeof v === 'number' && v > 0).sort((a, b) => a - b)
  if (!offerts.length) return null
  return offerts.find(v => v >= n) ?? offerts[offerts.length - 1]
}

export function tirageDuBrevet(d: DemandeBrevet): TirageBrevet {
  const ceinture = d.piste.ceintures[d.indice]
  const classes = Object.keys(d.module.definition.niveaux) as Classe[]
  if (!ceintureDisponible(d.piste, d.indice, d.niveau, classes)) throw new Error(`brevet : la ceinture ${d.indice + 1} de la piste « ${d.piste.id} » n’existe pas en ${d.niveau}`)
  // une ceinture au-delà de celles que la palette et le réglage montrent n'existe pas (le choix de la page ne les propose pas)
  if (d.indice >= nbCeinturesDe(d.ceintures, d.piste.ceintures.length)) throw new Error(`brevet : la ceinture ${d.indice + 1} n’existe pas avec cette palette (${nbCeinturesDe(d.ceintures, d.piste.ceintures.length)} ceintures)`)
  const voulues = ceinture.questions ?? d.ceintures.questions
  const demande: Record<string, unknown> = { ...(ceinture.reglages?.(d.niveau) ?? {}), ...d.reglages }
  // une fiche à nombre de calculs à choisir (calcul mental) : au moins autant que de questions voulues
  if (!('nbFiche' in demande)) {
    const nbFiche = nbFicheOffert(d.module, d.niveau, voulues)
    if (nbFiche !== null) demande.nbFiche = nbFiche
  }
  const config = reglagesDuNiveau(d.module.definition, { ...demande, niveau: d.niveau }) as Record<string, unknown>
  let nbQuestions = 0
  const fragment = fragmentDeExercice(d.module, {
    niveau: d.niveau, graine: d.graine, langue: d.langue, reglages: demande, extensions: d.extensions,
    ajuster: tirage => {
      const coupe = couper(tirage, voulues)
      nbQuestions = questionsDuTirage(coupe)!.length
      return coupe
    },
  })
  return { fragment, config, nbQuestions, bonnes: Math.ceil((nbQuestions * d.ceintures.seuil) / 100) }
}

/** Le titre de l'exercice d'une piste, dans la langue (section de l'interface de l'exercice, son identifiant en camelCase). */
const titreDeLExercice = (l: string, exercice: string): string => (traduire as (l: string, c: string) => string)(l, `${exercice.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())}.titre`)

export function brevetPapier(d: DemandeBrevet): string {
  const l = estLangue(d.langue) ? d.langue : LANGUE_SOURCE
  const i = (cle: string, params?: Record<string, string | number>): string => (traduire as (l: string, c: string, p?: unknown) => string)(l, `ceintures.${cle}`, params)
  const { fragment, nbQuestions, bonnes } = tirageDuBrevet(d)
  const ceinture = d.piste.ceintures[d.indice]
  const donnees: DonneesSupport = {
    titre: titreDeLExercice(l, d.piste.exercice ?? d.piste.id),
    // un nom par ceinture de la piste (les objectifs ne sont pas écrits sur le brevet)
    ceintures: ceinturesDe(d.piste.ceintures.map(() => ''), couleur => i(`ceinture.${couleur.id}`), d.ceintures),
    reglages: d.ceintures,
    libelles: { prenom: '', classe: '', date: '', signature: '', livret: '', diplome: '', passeport: '', decerne: '', commentFaire: '' },
  }
  const consigne = ceinture.duree
    ? i('brevet.consigneDuree', { n: nbQuestions, minutes: ceinture.duree, bonnes })
    : i('brevet.consigne', { n: nbQuestions, bonnes })
  return assemblerFiches({
    titre: `${i('brevet.titre')} — ${i(`ceinture.${donnees.ceintures[d.indice].couleur.id}`)}`,
    h1: null, langue: l, police: d.police, cssPolices: d.cssPolices, corrige: traduire(l, 'communs.corrige'),
    avant: enteteBrevetHtml(donnees, d.indice, i('brevet.titre'), consigne),
    apres: resultatBrevetHtml({ resultat: i('brevet.resultat'), validee: i('brevet.validee'), pasEncore: i('brevet.pasEncore') }, nbQuestions),
    css: CSS_CEINTURES,
    blocs: [{ sansTitre: true, fragment }],
  })
}
