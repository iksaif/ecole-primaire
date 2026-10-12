// Les pictogrammes des consignes (ARASAAC, Sergio Palao, CC BY-NC-SA) : un verbe de consigne = un pictogramme, le même partout,
// à gauche du texte de la consigne (qui reste toujours écrit : rien ne dépend d'eux). Guide : brouillons/iconographie/GUIDE.md, § 2.
// Pur : lisible par node comme par le navigateur. Les images (donnees/pictogrammes.ts, WebP en ligne) ne sont pas importées ici : on
// les fournit quand elles sont chargées (fournirPictogrammes, appelé par chargerPictogrammes de useImagesFiche.ts) ; le site ne fait
// aucune requête vers ARASAAC, seul le script d'import (scripts/generer/pictogrammes.ts) les télécharge.
//
//   const consigne = consignesDe(params)                                   // dans fiche.ts d'un exercice
//   `<p class="consigne">${consigne(['compte', 'ecris'], T('consigneEcrire'))}</p>`
//
// Sans pictogramme (réglage « jamais », classe d'élémentaire en « selon la classe », réglage absent : build des PDF publiés,
// instantanés), `consigne` rend le texte seul, à l'identique.
import type { ImagesFiche } from './preference.ts'

/**
 * Le lexique fermé : un verbe, le numéro de son pictogramme ARASAAC. Lexique provisoire du 2026-10-07 (à relire par une personne) ;
 * « écoute » (6572, « entendre ») et « colorie » (2348, « peindre ») sont des approximations. Pas encore de « barre » ni de
 * « souligne » : le 6223 porte le mot espagnol « TACHAR », le 6219 une écriture espagnole, et le 30851 (une case barrée) se confond
 * avec « coche » ; aucune fiche ne les demande. Un verbe de plus : l'écrire ici, puis `node scripts/generer/pictogrammes.ts`.
 */
export const VERBES = {
  ecoute: 6572, lis: 7141, ecris: 2380, entoure: 6285, colorie: 2348, relie: 8243, coche: 39451, compte: 2714,
  decoupe: 2547, colle: 2511, dessine: 8088,
} as const

/** Un verbe de consigne du lexique. */
export type VerbeConsigne = keyof typeof VERBES

/** Le réglage « Pictogrammes des consignes » : `classe` (défaut : en maternelle seulement, l'élève ne lit pas encore), `oui`, `non`. */
export type ChoixPictogrammes = 'classe' | 'oui' | 'non'
export const CHOIX_PICTOGRAMMES: readonly ChoixPictogrammes[] = ['classe', 'oui', 'non']
export const DEFAUT_PICTOGRAMMES: ChoixPictogrammes = 'classe'

/** Les classes où « selon la classe » montre les pictogrammes. */
const CLASSES_AVEC_PICTOGRAMMES: readonly string[] = ['ps', 'ms', 'gs']

/** La ligne de crédit qu'impose leur licence (citer l'auteur), ajoutée en bas de la feuille par le cadre (appliquerOptionsFiche). */
export const MARQUE_ARASAAC = 'arasaac'

/** Les images d'un pictogramme, en adresse `data:` : la couleur, et la version « nocolor » d'ARASAAC pour le style contour. */
export interface ImagesPictogramme { couleur: string, contour: string }

/** Les images fournies, par numéro ARASAAC ; null tant qu'elles ne sont pas chargées. */
let images: Readonly<Record<string, ImagesPictogramme>> | null = null
/** Appelé quand une fiche demande un pictogramme avant que les images soient là (le navigateur les charge alors). */
let surManque: (() => void) | null = null

/** Donne les images des pictogrammes (le module donnees/pictogrammes.ts, chargé à la demande). */
export function fournirPictogrammes(donnees: Readonly<Record<string, ImagesPictogramme>>): void {
  images = donnees
}

/** Ce qu'il faut faire quand une fiche demande un pictogramme pas encore chargé (useImagesFiche.ts : les charger). */
export function quandPictogrammesManquent(action: () => void): void {
  surManque = action
}

/** Le réglage lu avec méfiance : une valeur inconnue reprend le défaut. */
export function assainirPictogrammes(valeur: unknown): ChoixPictogrammes {
  return CHOIX_PICTOGRAMMES.find(c => c === valeur) ?? DEFAUT_PICTOGRAMMES
}

/** Ce qu'une fiche lit de ses paramètres pour ses consignes (ParamsFiche). */
interface ParamsConsignes {
  reglages?: unknown
  images?: ImagesFiche
  /** le réglage de « Sur la fiche » ; absent : aucun pictogramme (PDF publiés, instantanés) */
  pictogrammes?: ChoixPictogrammes
}

/** La classe des réglages d'une fiche (`niveau`), s'il y en a une. */
function classeDe(reglages: unknown): string | undefined {
  if (typeof reglages !== 'object' || reglages === null) return undefined
  const niveau = (reglages as { niveau?: unknown }).niveau
  return typeof niveau === 'string' ? niveau : undefined
}

/** Vrai si la fiche montre ses pictogrammes, d'après le réglage et sa classe. */
function avecPictogrammes(params: ParamsConsignes): boolean {
  if (params.pictogrammes === 'oui') return true
  if (params.pictogrammes !== 'classe') return false
  return CLASSES_AVEC_PICTOGRAMMES.includes(classeDe(params.reglages) ?? '')
}

/** Un pictogramme en HTML : décoratif (le texte de la consigne est à côté), marqué pour la ligne de crédit. */
function pictogrammeHtml(verbe: VerbeConsigne, image: string): string {
  return `<img class="picto-consigne" src="${image}" alt="" width="200" height="200" data-image="${MARQUE_ARASAAC}" data-verbe="${verbe}">`
}

/** Les pictogrammes d'une consigne (vide s'ils ne sont pas encore chargés : la fiche se redessine quand ils arrivent). */
function pictogrammes(verbes: readonly VerbeConsigne[], contour: boolean): string {
  if (!images) {
    surManque?.()
    return ''
  }
  const dessins = images
  return verbes.map(verbe => {
    const image = dessins[String(VERBES[verbe])]
    if (!image) throw new Error(`Pictogramme « ${verbe} » absent de src/images/donnees/pictogrammes.ts : node scripts/generer/pictogrammes.ts`)
    return pictogrammeHtml(verbe, contour ? image.contour : image.couleur)
  }).join('')
}

/** Une consigne : ses pictogrammes (selon le réglage), puis son texte. */
export type RenduConsigne = (verbes: readonly VerbeConsigne[], texte: string) => string

/** Le rendu des consignes d'une fiche, selon ses paramètres (le réglage, la classe, le style des images). */
export function consignesDe(params: ParamsConsignes): RenduConsigne {
  if (!avecPictogrammes(params)) return (_verbes, texte) => texte
  const contour = params.images?.famille === 'openmoji' && params.images.style === 'contour'
  return (verbes, texte) => {
    const dessins = pictogrammes(verbes, contour)
    if (!dessins) return texte
    return `<span class="pictos-consigne">${dessins}</span>${texte}`
  }
}

/** Styles des pictogrammes de consigne : ceux de appliquerOptionsFiche (optionsFiche.ts). */
export const CSS_PICTOGRAMMES = `
.pictos-consigne { display: inline-flex; gap: 1mm; vertical-align: middle; margin-right: 2mm; }
.picto-consigne { width: 12mm; height: 12mm; }
.credit-pictos { margin-top: 6mm; font-size: 7pt; color: #777; text-align: center; }
`
