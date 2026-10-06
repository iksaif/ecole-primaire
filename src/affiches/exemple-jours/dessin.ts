// Le dessin du deuxième exemple : sept lignes, le jour en script puis en attaché. `police(type)` donne la famille choisie
// pour ce type (le titre, lui, est toujours dans la police de base). Une seule page.
// Chaque colonne a sa taille de texte : celle qui fait tenir le plus long des sept jours dans la moitié de la largeur (l'attaché est
// plus large que le script, et le breton a des jours plus longs que le français), sans dépasser la hauteur d'une ligne.
import type { Rendu } from '../types.ts'
import type { Reglages } from './definition.ts'

export const dessin: Rendu<Reglages>['dessin'] = (_r, { W, H }, T, { police, nomPolice, mesure }) => {
  const ligne = H / 7
  const jours = Array.from({ length: 7 }, (_, i) => T(`jour.${i}`))
  const taille = (type: 'script' | 'attache'): number => {
    const plusLong = Math.max(...jours.map(j => mesure.largeur(j, nomPolice(type))))   // en corps de texte (em)
    return Math.min(ligne * 0.55, (W * 0.46) / Math.max(plusLong, 0.001))
  }
  const [tailleScript, tailleAttache] = [taille('script'), taille('attache')]
  const lignes = jours.map(jour => `<div class="jour" style="height:${ligne}mm">
    <span class="script" style="font-family:${police('script')};font-size:${tailleScript}mm">${jour}</span>
    <span class="attache" style="font-family:${police('attache')};font-size:${tailleAttache}mm">${jour}</span></div>`)
  return [`<div class="jours" style="width:${W}mm;height:${H}mm">${lignes.join('')}</div>`]
}

export const css = `.jours { display: flex; flex-direction: column; }
  .jour { display: flex; align-items: center; justify-content: space-around; border-bottom: .3mm solid #ccd; line-height: 1; }
  .script { flex: 1; text-align: center; } .attache { flex: 1; text-align: center; color: #1d4e9e; }`
