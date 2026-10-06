// Compteurs qui demandent de charger des modules de l'app (Vite sans navigateur) ou de lancer un autre contrôle.
// Compteurs (min : ne peuvent que monter) :
//   couverture       % des couples compétence × classe des domaines de maths et de français (src/data/programme.ts) qui ont
//                    au moins une ressource (exercice, fiche ou affiche ; src/impression/couverture.js, comme `npm run couverture`)
//   couvertureMonde  même pourcentage pour « le monde » (matière `monde` : sciences, histoire-géographie, EMC, temps et
//                    espace du cycle 1). Séparé le 2026-10-06, à l'ajout des programmes du Monde (168 cases sans ressource) :
//                    seuil à 0 tant qu'aucune ressource n'existe, il monte avec les premières. Le quiz de culture générale
//                    n'est rattaché à aucune compétence.
//   exercicesMigres  exercices interactifs du catalogue (activites.js, `fiche: true`, sous /maths, /francais,
//                    /maternelle) passés au modèle src/exercices/ (dans le registre) : avancement de la phase 2
// Compteur (max) :
//   erreursDeType    erreurs de `npm run types` (vue-tsc strict ; seuls les .ts, .vue et .d.ts comptent, pas les .js) : toujours 0
//
// La couverture et exercicesMigres lisent l'ANCIEN monde (activites.js, impression/couverture.js, exercices/ancien.js) : ils
// disparaîtront, ou seront réécrits sur src/ressources/, avec le dernier exercice ancien (le catalogue neuf ne compte aujourd'hui
// que les exercices déjà reportés : il ne mesure pas encore la couverture du site).
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { chargeurVite } from '../../lib/vite.ts'
import { racine } from '../../lib/racine.ts'
import type { Compteur } from './compteur.ts'

interface Programme {
  COMPETENCES: { id: string, domaine: string, niveaux: string[] }[]
  domaineDe: (id: string) => { matiere: string } | undefined
}
interface Couverture { ressourcesDe: (competence: string, niveau: string) => Record<string, unknown[]> }
interface Activites { ACTIVITES: { fiche?: boolean, to: string }[] }
interface Ancien { REGISTRE: { definition: { route: string } }[] }
interface Base { REGISTRE: { definition: { route: string }, exemple?: true }[] }

/** Un seul serveur Vite pour tous les compteurs qui en ont besoin ; fermé par `fermerChargeur` à la fin du contrôle. */
const vite = chargeurVite()
export const fermerChargeur = vite.fermer

// Couverture par matière : « maths et français » (les matières à programme chiffré, déjà couvertes par des exercices) et
// « le monde », dont les ressources arrivent après les compétences. Les deux dans un seul pourcentage feraient baisser le
// compteur de maths et français à chaque compétence du Monde ajoutée sans ressource, sans que rien n'ait régressé.
async function couvertureDes(matieres: string[]) {
  const { COMPETENCES, domaineDe } = await vite.charger<Programme>('/src/data/programme.ts')
  const { ressourcesDe } = await vite.charger<Couverture>('/src/impression/couverture.js')
  let cases = 0, couvertes = 0
  for (const k of COMPETENCES) {
    if (!matieres.includes(domaineDe(k.domaine)?.matiere ?? '')) continue
    for (const n of k.niveaux) {
      cases++
      if (Object.values(ressourcesDe(k.id, n)).some(l => l.length)) couvertes++
    }
  }
  // arrondi vers le bas au dixième : le seuil enregistré ne dépasse jamais la valeur réelle
  return { valeur: Math.floor(1000 * couvertes / cases) / 10, detail: `${couvertes} / ${cases} cases` }
}

const exercicesMigres: Compteur = async () => {
  const { ACTIVITES } = await vite.charger<Activites>('/src/data/activites.js')
  const { REGISTRE } = await vite.charger<Ancien>('/src/exercices/ancien.js')
  const { REGISTRE: BASE } = await vite.charger<Base>('/src/exercices/index.ts')
  // les exercices reportés dans la base (registre typé) ne sont plus au catalogue de l'ancien monde (activites.js) : on les compte des deux côtés
  const reportes = BASE.filter(e => !e.exemple).map(e => e.definition.route)
  const exercices = [...ACTIVITES.filter(a => a.fiche && /^\/(maths|francais|maternelle)\//.test(a.to)).map(a => a.to), ...reportes]
  const migres = new Set([...REGISTRE.map(e => e.definition.route), ...reportes])
  const restants = exercices.filter(r => !migres.has(r))
  const n = exercices.length - restants.length
  return { valeur: n, detail: `${n} / ${exercices.length} exercices au format définition (${reportes.length} dans la base)` }
}

// erreurs de type dans le TypeScript (verifier/types.mjs : vue-tsc strict, sans les .js) ; le détail : `npm run types`
const erreursDeType: Compteur = () => {
  const r = spawnSync(process.execPath, [join(racine, 'scripts/verifier/types.mjs')], { cwd: racine, encoding: 'utf8' })
  const n = Number(r.stdout.match(/✗ (\d+) erreur/)?.[1] ?? (r.status ? 1 : 0))
  return { valeur: n, detail: n ? 'voir npm run types' : '' }
}

export const compteursApp: Record<string, Compteur> = {
  erreursDeType,
  couverture: () => couvertureDes(['maths', 'francais']),
  couvertureMonde: () => couvertureDes(['monde']),
  exercicesMigres,
}
