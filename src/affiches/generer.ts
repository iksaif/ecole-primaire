// De la définition à la feuille : réglages valides → textes des langues → mesures du cadre → pages du dessin → document.
// C'est tout ce que sait faire une affiche ; le reste (page, titre, marge, A3, polices) est dans le cadre commun.
import { cadreAffiche, mesuresAffiche } from '../impression/affiches/cadre.ts'
import { POLICE_SCOLAIRE } from '../impression/document.ts'
import { creerRng } from '../utils/hasard.ts'
import { mesureEstimee } from './mesure.ts'
import { reglagesDe, POLICE_BASE } from './outils.ts'
import { cleVariante, traducteurAffiche } from './textes.ts'
import type { ContexteDessin, Mesure, ModuleAffiche, TypePolice } from './types.ts'

/**
 * Le document d'une affiche : une page par page du dessin.
 * @param config réglages lus (reglagesDe les rend valides)
 * @param polices police du texte quand `config.polices` n'en dit pas (Andika si absente)
 * @param mesure mesure de texte du dessin : le canvas dans le navigateur (mesureNavigateur), sinon l'estimation tabulée (mesure.ts)
 */
export function genererAffiche<R extends object>({ definition, rendu, textes }: ModuleAffiche<R>, config: Record<string, unknown> = {}, polices?: { script?: string }, mesure: Mesure = mesureEstimee) {
  const r = reglagesDe(definition, config)
  const Tde = (langue: string) => traducteurAffiche(textes, langue)
  const m = mesuresAffiche({ format: r.format, orientation: r.orientation, marge: definition.marge, hTitre: definition.hTitre })
  // le titre : celui de l'élève, sinon celui de l'affiche dans chaque langue de la feuille
  const titre = r.titre || r.langues.map(l => Tde(l)('titre')).join(' · ')
  const nomPolice = (type?: TypePolice): string => r.polices[type ?? 'unique'] ?? polices?.script ?? POLICE_BASE
  const contexte: ContexteDessin = {
    Tde,
    nomPolice,
    police: type => `'${nomPolice(type)}', Arial, sans-serif`,
    rng: creerRng(r.graine),
    mesure,
  }
  const pages = rendu.dessin(r, { W: m.W, H: m.H }, Tde(r.langue), contexte)
  if (!pages.length) throw new Error(`affiche « ${definition.id} » : le dessin doit rendre au moins une page`)
  // le titre et l'interface restent dans la police de base ; le texte de l'affiche, dans la police unique choisie
  const unique = r.polices.unique ?? polices?.script
  return cadreAffiche({
    ...m, format: r.format, orientation: r.orientation, polices: { script: unique ?? POLICE_BASE },
    titreDocument: r.titre || Tde(r.langue)(cleVariante(r.variante, 'titre')),
    pages: pages.map(p => {
      const titrePage = typeof p === 'string' || p.titre === undefined ? titre : (p.titre ?? undefined)
      const corps = typeof p === 'string' ? p : p.corps
      // le titre tient sur une ligne : sa taille baisse quand il est trop long (deux langues sur la feuille, titre de l'élève)
      return { titre: titrePage, corps, ratioTitre: titrePage ? ratioQuiTient(titrePage, m.W, m.hTitre, mesure) : undefined }
    }),
    css: `h1 { font-family: ${POLICE_SCOLAIRE}; }\n  ${rendu.css}`,
  })
}

/** La taille du titre (en part de sa hauteur) : 0,62 d'ordinaire, moins s'il faut pour tenir dans 95 % de la largeur (en gras, police de base). */
function ratioQuiTient(titre: string, largeur: number, hTitre: number, mesure: Mesure): number {
  const RATIO = 0.62
  const enCorps = mesure.largeur(titre, POLICE_BASE, true)   // largeur pour un corps de 1
  if (!enCorps) return RATIO
  return Math.min(RATIO, (largeur * 0.95) / enCorps / hTitre)
}
