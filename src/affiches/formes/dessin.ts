// Le dessin de l'affiche « Figures et solides » : une fonction pure (réglages, zone, T) → pages, sans Vue ni DOM (lisible par node).
// Une grille de cartes (le dessin, le nom, ses propriétés) dont les colonnes sont choisies pour que les dessins soient les plus grands
// possible dans la zone ; la légende (marques rouges, arêtes cachées) est au-dessus. Les figures et les solides sont ceux de
// src/dessins/ ; ce que montre chaque variante : lots.ts ; les noms et les propriétés : textes.ts (`figure.<id>.nom|info`, `solide.<id>.nom|info`).
import { echapper } from '../../utils/html.js'
import { CASE, FIGURES_ICONES } from '../../dessins/figures.ts'
import type { FigureIcone } from '../../dessins/figures.ts'
import { solide } from '../../dessins/solides.ts'
import type { SolideId } from '../../dessins/solides.ts'
import { emojiHtml } from '../../images/openmoji.ts'
import type { Rendu } from '../types.ts'
import { LOTS } from './lots.ts'
import type { Reglages } from './definition.ts'

const FONDS = ['#cfe3ff', '#ffe3c2', '#d3f0d3', '#ead7f5', '#ffd6e0', '#cdeff2']

// hauteur réservée à la légende (au plus 5 mm de texte, interligne et marge compris) : les cartes se partagent le reste
const H_LEGENDE = 10

/** Le nom d'un dessin : celui propre à la variante s'il existe (`<cle>.nom.<variante>`, ex. « le pavé » en maternelle), sinon le nom commun. */
function nomDe(T: (cle: string) => string, cle: string, variante: string): string {
  const propre = T(`${cle}.nom.${variante}`)
  return propre === `${cle}.nom.${variante}` ? T(`${cle}.nom`) : propre
}

type Montrer = { angles: boolean, cotes: boolean, paralleles: boolean, rayon: boolean, faces: boolean }

