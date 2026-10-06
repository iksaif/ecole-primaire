// Habille le `index.html` construit par Vite : une page statique est CE fichier (même script d'entrée, mêmes styles : l'app
// se charge par-dessus et remplace le contenu de #app) avec ses propres balises de tête et son contenu lisible sans JavaScript.
// On retire du modèle les balises que la page redéfinit (titre, description, canonical, Open Graph, Twitter) : une seule de chaque.
import { echapper } from './html.ts'

const BALISES_REMPLACEES = [
  /<title>[\s\S]*?<\/title>\s*/g,
  /<meta\s+name="description"[^>]*>\s*/g,
  /<link\s+rel="canonical"[^>]*>\s*/g,
  /<meta\s+property="og:[^"]*"[^>]*>\s*/g,
  /<meta\s+name="twitter:[^"]*"[^>]*>\s*/g,
]
const CONTENEUR = '<div id="app"></div>'

export interface PageHabillee {
  langue: string
  /** balises de tête propres à la page (titre, description, canonical, partage, JSON-LD, styles) */
  tete: string
  /** contenu lisible sans JavaScript, mis dans #app */
  corps: string
}

export function habiller(modele: string, { langue, tete, corps }: PageHabillee): string {
  if (!modele.includes(CONTENEUR)) throw new Error(`index.html : ${CONTENEUR} introuvable (le modèle a changé ?)`)
  let html = modele
  for (const motif of BALISES_REMPLACEES) html = html.replace(motif, '')
  html = html
    .replace(/<html\s+lang="[^"]*"/, `<html lang="${echapper(langue)}" data-statique`)
    .replace('</head>', `${tete}\n  </head>`)
    .replace(CONTENEUR, `<div id="app">${corps}</div>`)
  if (!html.includes('data-statique')) throw new Error('index.html : balise <html lang="…"> introuvable')
  return html
}

/** Style des pages statiques : limité à `.statique` (l'app le remplace en démarrant) ; couleurs de la charte (--bleu-fort). */
export const STYLE_STATIQUE = `<style>
.statique { font-family: system-ui, sans-serif; color: #2c3e50; max-width: 52rem; margin: 0 auto; padding: 1rem; line-height: 1.5 }
.statique a { color: #2f70c0 }
.statique img { max-width: 100%; height: auto; border: 1px solid #d5dbe3; border-radius: 6px }
.statique ol.fil { list-style: none; display: flex; flex-wrap: wrap; gap: .4rem; padding: 0; font-size: .9rem }
.statique ol.fil li + li::before { content: "›"; margin-right: .4rem }
.statique .actions { display: flex; flex-wrap: wrap; gap: .6rem; padding: 0; list-style: none }
.statique .actions a { display: inline-block; padding: .6rem 1rem; border: 2px solid #2f70c0; border-radius: 8px; text-decoration: none; font-weight: 700 }
.statique .actions a.principal { background: #2f70c0; color: #fff }
.statique dt { font-weight: 700 }
</style>`
