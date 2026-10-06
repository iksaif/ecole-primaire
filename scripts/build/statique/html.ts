// Petits outils HTML des gabarits : échappement (texte et attribut) et JSON-LD sûr dans un <script>.

/** Texte dans un élément ou un attribut entre guillemets : `& < > " '` échappés. */
export const echapper = (v: string | number): string =>
  String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

/** JSON pour un `<script type="application/ld+json">` : `<`, `>` et `&` en \uXXXX, pour qu'aucun texte ne referme la balise. */
export const jsonSur = (donnees: unknown): string =>
  JSON.stringify(donnees).replace(/[<>&\u2028\u2029]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)

/** `<meta name="x" content="…">` */
export const meta = (nom: string, contenu: string): string => `<meta name="${echapper(nom)}" content="${echapper(contenu)}">`
/** `<meta property="og:x" content="…">` */
export const propriete = (nom: string, contenu: string | number): string => `<meta property="${echapper(nom)}" content="${echapper(contenu)}">`
