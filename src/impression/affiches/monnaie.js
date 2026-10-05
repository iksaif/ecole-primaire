// Affiche des pièces et des billets en euros. CP : euros entiers jusqu'à 100 € ; CE1 : centimes
import { echapper, largeurTexte } from '../../utils/impression'
import { piece, billet, tailleReelle } from '../../exercices/monnaie/argent.js'

// Le dessin des pièces et des billets est celui de l'exercice (src/exercices/monnaie/argent.js). Les proportions
// sont vraies entre pièces et entre billets ; les pièces sont agrandies (LOUPE) pour rester lisibles, mais restent
// plus petites que les billets. Valeurs en centimes.
const PIECES = [1, 2, 5, 10, 20, 50, 100, 200]
const BILLETS = [500, 1000, 2000, 5000, 10000, 20000]
const ECART = 4         // mm entre deux pièces ou deux billets
const LOUPE = 2         // agrandissement des pièces par rapport aux billets (2 € : 5/6 de la hauteur du billet de 5 €)
const H_SECTION = 11    // titre « Les pièces » / « Les billets » (7 mm, interligne compris) et sa marge (cf. .sect)

export const titre = () => "Les pièces et les billets de l'euro"

// polices = { script } : les équivalences sont réduites si elles ne tiennent pas sur deux colonnes (police plus large)
export function dessin(cfg, W, H, polices) {
  const complet = cfg.variante !== 'euros'
  const pieces = (complet ? PIECES : PIECES.filter(v => v >= 100)).map(v => ({ v, d: tailleReelle(v).w }))
  const billets = (complet ? BILLETS : BILLETS.filter(v => v <= 10000)).map(v => ({ v, ...tailleReelle(v) }))
  // billets sur deux rangées (les plus petits en haut), pour qu'ils restent assez grands
  const coupe = Math.ceil(billets.length / 2)
  const rangees = [billets.slice(0, coupe), billets.slice(coupe)]
  const relations = [
    ['2 pièces de 1 €', '= 1 pièce de 2 €'], ['5 pièces de 2 €', '= 10 €'], ['10 pièces de 1 €', '= 1 billet de 10 €'], ['2 billets de 10 €', '= 1 billet de 20 €'],
    ...(complet ? [['100 centimes', '= 1 €'], ['10 pièces de 10 c', '= 1 €'], ['2 pièces de 50 c', '= 1 €']] : []),
  ]
  // équivalences sur 2 colonnes : chaque ligne doit tenir dans sa colonne
  const plusLongue = polices?.script ? Math.max(...relations.map(([a, b]) => largeurTexte(`${a} ${b}`, polices.script, true))) : 0
  const fs = Math.min(H * 0.035, 8, plusLongue ? (W - 16) / 2 / plusLongue : Infinity)
  // hauteur des équivalences et de la note du bas (« c = centime »)
  const hBas = Math.ceil(relations.length / 2) * (fs * 1.4 + 1) + 6 + (complet ? 12 : 0)
  // échelle commune : la plus grande qui tient en largeur (rangée la plus large) et en hauteur
  const largeur = l => l.reduce((t, x) => t + x.w, 0) + (l.length - 1) * ECART
  const kLargeur = Math.min((W - 10) / largeur(rangees[0]), (W - 10) / largeur(rangees[1]),
    (W - 10 - (pieces.length - 1) * ECART) / pieces.reduce((t, p) => t + p.d * LOUPE, 0))
  const hautMax = l => Math.max(...l.map(b => b.h))
  const kHauteur = (H - 2 * H_SECTION - hBas - 3 * ECART) / (Math.max(...pieces.map(p => p.d)) * LOUPE + hautMax(rangees[0]) + hautMax(rangees[1]))
  const k = Math.min(kLargeur, kHauteur)

  const kp = k * LOUPE
  const hPieces = Math.max(...pieces.map(p => p.d)) * kp + 2
  const rangee = (h, dessins) => `<div class="rangee" style="height:${h}mm;gap:${ECART}mm">${dessins.join('')}</div>`
  const lignePieces = rangee(hPieces, pieces.map(p => piece(p.v, { echelle: kp, unite: 'mm' })))
  const lignesBillets = rangees.map(l => rangee(hautMax(l) * k, l.map(b => billet(b.v, { echelle: k, unite: 'mm' })))).join('')
  return `<h2 class="sect">Les pièces</h2>${lignePieces}<h2 class="sect">Les billets</h2><div class="billets" style="gap:${ECART}mm">${lignesBillets}</div>
    <div class="rel" style="font-size:${fs}mm">${relations.map(([a, b]) => `<p>${echapper(a)} <b>${echapper(b)}</b></p>`).join('')}</div>${complet ? '<p class="legende" style="margin-top:4mm;font-size:5mm">c = centime</p>' : ''}`
}

export const css = `
  .sect { font-size: 7mm; line-height: 1.3; color: #1d4e9e; margin: 2mm 0 0; flex: none; }
  .rangee { display: flex; align-items: center; justify-content: center; flex: none; }
  .rangee svg { display: block; flex: none; }
  .billets { display: flex; flex-direction: column; margin-top: 1mm; flex: none; }
  .rel { display: grid; grid-template-columns: repeat(2, auto); gap: 1mm 12mm; margin-top: 3mm; flex: none; }
  .rel p { margin: 0; line-height: 1.4; }
  /* sous le titre, le contenu est centré dans la hauteur qui reste (portrait) */
  .sect:first-of-type { margin-top: auto; }
  .contenu > :last-child { margin-bottom: auto; }
  .rel b { color: #d9480f; }`
