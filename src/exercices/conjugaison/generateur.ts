// Conjugaison — générateur : QUOI poser comme questions, et comment les corriger. Pur : aucun import de Vue, aucun Math.random (le hasard
// vient de `rng`), donc lisible par node, par les tests et par le build des fiches.
//   questions({ niveau, reglages, rng })         une partie : les six lignes d'un tableau (un verbe, un temps), sur un écran (mode série)
//   questionsFiche({ niveau, reglages, rng })    les tableaux de la fiche imprimable (fiche.ts les met en page)
//   verifier(q, rep)                             la saisie { texte } est-elle juste ? → { ok, nuance } (nuance 'accents')
//   bonneReponse(q) / mauvaiseReponse(q)  ecartsAuProgramme(x, contraintes) : verbes et temps hors du programme du niveau
// Formes : src/data/conjugaison.js (partagé avec les affiches de conjugaison). L'ordre des tirages est celui de l'ancienne version : même
// flux de hasard, mêmes fiches (instantanés).
import type { Classe, Contraintes, ParamsGenerateur, Verdict } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type { CleContenu } from '../../langues/catalogue.ts'
import { formesTemps, verbeDe } from '../../data/conjugaison.js'
import { verdictSaisie } from '../../utils/reponses.ts'
import DEFINITION from './definition.ts'
import type { CONTENU } from './textes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>
type Cle = CleContenu<typeof CONTENU>
export type Temps = Reglages['temps'][number]
export type Verbe = Reglages['verbes'][number]

export const NB_TABLEAUX = 4    // tableaux par fiche
export const NB_LIGNES = 12     // lignes par fiche « une forme par ligne »
// groupe (src/data/conjugaison.js) → clé des textes (`groupe.<…>`)
const GROUPE_DE: Readonly<Record<string, 'aux' | 'g1' | 'g2' | 'g3'>> = { auxiliaire: 'aux', '1er groupe': 'g1', '2e groupe': 'g2', '3e groupe': 'g3' }
/** Le groupe d'un verbe, clé des textes `groupe.<…>` (aux, g1, g2, g3). */
export const groupeDe = (verbe: string): 'aux' | 'g1' | 'g2' | 'g3' => GROUPE_DE[verbeDe(verbe).groupe]
/** L'infinitif d'un verbe (« être »). */
export const infinitif = (verbe: string): string => verbeDe(verbe).inf

/** Une ligne d'un tableau : pronom, forme, début donné (radical ou auxiliaire) et partie à écrire (terminaison ou participe passé ; toute
 * la forme quand la terminaison n'est pas régulière, ex. vous êtes). */
export interface Ligne { pronom: string, forme: string, debut: string, trou: string }
/** Une question : une ligne du tableau d'un verbe à un temps ; `attendu` : ce que l'élève écrit (terminaison ou forme entière). */
export interface Question extends Ligne { cle: string, verbe: Verbe, temps: Temps, i: number, lacunes: boolean, attendu: string, texte: string }
/** La réponse de l'élève : ce qu'il a écrit. */
export interface Reponse { texte: string }
/** Ce que tire la fiche. */
export interface TirageFiche {
  niveau: Classe
  lacunes: boolean
  tableaux: { verbe: Verbe, temps: Temps, lignes: Ligne[] }[]
  /** fiche « une forme par ligne » : des lignes des tableaux, mélangées */
  lignes?: (Ligne & { verbe: Verbe, temps: Temps })[]
}

type Segment = [string, string]
export function lignes(verbe: string, temps: string): Ligne[] {
  return (formesTemps(verbe, temps) as [Segment, ...Segment[]][]).map(([[, pronom], ...segs]) => {
    const k = segs.map(([c]) => c).findLastIndex(c => c === 'ter' || c === 'pp')
    const txt = (l: Segment[]): string => l.map(([, x]) => x).join('')
    return { pronom: pronom.trim(), forme: txt(segs), debut: k > 0 ? txt(segs.slice(0, k)) : '', trou: k > 0 ? txt(segs.slice(k)) : txt(segs) }
  })
}

/** Couples (verbe, temps) possibles avec les choix du niveau, dans l'ordre des réglages. */
export function paires(niveau: Classe, reglages: Pick<Reglages, 'verbes' | 'temps'>): { verbe: Verbe, temps: Temps }[] {
  const n = DEFINITION.niveaux[niveau]?.options ?? {}
  const offerts = (cle: 'verbes' | 'temps'): readonly unknown[] => (n as Record<string, readonly unknown[]>)[cle] ?? []
  const vs = (reglages.verbes ?? []).filter(v => offerts('verbes').includes(v)), ts = (reglages.temps ?? []).filter(x => offerts('temps').includes(x))
  return vs.flatMap(verbe => ts.map(temps => ({ verbe, temps })))
}

