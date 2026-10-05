// Déclarer une affiche : `definirAffiche({ … })` rend une DefinitionAffiche (types.ts), après l'avoir vérifiée à l'import
// (une erreur de déclaration fait échouer l'app ou le test dès le chargement, avec un message qui dit quoi corriger).
// Même esprit que `definir` des exercices (src/noyau/definir.ts, dont `choix` et `cases` sont repris tels quels) :
//   - un réglage = un `choix(...)` (valeurs, défaut, bonus, hors programme) ; la définition en tire les trois structures
//     `reglages` / `options` / `bonus` que le formulaire et les tests lisent ;
//   - les compétences sont déclarées une fois ; chaque variante garde celles qui sont au programme de TOUTES ses classes,
//     moins celles qu'elle écarte avec `sauf` : on ne les recopie plus variante par variante ;
//   - le type des réglages se calcule d'après la déclaration (`config.points` est un booléen, `config.pointss` ne compile pas).
import { domaineDe, competenceDe } from '../data/programme.ts'
import { NIVEAUX } from '../data/classes.ts'
import { decrireChoix, estChoix } from '../noyau/definir.ts'
import type { SpecReglages, ReglagesDe } from '../noyau/definir.ts'
import type { Classe, CompetenceId, DomaineId, Reglages, ValeurOption } from '../noyau/types.ts'
import type { DefinitionAffiche, Format, Orientation, VarianteAffiche } from './types.ts'

export { choix, cases } from '../noyau/definir.ts'

/** Une variante, telle qu'on la déclare. */
export interface SpecVariante {
  niveaux: readonly Classe[]
  /** réglages propres à la variante : valeurs simples (ce que lit le dessin : `max`, `debut`…) ou `choix(...)` offerts à l'élève */
  reglages?: SpecReglages
  /** compétences de l'affiche qui sont au programme des classes de la variante mais qu'elle ne travaille pas */
  sauf?: readonly CompetenceId[]
  slug?: string
}

export interface SpecAffiche<C extends SpecReglages, V extends Record<string, SpecVariante>> {
  id: string
  domaine: DomaineId
  /** défaut : portrait */
  orientation?: Orientation
  /** défaut : A4 et A3 */
  formats?: readonly Format[]
  /** défaut : français seulement */
  langues?: readonly string[]
  /** défaut : /imprimer/affiches */
  route?: string
  marge?: number
  hTitre?: number
  /** toutes les compétences de l'affiche (K.…) */
  competences: readonly CompetenceId[]
  /** réglages communs à toutes les variantes */
  reglages?: C
  variantes: V
}

// noms réservés : ce sont les réglages de la feuille, communs à toutes les affiches
const RESERVES = ['variante', 'format', 'orientation', 'langue']

export function definirAffiche<C extends SpecReglages = {}, V extends Record<string, SpecVariante> = {}>(
  spec: SpecAffiche<C, V>,
): DefinitionAffiche<ReglagesDe<C, V>> {
  const { id } = spec
  const erreur = (message: string): never => { throw new Error(`définirAffiche « ${id} » : ${message}`) }

  if (!domaineDe(spec.domaine)) erreur(`domaine « ${spec.domaine} » inconnu de programme.ts`)
  for (const k of spec.competences) if (!competenceDe(k)) erreur(`compétence « ${k} » inconnue de programme.ts`)
  const dupliquee = spec.competences.find((k, i) => spec.competences.indexOf(k) !== i)
  if (dupliquee) erreur(`compétence « ${dupliquee} » déclarée deux fois`)
  const formats = spec.formats ?? ['A4', 'A3']
  const langues = spec.langues ?? ['fr']
  if (!formats.length || !langues.length) erreur('au moins un format et une langue')

  const reglages: Reglages = {}
  const options: Record<string, ValeurOption[]> = {}
  for (const [cle, v] of Object.entries((spec.reglages ?? {}) as SpecReglages)) {
    if (RESERVES.includes(cle)) erreur(`« ${cle} » est réservé`)
    if (!estChoix(v)) { reglages[cle] = v; continue }
    if (v.bonus.length || v.horsProgramme.length) erreur(`réglage commun « ${cle} » : bonus et horsProgramme se déclarent dans une variante (ils dépendent du programme)`)
    const d = decrireChoix(cle, v, 'réglages communs', erreur)
    reglages[cle] = d.defaut
    options[cle] = d.options
  }

  const declarees = spec.variantes as Record<string, SpecVariante>
  const ids = Object.keys(declarees)
  if (!ids.length) erreur('aucune variante')
  const variantes: Record<string, VarianteAffiche> = {}
  for (const vid of ids) {
    const s = declarees[vid]
    const ou = `variante ${vid}`
    if (!s.niveaux.length) erreur(`${ou} : aucune classe`)
    for (const n of s.niveaux) if (!NIVEAUX.includes(n)) erreur(`${ou} : classe « ${n} » inconnue (classes : ${NIVEAUX.join(', ')})`)
    for (const k of s.sauf ?? []) if (!spec.competences.includes(k)) erreur(`${ou} : sauf « ${k} » n'est pas une compétence de l'affiche`)
    const competences = spec.competences.filter(k => !s.sauf?.includes(k) && s.niveaux.every(n => competenceDe(k)!.niveaux.includes(n)))
    if (!competences.length) {
      erreur(`${ou} : aucune compétence de l'affiche n'est au programme de ${s.niveaux.join(', ')} (${spec.competences.map(k => `${k} : ${competenceDe(k)!.niveaux.join(', ')}`).join(' ; ')})`)
    }
    const v: VarianteAffiche = { niveaux: s.niveaux, competences, reglages: {}, options: {} }
    if (s.slug) v.slug = s.slug
    const bonus: Record<string, ValeurOption[]> = {}
    const horsProgramme: NonNullable<VarianteAffiche['horsProgramme']>[number][] = []
    for (const [cle, r] of Object.entries(s.reglages ?? {})) {
      if (RESERVES.includes(cle)) erreur(`« ${cle} » est réservé`)
      if (!estChoix(r)) { v.reglages[cle] = r; continue }
      const d = decrireChoix(cle, r, ou, erreur)
      v.reglages[cle] = d.defaut
      v.options![cle] = d.options
      if (r.bonus.length) bonus[cle] = [...r.bonus]
      for (const h of r.horsProgramme) horsProgramme.push({ reglage: cle, ...h })
    }
    if (Object.keys(bonus).length) v.bonus = bonus
    if (horsProgramme.length) v.horsProgramme = horsProgramme
    variantes[vid] = v
  }

  // les types de ReglagesDe décrivent ce que les contrôles ci-dessus viennent de vérifier : un seul point de conversion
  return {
    id, domaine: spec.domaine, genre: 'affiche', orientation: spec.orientation ?? 'portrait', formats, langues,
    route: spec.route ?? '/imprimer/affiches', marge: spec.marge, hTitre: spec.hTitre, reglages, options, variantes,
  } as unknown as DefinitionAffiche<ReglagesDe<C, V>>
}
