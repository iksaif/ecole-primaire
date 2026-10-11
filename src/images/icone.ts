// Le rendu d'une icône d'interface (src/images/icones.ts) : le caractère de l'appareil (par défaut), ou l'emoji OpenMoji en couleur, en
// SVG en ligne, si le réglage des icônes le demande (useIconesInterface). Pur : lisible par node comme par le navigateur. Les dessins viennent du
// lot léger de l'interface (donnees/interface.ts), jamais de celui des fiches. À l'écran, on passe par <Icone> (Icone.vue).
import { INTERFACE } from './donnees/interface.ts'
import { CARACTERES, ICONES } from './icones.ts'
import type { NomIcone } from './icones.ts'
import type { FamilleImages } from './preference.ts'
import { accessibilite, arrondi, caractereDe, systemeHtml, systemeSvg } from './systeme.ts'

export interface OptionsIcone {
  /**
   * côté, en unité CSS ; par défaut, l'emoji de l'appareil a la taille du texte, et le dessin OpenMoji 1.4em (sa marge le rend plus
   * petit) : elle suit le texte, donc le mode enfant aussi
   */
  taille?: string
  /** ce que dit l'icône quand elle est seule (bouton sans texte) ; sans libellé, elle est décorative (le texte est à côté) */
  libelle?: string
  /** `systeme` (défaut) : le caractère de l'appareil ; `openmoji` : le dessin du site */
  famille?: FamilleImages
}

/**
 * Le cadre des dessins : celui d'OpenMoji (72 × 72) resserré de 3 de chaque côté. OpenMoji dessine entre 4 et 68 et laisse une marge
 * vide qui, à la taille d'une icône (20 px), rend le sujet trop petit à côté du texte.
 */
const CADRE = '3 3 66 66'

/** Le dessin d'une icône ; une icône inconnue échoue en disant laquelle. */
function dessinDe(nom: NomIcone): string {
  const dessin = INTERFACE[ICONES[nom]]
  if (!dessin) throw new Error(`Icône « ${nom} » absente de src/images/donnees/interface.ts : l'écrire dans icones.ts, puis node scripts/generer/icones.ts`)
  return dessin
}

/** Le caractère de l'appareil pour cette icône, ou null pour dessiner l'OpenMoji (famille du site, ou pas de caractère). */
function caractereSysteme(nom: NomIcone, famille: FamilleImages): string | null {
  if (famille !== 'systeme') return null
  return CARACTERES[nom] ?? caractereDe(ICONES[nom])
}

/** Une icône en HTML. */
export function iconeHtml(nom: NomIcone, { taille, libelle, famille = 'systeme' }: OptionsIcone = {}): string {
  const caractere = caractereSysteme(nom, famille)
  // l'emoji de l'appareil à la taille du texte, comme un caractère ; à une taille donnée, centré dans son carré
  if (caractere && taille === undefined) return `<span ${accessibilite(libelle)} class="icone">${caractere}</span>`
  if (caractere) return systemeHtml(caractere, taille, libelle)
  return `<svg ${accessibilite(libelle)} class="icone" width="${taille ?? '1.4em'}" height="${taille ?? '1.4em'}" viewBox="${CADRE}" focusable="false" data-image="openmoji">${dessinDe(nom)}</svg>`
}

/** Une icône dans un SVG : carré de côté `taille` (unités du SVG) dont le coin haut gauche est en (x, y), décorative. */
export function iconeSvg(nom: NomIcone, x: number, y: number, taille: number, famille: FamilleImages = 'systeme'): string {
  const caractere = caractereSysteme(nom, famille)
  if (caractere) return systemeSvg(caractere, x, y, taille)
  return `<svg x="${arrondi(x)}" y="${arrondi(y)}" width="${arrondi(taille)}" height="${arrondi(taille)}" viewBox="${CADRE}" aria-hidden="true" data-image="openmoji">${dessinDe(nom)}</svg>`
}
