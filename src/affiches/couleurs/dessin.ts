// Le dessin des couleurs : des cartes (image, mot dans chaque langue de la feuille), dessin commun de la maternelle : src/affiches/cartes.ts.
import type { Rendu } from '../types.ts'
import { CSS_CARTES, dessinerCartes, titreDeLaPage } from '../cartes.ts'
import type { Carte, Enchainement } from '../cartes.ts'
import type { NomEmoji } from '../../images/tables.ts'
import type { Reglages } from './definition.ts'

/** Une carte de la feuille : son identifiant (les textes `mot.<id>`) et son image. */
interface Element { id: string, emoji: NomEmoji, couleur?: string }

const CARTES: Readonly<Record<string, { enchainement: Enchainement, elements: readonly Element[] }>> = {
  couleurs: { enchainement: 'grille', elements: [
    { id: 'rouge', emoji: 'pomme', couleur: '#e53935' },
    { id: 'bleu', emoji: 'baleine', couleur: '#1e66d0' },
    { id: 'jaune', emoji: 'citron', couleur: '#fbc02d' },
    { id: 'vert', emoji: 'grenouille', couleur: '#43a047' },
    { id: 'orange', emoji: 'carotte', couleur: '#fb8c00' },
    { id: 'violet', emoji: 'raisin', couleur: '#8e24aa' },
    { id: 'rose', emoji: 'cochon', couleur: '#f48fb1' },
    { id: 'marron', emoji: 'chataigne', couleur: '#8d5b3e' },
    { id: 'noir', emoji: 'chatNoir', couleur: '#212121' },
    { id: 'blanc', emoji: 'bonhommeDeNeige', couleur: '#e3e8ec' },
    { id: 'gris', emoji: 'elephant', couleur: '#9e9e9e' },
  ] },
}

/** Les couleurs ajoutées par le réglage « Noir, blanc et gris ». */
const NEUTRES: readonly string[] = ['noir', 'blanc', 'gris']

export const dessin: Rendu<Reglages>['dessin'] = (r, zone, _T, ctx) => {
  const lot = CARTES[r.variante]
  const montrees = lot.elements.filter(e => r.neutres || !NEUTRES.includes(e.id))
  const cartes: Carte[] = montrees.map(e => ({
    emoji: e.emoji,
    mot: langue => ctx.Tde(langue)(`mot.${e.id}`),
    couleur: e.couleur,
  }))
  return [{ corps: dessinerCartes(cartes, zone, ctx, { langues: r.langues, enchainement: lot.enchainement }), titre: titreDeLaPage(r, ctx) }]
}

export const css = CSS_CARTES
