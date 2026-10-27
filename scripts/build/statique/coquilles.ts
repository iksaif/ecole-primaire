// Les pages de l'app (accueil excepté) ont chacune leur adresse dans le sitemap, mais l'app est une seule page : sans JavaScript, ou avant qu'il
// ne s'exécute, le serveur rend le même `index.html` partout, dont le canonical est celui de l'accueil. Les moteurs de recherche lisent alors
// chaque route comme un double de l'accueil (« Alternate page with proper canonical tag ») et ne l'indexent pas, le canonical posé ensuite
// par le routeur (src/router/canonique.ts) arrivant trop tard. Ici, une « coquille » par route : le même `index.html` construit, avec le
// canonical de la route (elle-même, ou la même page du site de référence sur un site régional : indexation.ts), écrit à l'adresse de la route
// (`maths/numeration/index.html` : le serveur le sert pour `/maths/numeration`, comme les pages de fiches). `<html data-canonical>` dit au routeur de ne pas
// le refaire avant la première navigation. L'app se charge par-dessus, rien d'autre ne change. L'accueil et la page de la langue régionale reçoivent aussi
// leurs `hreflang` (l'accueil : le `index.html` de la racine, réécrit).
import { echapper } from './html.ts'
import { adressesApp, alternativesApp, canoniqueApp } from './indexation.ts'
import type { Alternative } from './adresses.ts'
import type { ContexteStatique, FichierStatique } from './types.ts'

const CANONICAL = /<link\s+rel="canonical"[^>]*>/
const ALTERNATES = /\s*<link\s+rel="alternate"\s+hreflang="[^"]*"[^>]*>/g

/** Le `index.html` avec les versions de langue de la page (celles qu'il avait déjà sont remplacées : le build se relance sans doublon). */
function avecAlternatives(html: string, alternatives: readonly Alternative[]): string {
  if (!alternatives.length) return html
  const liens = alternatives.map(a => `\n    <link rel="alternate" hreflang="${echapper(a.hreflang)}" href="${echapper(a.href)}" />`).join('')
  return html.replace(ALTERNATES, '').replace('</head>', `${liens}\n  </head>`)
}

/** Les coquilles des pages de l'app listées au sitemap : un fichier par adresse, et l'accueil réécrit avec ses `hreflang`. */
export function coquillesApp(ctx: ContexteStatique): FichierStatique[] {
  if (!CANONICAL.test(ctx.modele)) throw new Error('index.html : <link rel="canonical"> introuvable (le modèle a changé ?)')
  if (!/<html\s/.test(ctx.modele)) throw new Error('index.html : balise <html> introuvable (le modèle a changé ?)')
  const coquille = (adresse: string): string => avecAlternatives(
    ctx.modele.replace(CANONICAL, `<link rel="canonical" href="${echapper(canoniqueApp(ctx, adresse))}" />`).replace(/<html\s/, '<html data-canonical '),
    alternativesApp(adresse),
  )
  const pages = adressesApp(ctx).filter(adresse => adresse !== '').map(adresse => ({ chemin: `${adresse}/index.html`, contenu: coquille(adresse) }))
  const accueil = avecAlternatives(ctx.modele, alternativesApp(''))
  return accueil === ctx.modele ? pages : [{ chemin: 'index.html', contenu: accueil }, ...pages]
}
