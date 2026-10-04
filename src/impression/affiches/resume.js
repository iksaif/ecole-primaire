// Affiche « Ce que je sais faire » : pour un domaine du programme et un niveau, une case à cocher par compétence
// (phrases : src/data/savoirs.js ; compétences et noms des domaines : src/data/programme.js)
import { echapper, largeurTexte } from '../../utils/impression'
import { COMPETENCES, DOMAINES, domaineDe, nomOfficiel } from '../../data/programme.js'
import { savoirsDu } from '../../data/savoirs.js'
import { COULEURS, hauteurRendue } from './cadre.js'

import { enClasse } from '../../data/classes.js'
export { enClasse }
export const phrases = c => savoirsDu(COMPETENCES.filter(k => k.domaine === c.domaine), c.niveau)

export const titre = c => `${domaineDe(c.domaine)?.court ?? ''} — ${c.niveau.toUpperCase()}`

// polices = { script } : la taille du texte est réduite jusqu'à ce que la liste tienne (mesurée hors écran)
export function dessin(cfg, W, H, polices) {
  const liste = phrases(cfg)
  const couleur = COULEURS[Math.max(0, DOMAINES.findIndex(d => d.id === cfg.domaine)) % COULEURS.length]
  const officiel = nomOfficiel(cfg.domaine, cfg.niveau)
  const rendu = fs => `<p class="sous-titre" style="font-size:${Math.max(fs * 1.15, 6)}mm;color:${couleur}">Ce que je sais faire ${enClasse(cfg.niveau)}</p>
    <ul class="savoirs" style="font-size:${fs}mm;--couleur:${couleur}">${liste.map(p => `<li><span class="case"></span><span>${echapper(p.texte)}</span></li>`).join('')}</ul>
    <p class="officiel" style="font-size:${Math.min(fs * 0.55, 4.2)}mm">D'après le programme officiel${officiel ? ` : « ${echapper(officiel)} »` : ''}</p>`
  // taille de départ : selon la place par phrase, et la plus longue phrase sur deux lignes au plus
  const police = polices?.script
  const plusLongue = police ? Math.max(...liste.map(p => largeurTexte(p.texte, police))) : 30
  let fs = Math.min(8, H / (liste.length * 2.6 + 4), (W - 20) * 2 / plusLongue)
  for (let k = 0; k < 4 && police; k++) {
    const h = hauteurRendue(rendu(fs), css, W, police)
    if (!h || h <= H * 0.96) break
    fs *= H * 0.95 / h
  }
  return `<div class="corps-savoirs">${rendu(fs)}</div>`
}

export const css = `
  .corps-savoirs { flex: 1; display: flex; flex-direction: column; justify-content: center; width: 100%; }
  ul.savoirs { list-style: none; display: flex; flex-direction: column; gap: 0.7em; padding: 0 4mm; }
  ul.savoirs li { display: flex; align-items: flex-start; gap: 0.6em; line-height: 1.3; }
  ul.savoirs .case { flex: none; width: 0.9em; height: 0.9em; margin-top: 0.2em; border: 0.5mm solid var(--couleur); border-radius: 1.2mm; }
  .sous-titre { font-weight: 700; text-align: center; margin-bottom: 0.8em; }
  .officiel { margin-top: 6mm; color: #888; text-align: center; }`
