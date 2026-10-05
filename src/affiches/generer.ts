// De la définition à la feuille : réglages valides → textes de la langue → mesures du cadre → dessin → document.
// C'est tout ce que sait faire une affiche ; le reste (page, titre, marge, A3, polices) est dans le cadre commun.
import { contenu } from '../i18n/index.js'
import { cadreAffiche, mesuresAffiche } from '../impression/affiches/cadre.ts'
import type { Reglages } from '../noyau/types.ts'
import { reglagesDe } from './outils.ts'
import { cleVariante } from './textes.ts'
import type { ModuleAffiche } from './types.ts'

/**
 * @param config réglages lus (reglagesDe les rend valides)
 * @param polices police du texte, déjà chargée (Andika si absente)
 */
export function genererAffiche<R extends Reglages>({ definition, rendu, textes }: ModuleAffiche<R>, config: Record<string, unknown> = {}, polices?: { script?: string }) {
  const r = reglagesDe(definition, config)
  const T = contenu(textes, r.langue).t
  const m = mesuresAffiche({ format: r.format, orientation: r.orientation, marge: definition.marge, hTitre: definition.hTitre })
  return cadreAffiche({
    ...m, format: r.format, orientation: r.orientation, polices,
    titre: T('titre'), titreDocument: T(cleVariante(r.variante, 'titre')),
    corps: rendu.dessin(r, { W: m.W, H: m.H }, T), css: rendu.css,
  })
}
