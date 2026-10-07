// Polices livrées, chargées pour l'ÉCRAN (les fiches imprimées embarquent les leurs : polices.ts) : un exercice qui montre des
// lettres dans une écriture scolaire (script : Andika, a et g à un œil ; cursive : Playwrite FR Trad) les charge une fois.
// FontFace du navigateur ; sans navigateur (node, tests) : rien.
import attacheUrl from '@fontsource/playwrite-fr-trad/files/playwrite-fr-trad-latin-400-normal.woff2?url'
import scriptUrl from '@fontsource/andika/files/andika-latin-400-normal.woff2?url'
import scriptGrasUrl from '@fontsource/andika/files/andika-latin-700-normal.woff2?url'

/** Familles CSS des écritures scolaires, avec leur repli. */
export const FAMILLE_SCRIPT = "'Andika', Arial, sans-serif"
export const FAMILLE_CURSIVE = "'Playwrite FR Trad', 'Andika', cursive"

let charge = false

/** Charge Andika (400, 700) et Playwrite FR Trad pour l'écran, une seule fois. */
export function chargerPolicesEcran(): void {
  if (charge || typeof document === 'undefined' || typeof FontFace === 'undefined') return
  charge = true
  for (const [famille, url, poids] of [['Andika', scriptUrl, '400'], ['Andika', scriptGrasUrl, '700'], ['Playwrite FR Trad', attacheUrl, '400']] as const) {
    const f = new FontFace(famille, `url(${url})`, { weight: poids })
    document.fonts.add(f)
    void f.load().catch(() => {})
  }
}
