// La phrase (CE1) : ce qu'est une phrase (une majuscule, un point, du sens), ses trois types avec leur ponctuation (déclarative, interrogative,
// impérative), ses deux formes (négative avec « ne … pas », exclamative), et ses groupes (le groupe sujet, le verbe, le complément).
// Programme (src/data/programme.ts) : « phrase » (BO n° 41 p. 93 : « Reconnaitre et utiliser les trois types de phrases, en lien avec la
// ponctuation : déclarative, interrogative et impérative » ; « les formes négatives et exclamatives » ; « groupe sujet, verbe et compléments
// sans distinguer ces derniers entre eux »). Français seulement (décision du 2026-10-10). Dessin : dessin.ts.
import { definirAffiche, choix } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'phrase',
  domaine: D.grammaire,
  emoji: '✍️',
  orientations: ['portrait', 'landscape'],
  formats: ['A4', 'A3'],
  competences: [K.phrase, K.sujetVerbe],
  // les groupes de la phrase (sujet, verbe, complément) : une bande de plus en bas de l'affiche
  reglages: { groupes: choix([true, false]) },
  variantes: {
    // ce qu'est une phrase, sans les types : la majuscule, le point (. ? !), des mots dans l'ordre, un sens, un verbe ; et ce qui n'en est pas une
    // (CP : « notion de phrase simple : majuscule, ponctuation, sens », BO n° 41 p. 92 ; CE1 p. 93)
    definition: { classes: ['cp'], slug: 'affiche-qu-est-ce-qu-une-phrase', reglages: { groupes: false } },
    // CE1, sans les types ni les formes, plus expliquée : la définition (une suite de mots qui a du sens), les trois vérifications (majuscule,
    // point, sens), deux contre-exemples vérifiés pas à pas, « de qui on parle / ce qu'on en dit » (le groupe sujet et le reste, BO p. 93)
    explication: { classes: ['ce1'], slug: 'affiche-la-phrase-expliquee', orientation: 'portrait', reglages: { groupes: false } },
    ce1: { classes: ['ce1'], slug: 'affiche-la-phrase' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
