// Les pages de l'app (accueil excepté) ont chacune leur adresse dans le sitemap, mais l'app est une seule page : sans JavaScript, ou avant qu'il
// ne s'exécute, le serveur rend le même `index.html` partout, dont le canonical est celui de l'accueil. Les moteurs de recherche lisent alors
// chaque route comme un double de l'accueil (« Alternate page with proper canonical tag ») et ne l'indexent pas, le canonical posé ensuite
// par le routeur (src/router/canonique.ts) arrivant trop tard. Ici, une « coquille » par route : le même `index.html` construit, avec le
// canonical de la route, écrit à l'adresse de la route (`maths/numeration/index.html` : le serveur le sert pour `/maths/numeration`, comme les
// pages de fiches). L'app se charge par-dessus, rien d'autre ne change.
import { echapper } from './html.ts'
import { absolue } from './adresses.ts'
import { adressesApp } from './sitemap.ts'
import type { ContexteStatique, FichierStatique } from './types.ts'

const CANONICAL = /<link\s+rel="canonical"[^>]*>/

/** Les coquilles des pages de l'app listées au sitemap : un fichier par adresse (l'accueil garde le `index.html` de la racine). */
export function coquillesApp(ctx: ContexteStatique): FichierStatique[] {
  if (!CANONICAL.test(ctx.modele)) throw new Error('index.html : <link rel="canonical"> introuvable (le modèle a changé ?)')
  return adressesApp(ctx).filter(adresse => adresse !== '').map(adresse => ({
    chemin: `${adresse}/index.html`,
    contenu: ctx.modele.replace(CANONICAL, `<link rel="canonical" href="${echapper(absolue(ctx.site, adresse))}" />`),
  }))
}
