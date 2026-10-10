// La phrase, quatre affiches (CP et CE1) : qu'est-ce qu'une phrase (CP), ses trois types par la ponctuation (CP), reconnaître une phrase et ses
// groupes (CE1), ses types et ses formes (CE1). Programme (src/data/programme.ts) : « phrase » et « sujet-verbe » (BO n° 41 p. 92-93).
// Français seulement (décision du 2026-10-10). Dessin : dessin.ts.
import { definirAffiche } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const definition = definirAffiche({
  id: 'phrase',
  domaine: D.grammaire,
  emoji: '✍️',
  // portrait seulement : ce sont des affiches de texte en bandes, illisibles en deux colonnes étroites
  orientations: ['portrait'],
  formats: ['A4', 'A3'],
  competences: [K.phrase, K.sujetVerbe],
  // quatre affiches, deux par classe ; chacune dit une seule chose (pas de réglage qui ajoute ou retire une partie)
  variantes: {
    // CP : ce qu'est une phrase (majuscule, point, ordre, sens) et ce qui n'en est pas une (« notion de phrase simple : majuscule,
    // ponctuation, sens », BO n° 41 p. 92)
    definition: { classes: ['cp'], slug: 'affiche-qu-est-ce-qu-une-phrase' },
    // CP : les trois types de phrases reconnus par leur ponctuation (« s'appuyer sur la ponctuation pour reconnaître les trois types de
    // phrases », BO p. 92) : le signe, ce qu'on fait (je dis, je demande, je donne un ordre), un exemple
    'types-cp': { classes: ['cp'], slug: 'affiche-types-de-phrases-cp' },
    // CE1 : reconnaître une phrase (une suite de mots qui a du sens, les trois vérifications, un contre-exemple) et ses groupes : groupe
    // sujet, verbe, complément (BO p. 93)
    explication: { classes: ['ce1'], slug: 'affiche-la-phrase-expliquee' },
    // CE1 : les trois types et les deux formes (négative, exclamative), BO p. 93
    ce1: { classes: ['ce1'], slug: 'affiche-la-phrase' },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
