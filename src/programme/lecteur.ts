// Lire un passage d'un texte officiel dans l'app : découper le texte d'une page du PDF en mots, retrouver un passage par ses ancres
// (les mots du début et de la fin) et rendre le texte en morceaux dont certains sont surlignés. Pur (lisible par node) ; les ancres
// sont dans ancres.ts, proposées par scripts/generer/programmes.ts.

/** Un passage : les mots du début et de la fin, tels qu'ils sont dans le texte (casse, accents et ponctuation sans importance). */
export interface Ancre {
  debut: string
  fin: string
}

/** Un bout du texte de la page : un mot (numéro dans la suite des mots) ou ce qui l'entoure (espaces, tirets de liste, ponctuation seule). */
export interface Morceau {
  texte: string
  /** numéro du mot, `null` pour un morceau sans lettre ni chiffre */
  mot: number | null
}

/** Un mot sans casse, accents ni ponctuation : « Hugues, » → « hugues ». Vide pour un morceau sans lettre ni chiffre. */
export function normaliser(mot: string): string {
  return mot.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '')
}

/** Le texte d'une page en morceaux (mots et espaces) : les remettre bout à bout redonne le texte. */
export function decouper(texte: string): { morceaux: Morceau[], mots: string[] } {
  const morceaux: Morceau[] = []
  const mots: string[] = []
  for (const bout of texte.split(/(\s+)/)) {
    if (bout === '') continue
    const norme = normaliser(bout)
    if (/^\s+$/.test(bout) || norme === '') {
      morceaux.push({ texte: bout, mot: null })
      continue
    }
    morceaux.push({ texte: bout, mot: mots.length })
    mots.push(norme)
  }
  return { morceaux, mots }
}

/** Les mots d'une ancre (même normalisation que le texte). */
export function motsDeLAncre(phrase: string): string[] {
  return phrase.split(/\s+/).map(normaliser).filter(m => m !== '')
}

/** Où la suite de mots `cherche` commence dans `mots`, à partir de `depuis` ; -1 si elle n'y est pas. */
function trouverSuite(mots: readonly string[], cherche: readonly string[], depuis: number): number {
  if (cherche.length === 0) return -1
  for (let i = depuis; i + cherche.length <= mots.length; i++) {
    if (cherche.every((m, k) => mots[i + k] === m)) return i
  }
  return -1
}

export interface Passage {
  /** numéro du premier mot du passage */
  debut: number
  /** numéro du dernier mot du passage (compris) */
  fin: number
}

/** Le passage d'une ancre dans une page : du début à la première fin qui le suit ; `null` si l'une des deux ancres n'est pas dans la page. */
export function trouverPassage(mots: readonly string[], ancre: Ancre): Passage | null {
  const debut = motsDeLAncre(ancre.debut)
  const fin = motsDeLAncre(ancre.fin)
  const i = trouverSuite(mots, debut, 0)
  if (i < 0) return null
  const k = trouverSuite(mots, fin, i)
  if (k < 0) return null
  return { debut: i, fin: k + fin.length - 1 }
}

export interface Tranche {
  texte: string
  surligne: boolean
}

/** Le texte de la page en tranches, celles du passage surlignées ; sans passage, une seule tranche. Les espaces entre deux mots surlignés le sont aussi. */
export function surligner(morceaux: readonly Morceau[], passage: Passage | null): Tranche[] {
  const tranches: Tranche[] = []
  let dernierMot = -1
  const ajouter = (texte: string, surligne: boolean): void => {
    const derniere = tranches.at(-1)
    if (derniere && derniere.surligne === surligne) derniere.texte += texte
    else tranches.push({ texte, surligne })
  }
  const motsApres = passage ? passage.fin : -1
  for (const m of morceaux) {
    if (m.mot !== null) dernierMot = m.mot
    const dedans = passage !== null && m.mot !== null && m.mot >= passage.debut && m.mot <= passage.fin
    // un morceau sans mot (espace) entre deux mots du passage en fait partie
    const entre = passage !== null && m.mot === null && dernierMot >= passage.debut && dernierMot < motsApres
    ajouter(m.texte, dedans || entre)
  }
  return tranches
}
