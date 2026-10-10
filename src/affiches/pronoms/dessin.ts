// Le dessin des pronoms personnels sujets : un tableau de trois rangées (1re, 2e, 3e personne) et deux colonnes (un seul, plusieurs). Chaque case :
// l'image de la personne, le ou les pronoms en grand (il / elle, ils / elles côte à côte), et, si demandé, l'exemple avec « chanter » au présent.
// Pur : la mesure du texte vient du contexte, les images de src/images/.
import { echapper } from '../../utils/html.js'
import { emojiHtml } from '../../images/openmoji.ts'
import type { NomEmoji } from '../../images/tables.ts'
import { tailleQuiTient } from '../listeMots.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

/**
 * Un pronom, ses images et son exemple (« chanter » au présent : -e, -es, -e, -ons, -ez, -ent). Je : moi, la main levée ; tu : la main qui
 * montre l'enfant à qui je parle ; il, elle : un garçon, une fille dont je parle. Au pluriel, deux personnes : moi et une autre (nous), la main
 * qui montre deux enfants (vous), un garçon et une fille (ils : il suffit d'un garçon), deux filles (elles).
 */
interface Pronom { pronom: string, images: readonly NomEmoji[], exemple: string, remplace: string }

/** Les cases du tableau : [personne][un seul, plusieurs], chaque case avec un ou deux pronoms. */
const TABLEAU: readonly (readonly (readonly Pronom[])[])[] = [
  [[{ pronom: 'je', images: ['leveLaMain'], exemple: 'je chante', remplace: 'moi' }], [{ pronom: 'nous', images: ['leveLaMain', 'fille'], exemple: 'nous chantons', remplace: 'moi + d’autres' }]],
  [[{ pronom: 'tu', images: ['montreDuDoigt', 'petitEnfant'], exemple: 'tu chantes', remplace: 'toi' }], [{ pronom: 'vous', images: ['montreDuDoigt', 'petitEnfant', 'petitEnfant'], exemple: 'vous chantez', remplace: 'toi + d’autres' }]],
  // la 3e personne remplace aussi des choses et des animaux (le chat → il, la fleur → elle). On : une seule silhouette sans visage, quelqu'un
  // qu'on ne nomme pas (« on frappe à la porte ») ; il se conjugue comme il (on chante), alors que nous a la main levée de moi (nous chantons)
  [[{ pronom: 'il', images: ['garcon'], exemple: 'il chante', remplace: 'Léo, le chat' }, { pronom: 'elle', images: ['fille'], exemple: 'elle chante', remplace: 'Léa, la fleur' },
    { pronom: 'on', images: ['quelquun'], exemple: 'on chante', remplace: 'quelqu’un' }],
    [{ pronom: 'ils', images: ['garcon', 'fille'], exemple: 'ils chantent', remplace: 'Léo et Léa' }, { pronom: 'elles', images: ['fille', 'fille'], exemple: 'elles chantent', remplace: 'les filles' }]],
]

const COULEURS = ['#1d4e9e', '#d9480f', '#2b8a3e']

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  const lEntete = Math.min(W * 0.2, 46), hEntete = Math.min(H * 0.1, 14)
  const MARGE = 1.2
  const lCase = (W - lEntete) / 2, hCase = (H - hEntete) / 3
  const lInterieur = lCase - 2 * MARGE
  // les tailles : le pronom en grand, l'exemple plus petit ; la largeur d'un pronom est celle de la case la plus remplie (il, elle, on)
  const parCase = Math.max(...TABLEAU.flat().map(c => c.length))
  const lPronom = lInterieur / parCase
  const police = ctx.nomPolice()
  const tPronom = tailleQuiTient(['elles', 'nous', 'vous'], police, lPronom * 0.8, hCase * 0.22, ctx)
  const tExemple = tailleQuiTient(['elles chantent', 'nous chantons'], police, lPronom * 0.92, hCase * 0.1, ctx)
  const tRemplace = tailleQuiTient(TABLEAU.flat(2).map(p => p.remplace), police, lPronom * 0.92, hCase * 0.09, ctx)
  const tEntete = tailleQuiTient([T('personne.3'), '3e personne'], police, lEntete * 0.92, hEntete * 0.45, ctx)
  const tColonne = tailleQuiTient([T('singulier'), T('pluriel')], police, lCase * 0.9, hEntete * 0.5, ctx)
  const image = Math.min(hCase * (r.exemple ? 0.34 : 0.42), lPronom * 0.4)

  const pronomHtml = (p: Pronom, couleur: string): string =>
    `<div class="pronom" style="width:${lPronom}mm"><span class="images">${p.images.map(n => emojiHtml(n, `${image}mm`)).join('')}</span><b style="font-size:${tPronom}mm;color:${couleur}">${echapper(p.pronom)}</b><em style="font-size:${tRemplace}mm">${echapper(p.remplace)}</em>${r.exemple ? `<span style="font-size:${tExemple}mm">${echapper(p.exemple)}</span>` : ''}</div>`
  const entete = `<div class="entete" style="height:${hEntete}mm"><span style="width:${lEntete}mm"></span>${['singulier', 'pluriel'].map(c => `<span style="width:${lCase}mm;font-size:${tColonne}mm">${echapper(T(c))}</span>`).join('')}</div>`
  const rangees = TABLEAU.map((cases, i) => {
    const couleur = COULEURS[i]
    const tete = `<div class="personne" style="width:${lEntete}mm;color:${couleur}"><b style="font-size:${tEntete * 1.15}mm">${i + 1}<sup>${i === 0 ? 're' : 'e'}</sup>&nbsp;personne</b><span style="font-size:${tEntete}mm">${echapper(T(`personne.${i + 1}`))}</span></div>`
    const contenu = cases.map(c => `<div class="case" style="width:${lInterieur}mm;margin:${MARGE}mm;border-color:${couleur}">${c.map(p => pronomHtml(p, couleur)).join('')}</div>`).join('')
    return `<div class="rangee" style="height:${hCase}mm">${tete}${contenu}</div>`
  }).join('')
  return [`<div class="pronoms" style="width:${W}mm;height:${H}mm;font-family:${ctx.police()}">${entete}${rangees}</div>`]
}

export const css = `
  .pronoms { display: flex; flex-direction: column; }
  .entete, .rangee { display: flex; align-items: stretch; flex: none; }
  .entete span { display: flex; align-items: center; justify-content: center; font-weight: 700; color: #444; }
  .personne { display: flex; flex-direction: column; justify-content: center; gap: 1mm; padding-right: 2mm; box-sizing: border-box; line-height: 1.1; }
  .personne span { color: #555; }
  .case { display: flex; align-items: center; justify-content: center; border: .5mm solid; border-radius: 3mm; box-sizing: border-box; flex: none; }
  .images { display: flex; gap: .5mm; }
  .personne b { white-space: nowrap; }
  .pronom { display: flex; flex-direction: column; align-items: center; gap: 1mm; line-height: 1.05; }
  .pronom b { font-weight: 700; }
  .pronom span { color: #333; }
  .pronom em { color: #666; font-style: italic; white-space: nowrap; }
  .pronom svg { display: block; flex: none; }`
