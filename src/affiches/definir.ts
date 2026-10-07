// Déclarer une affiche : `definirAffiche({ … })` rend une DefinitionAffiche (types.ts), après l'avoir vérifiée à l'import
// (une erreur de déclaration fait échouer l'app ou le test dès le chargement, avec un message qui dit quoi corriger).
// Même esprit que `definir` des exercices (src/noyau/definir.ts) ; la déclaration commune (réglages, compétences, niveaux)
// est dans src/noyau/declaration.ts, qu'ils partagent :
//   - un réglage = un `choix(...)` ou `cases(...)` (valeurs, défaut, bonus, hors programme), ou un champ libre
//     `texte(...)` / `nombre(...)` ; la définition en tire `reglages` / `options` / `bonus` / `champs` ;
//   - les compétences sont déclarées une fois ; chaque variante garde celles qui sont au programme de TOUTES ses classes
//     (`every`, alors qu'un exercice, qui n'a qu'une classe par niveau, teste l'égalité), moins `sauf` : on ne les recopie plus ;
//   - le type des réglages se calcule d'après la déclaration (`config.points` est un booléen, `config.pointss` ne compile pas).
import { FORME_ID, decrireNiveau, decrireReglagesCommuns, reglagesHerites, verifierClasses, verifierProgramme } from '../noyau/declaration.ts'
import type { Champ, ReglagesDe, SpecReglages } from '../noyau/declaration.ts'
import type { Classe, CompetenceId, DomaineId, ValeurReglage } from '../noyau/types.ts'
import { CODES } from '../langues/registre.ts'
import { reglagesDeCondition } from './outils.ts'
import type { DefinitionAffiche, Format, Offertes, Orientation, PlanFormulaire, PoliceAffiche, VarianteAffiche } from './types.ts'

export { choix, cases, texte, nombre } from '../noyau/declaration.ts'

/** Une variante, telle qu'on la déclare. */
export interface SpecVariante {
  /** classes de la variante (un tableau : une affiche sert souvent plusieurs classes) */
  classes: readonly Classe[]
  /** réglages propres à la variante : valeurs simples (ce que lit le dessin : `max`, `debut`…), `choix(...)` ou champs offerts à l'élève */
  reglages?: SpecReglages
  /** compétences de l'affiche qui sont au programme des classes de la variante mais qu'elle ne travaille pas */
  sauf?: readonly CompetenceId[]
  /** compétences travaillées malgré le programme (avec la raison) ; rare */
  horsProgramme?: readonly { competence: CompetenceId, raison: string }[]
  /** identifiant d'une autre variante dont celle-ci part (réglages seulement : ni `classes`, ni `sauf`, ni `horsProgramme`) */
  herite?: string
  slug?: string
  /** format et sens par défaut de la variante (parmi `formats` et `orientations` de l'affiche) : A3 pour « l'affiche de la classe » */
  format?: Format
  orientation?: Orientation
  /** place de la variante sur les axes du choix (beaucoup de variantes : un verbe × une série de temps) ; toutes les variantes ont les mêmes axes */
  axes?: Readonly<Record<string, string>>
}

export interface SpecAffiche<C extends SpecReglages, V extends Record<string, SpecVariante>> {
  id: string
  domaine: DomaineId
  /** domaines, autres que `domaine`, dont l'affiche travaille aussi des compétences */
  autresDomaines?: readonly DomaineId[]
  /** orientations permises, la première par défaut ; une seule : fixe, non proposée ; défaut : portrait puis paysage */
  orientations?: readonly Orientation[]
  /** formats permis, le premier par défaut ; un seul : fixe, non proposé ; défaut : A4 et A3 */
  formats?: readonly Format[]
  /** langues de contenu ; défaut : français seulement */
  langues?: readonly string[]
  /** plusieurs langues sur la même feuille (réglage « langues affichées ») ; défaut : non, une langue par feuille */
  bilingue?: boolean
  /** police du contenu ; défaut : un seul choix (`{ mode: 'unique' }`). Le titre reste dans la police de base. */
  police?: PoliceAffiche
  /** le dessin a du hasard (réglage `graine`, bouton « Nouvelle ») ; défaut : non */
  hasard?: boolean
  /** groupes, ordre et « visible si » du formulaire */
  formulaire?: PlanFormulaire
  /**
   * Valeurs proposées d'un réglage `choix`/`cases` qui dépendent des autres réglages (langue, variante, autre choix) : une
   * fonction de la config (réglages lus, jamais `titre` ni `polices`) qui rend les valeurs à proposer, parmi celles déclarées.
   * Le défaut est gardé s'il reste proposé, sinon la première valeur proposée.
   */
  offertes?: Readonly<Record<string, Offertes>>
  /** jeux de réglages nommés (texte `prereglage.<id>`) : un clic pré-remplit le formulaire, qui reste modifiable. Ce ne sont pas des variantes. */
  prereglages?: Readonly<Record<string, Readonly<Record<string, ValeurReglage>>>>
  /** défaut : /imprimer/affiches */
  route?: string
  /** emoji de la carte du catalogue (💶 pour les pièces et billets) ; défaut : celui du domaine */
  emoji?: string
  marge?: number
  hTitre?: number
  /** toutes les compétences de l'affiche (K.…) */
  competences: readonly CompetenceId[]
  /** réglages communs à toutes les variantes */
  reglages?: C
  /** les variantes par identifiant, ou une fonction pure qui les produit (classes × un paramètre…) : elle est appelée ici */
  variantes: V | (() => V)
}

