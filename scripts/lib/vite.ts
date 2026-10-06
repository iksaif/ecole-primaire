// Charge des modules de l'app (ceux qui importent sans extension, ou des .vue) dans node, par un serveur Vite sans navigateur
// (rendu côté serveur). Plusieurs compteurs ou rapports en ont besoin : un seul serveur par script, fermé à la fin.
//   const { charger, fermer } = chargeurVite()
//   const { COMPETENCES } = await charger<{ COMPETENCES: Competence[] }>('/src/data/programme.ts')
//   await fermer()
import { createServer } from 'vite'
import type { ViteDevServer } from 'vite'
import { racine } from './racine.ts'

export interface ChargeurVite {
  /** le type du module est une affirmation de l'appelant : Vite ne le vérifie pas */
  charger: <Module>(module: string) => Promise<Module>
  /** ferme le serveur s'il a été démarré (sans effet sinon) */
  fermer: () => Promise<void>
}

export function chargeurVite(): ChargeurVite {
  let serveur: ViteDevServer | null = null
  return {
    // démarré à la première demande : un script qui n'en a pas besoin ne paie pas son démarrage
    async charger<Module>(module: string): Promise<Module> {
      serveur ??= await createServer({ root: racine, server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
      return await serveur.ssrLoadModule(module) as Module
    },
    fermer: async () => { await serveur?.close() },
  }
}
