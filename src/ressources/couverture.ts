// Couverture du programme : ce qui travaille chaque compétence de src/data/programme.ts, classe par classe, d'après les registres de la
// base — les exercices (une ressource par niveau), leurs fiches publiées, les affiches (une ressource par variante). Pur (lisible par
// node) : le rapport `npm run couverture` et les compteurs `couverture` de `npm run qualite` le lisent. Remplace
// src/impression/couverture.js (ancien monde, supprimé le 2026-10-07).
import { REGISTRE as EXERCICES } from '../exercices/index.ts'
import { REGISTRE as AFFICHES } from '../affiches/index.ts'
import { slugDe } from '../affiches/catalogue.ts'
import { competencesDeFiche } from '../noyau/definir.ts'
import { slugFiche } from '../noyau/slugs.ts'
import type { Classe, CompetenceId } from '../noyau/types.ts'

export type SorteCouverture = 'exercice' | 'fiche' | 'affiche'

/** Une ressource qui couvre des compétences dans des classes. */
export interface RessourceCouverte {
  sorte: SorteCouverture
  titre: string
  /** route de l'app (exercice, affiche) ou slug de la page /telechargements/ (fiche, affiche) */
  route?: string
  slug?: string
  competences: readonly CompetenceId[]
  classes: readonly Classe[]
}

/** Toutes les ressources réelles des registres (sans les exemples de développement). */
export const RESSOURCES: readonly RessourceCouverte[] = [
  ...EXERCICES.filter(e => !e.exemple).flatMap(({ definition: d }) => [
    ...Object.entries(d.niveaux).map(([classe, niv]): RessourceCouverte => ({
      sorte: 'exercice', titre: d.id, route: d.route, competences: niv?.competences ?? [], classes: [classe as Classe],
    })),
    ...d.fiches.map((f): RessourceCouverte => ({
      sorte: 'fiche', titre: `${d.id} : ${f.id}`, slug: slugFiche(d.id, f), competences: competencesDeFiche(d, f), classes: f.classes ?? [f.niveau],
    })),
  ]),
  ...AFFICHES.filter(a => a.definition.domaine !== 'exemple').flatMap(({ definition: d, textes }) => Object.entries(d.variantes).map(([id, v]): RessourceCouverte => ({
    sorte: 'affiche', titre: textes.fr?.[`variante.${id}.court`] ?? id, slug: slugDe(d, id, ['fr']),
    route: `${d.route}?affiche=${d.id}&variante=${id}`, competences: v.competences, classes: v.classes,
  }))),
]

/** Ce qui travaille une compétence dans une classe, par sorte. */
export function ressourcesDe(competence: string, niveau: string): Record<SorteCouverture, RessourceCouverte[]> {
  const par: Record<SorteCouverture, RessourceCouverte[]> = { exercice: [], fiche: [], affiche: [] }
  for (const r of RESSOURCES) if (r.competences.includes(competence as CompetenceId) && r.classes.includes(niveau as Classe)) par[r.sorte].push(r)
  return par
}
