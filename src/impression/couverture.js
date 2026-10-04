// Couverture du programme : ce qui travaille chaque compétence de src/data/programme.js, classe par classe — exercices
// de l'app, générateurs, fiches et affiches toutes prêtes, fiches par compétence. Partagé par la page « Le programme »
// (ProgrammeView) et par le rapport `npm run couverture`. Les liens entre ressources et compétences sont dans les
// données : `competences` des activités, des affiches et des fiches du catalogue, `fiches` des exercices prégénérés.
import { NIVEAUX } from '../data/programme.js'
import { ACTIVITES } from '../data/activites.js'
import { TELECHARGEMENTS } from './catalogue.js'
import { TELECHARGEMENTS_CALCUL } from './calcul'
import { EXERCICES, classesDe, fichesDe } from './exercices.js'

// « GS · CP · CE1 », « CE1 → CM2 » → ['gs', 'cp', 'ce1'] ; une flèche donne toutes les classes entre les deux
export function classesDuTexte(s) {
  const c = (s || '').toLowerCase().split(/[·,\s]+/).filter(x => NIVEAUX.includes(x) || x === '→')
  const i = c.indexOf('→')
  if (i > 0) return NIVEAUX.slice(NIVEAUX.indexOf(c[i - 1]), NIVEAUX.indexOf(c[i + 1]) + 1)
  return c.filter(x => x !== '→')
}

// Ressources : { sorte: 'exercice' | 'fiche' | 'affiche', titre, route (app) ou slug (page /telechargements/),
// competences, classes }. Fiches en français seulement (les versions bretonnes ont le même contenu).
export const RESSOURCES = [
  ...ACTIVITES.filter(a => a.competences?.length).map(a => ({
    sorte: a.matiere === 'imprimer' ? (a.genre === 'affiche' ? 'affiche' : 'fiche') : 'exercice',
    generateur: a.matiere === 'imprimer', titre: a.titre, icone: a.icon, route: a.to, competences: a.competences, classes: a.niveaux,
  })),
  ...[...TELECHARGEMENTS.filter(t => t.langues.includes('fr')), ...TELECHARGEMENTS_CALCUL.filter(t => t.config.langue !== 'br')].map(t => ({
    // lien : le générateur réglé sur cette fiche ou affiche (`lien` du catalogue) ; slug : sa page de téléchargement
    sorte: t.genre === 'affiche' ? 'affiche' : 'fiche', titre: t.court ?? t.titre, slug: t.slug, lien: t.lien,
    competences: t.competences ?? [], classes: classesDuTexte(t.niveaux),
  })),
  ...EXERCICES.flatMap(ex => ex.classes.flatMap(c => fichesDe(ex, c.classe).map(f => ({
    sorte: 'fiche', titre: `${ex.titre.fr} : ${f.titre}`, slug: `exercices-${ex.id}-${c.classe}-${f.id}`,
    competences: [f.competence], classes: classesDe(c.classe),
  })))),
]

// Ce qui travaille une compétence dans une classe, par sorte
export function ressourcesDe(competence, niveau) {
  const par = { exercice: [], fiche: [], affiche: [] }
  for (const r of RESSOURCES) if (r.competences.includes(competence) && r.classes.includes(niveau)) par[r.sorte].push(r)
  return par
}
