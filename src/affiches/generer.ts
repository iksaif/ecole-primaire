// De la définition à la feuille : réglages valides → textes des langues → mesures du cadre → pages du dessin → document.
// C'est tout ce que sait faire une affiche ; le reste (page, titre, marge, A3, polices) est dans le cadre commun.
import { cadreAffiche, mesuresAffiche } from '../impression/affiches/cadre.ts'
import { POLICE_SCOLAIRE } from '../impression/document.ts'
import { creerRng } from '../utils/hasard.ts'
import type { Reglages } from '../noyau/types.ts'
import { reglagesDe, POLICE_BASE } from './outils.ts'
import { cleVariante, traducteurAffiche } from './textes.ts'
import type { ContexteDessin, ModuleAffiche, TypePolice } from './types.ts'

/**
 * Le document d'une affiche : une page par page du dessin.
 * @param config réglages lus (reglagesDe les rend valides)
 * @param polices police du texte quand `config.polices` n'en dit pas (Andika si absente)
 */
export function genererAffiche<R extends Reglages>({ definition, rendu, textes }: ModuleAffiche<R>, config: Record<string, unknown> = {}, polices?: { script?: string }) {
  const r = reglagesDe(definition, config)
  const Tde = (langue: string) => traducteurAffiche(textes, langue)
  const m = mesuresAffiche({ format: r.format, orientation: r.orientation, marge: definition.marge, hTitre: definition.hTitre })
  // le titre : celui de l'élève, sinon celui de l'affiche dans chaque langue de la feuille
  const titre = r.titre || r.langues.map(l => Tde(l)('titre')).join(' · ')
  const contexte: ContexteDessin = {
    Tde,
    police: (type?: TypePolice) => `'${r.polices[type ?? 'unique'] ?? polices?.script ?? POLICE_BASE}', Arial, sans-serif`,
    rng: creerRng(r.graine),
  }
  const pages = rendu.dessin(r, { W: m.W, H: m.H }, Tde(r.langue), contexte)
  if (!pages.length) throw new Error(`affiche « ${definition.id} » : le dessin doit rendre au moins une page`)
  // le titre et l'interface restent dans la police de base ; le texte de l'affiche, dans la police unique choisie
  const unique = r.polices.unique ?? polices?.script
  return cadreAffiche({
    ...m, format: r.format, orientation: r.orientation, polices: { script: unique ?? POLICE_BASE },
    titreDocument: r.titre || Tde(r.langue)(cleVariante(r.variante, 'titre')),
    pages: pages.map(p => (typeof p === 'string' ? { titre, corps: p } : { titre: p.titre === undefined ? titre : (p.titre ?? undefined), corps: p.corps })),
    css: `h1 { font-family: ${POLICE_SCOLAIRE}; }\n  ${rendu.css}`,
  })
}
