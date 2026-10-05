// Les formes — générateur (pur : aucun import de Vue, aucun Math.random ; lisible par node).
//   questions({ niveau, reglages, rng, T })   une série de questions : chaque forme du niveau deux fois, jamais deux fois
//                                             de suite ; chaque question porte les propositions des 4 modes (`modes`)
//   questionsFiche({ niveau, reglages, rng, T })  tout ce que tire la fiche imprimable (formes à colorier, puis à compter)
//   verifier(q, rep)                          rep : { mode, choix: indice de la proposition touchée }
//   bonneReponse(q)  ecartsAuProgramme(questions, contraintes)
// Le nombre de questions est fixé par le niveau (6 en PS et MS, 8 en GS) : `nb` est ignoré.
// rng : src/utils/hasard.js. L'ordre des tirages est celui de l'ancienne vue : mêmes questions, mêmes fiches.

// Programme du cycle 1 : triangle, carré, disque (4 ans), puis rectangle (5 ans) ; la forme pleine est un disque (le
// cercle est son contour, au CE1). Losange, pentagone, hexagone : cycle 3 ; l'ovale n'est pas une figure.
// id : identifiant du programme et de la clé de contenu (nom sans accent)
export const FORMES = [
  { nom: 'disque', id: 'disque', cotes: 0, svg: '<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="40" fill="#4a90e2" opacity=".85"/></svg>' },
  { nom: 'carré', id: 'carre', cotes: 4, svg: '<svg viewBox="0 0 100 100" width="100" height="100"><rect x="15" y="15" width="70" height="70" fill="#e74c3c" opacity=".85"/></svg>' },
  { nom: 'triangle', id: 'triangle', cotes: 3, svg: '<svg viewBox="0 0 100 100" width="100" height="100"><polygon points="50,10 90,90 10,90" fill="#2ecc71" opacity=".85"/></svg>' },
  { nom: 'rectangle', id: 'rectangle', cotes: 4, svg: '<svg viewBox="0 0 100 100" width="100" height="100"><rect x="10" y="25" width="80" height="50" fill="#f39c12" opacity=".85"/></svg>' },
]
// formes du niveau : le rectangle arrive en GS
export const formesDuNiveau = niveau => (niveau === 'gs' ? FORMES : FORMES.filter(f => f.nom !== 'rectangle'))

const TEINTES = ['#4a90e2', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6', '#16a085']

// Une forme de taille, de couleur et d'orientation variées (on reconnaît la forme malgré le déplacement, p. 68)
function variante(f, rng) {
  const taille = 70 + rng.entier(0, 29)
  const angle = f.nom === 'disque' ? 0 : rng.entier(0, 60) - 30
  return f.svg.replace(/fill="[^"]*"/, `fill="${TEINTES[rng.entier(0, TEINTES.length - 1)]}"`)
    .replace(/width="100" height="100"/, `width="${taille}" height="${taille}" style="transform: rotate(${angle}deg)"`)
}

const autresFormes = (niveau, exclure, n, rng) => rng.melanger(formesDuNiveau(niveau).filter(f => f.nom !== exclure)).slice(0, n)

export function questions({ niveau, rng }) {
  // chaque forme du niveau deux fois, jamais deux fois de suite
  let tirage, essais = 0
  const formes = formesDuNiveau(niveau)
  do { tirage = rng.melanger([...formes, ...formes]) } while (tirage.some((f, i) => f === tirage[i - 1]) && ++essais < 50)
  return tirage.map((f, k) => {
    const faussesCotes = rng.melanger([0, 1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== f.cotes)).slice(0, 3)
    const choixNb = rng.melanger([f.cotes, ...faussesCotes])
    const choixFormes = rng.melanger([f, ...autresFormes(niveau, f.nom, 3, rng)])
    const choixNommees = rng.melanger([f, ...autresFormes(niveau, f.nom, 3, rng)])
    const memes = rng.melanger([{ ok: true, svg: variante(f, rng) }, ...autresFormes(niveau, f.nom, 2, rng).map(o => ({ ok: false, svg: variante(o, rng) }))])
    return {
      cle: `${f.id}${k}`, nom: f.nom, id: f.id, cotes: f.cotes, svg: f.svg,
      // propositions et bonne réponse de chaque mode
      modes: {
        meme: { options: memes.map(m => ({ svg: m.svg })), bonne: memes.findIndex(m => m.ok) },
        reconnaitre: { options: choixNommees.map(x => ({ id: x.id, svg: x.svg.replace(/width="100" height="100"/, 'width="60" height="60"') })), bonne: choixNommees.findIndex(x => x.nom === f.nom) },
        compter: { options: choixNb.map(c => ({ label: String(c) })), bonne: choixNb.indexOf(f.cotes) },
        trouver: { options: choixFormes.map(x => ({ svg: x.svg })), bonne: choixFormes.findIndex(x => x.nom === f.nom) },
      },
    }
  })
}

// ── Fiche : formes à colorier selon une légende, puis à compter ; PS : colorier les formes pareilles au modèle
export const COULEURS_FICHE = [
  { nom: 'disque', couleur: 'rouge', hex: '#e53935' },
  { nom: 'carré', couleur: 'bleu', hex: '#1e88e5' },
  { nom: 'triangle', couleur: 'vert', hex: '#43a047' },
  { nom: 'rectangle', couleur: 'jaune', hex: '#fdd835' },
]

// Forme dessinée au trait (à colorier)
export const contour = (nom, taille, angle = 0) => FORMES.find(f => f.nom === nom).svg
  .replace(/width="100" height="100"/, `width="${taille}" height="${taille}" style="transform: rotate(${angle}deg)"`)
  .replace(/fill="[^"]*" opacity="[^"]*"/, 'fill="none" stroke="#222" stroke-width="3.5" stroke-linejoin="round"')

export function questionsFiche({ niveau, rng }) {
  const noms = formesDuNiveau(niveau).map(f => f.nom)
  if (niveau === 'ps') {
    const modele = noms[rng.entier(0, noms.length - 1)]
    const tirage = rng.melanger([modele, modele, modele, ...Array.from({ length: 9 }, () => noms[rng.entier(0, noms.length - 1)])])
    return { niveau, modele, formes: tirage.map(nom => ({ nom, taille: 70 + rng.entier(0, 29), angle: nom === 'disque' ? 0 : rng.entier(0, 60) - 30 })) }
  }
  // 20 formes : au moins 2 de chaque, le reste au hasard (MS : sans le rectangle, qui arrive en GS)
  const tirage = rng.melanger([...noms, ...noms, ...Array.from({ length: 20 - 2 * noms.length }, () => noms[rng.entier(0, noms.length - 1)])])
  return { niveau, formes: tirage.map(nom => ({ nom, taille: 62 + rng.entier(0, 29), angle: nom === 'disque' ? 0 : rng.entier(0, 30) - 15 })) }
}

export const verifier = (q, rep) => rep.choix === q.modes[rep.mode].bonne

export const bonneReponse = q => ({ mode: 'meme', choix: q.modes.meme.bonne })

export function ecartsAuProgramme(x, contraintes) {
  const noms = Array.isArray(x) ? x.map(q => q.id) : x.formes.map(f => FORMES.find(g => g.nom === f.nom).id)
  const permis = contraintes.niveau === 'ps' ? contraintes.formesTriees : contraintes.figures
  return [...new Set(noms.filter(id => !permis.includes(id)))].map(id => `forme ${id} hors programme du niveau`)
}
