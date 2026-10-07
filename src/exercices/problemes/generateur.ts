// Problèmes — générateur : QUOI poser comme problèmes, et comment les corriger. Pur : aucun import de Vue, aucun Math.random.
// Les modèles d'énoncés sont dans modeles-*.ts, les textes dans textes.ts ; ici, le choix d'une catégorie, d'un modèle et la partie.
import type { Classe, Contraintes, ParamsGenerateur } from '../../noyau/types.ts'
import type { ReglagesDeDefinition } from '../../noyau/definir.ts'
import type DEFINITION from './definition.ts'
import { tirerUniques } from '../../noyau/uniques.ts'
import type { Rng } from '../../utils/hasard.ts'
import { Contexte } from './contexte.ts'
import type { Categorie, Cle, Modele, Probleme } from './contexte.ts'
import { CATEGORIES, PLAGES, TABLES } from './donnees.ts'
import { AJOUT_RETRAIT, COMPARAISON, PARTIES_TOUT } from './modeles-additifs.ts'
import { MULTIPLICATION, PARTAGE, FOIS_PLUS } from './modeles-multiplicatifs.ts'
import { DEUX_ETAPES, TROIS_ETAPES } from './modeles-etapes.ts'

type Reglages = ReglagesDeDefinition<typeof DEFINITION>

/** Un problème de l'exercice : ce qu'écrit son modèle, et sa catégorie. `texte` : la question, pour le tableau de correction. */
export interface Question extends Probleme { cat: Categorie, texte: string }
/** La réponse de l'élève : le nombre saisi, tel qu'il l'a écrit. */
export interface Reponse { texte: string }

const MODELES: readonly Modele[] = [...AJOUT_RETRAIT, ...COMPARAISON, ...PARTIES_TOUT, ...MULTIPLICATION, ...PARTAGE, ...DEUX_ETAPES, ...FOIS_PLUS, ...TROIS_ETAPES]
const ESSAIS_PAR_PROBLEME = 20   // un modèle peut refuser son tirage (null) : on en essaie un autre

// Les modèles d'une catégorie qui ont un sens au niveau, dans le champ numérique de la série
function modelesDe(cat: Categorie, niveau: Classe, plageMax: number): Modele[] {
  return MODELES.filter(m => m.cat === cat && (!m.niveaux || m.niveaux.includes(niveau)) && (m.min ?? 0) <= plageMax)
}

// Un problème de la catégorie, ou null si aucun modèle n'aboutit.
function probleme(ctx: Contexte, niveau: Classe, plageMax: number, cat: Categorie): Question | null {
  let modeles = modelesDe(cat, niveau, plageMax)
  if (!modeles.length) return null
  // En « grands nombres », on privilégie les contextes où ces nombres sont réalistes
  const grands = modeles.filter(m => m.cap >= plageMax)
  if (grands.length && plageMax > 100 && ctx.rng.vrai(0.75)) modeles = grands
  for (let essai = 0; essai < ESSAIS_PAR_PROBLEME; essai++) {
    const m = ctx.rng.choisir(modeles)
    // la plage de la série, bornée par le réalisme du contexte (pas 900 passagers dans un bus)
    const max = Math.max(10, Math.min(plageMax, m.cap))
    const p = m.gen(ctx, TABLES[niveau] ?? [], max)
    if (p && p.reponse > 0) return { ...p, cat, texte: p.question }
  }
  return null
}

// Les catégories cochées et offertes au niveau (une sauvegarde ancienne peut en garder une qui n'y est plus), toutes si aucune
function categoriesDe(niveau: Classe, cochees: readonly Categorie[]): readonly Categorie[] {
  const offertes = CATEGORIES[niveau] ?? []
  const cats = cochees.filter(c => offertes.includes(c))
  return cats.length ? cats : offertes
}

// Le rang de chaque problème dans les catégories : mélangées d'abord, quand il y a moins de problèmes que de catégories ce ne sont
// pas toujours les dernières de la liste qui sont oubliées ; puis une catégorie par problème, dans le désordre.
function ordreDesCategories(cats: readonly Categorie[], nb: number, rng: Rng): Categorie[] {
  const melangees = rng.melanger(cats)
  return rng.melanger(Array.from({ length: nb }, (_, i) => melangees[i % melangees.length]))
}

/** Les problèmes de l'exercice à l'écran, tous différents. `nb` : le réglage nbQ, sauf si l'appelant en veut un autre. */
export function questions({ niveau, reglages, rng, T, nb = reglages.nbQ }: ParamsGenerateur<Reglages, Cle>): Question[] {
  const ctx = new Contexte(rng, T)
  const plageMax = PLAGES[reglages.plage] ?? PLAGES.grands
  const ordre = ordreDesCategories(categoriesDe(niveau, reglages.categories), nb, rng)
  // jamais deux fois le même problème (noyau/uniques.ts) ; un tirage sans problème (null) compte pour un essai, puis est écarté
  const tires = tirerUniques<Question | null>(nb, rang => probleme(ctx, niveau, plageMax, ordre[rang]),
    { cle: q => (q ? q.enonce + q.question : ''), essais: nb * 50 })
  return tires.filter((q): q is Question => q !== null)
}

/** Ce que tire la fiche : les mêmes problèmes (réglage nbQ). */
export const questionsFiche = (p: Omit<ParamsGenerateur<Reglages, Cle>, 'nb'>): Question[] => questions(p)

export const verifier = (q: Question, rep: Reponse): boolean => {
  const val = rep.texte.trim()
  return val !== '' && Number(val) === q.reponse
}
export const bonneReponse = (q: Question): Reponse => ({ texte: String(q.reponse) })
export const mauvaiseReponse = (q: Question): Reponse => ({ texte: String(q.reponse + 1) })

// « 2 euros » : le nom de l'unité accordé avec le nombre (le breton garde le singulier)
export const unite = (q: Question, n: number): string => (Math.abs(n) >= 2 ? q.unite.p : q.unite.s)
export const avecUnite = (q: Question, n: number): string => `${n} ${unite(q, n)}`

// Nombres écrits dans l'énoncé et le calcul : au plus le champ numérique du niveau
export function ecartsAuProgramme(qs: Question[], contraintes: Contraintes): string[] {
  const ecarts: string[] = []
  const limite = contraintes.nombreMax ?? Infinity
  for (const q of qs) {
    const nombres = `${q.enonce} ${q.question} ${q.calcul}`.replace(/(\d) (?=\d{3}\b)/g, '$1').match(/\d+/g) ?? []
    const max = Math.max(0, ...nombres.map(Number))
    if (max > limite) ecarts.push(`${max} > ${limite} (nombreMax) : ${q.question}`)
  }
  return ecarts
}
