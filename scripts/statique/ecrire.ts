// Assemble puis écrit les pages statiques : `telechargements/index.html`, `telechargements/<slug>/index.html`, `sitemap.xml`,
// `robots.txt`, `404.html`. Le dossier `telechargements/` existant est vidé d'abord (ce qui n'est plus produit ne reste pas publié).
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pageIntrouvable } from './introuvable.ts'
import { pageIndex } from './index.ts'
import { pageFiche } from './page.ts'
import { robots } from './robots.ts'
import { sitemap } from './sitemap.ts'
import type { ContexteStatique, FichierStatique, PageStatique } from './types.ts'

/** Toutes les pages statiques : l'index, puis une page par entrée de l'index (dans son ordre). */
export function pagesStatiques(ctx: ContexteStatique): PageStatique[] {
  const fiches = ctx.index.entrees.map(e => {
    const entree = ctx.entrees.get(e.slug)
    if (!entree) throw new Error(`entrée « ${e.slug} » : JSON absent`)
    return pageFiche(ctx, entree)
  })
  const pages = [pageIndex(ctx), ...fiches]
  const vues = new Set<string>()
  for (const p of pages) {
    if (vues.has(p.adresse)) throw new Error(`deux pages à l'adresse « ${p.adresse} »`)
    vues.add(p.adresse)
  }
  return pages
}

/** Les fichiers à écrire, chemins relatifs à `<outDir>`. */
export function fichiersStatiques(ctx: ContexteStatique): FichierStatique[] {
  return [
    ...pagesStatiques(ctx).map(p => ({ chemin: `${p.adresse}index.html`, contenu: p.html })),
    { chemin: 'sitemap.xml', contenu: sitemap(ctx) },
    { chemin: 'robots.txt', contenu: robots(ctx) },
    { chemin: '404.html', contenu: pageIntrouvable(ctx) },
  ]
}

/** Écrit les fichiers sous `outDir` (après avoir vidé `telechargements/`). */
export function ecrireStatique(outDir: string, fichiers: readonly FichierStatique[]): void {
  rmSync(join(outDir, 'telechargements'), { recursive: true, force: true })
  for (const f of fichiers) {
    const chemin = join(outDir, f.chemin)
    mkdirSync(dirname(chemin), { recursive: true })
    writeFileSync(chemin, f.contenu)
  }
}
