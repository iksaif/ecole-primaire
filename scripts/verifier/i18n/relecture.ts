// Le tableau de relecture de la traduction (i18n-relecture.html, non versionné) : une ligne par texte, les passages « à relire » en jaune.
import { writeFileSync } from 'node:fs'
import { echapper } from '../../../src/utils/html.js'
import { chemin } from '../../lib/racine.ts'
import { texte } from './arbre.ts'

/** Une ligne d'en-tête de section (un module, une section de textes, un exercice). */
export const ligneSection = (titre: string): string => `<tr class="module"><th colspan="4">${echapper(titre)}</th></tr>`

/** Une ligne de texte : clé, français, traduction (`absent` : ce qu'on écrit quand il n'y en a pas), pastille « à relire ». */
export function ligneTexte(cle: string, francais: unknown, traduction: unknown, relire: boolean, absent: string): string {
  const br = traduction === undefined ? `<em>${absent}</em>` : echapper(texte(traduction))
  return `<tr${relire ? ' class="relire"' : ''}><td><code>${echapper(cle)}</code></td><td>${echapper(texte(francais))}</td>
<td>${br}</td><td>${relire ? '⚠️' : ''}</td></tr>`
}

export function ecrirePageRelecture(lignes: string[]): void {
  writeFileSync(chemin('i18n-relecture.html'), `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Relecture de la traduction bretonne</title><style>
body { font-family: system-ui, sans-serif; margin: 2rem; color: #222; }
table { border-collapse: collapse; width: 100%; font-size: .9rem; }
td, th { border: 1px solid #ddd; padding: .35rem .5rem; vertical-align: top; text-align: left; }
tr.module th { background: #2c3e50; color: white; font-size: .95rem; }
tr.relire td { background: #fff7e0; }
td:nth-child(3) { font-style: italic; }
</style></head><body>
<h1>Relecture de la traduction bretonne</h1>
<p>Pour chaque texte : la clé (repère technique), le français, la traduction bretonne actuelle (automatique).
Les lignes en jaune ⚠️ sont celles dont on est le moins sûr. Corrigez directement dans la colonne breton
(imprimez, annotez, ou copiez dans un tableur) et renvoyez à contact@skoolik.app. Trugarez !</p>
<table><tr><th>Clé</th><th>Français</th><th>Brezhoneg</th><th></th></tr>
${lignes.join('\n')}
</table></body></html>`)
  console.log('→ i18n-relecture.html écrit')
}
