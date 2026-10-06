// Surlignage du mot trouvé dans un résultat de recherche : pur (lisible par node), aucun HTML produit. On découpe le texte
// d'origine en morceaux, ceux qui correspondent à la requête étant marqués `trouve` ; le composant les rend avec `<mark>`.
//   decouper('Les fractions', 'fraction')   // [{ texte: 'Les ', trouve: false }, { texte: 'fraction', trouve: true }, { texte: 's', trouve: false }]
//
// La correspondance suit la normalisation de la recherche (sans accents ni casse, « c'h » écrit « ch », ponctuation en espaces),
// mais sur le texte d'origine : chaque lettre normalisée garde la position de sa lettre d'origine, pour couper au bon endroit.
import { normaliser } from './index.ts'

export interface Morceau {
  readonly texte: string
  readonly trouve: boolean
}

/** Le texte normalisé lettre à lettre (sans réduire les espaces) et, pour chaque lettre normalisée, sa position dans l'original. */
function normaliserAvecOrigine(texte: string): { normalise: string, origine: number[] } {
  let normalise = ''
  const origine: number[] = []
  let position = 0
  const caracteres = [...texte]
  caracteres.forEach((c, i) => {
    // l'apostrophe de « c'h » disparaît (lettre bretonne) ; les autres signes deviennent des espaces
    const apostropheDeCh = /['’‘ʼ`´]/.test(c) && /c/i.test(caracteres[i - 1] ?? '') && /h/i.test(caracteres[i + 1] ?? '')
    const n = apostropheDeCh ? '' : normaliser(c) || ' '
    for (const lettre of n) { normalise += lettre; origine.push(position) }
    position += c.length
  })
  return { normalise, origine }
}

/** Les morceaux du texte, dans l'ordre ; ceux qui contiennent un mot de la requête sont `trouve`. Requête vide : un seul morceau. */
export function decouper(texte: string, requete: string): readonly Morceau[] {
  const mots = [...new Set(normaliser(requete).split(' ').filter(Boolean))]
  if (!mots.length || !texte) return [{ texte, trouve: false }]
  const { normalise, origine } = normaliserAvecOrigine(texte)
  const plages: [number, number][] = []
  for (const mot of mots) {
    for (let i = normalise.indexOf(mot); i >= 0; i = normalise.indexOf(mot, i + mot.length)) {
      plages.push([origine[i] ?? 0, (origine[i + mot.length - 1] ?? 0) + 1])
    }
  }
  plages.sort((a, b) => a[0] - b[0])
  const fusionnees: [number, number][] = []
  for (const [debut, fin] of plages) {
    const derniere = fusionnees[fusionnees.length - 1]
    if (derniere && debut <= derniere[1]) derniere[1] = Math.max(derniere[1], fin)
    else fusionnees.push([debut, fin])
  }
  const morceaux: Morceau[] = []
  let curseur = 0
  for (const [debut, fin] of fusionnees) {
    if (debut > curseur) morceaux.push({ texte: texte.slice(curseur, debut), trouve: false })
    morceaux.push({ texte: texte.slice(debut, fin), trouve: true })
    curseur = fin
  }
  if (curseur < texte.length) morceaux.push({ texte: texte.slice(curseur), trouve: false })
  return morceaux
}
