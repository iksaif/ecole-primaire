// `404.html` : la page d'erreur de nginx pour les adresses sans application (fichiers manquants sous /assets/ ou /fiches/).
// Autonome : pas de script de l'app (ses fichiers sont peut-être justement ceux qui manquent), liens absolus depuis la base,
// recherche = formulaire GET vers la grille des fiches (`?q=`). Jamais indexée.
import { contenu } from '../../../src/langues/traduire.ts'
import { echapper, meta } from './html.ts'
import { STYLE_STATIQUE } from './modele.ts'
import type { ContexteStatique } from './types.ts'

export function pageIntrouvable(ctx: ContexteStatique): string {
  const langue = ctx.site.langueInterface
  const { t } = contenu(langue)
  const titre = `${t('statique.introuvableTitre')} — ${ctx.site.nom}`
  return `<!doctype html>
<html lang="${langue}">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${echapper(titre)}</title>
    ${meta('robots', 'noindex')}
    <link rel="icon" href="${echapper(ctx.base)}favicon.svg" type="image/svg+xml">
    ${STYLE_STATIQUE}
  </head>
  <body>
    <main class="statique">
      <h1>${echapper(t('statique.introuvableTitre'))}</h1>
      <p>${echapper(t('statique.introuvableTexte'))}</p>
      <form action="${echapper(`${ctx.base}telechargements/`)}" method="get" role="search">
        <label for="q">${echapper(t('statique.rechercher'))}</label><br>
        <input id="q" name="q" type="search" placeholder="${echapper(t('statique.champ'))}" size="32">
        <button type="submit">${echapper(t('statique.chercher'))}</button>
      </form>
      <ul class="actions">
        <li><a class="principal" href="${echapper(ctx.base)}">${echapper(t('statique.accueil'))}</a></li>
        <li><a href="${echapper(`${ctx.base}telechargements/`)}">${echapper(t('statique.fichesAImprimer'))}</a></li>
      </ul>
    </main>
  </body>
</html>
`
}
