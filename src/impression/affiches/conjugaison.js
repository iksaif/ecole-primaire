// Affiche de conjugaison : un bloc par temps, radical et terminaison en couleur (données : src/data/conjugaison.js)
import { echapper, largeurTexte, metriquesPolice } from '../../utils/impression'
import { VERBES, TITRES_TEMPS, TEMPS_CYCLE, formesTemps } from '../../data/conjugaison.js'
import { COULEURS } from './cadre.js'

const ligneHtml = segs => segs.map(([c, t]) => (c ? `<span class="${c}">${echapper(t)}</span>` : echapper(t))).join('')

export const titre = c => `Conjuguer le verbe ${VERBES[c.verbe]?.inf ?? ''}`

// polices = { script } : l'interligne suit les hampes et jambages de la police (une attachée est plus haute)
export function dessin(cfg, W, H, polices) {
  const v = VERBES[cfg.verbe] ?? VERBES.etre
  const temps = cfg.temps?.length ? cfg.temps : TEMPS_CYCLE
  const cols = temps.length > 2 ? 2 : 1, rangs = Math.ceil(temps.length / cols)
  const gap = 6, wb = (W - (cols - 1) * gap) / cols, hb = (H - 18 - (rangs - 1) * gap) / rangs
  // 6 lignes à l'interligne `il` × 1,25 dans la partie basse du bloc (84 %), avec un peu de marge
  const m = polices?.script ? metriquesPolice(polices.script) : null
  const il = m ? Math.max(1, (m.hampe + m.jambage) / 1.05) : 1
  // la ligne la plus longue (en gras, par prudence) tient dans le bloc, retrait de 8 % compris
  const police = polices?.script
  const lignes = temps.flatMap(t => formesTemps(cfg.verbe, t).map(l => l.map(([, x]) => x).join('')))
  const fsLargeur = police ? wb * 0.86 / Math.max(...lignes.map(l => largeurTexte(l, police, true))) : Infinity
  const fs = Math.min(hb / 10.5, wb / 17, hb * 0.84 * 0.92 / (6 * 1.25 * il), fsLargeur)
  const blocs = temps.map((t, k) => `<div class="bloc" style="width:${wb}mm;height:${hb}mm;border-color:${COULEURS[k % COULEURS.length]}">
    <div class="bt" style="background:${COULEURS[k % COULEURS.length]};font-size:${fs * 1.15}mm;height:${hb * 0.16}mm">${TITRES_TEMPS[t]}</div>
    <div class="bl" style="font-size:${fs}mm;line-height:${(1.25 * il).toFixed(2)}">${formesTemps(cfg.verbe, t).map(l => `<div>${ligneHtml(l)}</div>`).join('')}</div></div>`).join('')
  // auxiliaire et participe : seulement s'il y a un temps composé (pas sur l'affiche du présent seul)
  const compose = temps.some(t => t === 'passe-compose' || t === 'plus-que-parfait')
  const texteLegende = `radical + terminaison · ${compose ? 'auxiliaire + participe passé · ' : ''}${v.groupe === 'auxiliaire' ? 'verbe auxiliaire' : `verbe du ${v.groupe}`}`
  const fsLegende = Math.min(fs * 0.6, 5, police ? W * 0.95 / largeurTexte(texteLegende, police, true) : Infinity)
  const legende = `<p class="legende" style="font-size:${fsLegende}mm;white-space:nowrap"><span class="rad">radical</span> + <span class="ter">terminaison</span> · ${compose ? '<span class="aux">auxiliaire</span> + <span class="pp">participe passé</span> · ' : ''}${echapper(v.groupe === 'auxiliaire' ? 'verbe auxiliaire' : `verbe du ${v.groupe}`)}</p>`
  return `${legende}<div class="blocs" style="grid-template-columns:repeat(${cols}, ${wb}mm);gap:${gap}mm">${blocs}</div>`
}

export const css = `
  .blocs { display: grid; }
  .bloc { border: 0.6mm solid; border-radius: 3mm; overflow: hidden; display: flex; flex-direction: column; background: white; }
  .bt { color: white; font-weight: 700; display: flex; align-items: center; justify-content: center; flex: none; }
  .bl { flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: space-evenly; padding-left: 8%; }
  .rad { color: #1d4e9e; } .ter { color: #d9480f; font-weight: 700; } .aux { color: #2b8a3e; font-weight: 700; } .pp { color: #1d4e9e; }`
