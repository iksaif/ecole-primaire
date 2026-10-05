// Le dessin du deuxième exemple : sept lignes, le jour en script puis en attaché. `police(type)` donne la famille choisie
// pour ce type (le titre, lui, est toujours dans la police de base). Une seule page.
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

export const dessin: Rendu<Reglages>['dessin'] = (_r, { W, H }, T, { police }) => {
  const ligne = H / 7
  const taille = ligne * 0.55
  const lignes = Array.from({ length: 7 }, (_, i) => `<div class="jour" style="height:${ligne}mm;font-size:${taille}mm">
    <span class="script" style="font-family:${police('script')}">${T(`jour.${i}`)}</span>
    <span class="attache" style="font-family:${police('attache')}">${T(`jour.${i}`)}</span></div>`)
  return [`<div class="jours" style="width:${W}mm;height:${H}mm">${lignes.join('')}</div>`]
}

export const css = `.jours { display: flex; flex-direction: column; }
  .jour { display: flex; align-items: center; justify-content: space-around; border-bottom: .3mm solid #ccd; line-height: 1; }
  .script { flex: 1; text-align: center; } .attache { flex: 1; text-align: center; color: #1d4e9e; }`
