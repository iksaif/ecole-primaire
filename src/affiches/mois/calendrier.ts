// Les mois dans l'ordre de l'année, de janvier à décembre, avec les saisons en bande à gauche : la saison change au milieu d'un mois (vers le 21),
// donc la bande et le fond des mois changent de couleur en cours de mois, et l'hiver est coupé en deux (début et fin de l'année). Un repère
// « vers le 21 mars » marque chaque changement. Pur : la mesure du texte vient du contexte.
import type { ContexteDessin } from '../types.ts'
import { echapper } from '../../utils/html.js'
import { ecritures, tailleQuiTient } from '../listeMots.ts'
import { AFFICHER_DATES_DE_CHANGEMENT, CHANGEMENTS, SAISONS, saisonDe, troncons } from './saisons.ts'

const MOIS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

export function dessinerCalendrier(zone: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[], attache: boolean): string {
  const { W, H } = zone
  const types = ecritures(attache)
  const rh = H / 12
  const bande = Math.min(W * (AFFICHER_DATES_DE_CHANGEMENT ? 0.2 : 0.17), AFFICHER_DATES_DE_CHANGEMENT ? 40 : 36)
  const largeurMois = W - bande
  const largeurMot = largeurMois / (langues.length * types.length)
  const tousLesMois = (l: string): string[] => MOIS.map(i => ctx.Tde(l)(`mois.${i}`))
  const tailles = langues.map(l => types.map(type => tailleQuiTient(tousLesMois(l), ctx.nomPolice(type), largeurMot, rh * 0.62, ctx)))

  // le fond des mois : une couleur par tronçon de saison, avec un changement net là où la saison change (au milieu d'un mois)
  const arrets = troncons().map(t => `${saisonDe(t.saison).fond} ${(t.debut * rh).toFixed(2)}mm ${(t.fin * rh).toFixed(2)}mm`).join(', ')
  const fond = `<div class="fond-annee" style="left:${bande}mm;width:${largeurMois}mm;height:${H}mm;background:linear-gradient(to bottom, ${arrets})"></div>`

  // les mois, une rangée chacun
  const rangees = MOIS.map(i => `<div class="mois-annee" style="top:${i * rh}mm;left:${bande}mm;width:${largeurMois}mm;height:${rh}mm">${
    langues.map((l, k) => types.map((type, j) =>
      `<span class="mot l${k} ${type}" style="width:${largeurMot}mm;font-family:${ctx.police(type)};font-size:${tailles[k][j]}mm">${echapper(ctx.Tde(l)(`mois.${i}`))}</span>`).join('')).join('')}</div>`).join('')

  // la bande des saisons : un tronçon par saison, l'image et le nom dans les tronçons assez hauts (pas dans le bout d'hiver de fin d'année)
  const hNom = (rh * 0.9) / langues.length
  const tNom = Math.min(...langues.map(l => tailleQuiTient(SAISONS.map(s => ctx.Tde(l)(`saison.${s.id}`)), ctx.nomPolice('script'), bande * 0.88, hNom * 0.85, ctx)))
  const tImage = Math.min(rh * 1.1, bande * 0.45)
  const troncs = troncons().map(t => {
    const s = saisonDe(t.saison)
    const haut = (t.fin - t.debut) * rh
    const contenu = haut >= rh * 1.5
      ? `<span class="image-saison" style="font-size:${tImage}mm">${s.emoji}</span>${langues.map((l, k) => `<span class="nom-saison l${k}" style="font-family:${ctx.police('script')};font-size:${tNom}mm">${echapper(ctx.Tde(l)(`saison.${t.saison}`))}</span>`).join('')}`
      : ''
    return `<div class="troncon-saison" style="top:${(t.debut * rh).toFixed(2)}mm;height:${haut.toFixed(2)}mm;width:${bande}mm;background:${s.accent}">${contenu}</div>`
  }).join('')

  // les repères : « vers le 21 mars », posés sur la bande, à cheval sur le changement
  const tRepere = !AFFICHER_DATES_DE_CHANGEMENT ? 0 : Math.min(3.8, ...langues.map(l => tailleQuiTient(CHANGEMENTS.map(c => ctx.Tde(l)('saison.debut', { jour: c.jour, mois: ctx.Tde(l)(`mois.${c.mois}`) })), ctx.nomPolice('script'), bande - 3, 3.8, ctx)))
  const reperes = !AFFICHER_DATES_DE_CHANGEMENT ? '' : CHANGEMENTS.map(c => {
    const y = ((c.mois + (c.jour - 1) / [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][c.mois]) * rh).toFixed(2)
    const textes = langues.map((l, k) => `<span class="l${k}">${echapper(ctx.Tde(l)('saison.debut', { jour: c.jour, mois: ctx.Tde(l)(`mois.${c.mois}`) }))}</span>`).join('')
    return `<div class="repere-saison" style="top:${y}mm;width:${bande - 3}mm;font-family:${ctx.police('script')};font-size:${tRepere}mm">${textes}</div>`
  }).join('')

  return `<div class="calendrier" style="width:${W}mm;height:${H}mm">${fond}${rangees}${troncs}${reperes}</div>`
}

export const CSS_CALENDRIER = `
  /* pas d'overflow caché : les hautes et les basses lettres de l'attaché dépassent d'une rangée ; les coins arrondis sont posés sur le fond et sur la bande */
  .calendrier { position: relative; border-radius: 3mm; border: .3mm solid #cfd6df; box-sizing: border-box; }
  .fond-annee { position: absolute; top: 0; border-radius: 0 2.7mm 2.7mm 0; }
  .troncon-saison:first-of-type { border-radius: 2.7mm 0 0 0; }
  .troncon-saison:last-of-type { border-radius: 0 0 0 2.7mm; }
  .mois-annee { position: absolute; display: flex; align-items: center; border-bottom: .3mm solid rgba(0, 0, 0, .12); line-height: 1; box-sizing: border-box; }
  .mois-annee .mot { text-align: center; white-space: nowrap; }
  .troncon-saison { position: absolute; left: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; line-height: 1; box-sizing: border-box; }
  .repere-saison { position: absolute; left: 1.5mm; transform: translateY(-50%); display: flex; flex-direction: column; align-items: center; gap: .4mm; padding: .8mm .6mm; text-align: center; line-height: 1.1; background: #fff; border: .3mm solid #8b95a3; border-radius: 1.5mm; color: #222; z-index: 2; box-sizing: border-box; }
  .repere-saison .l1 { color: #1d4e9e; }
  .note-saisons { display: flex; flex-direction: column; justify-content: center; text-align: center; color: #333; line-height: 1.25; }
  .note-saisons .l1 { color: #1d4e9e; }`
