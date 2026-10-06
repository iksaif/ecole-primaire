// La configuration du déploiement : `.deploy.env` à la racine (non commité, modèle : `.deploy.env.example`). C'est le seul endroit
// où vivent l'hôte SSH et les domaines : ni secret ni hôte réel dans le dépôt. deploy-vps.sh la lit avec `source` (bash) ; les
// scripts node la lisent ici, avec la même forme `CLE=valeur`.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { chemin } from '../lib/racine.ts'

export interface ConfigDeploiement {
  /** `utilisateur@serveur` */
  hote: string
  /** les sites (fichiers `.env.<site>`) */
  sites: string[]
  /** le domaine d'un site : `DOMAINE_<site>`, sinon `<site>.app` */
  domaine: (site: string) => string
  /** exécute une commande sur le serveur par SSH et rend sa sortie */
  ssh: (commande: string) => string
}

/** Les lignes `CLE=valeur` d'un fichier d'environnement (guillemets retirés ; commentaires et lignes vides ignorés). */
function lireEnv(fichier: string): Record<string, string> {
  const lignes = readFileSync(fichier, 'utf8').split('\n').filter(l => /^\w+=/.test(l))
  return Object.fromEntries(lignes.map(l => {
    const [cle, ...valeur] = l.split('=')
    return [cle, valeur.join('=').replace(/^"|"$/g, '')]
  }))
}

export function lireConfigDeploiement(): ConfigDeploiement {
  const fichier = chemin('.deploy.env')
  if (!existsSync(fichier)) throw new Error('.deploy.env manquant : cp .deploy.env.example .deploy.env puis adapter')
  const env = lireEnv(fichier)
  if (!env.DEPLOY_HOST) throw new Error('DEPLOY_HOST manquant dans .deploy.env')
  const options = env.DEPLOY_SSH_OPTS ? env.DEPLOY_SSH_OPTS.split(' ') : []
  return {
    hote: env.DEPLOY_HOST,
    sites: (env.DEPLOY_SITES || 'ecoleprimaire skoolik').split(/\s+/),
    domaine: site => env[`DOMAINE_${site}`] || `${site}.app`,
    ssh: commande => execFileSync('ssh', [...options, env.DEPLOY_HOST, commande], { encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 }),
  }
}