// noms réservés : ce sont les réglages de la feuille, communs à toutes les affiches
const RESERVES = ['variante', 'format', 'orientation', 'langue', 'langues', 'titre', 'polices', 'graine']
// réglages de la feuille que le formulaire peut placer dans un groupe ou rendre conditionnels
const DE_LA_FEUILLE = ['langues', 'titre', 'polices', 'graine']
// réglages de la feuille qu'une condition `visibleSi` peut lire
const LISIBLES = ['variante', 'format', 'orientation', 'langue', 'langues']

export function definirAffiche<C extends SpecReglages = {}, V extends Record<string, SpecVariante> = {}>(
  spec: SpecAffiche<C, V>,
): DefinitionAffiche<ReglagesDe<C, V>> {
  const { id } = spec
  const erreur = (message: string): never => { throw new Error(`définirAffiche « ${id} » : ${message}`) }

  if (typeof id !== 'string' || !FORME_ID.test(id)) erreur(`id « ${id} » invalide (minuscules, chiffres et tirets : « bande-numerique »)`)
  verifierProgramme(spec, erreur)
  const formats = spec.formats ?? ['A4', 'A3']
  const orientations = spec.orientations ?? ['portrait', 'landscape']
  const langues = spec.langues ?? ['fr']
  if (!formats.length || !orientations.length || !langues.length) erreur('au moins un format, une orientation et une langue')
  for (const l of langues) if (!CODES.includes(l as never)) erreur(`langue « ${l} » absente du registre (src/langues/registre.ts)`)
  const police: PoliceAffiche = spec.police ?? { mode: 'unique' }
  if (police.mode === 'parType' && !police.types.length) erreur('police parType : au moins un type')

  const communs = decrireReglagesCommuns(spec.reglages, { reservees: RESERVES, champs: true, ecartsDans: 'une variante', erreur })

  const declarees = (typeof spec.variantes === 'function' ? spec.variantes() : spec.variantes) as Record<string, SpecVariante>
  const ids = Object.keys(declarees)
  if (!ids.length) erreur('aucune variante')
  const variantes: Record<string, VarianteAffiche> = {}
  for (const vid of ids) {
    const s = declarees[vid]
    const ou = `variante ${vid}`
    if (!s.classes?.length) erreur(`${ou} : aucune classe`)
    verifierClasses(s.classes, 'classe', e => erreur(`${ou} : ${e}`))
    const { niveau, champs } = decrireNiveau({
      ou, de: 'l\'affiche', classes: s.classes, competences: spec.competences, sauf: s.sauf, horsProgramme: s.horsProgramme,
      reglages: reglagesHerites(declarees, vid, 'variante', erreur), reservees: RESERVES, champs: true,
    }, erreur)
    const v: VarianteAffiche = { classes: s.classes, ...niveau }
    if (Object.keys(champs).length) v.champs = champs
    if (s.slug) v.slug = s.slug
    if (s.format) { if (!formats.includes(s.format)) erreur(`${ou} : format ${s.format} non permis (formats : ${formats.join(', ')})`); v.format = s.format }
    if (s.orientation) { if (!orientations.includes(s.orientation)) erreur(`${ou} : orientation ${s.orientation} non permise (orientations : ${orientations.join(', ')})`); v.orientation = s.orientation }
    if (s.axes) v.axes = s.axes
    variantes[vid] = v
  }
  // axes : toutes les variantes ou aucune, les mêmes axes, et pas deux variantes au même endroit
  const avecAxes = ids.filter(vid => declarees[vid].axes)
  if (avecAxes.length && avecAxes.length !== ids.length) erreur('axes : toutes les variantes doivent en avoir, ou aucune')
  if (avecAxes.length) {
    const noms = Object.keys(declarees[ids[0]].axes ?? {}).join()
    const places = new Set<string>()
    for (const vid of ids) {
      const axes = declarees[vid].axes ?? {}
      if (Object.keys(axes).join() !== noms) erreur(`variante ${vid} : axes ${Object.keys(axes).join()} au lieu de ${noms}`)
      const place = Object.values(axes).join('|')
      if (places.has(place)) erreur(`variante ${vid} : une autre variante a déjà les axes ${place}`)
      places.add(place)
    }
  }

  // le formulaire ne parle que de réglages qui existent
  const choixConnus = new Set([...Object.keys(communs.options), ...Object.values(variantes).flatMap(v => Object.keys(v.options ?? {}))])
  const champsConnus = new Set([...Object.keys(communs.champs), ...Object.values(variantes).flatMap(v => Object.keys(v.champs ?? {}))])
  const connus = new Set([...DE_LA_FEUILLE, ...Object.keys(communs.reglages), ...choixConnus, ...champsConnus, ...Object.values(variantes).flatMap(v => Object.keys(v.reglages))])
  const typesPolice = police.mode === 'parType' ? police.types.map(t => `polices.${t}`) : []
  const formulaire: PlanFormulaire = spec.formulaire ?? {}
  for (const cle of (formulaire.groupes ?? []).flatMap(g => g.reglages)) if (!connus.has(cle)) erreur(`formulaire : réglage « ${cle} » inconnu`)
  for (const [cle, c] of Object.entries(formulaire.visibleSi ?? {})) {
    if (!connus.has(cle) && !typesPolice.includes(cle)) erreur(`formulaire : visibleSi « ${cle} » : réglage inconnu${police.mode === 'unique' && cle.startsWith('polices.') ? ' (les polices par type sont du mode parType)' : ''}`)
    for (const lu of reglagesDeCondition(c)) if (!connus.has(lu) && !LISIBLES.includes(lu)) erreur(`formulaire : « ${cle} » visible selon « ${lu} », réglage inconnu`)
  }

  const offertes = spec.offertes ?? {}
  for (const cle of Object.keys(offertes)) if (!choixConnus.has(cle)) erreur(`offertes : « ${cle} » n'est pas un réglage à choix (choix ou cases)`)

  // un préréglage ne dit que des valeurs que le formulaire accepterait
  const prereglages = spec.prereglages ?? {}
  for (const [pid, valeurs] of Object.entries(prereglages)) {
    if (!FORME_ID.test(pid)) erreur(`préréglage « ${pid} » : identifiant invalide`)
    if (!Object.keys(valeurs).length) erreur(`préréglage « ${pid} » : aucune valeur`)
    for (const [cle, x] of Object.entries(valeurs)) {
      const propositions = [communs.options, ...Object.values(variantes).map(v => v.options ?? {})].flatMap(o => (o[cle] ? [o[cle]] : []))
      const champs = [communs.champs, ...Object.values(variantes).map(v => v.champs ?? {})].flatMap(c => (c[cle] ? [c[cle]] : []))
      if (!propositions.length && !champs.length) erreur(`préréglage « ${pid} » : « ${cle} » n'est pas un réglage à choix ni un champ`)
      const bon = propositions.some(o => (Array.isArray(x) ? x.length && x.every(e => o.includes(e)) : o.includes(x as never))) || champs.some(c => champValide(c, x))
      if (!bon) erreur(`préréglage « ${pid} » : ${cle} = ${JSON.stringify(x)} n'est pas une valeur valide`)
    }
  }

  // les types de ReglagesDe décrivent ce que les contrôles ci-dessus viennent de vérifier : un seul point de conversion
  return {
    id, domaine: spec.domaine, genre: 'affiche', orientations, formats, langues,
    bilingue: spec.bilingue ?? false, police, hasard: spec.hasard ?? false, formulaire,
    route: spec.route ?? '/imprimer/affiches', emoji: spec.emoji, marge: spec.marge, hTitre: spec.hTitre,
    reglages: communs.reglages, options: communs.options, champs: communs.champs, offertes, prereglages, variantes,
  } as unknown as DefinitionAffiche<ReglagesDe<C, V>>
}

// la valeur est-elle acceptable pour ce champ (texte assez court, nombre dans ses bornes) ?
function champValide(c: Champ, x: unknown): boolean {
  return c.sorte === 'texte' ? typeof x === 'string' && x.length <= c.max : typeof x === 'number' && x >= c.min && x <= c.max
}
