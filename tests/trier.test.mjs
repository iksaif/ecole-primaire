// Trier les images : le corpus est complet et sans ambiguïté. Chaque image et chaque boîte a un nom en français et en breton ; la bonne boîte
// d'une image n'est jamais écartée de ses propres leurres ; chaque image a assez de leurres pour le plus grand nombre de boîtes de sa classe.
//   node tests/trier.test.mjs
import { CORPUS, THEMES } from '../src/exercices/trier/corpus.ts'
import { THEMES_PAR_NIVEAU, questions } from '../src/exercices/trier/generateur.ts'
import DEFINITION from '../src/exercices/trier/definition.ts'
import { CONTENU } from '../src/exercices/trier/textes.ts'
import { traducteur } from '../src/langues/catalogue.ts'
import { reglagesDuNiveau } from '../src/noyau/reglages.ts'
import { creerRng } from '../src/utils/hasard.ts'
import { verifier, nbEchecs } from './outils.mjs'

for (const langue of ['fr', 'br']) {
  const T = traducteur(CONTENU, langue)
  const manques = []
  for (const theme of THEMES) {
    const { boites, entrees } = CORPUS[theme]
    for (const id of Object.keys(boites)) if (!T(`boite.${id}`) || T(`boite.${id}`).includes('boite.')) manques.push(`boîte ${id}`)
    for (const { item } of entrees) if (!T(`mot.${item}`) || T(`mot.${item}`).includes('mot.')) manques.push(`mot ${item}`)
  }
  verifier(manques.length === 0, `${langue} : tous les noms de boîtes et d'images (${manques.join(', ') || 'complet'})`)
}

const problemes = []
for (const theme of THEMES) {
  const { boites, entrees } = CORPUS[theme]
  const items = entrees.map(e => `${theme}:${e.item}`)
  if (new Set(items).size !== items.length) problemes.push(`${theme} : image en double`)
  for (const e of entrees) {
    if (!boites[e.boite]) problemes.push(`${theme} ${e.item} : boîte ${e.boite} inconnue`)
    if (e.pas?.includes(e.boite)) problemes.push(`${theme} ${e.item} : écarte sa propre boîte`)
    if (e.pas?.some(id => !boites[id])) problemes.push(`${theme} ${e.item} : leurre écarté inconnu`)
    const leurres = Object.keys(boites).filter(id => id !== e.boite && !e.pas?.includes(id)).length
    if (leurres < Math.min(3, Object.keys(boites).length - 1)) problemes.push(`${theme} ${e.item} : ${leurres} leurre(s) seulement`)
  }
}
verifier(problemes.length === 0, `corpus : images uniques, boîtes connues, assez de leurres (${problemes.join(' ; ') || 'ok'})`)

// le jeu tire autant de questions que demandé quand le corpus le permet (10 en MS-GS pour les quatre thèmes ensemble)
const T = traducteur(CONTENU, 'fr')
for (const niveau of ['ps', 'ms', 'gs']) {
  const reglages = { ...reglagesDuNiveau(DEFINITION, { niveau }), nbQ: 10 }
  const qs = questions({ niveau, reglages, rng: creerRng(5), T })
  const permis = THEMES_PAR_NIVEAU[niveau]
  verifier(qs.length === 10 && qs.every(q => permis.includes(q.theme)), `${niveau} : 10 questions, thèmes de la classe`)
}
process.exit(nbEchecs() ? 1 : 0)
