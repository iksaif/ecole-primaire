// L'affiche des nombres en lettres (reportée de `main`, src/impression/nombres.js) : des nombres en chiffres, en lettres, avec leur
// représentation en matériel (unités, barres de dix, plaques de cent), dans une ou plusieurs langues sur la même feuille (français,
// breton, ou les deux). Une affiche par section (une page chacune) ou toutes les sections sur une seule feuille.
// Programme (src/data/programme.ts) : « nombres en lettres » (CP : jusqu'à 50 ; CE1 : jusqu'à 100 ; CE2 : jusqu'à 1 000 et au-delà).
// Les fiches publiées gardent leur adresse française (`nombres-en-lettres-0-100`) ; une langue seule ou deux ajoutent `-br`, `-fr-br`.
import { definirAffiche, choix, cases, nombre } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'
import { DIZAINES, SECTIONS } from './sections.ts'

const une = (...ids: (typeof SECTIONS)[number][]) => cases(SECTIONS, { defaut: ids })
const CINQ = ['unites', 'onze', 'dizaines', 'centaines', 'milliers'] as const

const definition = definirAffiche({
  id: 'nombres',
  domaine: D.nombresCalcul,
  emoji: '🔢',
  langues: CODES,
  bilingue: true,
  orientations: ['portrait', 'landscape'],
  formats: ['A4', 'A3'],
  marge: 10,
  hTitre: 14,
  competences: [K.nombresEnLettres],
  reglages: {
    sections: cases(SECTIONS, { defaut: [...CINQ.slice(0, 4)] }),
    miseEnPage: choix(['affiches', 'fiche']),
    representation: choix([true, false]),
    rectifiee: choix([true, false]),
    de: nombre({ defaut: 20, min: 0, max: 9999 }),
    a: nombre({ defaut: 29, min: 0, max: 9999 }),
    pas: nombre({ defaut: 1, min: 1, max: 1000 }),
  },
  formulaire: {
    groupes: [
      { id: 'contenu', reglages: ['sections', 'de', 'a', 'pas'] },
      { id: 'miseEnPage', reglages: ['miseEnPage', 'representation', 'rectifiee'] },
    ],
    visibleSi: {
      de: { reglage: 'sections', contient: 'perso' }, a: { reglage: 'sections', contient: 'perso' }, pas: { reglage: 'sections', contient: 'perso' },
      // l'orthographe rectifiée ne concerne que le français
      rectifiee: { reglage: 'langues', contient: 'fr' },
    },
  },
  // une variante par fiche toute prête (slugs de `main`) ; écriture en lettres : jusqu'à 50 au CP, 100 dès le CE1
  variantes: {
    cent: { classes: ['ce1', 'ce2'], slug: 'nombres-en-lettres-0-100', reglages: { sections: une('cent') } },
    'unites-milliers': { classes: ['ce2'], slug: 'nombres-en-lettres-dizaines-centaines', reglages: { sections: une(...CINQ) } },
    ...Object.fromEntries(DIZAINES.map((d, i) => [`dizaine-${i + 1}`, {
      classes: i < 4 ? ['cp', 'ce1'] as const : ['ce1', 'ce2'] as const, slug: `nombres-en-lettres-${(i + 1) * 10}-${(i + 2) * 10}`, reglages: { sections: une(d) },
    }])),
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
