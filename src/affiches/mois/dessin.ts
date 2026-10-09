// Le dessin des mois de l'année. Sans les saisons : une ligne par mois (dessin commun des listes de mots : listeMots.ts). Avec les saisons :
// quatre bandes, une par saison, chacune de sa couleur, avec ses trois mois dedans — pour voir d'un coup d'œil dans quelle saison tombe
// chaque mois (printemps : mars, avril, mai ; été : juin, juillet, août ; automne : septembre, octobre, novembre ; hiver : décembre,
// janvier, février). Portrait : les bandes l'une sous l'autre, la saison à gauche et les mois à droite ; paysage : quatre colonnes.
import type { ContexteDessin, Rendu } from '../types.ts'
import { echapper } from '../../utils/html.js'
import { CSS_LISTE, dessinerListe, ecritures, tailleQuiTient } from '../listeMots.ts'
import type { Reglages } from './definition.ts'

const MOIS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

/**
 * Les saisons dans l'ordre des repères de l'académie de Rennes (« nevez-amzer, hañv, diskar-amzer, goañv »), avec leurs mois (0 = janvier),
 * leur image et leurs deux couleurs : le fond pâle de la bande et l'accent de la saison (la case de gauche).
 */
const SAISONS = [
  { id: 'printemps', emoji: '🌱', mois: [2, 3, 4], fond: '#eaf7e4', accent: '#a5d98f' },
  { id: 'ete', emoji: '☀️', mois: [5, 6, 7], fond: '#fff7d9', accent: '#ffd966' },
  { id: 'automne', emoji: '🍂', mois: [8, 9, 10], fond: '#fdeede', accent: '#f4aa6c' },
  { id: 'hiver', emoji: '❄️', mois: [11, 0, 1], fond: '#e8f2fc', accent: '#9fc9f0' },
] as const

const ECART = 3   // mm entre les bandes (ou les colonnes)

/** Les mots d'un mois : une case par langue et par écriture, côte à côte (portrait) ou les uns sous les autres (paysage). */
function motsDuMois(i: number, langues: readonly string[], types: readonly ('script' | 'attache')[], tailles: number[][], largeur: number, hauteur: number, ctx: ContexteDessin, enLigne: boolean): string {
  return langues.map((l, k) => types.map((type, j) =>
    `<span class="mot l${k} ${type}" style="${enLigne ? `width:${largeur}mm` : `height:${hauteur}mm`};font-family:${ctx.police(type)};font-size:${tailles[k][j]}mm">${echapper(ctx.Tde(l)(`mois.${i}`))}</span>`).join('')).join('')
}

/** Les mois par saison : une bande (portrait) ou une colonne (paysage) par saison. */
function dessinerSaisons(zone: { W: number, H: number }, ctx: ContexteDessin, langues: readonly string[], attache: boolean): string {
  const { W, H } = zone
  const paysage = W > H
  const types = ecritures(attache)
  const nbMots = langues.length * types.length
  // la taille de la bande (ou de la colonne) d'une saison, de son bloc « saison » et de la rangée d'un mois
  const bande = paysage ? { l: (W - 3 * ECART) / 4, h: H } : { l: W, h: (H - 3 * ECART) / 4 }
  const bloc = paysage ? { l: bande.l, h: bande.h * 0.3 } : { l: bande.l * 0.27, h: bande.h }
  const moisZone = paysage ? { l: bande.l, h: bande.h - bloc.h } : { l: bande.l - bloc.l, h: bande.h }
  const rangee = { l: moisZone.l, h: moisZone.h / 3 }
  // les mois : en portrait un mot par colonne ; en paysage les mots sont empilés (une ligne par langue et par écriture)
  const largeurMot = paysage ? rangee.l : rangee.l / nbMots
  const hauteurMot = paysage ? rangee.h / nbMots : rangee.h
  const tousLesMois = (l: string): string[] => MOIS.map(i => ctx.Tde(l)(`mois.${i}`))
  const tailles = langues.map(l => types.map(type => tailleQuiTient(tousLesMois(l), ctx.nomPolice(type), largeurMot, hauteurMot * (paysage ? 0.8 : 0.6), ctx)))
  // le nom de la saison : une ligne par langue dans le bloc, sous l'image
  const nomsSaison = (id: string): string[] => langues.map(l => ctx.Tde(l)(`saison.${id}`))
  const hNom = (bloc.h * (paysage ? 0.4 : 0.36)) / langues.length
  const tNom = Math.min(...langues.map(l => tailleQuiTient(SAISONS.map(s => ctx.Tde(l)(`saison.${s.id}`)), ctx.nomPolice('script'), bloc.l * 0.88, hNom * 0.8, ctx)))   // en gras : un peu plus large que la mesure du texte courant
  const tImage = Math.min(bloc.h * (paysage ? 0.45 : 0.4), bloc.l * 0.5)

  const bandes = SAISONS.map(s => {
    const lignes = s.mois.map(i => `<div class="mois-saison" style="height:${rangee.h}mm">${motsDuMois(i, langues, types, tailles, largeurMot, hauteurMot, ctx, !paysage)}</div>`).join('')
    const noms = nomsSaison(s.id).map((n, k) => `<span class="nom-saison l${k}" style="font-family:${ctx.police('script')};font-size:${tNom}mm">${echapper(n)}</span>`).join('')
    return `<section class="saison" style="width:${bande.l}mm;height:${bande.h}mm;background:${s.fond}">
      <div class="bloc-saison" style="width:${bloc.l}mm;height:${bloc.h}mm;background:${s.accent}"><span class="image-saison" style="font-size:${tImage}mm">${s.emoji}</span>${noms}</div>
      <div class="mois-de-la-saison" style="width:${moisZone.l}mm;height:${moisZone.h}mm">${lignes}</div></section>`
  }).join('')
  return `<div class="saisons ${paysage ? 'paysage' : 'portrait'}" style="width:${W}mm;height:${H}mm;gap:${ECART}mm">${bandes}</div>`
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  if (r.saisons) return [dessinerSaisons(zone, ctx, r.langues, r.attache)]
  const elements = MOIS.map(i => ({ mot: (l: string) => ctx.Tde(l)(`mois.${i}`) }))
  return [dessinerListe(elements, zone, ctx, { langues: r.langues, attache: r.attache })]
}

export const css = `${CSS_LISTE}
  .saisons { display: flex; }
  .saisons.portrait { flex-direction: column; }
  .saison { display: flex; border-radius: 4mm; overflow: hidden; border: .3mm solid #cfd6df; }
  .saisons.portrait .saison { flex-direction: row; }
  .saisons.paysage .saison { flex-direction: column; }
  .bloc-saison { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1mm; line-height: 1; }
  .nom-saison { font-weight: 700; white-space: nowrap; color: #222; }
  .nom-saison.l1 { color: #1d4e9e; }
  .image-saison { line-height: 1; }
  .mois-de-la-saison { display: flex; flex-direction: column; }
  .mois-saison { display: flex; align-items: center; border-bottom: .3mm solid rgba(0, 0, 0, .12); line-height: 1; }
  .mois-saison:last-child { border-bottom: none; }
  .saisons.portrait .mois-saison .mot { text-align: center; white-space: nowrap; }
  .saisons.paysage .mois-saison { flex-direction: column; justify-content: center; }
  .saisons.paysage .mois-saison .mot { display: flex; align-items: center; justify-content: center; white-space: nowrap; }`
