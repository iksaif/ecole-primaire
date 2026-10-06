// Lecture de ce que le build a déjà écrit : `<outDir>/fiches/index.json` et `<slug>.json` (validés par le schéma de
// src/telechargements/valider.ts), et `<outDir>/index.html` (le modèle Vite : balises de l'app, base).
// Les entrées d'exemple sont retirées sauf `avecExemples` (la commande le refuse en production, comme `npm run fiches`).
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { site as siteDe } from '../../src/sites.ts'
import { DOSSIER_FICHES, FICHIER_INDEX } from '../../src/telechargements/types.ts'
import type { Entree, IndexFiches } from '../../src/telechargements/types.ts'
import { lireEntree, lireIndex } from '../../src/telechargements/valider.ts'
import type { ContexteStatique } from './types.ts'

/** Base de l'app (« / », « /ecole-primaire/ ») d'après le `index.html` construit : le préfixe de ses fichiers `assets/`. */
export function baseDuModele(modele: string): string {
  const m = /(?:src|href)="([^"]*?)assets\//.exec(modele)
  if (!m) throw new Error('index.html : aucun fichier assets/ (le build Vite a-t-il tourné ?)')
  return m[1].startsWith('/') ? m[1] : `/${m[1]}`
}

const lireJson = (chemin: string): unknown => JSON.parse(readFileSync(chemin, 'utf8'))

export interface OptionsLecture {
  mode: string
  outDir: string
  avecExemples: boolean
}

/** Construit le contexte des gabarits. Lève si le build manque ou si les données sont incohérentes. */
export function lireContexte({ mode, outDir, avecExemples }: OptionsLecture): ContexteStatique {
  const fichierModele = join(outDir, 'index.html')
  if (!existsSync(fichierModele)) throw new Error(`${fichierModele} absent : lancer « vite build » avant « npm run statique »`)
  const fichierIndex = join(outDir, DOSSIER_FICHES, FICHIER_INDEX)
  if (!existsSync(fichierIndex)) throw new Error(`${fichierIndex} absent : lancer « npm run fiches » avant « npm run statique »`)

  const complet = lireIndex(lireJson(fichierIndex))
  const gardees = complet.entrees.filter(e => avecExemples || !e.exemple)
  const index: IndexFiches = { ...complet, entrees: gardees }
  const entrees = new Map<string, Entree>()
  for (const e of gardees) entrees.set(e.slug, lireEntree(lireJson(join(outDir, DOSSIER_FICHES, `${e.slug}.json`))))
  const modele = readFileSync(fichierModele, 'utf8')
  return { site: siteDe(mode), base: baseDuModele(modele), modele, index, entrees, date: complet.genereLe.slice(0, 10), avecExemples }
}
