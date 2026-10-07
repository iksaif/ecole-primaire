// Le dessin de l'affiche de l'horloge : pur. Une grande horloge et sa légende, puis quatre petites horloges d'exemple. Les cadrans sont
// ceux de l'exercice (src/exercices/heure/horloge.ts), l'heure dite en lettres aussi (oral12, avec le catalogue de « Lire l'heure ») :
// un seul dessin d'horloge, une seule façon de dire l'heure.
import { echapper } from '../../utils/html.js'
import { elementsHorloge, COULEUR_HEURES, COULEUR_MINUTES } from '../../exercices/heure/horloge.ts'
import { oral12, ecrit } from '../../exercices/heure/generateur.ts'
import { CONTENU as CONTENU_HEURE } from '../../exercices/heure/textes.ts'
import { traducteur } from '../../langues/catalogue.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

type Variante = 'heures' | 'quarts' | 'minutes'
// une couleur par aiguille : la courte (les heures) est rouge, la longue (les minutes) est bleue ; les mêmes que sur les cadrans
const BLEU = COULEUR_MINUTES, ROUGE = COULEUR_HEURES, VERT = '#2b8a3e', NOIR = '#222'

// (`petite` : l'aiguille courte, couleur des heures ; les `grande…` : l'aiguille longue, couleur des minutes)
// Les lignes de la légende : [texte `legende.<id>.a` (en couleur), texte `legende.<id>.b`, couleur]
const LEGENDES: Readonly<Record<Variante, readonly (readonly [string, string])[]>> = {
  heures: [['petite', ROUGE], ['grandeHeures', BLEU], ['matin', NOIR], ['soir', NOIR]],
  // CE1 : pas encore les minutes une à une, seulement la grande aiguille sur le 12, le 3, le 6 ou le 9
  quarts: [['petite', ROUGE], ['grandeQuarts', BLEU], ['sur3', NOIR], ['sur6', NOIR], ['sur9', NOIR], ['vert', VERT]],
  minutes: [['petite', ROUGE], ['grandeMinutes', BLEU], ['heure60', NOIR], ['quartHeure', NOIR], ['demiHeure', NOIR], ['vert', VERT]],
}
// Les moments de la journée (variante « heures ») : [heure, texte `moment.<id>`]
const MOMENTS = [[7, 'leve'], [8, 'ecole'], [12, 'mange'], [9, 'couche']] as const
const QUARTS = [[7, 15], [7, 30], [7, 45], [8, 0]] as const
const num2 = (n: number): string => String(n).padStart(2, '0')

/**
 * Une horloge de rayon `rayon` mm dans une boîte carrée de `cote` mm : coordonnées en mm (viewBox = la boîte), sans SVG imbriqué.
 * Le cadran est celui de l'exercice (elementsHorloge) ; les nombres sont par-dessus les aiguilles, avec un liseré blanc.
 */
function horloge(h: number, m: number, cote: number, rayon: number, o: { minutes: boolean, heures24: boolean, libelle: string }): string {
  const elements = elementsHorloge(h, m, { aideMinutes: o.minutes, minutes60: true, heures24: o.heures24, nombresAuDessus: true, impression: true, couleursAiguilles: true },
    { cx: cote / 2, cy: cote / 2, k: rayon / 100 })
  return `<svg width="${cote}mm" height="${cote}mm" viewBox="0 0 ${cote} ${cote}" role="img" aria-label="${echapper(o.libelle)}">${elements}</svg>`
}

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, _T, ctx) => {
  const variante = r.variante as Variante
  const minutes = variante === 'minutes', pile = variante === 'heures'
  return (r.langues as readonly string[]).map(langue => {
    const T = ctx.Tde(langue)
    const Th = traducteur(CONTENU_HEURE, langue)
    const libelle = Th('horloge')
    const grand = Math.min(H * 0.36, W * 0.3)
    const ligne2 = H - grand * 2 - 6
    const rp = Math.min(ligne2 * 0.32, W / 10)
    const gauche = horloge(10, variante === 'quarts' ? 15 : 10, grand * 2, grand * (minutes ? 0.78 : 0.84), { minutes, heures24: !pile, libelle })
    const droite = `<div class="leg" style="font-size:${Math.min(grand * 0.11, 8)}mm">${LEGENDES[variante].map(([id, c]) => `<p><b style="color:${c}">${echapper(T(`legende.${id}.a`))}</b><br>${echapper(T(`legende.${id}.b`))}</p>`).join('')}</div>`
    const exemples = pile
      ? MOMENTS.map(([h, id]) => ({ h, m: 0, texte: echapper(T(`moment.${id}`)) }))
      : QUARTS.map(([h, m]) => ({ h, m, texte: `<span>${num2(h)}:${num2(m)}</span><br>${echapper(oral12(Th, h, m))}` }))
    const minis = exemples.map(e => `<figure style="width:${W / 4.4}mm">${horloge(e.h, e.m, rp * 2.2, rp, { minutes: false, heures24: false, libelle })}
      <figcaption style="font-size:${Math.min(rp * 0.28, 6)}mm"><b>${echapper(ecrit(e.h, e.m))}</b> · ${e.texte}</figcaption></figure>`).join('')
    const corps = `<div style="display:flex;gap:${W * 0.04}mm;align-items:center;justify-content:center;flex:none;height:${grand * 2}mm">${gauche}${droite}</div>
    <div class="minis" style="height:${ligne2}mm">${minis}</div>`
    return { titre: T(`titre.${variante}`), corps }
  })
}

export const css = `
  h1 { color: #1d4e9e; }
  svg { display: block; flex: none; } svg text { font-family: inherit; }
  .leg { display: flex; flex-direction: column; gap: 2.5mm; max-width: 40%; line-height: 1.25; }
  .minis { display: flex; justify-content: space-around; align-items: center; width: 100%; flex: none; }
  .minis figure { display: flex; flex-direction: column; align-items: center; text-align: center; line-height: 1.2; }
  .minis figcaption span { font-family: monospace; color: #2b8a3e; }`
