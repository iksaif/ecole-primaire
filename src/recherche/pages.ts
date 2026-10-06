// Les pages du site, vues comme des ressources à chercher : tirées de la table des routes (celles qui ont un titre de document
// et une adresse sans paramètre). Pur : lisible par node.
//   const pages = pagesDuSite(router.getRoutes())
// Écartées : les routes à paramètre (`/competence/:id`, `/telechargements/:slug`, la page introuvable), les redirections, les
// pages de développement (`/dev…`) et la page générique d'un exercice (les exercices sont dans le catalogue).
import type { RouteMeta } from 'vue-router'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { EMOJI_TYPE } from '../ressources/emojis.ts'
import type { RessourcePage } from '../ressources/types.ts'

/** Ce qu'il faut d'une route : son adresse, ses métadonnées, et si c'est une redirection. */
export interface RouteDeLaTable {
  readonly path: string
  readonly meta: RouteMeta
  readonly redirect?: unknown
}

const TITRE_EXERCICE = 'routeur.titre.exercice'

/** Une page par route retenue, dans l'ordre de la table. */
export function pagesDuSite(routes: readonly RouteDeLaTable[]): readonly RessourcePage[] {
  return routes.flatMap((r): RessourcePage[] => {
    if (r.redirect || r.path.includes(':') || r.path.startsWith('/dev') || r.meta.titre === TITRE_EXERCICE) return []
    const titre = r.meta.titre ? { cle: r.meta.titre } : r.meta.titreLibre ? { texte: { [LANGUE_SOURCE]: r.meta.titreLibre } } : null
    if (!titre) return []
    return [{
      id: `page:${r.path}`, type: 'page', titre, description: null, emoji: EMOJI_TYPE.page, classes: [], competences: [],
      langues: [LANGUE_SOURCE], route: r.path, exemple: false,
    }]
  })
}
