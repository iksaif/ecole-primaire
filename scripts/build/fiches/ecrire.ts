// Écriture des fiches : valide les données contre le schéma (src/telechargements/valider.ts) puis écrit
// `<outDir>/fiches/index.json`, `<slug>.json` et les fichiers (PDF, aperçus, miniatures) de chaque fiche.
// Un dossier `fiches/` existant est vidé d'abord : ce qui n'est plus produit ne reste pas publié.
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DOSSIER_FICHES, FICHIER_INDEX } from '../../../src/telechargements/types.ts'
import { ErreurSchema, problemesEntree, problemesIndex } from '../../../src/telechargements/valider.ts'
import type { Entree, IndexFiches } from '../../../src/telechargements/types.ts'
import type { FicheRendue } from './types.ts'

const json = (donnees: unknown): string => `${JSON.stringify(donnees, null, 1)}\n`

/** Refuse des données qui ne respectent pas le schéma ; message : les premiers problèmes. */
export function validerTout(index: IndexFiches, entrees: readonly Entree[]): void {
  const problemes = problemesIndex(index)
  const slugs = new Set(index.entrees.map(e => e.slug))
  for (const e of entrees) problemes.push(...problemesEntree(e, slugs))
  if (entrees.length !== index.entrees.length) problemes.push(`${entrees.length} entrées pour ${index.entrees.length} dans l'index`)
  if (problemes.length) throw new ErreurSchema(`${problemes.length} problème(s) dans les fiches :\n  ${problemes.slice(0, 10).join('\n  ')}`)
}

/** Écrit tout sous `<outDir>/fiches/` et rend ce dossier. */
export function ecrireFiches(outDir: string, index: IndexFiches, entrees: readonly Entree[], rendues: readonly FicheRendue[]): string {
  validerTout(index, entrees)
  const dossier = join(outDir, DOSSIER_FICHES)
  rmSync(dossier, { recursive: true, force: true })
  const ecrire = (chemin: string, contenu: string | Uint8Array): void => {
    const f = join(dossier, chemin)
    mkdirSync(dirname(f), { recursive: true })
    writeFileSync(f, contenu)
  }
  for (const r of rendues) for (const f of r.fichiers) ecrire(f.chemin, f.octets)
  for (const e of entrees) ecrire(`${e.slug}.json`, json(e))
  ecrire(FICHIER_INDEX, json(index))
  return dossier
}