/** Ce qu'une carte écrit sous le nom : le texte de base, puis les propriétés montrées (`<cle>.cotes|angles|paralleles`, si le texte existe) ; solide : ses faces seulement si demandées. */
function infoDe(T: (cle: string) => string, cle: string, type: 'figures' | 'solides', montrer: Montrer): string {
  if (type === 'solides') return montrer.faces ? T(`${cle}.info`) : ''
  const lignes = [T(`${cle}.info`)]
  for (const p of ['cotes', 'angles', 'paralleles'] as const) {
    if (!montrer[p]) continue
    const texte = T(`${cle}.${p}`)
    if (texte !== `${cle}.${p}`) lignes.push(texte)
  }
  return lignes.join('\n')
}
// marge intérieure d'une carte, en part de sa largeur (de chaque côté)
export const MARGE = 0.04

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H: Hzone }, T, { mesure, nomPolice }) => {
  const lot = LOTS[r.variante] ?? LOTS['plan-cycle2']
  // propriétés à montrer, et donc la légende : sa hauteur est réservée aux cartes
  const montrer = { angles: !!r.angles, cotes: !!r.cotes, paralleles: !!r.paralleles, rayon: !!r.rayon, faces: !!r.faces }
  const sansLegende = lot.type === 'solides' && !!lot.sansLegende
  const aLegende = !sansLegende && lot.type === 'solides' || montrer.cotes || montrer.angles || (montrer.rayon && lot.liste.includes('disque' as never)) || (montrer.paralleles && lot.liste.includes('trapeze' as never))
  const H = Hzone - (aLegende ? H_LEGENDE : 0)
  const n = lot.liste.length, gap = 5
  let meilleur: { cols: number, cw: number, ch: number, t: number } | null = null
  for (let cols = 1; cols <= n; cols++) {
    const rangs = Math.ceil(n / cols)
    const cw = (W - (cols - 1) * gap) / cols, ch = (H - (rangs - 1) * gap) / rangs
    const t = Math.min(cw, ch * 0.78)
    if (!meilleur || t > meilleur.t) meilleur = { cols, cw, ch, t }
  }
  const { cols, cw, ch, t } = meilleur!
  const fs = Math.min(cw / 14, ch / 11)
  const ids: readonly string[] = lot.liste
  const marques = { egalite: montrer.cotes, angles: montrer.angles, paralleles: montrer.paralleles, rayon: montrer.rayon }
  // marge intérieure franche entre le texte et la bordure de la carte (4 % de sa largeur de chaque côté) ; le texte, mesuré dans la
  // police réelle (une langue aux mots longs comme le breton), est réduit pour tenir dans la zone intérieure
  const marge = cw * MARGE, interieur = cw - 2 * marge
  const police = nomPolice()
  const taille = (lignes: readonly string[], voulue: number, gras: boolean): number =>
    Math.min(voulue, interieur / (Math.max(...lignes.map(l => mesure.largeur(l, police, gras))) * 1.05))
  // le texte de chaque carte, avec sa taille réduite pour tenir en largeur ; le dessin prend la hauteur qui reste (la même pour toutes
  // les cartes, d'après la carte la plus chargée), avec une marge au-dessus et au-dessous
  const textes = ids.map(id => {
    const cle = `${lot.type === 'figures' ? 'figure' : 'solide'}.${id}`
    const nom = nomDe(T, cle, r.variante), info = infoDe(T, cle, lot.type, montrer)
    const tNom = taille([nom], fs * 1.15, true), tInfo = taille(info.split('\n'), fs * 0.85, false)
    return { id, nom, info, tNom, tInfo, haut: tNom * 1.2 + (info ? info.split('\n').length * tInfo * 1.2 : 0) + 2 }
  })
  // l'objet de tous les jours, sous le nom (maternelle) : un emoji de la hauteur d'une ligne et demie du nom
  const objets = lot.type === 'solides' ? lot.objets : undefined
  const hObjet = objets ? Math.min(ch * 0.26, cw * 0.34) : 0
  const dessinMax = Math.min(t * 0.78, ch * 0.92 - Math.max(...textes.map(x => x.haut)) - hObjet)
  const objetDe = (id: string): string => {
    const nomEmoji = objets?.[id as SolideId]
    return nomEmoji ? emojiHtml(nomEmoji, `${hObjet}mm`) : ''
  }
  const cartes = textes.map(({ id, nom, info, tNom, tInfo }, k) => {
    const fond = FONDS[k % 6]
    const dessinDe = lot.type === 'figures' ? FIGURES_ICONES[id as FigureIcone](fond, marques) : solide(id as SolideId, fond)
    return `<div class="carte" style="width:${cw}mm;height:${ch}mm;padding:0 ${marge}mm"><svg width="${dessinMax}mm" height="${dessinMax}mm" viewBox="0 0 ${CASE} ${CASE}">${dessinDe}</svg>
      <b style="font-size:${tNom}mm">${echapper(nom)}</b><small style="font-size:${tInfo}mm">${echapper(info).replace(/\n/g, '<br>')}</small>${objetDe(id)}</div>`
  }).join('')
  const taillePolice = Math.min(fs * 0.7, 5)
  // la légende : les marques rouges effectivement dessinées (rien à expliquer si aucune propriété n'est montrée)
  const marquees = [montrer.cotes && T('legende.cotes'), montrer.angles && T('legende.angles'), montrer.rayon && lot.liste.includes('disque' as never) && T('legende.rayon')].filter(Boolean).join(' · ')
  const chevrons = montrer.paralleles && ids.includes('trapeze')
  const texteLegende = sansLegende ? '' : lot.type === 'solides' ? echapper(T('legende.solides'))
    : [marquees && `<span class="ter">${echapper(T('legende.traits'))}</span> : ${echapper(marquees)}`, chevrons && `<span class="ter">»</span> : ${echapper(T('legende.paralleles'))}`].filter(Boolean).join(' · ')
  const aide = texteLegende ? `<p class="legende" style="font-size:${taillePolice}mm">${texteLegende}</p>` : ''
  return [{ corps: `${aide}<div class="cartes" style="grid-template-columns:repeat(${cols}, ${cw}mm);gap:${gap}mm">${cartes}</div>`, titre: r.titre || T(`lot.${r.variante}`) }]
}

// CSS propre à l'affiche (ajouté après celui du cadre) : titre bleu, dessins dans la police du texte, légende sous le titre
export const css = `h1 { color: #1d4e9e; }
  svg { display: block; flex: none; } svg text { font-family: inherit; }
  .legende { text-align: center; color: #555; margin-bottom: 3mm; flex: none; }
  .cartes { display: grid; }
  .ter { color: #d9480f; font-weight: 700; }
  .carte { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 0.4mm solid #cfd6df; border-radius: 3mm; text-align: center; line-height: 1.2; gap: 1mm; }
  .carte b, .carte small { white-space: nowrap; }
  .carte small { color: #555; }`
