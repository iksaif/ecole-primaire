// Compteurs qui demandent de charger des modules de l'app ou de lancer un autre contrôle.
// Compteurs (min : ne peuvent que monter) :
//   couverture       % des couples compétence × classe des domaines de maths et de français (src/data/programme.ts) qui ont
//                    au moins une ressource (exercice, fiche ou affiche des registres ; src/ressources/couverture.ts, comme `npm run couverture`)
//   couvertureMonde  même pourcentage pour « le monde » (matière `monde` : sciences, histoire-géographie, EMC, temps et
//                    espace du cycle 1). Séparé le 2026-10-06, à l'ajout des programmes du Monde : seuil à 0 au départ, il monte
//                    avec les ressources.
// Compteur (max) :
//   erreursDeType    erreurs de `npm run types` (vue-tsc strict ; seuls les .ts, .vue et .d.ts comptent, pas les .js) : toujours 0
//
// Retiré le 2026-10-07 : `exercicesMigres` (exercices de l'ancien catalogue passés au modèle de la base) : la migration est finie
// (26 sur 26) et l'ancien catalogue (data/activites.js) est supprimé. La couverture lit désormais les registres de la base.
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { racine } from '../../lib/racine.ts'
import type { Compteur } from './compteur.ts'

import { COMPETENCES, domaineDe } from '../../../src/data/programme.ts'
import { ressourcesDe } from '../../../src/ressources/couverture.ts'

/** Rien à fermer : les modules de l'app se lisent directement (node exécute le TypeScript). Gardé pour qualite.ts. */
export const fermerChargeur = async (): Promise<void> => {}

// Couverture par matière : « maths et français » (les matières à programme chiffré, déjà couvertes par des exercices) et
// « le monde », dont les ressources arrivent après les compétences. Les deux dans un seul pourcentage feraient baisser le
// compteur de maths et français à chaque compétence du Monde ajoutée sans ressource, sans que rien n'ait régressé.
function couvertureDes(matieres: string[]) {
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
}
