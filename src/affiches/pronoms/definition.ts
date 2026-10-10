// Les pronoms personnels sujets (CE1) : un tableau des personnes, au singulier et au pluriel (je / nous, tu / vous, il, elle, on / ils, elles),
// chaque case avec une image (qui parle, à qui l'on parle, de qui l'on parle) et, au besoin, un exemple avec un verbe du 1er groupe au présent.
// Programme (src/data/programme.ts) : « le pronom personnel sujet » parmi les classes de mots du CE1 (BO n° 41 p. 93), et la substitution
// d'un groupe sujet par un pronom (« La maitresse raconte… → Elle raconte… »). Contenu en français seulement (pas de grammaire bretonne pour
// l'instant, décision du 2026-10-10). Dessin : dessin.ts (images OpenMoji : src/images/).
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'pronoms',
  domaine: D.grammaire,
  emoji: '👥',
  // paysage seulement : le tableau a deux colonnes larges (trois pronoms dans la case il, elle, on)
  orientations: ['landscape'],
  formats: ['A4', 'A3'],
  competences: [K.classesMots, K.sujetVerbe],
  reglages: { exemple: choix([true, false]) },
  variantes: {
    ce1: { classes: ['ce1'], slug: 'affiche-pronoms-personnels-sujets' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
