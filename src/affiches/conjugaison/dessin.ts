// Le dessin de l'affiche de conjugaison : pur. Une légende (radical, terminaison, auxiliaire, participe), puis un bloc par temps, sur
// une ou deux colonnes. La taille du texte suit la place : la plus longue forme (mesurée dans la police de l'affiche, en gras par
// prudence) tient dans son bloc, et l'interligne suit les hampes et les jambages de la police (une attachée est plus haute).
import { echapper } from '../../utils/html.js'
import { VERBES, TEMPS_CYCLE, formesTemps } from '../../data/conjugaison.js'
import { COULEURS } from '../../impression/affiches/cadre.ts'
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

type Segment = [string, string]
interface Verbe { inf: string, groupe: string }

// une forme : ses segments, en couleur selon leur rôle (rad, ter, aux, pp ; le pronom sans couleur)
const ligneHtml = (segs: readonly Segment[]): string => segs.map(([classe, texte]) => (classe ? `<span class="${classe}">${echapper(texte)}</span>` : echapper(texte))).join('')
const formes = (verbe: string, temps: string): Segment[][] => formesTemps(verbe, temps) as Segment[][]

export const dessin: Rendu<Reglages>['dessin'] = (r, { W, H }, T, ctx) => {
  const reglages = r as unknown as { verbe: string, temps: readonly string[] }
  const verbe = (VERBES as Record<string, Verbe>)[reglages.verbe] ? reglages.verbe : 'etre'
  const v = (VERBES as Record<string, Verbe>)[verbe]
  const temps = reglages.temps?.length ? reglages.temps : TEMPS_CYCLE
  // la grille : deux colonnes au-delà de deux temps
  const cols = temps.length > 2 ? 2 : 1
  const rangs = Math.ceil(temps.length / cols)
  const gap = 6
  const wb = (W - (cols - 1) * gap) / cols
  const hb = (H - 18 - (rangs - 1) * gap) / rangs
  // la taille : 6 lignes à l'interligne il × 1,25 dans 84 % du bloc ; la ligne la plus longue tient dans 86 % de la largeur
  const police = ctx.nomPolice()
  const m = ctx.mesure.metriques(police)
  const il = Math.max(1, (m.hampe + m.jambage) / 1.05)
  const lignes = temps.flatMap(t => formes(verbe, t).map(l => l.map(([, x]) => x).join('')))
  const plusLongue = Math.max(...lignes.map(l => ctx.mesure.largeur(l, police, true)))
  const fs = Math.min(hb / 10.5, wb / 17, hb * 0.84 * 0.92 / (6 * 1.25 * il), wb * 0.86 / plusLongue)
  const blocs = temps.map((t, k) => {
    const couleur = COULEURS[k % COULEURS.length]
    return `<div class="bloc" style="width:${wb}mm;height:${hb}mm;border-color:${couleur}">
    <div class="bt" style="background:${couleur};font-size:${fs * 1.15}mm;height:${hb * 0.16}mm">${echapper(T(`temps.${t}`))}</div>
    <div class="bl" style="font-size:${fs}mm;line-height:${(1.25 * il).toFixed(2)}">${formes(verbe, t).map(l => `<div>${ligneHtml(l)}</div>`).join('')}</div></div>`
  }).join('')
  // la légende : l'auxiliaire et le participe seulement s'il y a un temps composé
  const compose = temps.some(t => t === 'passe-compose' || t === 'plus-que-parfait')
  const groupe = v.groupe === 'auxiliaire' ? T('legende.auxiliaire') : T('legende.groupe', { groupe: v.groupe })
  const texteLegende = `${T('legende.radical')} + ${T('legende.terminaison')} · ${compose ? `${T('legende.aux')} + ${T('legende.pp')} · ` : ''}${groupe}`
  const fsLegende = Math.min(fs * 0.6, 5, W * 0.95 / ctx.mesure.largeur(texteLegende, police, true))
  const legende = `<p class="legende" style="font-size:${fsLegende}mm;white-space:nowrap"><span class="rad">${echapper(T('legende.radical'))}</span> + <span class="ter">${echapper(T('legende.terminaison'))}</span> · ${compose ? `<span class="aux">${echapper(T('legende.aux'))}</span> + <span class="pp">${echapper(T('legende.pp'))}</span> · ` : ''}${echapper(groupe)}</p>`
  return [{
    titre: T('titreVerbe', { inf: v.inf }),
    corps: `${legende}<div class="blocs" style="grid-template-columns:repeat(${cols}, ${wb}mm);gap:${gap}mm">${blocs}</div>`,
  }]
}

export const css = `
  h1 { color: #1d4e9e; }
  .legende { text-align: center; color: #555; margin-bottom: 3mm; flex: none; }
  .blocs { display: grid; }
  .bloc { border: 0.6mm solid; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; background: white; }
  .bt { color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .bl { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-evenly; padding-left: 8%; }
  .rad { color: #1d4e9e; } .ter { color: #d9480f; font-weight: 700; } .aux { color: #2b8a3e; font-weight: 700; } .pp { color: #1d4e9e; }`
