// Dessin commun des affiches « liste de mots » (les jours de la semaine, les mois de l'année, la météo) : une ligne par élément, son
// image facultative à gauche, puis le mot dans chaque langue de la feuille (une colonne par langue, la deuxième en bleu, comme les
// nombres en lettres). En attaché (`attache`), chaque colonne montre le mot en script puis en attaché. Un `bandeau` facultatif (les
// saisons) passe sous la liste, en cases côte à côte. Une seule page. Pur : la mesure du texte vient du contexte.
import type { ContexteDessin, TextesAffiche } from './types.ts'
import { echapper } from '../utils/html.js'

/** Un élément : son image (emoji, facultative) et son mot dans une langue. */
export interface ElementListe {
  emoji?: string
  mot: (langue: string) => string
}

export interface OptionsListe {
  /** les langues de la feuille, dans l'ordre des colonnes */
  langues: readonly string[]
  /** chaque mot en script puis en attaché */
  attache: boolean
  /** une ligne au-dessus de la liste, dans chaque langue (la question « Quel temps fait-il ? ») */
  entete?: (langue: string) => string
  /** des cases sous la liste (les saisons) */
  bandeau?: readonly ElementListe[]
}

type TypePolice = 'script' | 'attache'

/** La taille (mm) qui fait tenir le plus long des textes dans `largeur`, sans dépasser `plafond`. */
export function tailleQuiTient(textes: readonly string[], police: string, largeur: number, plafond: number, ctx: ContexteDessin): number {
  const plusLong = Math.max(...textes.map(t => ctx.mesure.largeur(t, police)), 0.001)   // en corps de texte (em)
  return Math.min(plafond, (largeur * 0.9) / plusLong)
}

/** Les écritures d'une colonne : le script, et l'attaché si demandé. */
export const ecritures = (attache: boolean): TypePolice[] => (attache ? ['script', 'attache'] : ['script'])

export function dessinerListe(elements: readonly ElementListe[], { W, H }: { W: number, H: number }, ctx: ContexteDessin, options: OptionsListe): string {
  const { langues, attache, entete, bandeau } = options
  const hEntete = entete ? H * 0.08 : 0
  const hBandeau = bandeau?.length ? H * 0.2 : 0
  const hListe = H - hEntete - hBandeau
  const ligne = hListe / elements.length
  const avecImages = elements.some(e => e.emoji)
  const lImage = avecImages ? Math.min(ligne * 1.2, W * 0.15) : 0
  // une colonne par langue et par écriture, de même largeur
  const types = ecritures(attache)
  const lColonne = (W - lImage) / (langues.length * types.length)
  // la taille de chaque colonne : celle du plus long de ses mots
  const tailles = langues.map(l => types.map(type =>
    tailleQuiTient(elements.map(e => e.mot(l)), ctx.nomPolice(type), lColonne, ligne * 0.55, ctx)))

  const cellules = (e: ElementListe): string => langues.map((l, i) => types.map((type, j) =>
    `<span class="mot l${i} ${type}" style="width:${lColonne}mm;font-family:${ctx.police(type)};font-size:${tailles[i][j]}mm">${echapper(e.mot(l))}</span>`).join('')).join('')
  const image = (e: ElementListe): string => (avecImages ? `<span class="image" style="width:${lImage}mm;font-size:${ligne * 0.6}mm">${e.emoji ?? ''}</span>` : '')
  const lignes = elements.map(e => `<div class="ligne-mot" style="height:${ligne}mm">${image(e)}${cellules(e)}</div>`).join('')

  const haut = entete ? dessinerEntete(entete, W, hEntete, langues, ctx) : ''
  const bas = bandeau?.length ? dessinerBandeau(bandeau, W, hBandeau, langues, ctx) : ''
  return `<div class="liste-mots" style="width:${W}mm;height:${H}mm">${haut}${lignes}${bas}</div>`
}

/** La ligne du haut : le texte de chaque langue dans sa colonne, à une taille qui le fait tenir. */
function dessinerEntete(entete: (langue: string) => string, W: number, h: number, langues: readonly string[], ctx: ContexteDessin): string {
  const lColonne = W / langues.length
  const taille = Math.min(...langues.map(l => tailleQuiTient([entete(l)], ctx.nomPolice('script'), lColonne, h * 0.5, ctx)))
  const textes = langues.map((l, i) => `<span class="l${i}" style="width:${lColonne}mm">${echapper(entete(l))}</span>`).join('')
  return `<div class="entete-liste" style="height:${h}mm;font-size:${taille}mm">${textes}</div>`
}

/** Les cases du bandeau : l'image, puis le mot dans chaque langue. */
function dessinerBandeau(cases: readonly ElementListe[], W: number, h: number, langues: readonly string[], ctx: ContexteDessin): string {
  const lCase = W / cases.length
  const hMot = (h * 0.45) / langues.length
  const taille = Math.min(hMot * 0.8, ...langues.map(l => tailleQuiTient(cases.map(c => c.mot(l)), ctx.nomPolice('script'), lCase, hMot * 0.8, ctx)))
  const contenu = cases.map(c => `<div class="case-bandeau" style="width:${lCase}mm;height:${h}mm">
    <span class="image" style="font-size:${h * 0.35}mm">${c.emoji ?? ''}</span>
    ${langues.map((l, i) => `<span class="mot l${i}" style="font-family:${ctx.police('script')};font-size:${taille}mm">${echapper(c.mot(l))}</span>`).join('')}</div>`).join('')
  return `<div class="bandeau">${contenu}</div>`
}

export const CSS_LISTE = `.liste-mots { display: flex; flex-direction: column; }
  .ligne-mot { display: flex; align-items: center; border-bottom: .3mm solid #ccd; line-height: 1; }
  .ligne-mot .mot { text-align: center; white-space: nowrap; }
  .image { text-align: center; line-height: 1; }
  .l1 { color: #1d4e9e; }
  .attache { color: #444; }
  .ligne-mot .l1.attache { color: #1d4e9e; }
  .entete-liste { display: flex; align-items: center; font-weight: 700; }
  .entete-liste span { text-align: center; white-space: nowrap; }
  .bandeau { display: flex; margin-top: auto; }
  .case-bandeau { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; border: .3mm solid #ccd; border-radius: 3mm; }
  .case-bandeau .mot { white-space: nowrap; }`

/** Les textes communs des affiches « liste de mots » : le réglage de l'écriture (script, ou script et attaché). À étaler dans leurs textes. */
export const TEXTES_LISTE: TextesAffiche = {
  fr: {
    'reglage.attache': 'Écriture',
    'valeur.attache.false': 'Script',
    'valeur.attache.true': 'Script et attaché',
  },
  br: {
    'reglage.attache': 'Skritur', // br: à relire
    'valeur.attache.false': 'Skript', // br: à relire
    'valeur.attache.true': 'Skript hag a-stag', // br: à relire
  },
}