/** « allé(e)s » : la forme écrite telle quelle, et allés, allées. */
export const formesAcceptees = (attendu: string): string[] => (attendu.includes('(e)') ? [attendu, attendu.replace(/\(e\)/g, ''), attendu.replace(/\(e\)/g, 'e')] : [attendu])

/** Une partie : un couple au hasard, ses six lignes. */
export function questions({ niveau, reglages, rng }: ParamsGenerateur<Reglages, Cle>): Question[] {
  const ps = paires(niveau, reglages)
  if (!ps.length) return []
  const { verbe, temps } = ps[rng.entier(0, ps.length - 1)]
  const lacunes = reglages.mode !== 'complet'
  return lignes(verbe, temps).map((l, i) => ({
    cle: `${verbe}:${temps}:${i}`, verbe, temps, i, ...l, lacunes,
    // en mode lacunes, une ligne sans début donné (vous êtes) s'écrit en entier
    attendu: lacunes ? l.trou : l.forme,
    texte: `${l.pronom} ${l.forme}`,
  }))
}

// Accents oubliés : comptés faux, avec la nuance 'accents' (la vue avertit et montre la bonne graphie ; décision du 2026-10-05)
// La forme entière s'écrit avec ou sans son pronom (« suis » ou « je suis », « ai » ou « j'ai »)
export function verifier(q: Question, rep: Reponse): Verdict {
  const formes = formesAcceptees(q.attendu)
  const entiere = !q.lacunes || !q.debut
  const pronoms = q.pronom.split(' / ')   // « il / elle / on » : chacun
  const avecPronom = entiere ? formes.flatMap(f => pronoms.flatMap(p => (p.endsWith("'") ? [`${p}${f}`, `${p} ${f}`] : [`${p} ${f}`]))) : []
  return verdictSaisie(rep.texte, [...formes, ...avecPronom])
}
export const bonneReponse = (q: Question): Reponse => ({ texte: q.attendu })
export const mauvaiseReponse = (q: Question): Reponse => ({ texte: `${q.attendu}zz` })

/** Tableaux de la fiche : des couples au hasard, en variant les verbes autant que possible. */
export function questionsFiche({ niveau, reglages, rng }: Omit<ParamsGenerateur<Reglages, Cle>, 'nb' | 'T'>): TirageFiche {
  const tous = rng.melanger([...paires(niveau, reglages)]), choisis: typeof tous = [], vus = new Set<string>()
  for (const p of tous) if (choisis.length < NB_TABLEAUX && !vus.has(p.verbe)) { choisis.push(p); vus.add(p.verbe) }
  for (const p of tous) if (choisis.length < NB_TABLEAUX && !choisis.includes(p)) choisis.push(p)
  const tableaux = choisis.map(p => ({ ...p, lignes: lignes(p.verbe, p.temps) }))
  // « une forme par ligne » : des lignes des tableaux tirés, mélangées (tirage APRÈS celui des tableaux : la fiche « tableaux » ne change pas)
  const enLignes = reglages.fiche === 'lignes'
    ? rng.melanger(tableaux.flatMap(t => t.lignes.map(l => ({ ...l, verbe: t.verbe, temps: t.temps })))).slice(0, NB_LIGNES)
    : undefined
  return { niveau, lacunes: reglages.mode !== 'complet', tableaux, ...(enLignes ? { lignes: enLignes } : {}) }
}

// ── Programme : verbes et temps hors des contraintes du niveau (src/data/programme.ts, contraintes `conjugaison`) ──
const GROUPE_PROGRAMME: Readonly<Record<string, string>> = { auxiliaire: 'etre-avoir', '1er groupe': '1er-groupe', '2e groupe': '2e-groupe' }
function ecartsCouples(couples: readonly { verbe: string, temps: string }[], contraintes: Contraintes): string[] {
  const c = contraintes.conjugaison
  if (!c) return ['conjugaison : pas au programme du niveau']
  const ecarts: string[] = []
  for (const { verbe, temps } of couples) {
    const v = verbeDe(verbe)
    if (!v) ecarts.push(`${verbe} : verbe inconnu`)
    else if (v.groupe === '3e groupe' ? !c.irreguliers.includes(verbe) : !c.groupes.includes(GROUPE_PROGRAMME[v.groupe])) ecarts.push(`${v.inf} : pas au programme`)
    if (!c.temps.includes(temps)) ecarts.push(`${temps} : pas au programme`)
  }
  return [...new Set(ecarts)]
}
export const ecartsAuProgramme = (x: readonly Question[] | TirageFiche, contraintes: Contraintes): string[] =>
  ecartsCouples(Array.isArray(x) ? (x as readonly Question[]) : (x as TirageFiche).tableaux, contraintes)
