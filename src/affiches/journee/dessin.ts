// Le dessin de la journée : des cartes (image, mot dans chaque langue de la feuille), dessin commun de la maternelle : src/affiches/cartes.ts.
import type { Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte, Enchainement } from '../cartes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Reglages } from './definition.ts'

/** Une carte de la feuille : son identifiant (les textes `mot.<id>`) et son image. */
interface Element { id: string, emoji: NomEmoji }

const CARTES: Readonly<Record<string, { enchainement: Enchainement, numeroter?: boolean, elements: readonly Element[] }>> = {
  'jour-nuit': { enchainement: 'grille', elements: [
    { id: 'matin', emoji: 'coq' },
    { id: 'soir', emoji: 'couchant' },
    { id: 'jour', emoji: 'soleil' },
    { id: 'nuit', emoji: 'lune' },
  ] },
  moments: { enchainement: 'suite', numeroter: true, elements: [
    { id: 'matin', emoji: 'coq' },
    { id: 'midi', emoji: 'repas' },
    { id: 'apresMidi', emoji: 'jouet' },
    { id: 'soir', emoji: 'couchant' },
    { id: 'nuit', emoji: 'lune' },
  ] },
  routine: { enchainement: 'suite', numeroter: true, elements: [
    { id: 'petitDejeuner', emoji: 'croissant' },
    { id: 'ecole', emoji: 'ecole' },
    { id: 'dejeuner', emoji: 'repas' },
    { id: 'gouter', emoji: 'gouter' },
    { id: 'diner', emoji: 'pates' },
    { id: 'dormir', emoji: 'lit' },
  ] },
}

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const lot = CARTES[r.variante]
  const cartes: Carte[] = lot.elements.map((e, i) => ({
    emoji: e.emoji,
    mot: langue => ctx.Tde(langue)(`mot.${e.id}`),
    numero: lot.numeroter ? i + 1 : undefined,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: lot.enchainement }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
