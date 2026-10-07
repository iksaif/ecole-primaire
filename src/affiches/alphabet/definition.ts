// L'affiche de l'alphabet (reportée de `main`, src/impression/alphabet.js) : les lettres en quatre écritures (script et attaché,
// majuscules et minuscules), un mot illustré par lettre, A4 ou A3. Elle montre le modèle « riche » : une langue par page ou
// plusieurs sur la même feuille (français, breton : l'alphabet de chaque langue a ses propres lettres), des écritures au choix,
// des polices par type (script, attaché), des pages multiples (une lettre par page), une série « lettres spéciales ».
// Les fiches toutes prêtes publiées gardent leur slug : une variante par fiche (voir `variantes`).
import { definirAffiche, choix, cases } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES } from '../../langues/registre.ts'
import { SERIES } from './lettres.ts'
import type { ReglagesDeAffiche } from '../types.ts'

/** Les quatre écritures : le script (lettres séparées) et l'attaché (cursive), en majuscules et en minuscules. */
export const STYLES = ['script-maj', 'script-min', 'attache-maj', 'attache-min'] as const
export const DISPOSITIONS = ['grille', 'carte'] as const

/** Marge et hauteur du titre (mm, agrandis en A3 par le cadre). */
export const MARGE = 8
export const H_TITRE = 11

// ce que les variantes changent des réglages communs : les écritures, la série, la disposition
const ATTACHE = cases(STYLES, { defaut: ['attache-maj', 'attache-min'] })
const UNE_PAR_PAGE = choix(DISPOSITIONS, { defaut: 'carte' })
const SPECIALES = choix(SERIES, { defaut: 'speciales' })

const definition = definirAffiche({
  id: 'alphabet',
  domaine: D.lecture,
  // la carte du catalogue (l'emoji de l'ancienne entrée « Affiche de l'alphabet », src/data/activites.js)
  emoji: '🔤',
  // la cursive est une compétence d'écriture, les accents une compétence de vocabulaire (programme.ts)
  // l'alphabet de la langue régionale (dans cette langue, la même affiche montre son alphabet : src/langues/<langue>/donnees.ts)
  autresDomaines: [D.ecriture, D.vocabulaire, D.regionaleSons],
  // une ou plusieurs langues sur la feuille ; l'alphabet de chaque langue est le sien (src/langues/<langue>/donnees.ts)
  langues: CODES,
  bilingue: true,
  orientations: ['landscape', 'portrait'],
  formats: ['A4', 'A3'],
  marge: MARGE,
  hTitre: H_TITRE,
  // le mot illustré et le titre sont en script ; l'attaché a sa police, avec son lignage facultatif
  police: { mode: 'parType', types: ['script', 'attache'], defauts: { script: 'Andika', attache: 'Playwrite FR Trad' } },
  // chaque variante garde celles qui sont au programme de TOUTES ses classes
  competences: [K.nomLettres, K.cursive, K.accentsLettres, K.alphabetLangueRegionale],
  reglages: {
    serie: choix(SERIES),
    disposition: choix(DISPOSITIONS),
    styles: cases(STYLES),
    mot: choix([true, false]),
    voyelles: choix([true, false]),
    lignes: choix([false, true]),
  },
  formulaire: {
    groupes: [
      { id: 'contenu', reglages: ['serie', 'disposition', 'mot', 'voyelles'] },
      { id: 'ecriture', reglages: ['styles', 'lignes'] },
    ],
    visibleSi: {
      // le lignage n'accompagne que l'attaché, dont c'est la police qu'on choisit alors
      lignes: { un: [{ reglage: 'styles', contient: 'attache-maj' }, { reglage: 'styles', contient: 'attache-min' }] },
      'polices.attache': { un: [{ reglage: 'styles', contient: 'attache-maj' }, { reglage: 'styles', contient: 'attache-min' }] },
    },
  },
  // une variante par fiche toute prête publiée (slugs de `main`) : `format` et `orientation` sont ceux de la fiche
  variantes: {
    'a4-paysage': { classes: ['ms', 'gs', 'cp'], format: 'A4', orientation: 'landscape' },
    'a3-paysage': { classes: ['ms', 'gs', 'cp'], format: 'A3', orientation: 'landscape' },
    'a4-portrait': { classes: ['ms', 'gs', 'cp'], format: 'A4', orientation: 'portrait' },
    // l'alphabet en cursive seule : la compétence « écrire en cursive » (CP : minuscules, CE1 : majuscules)
    cursive: { classes: ['cp', 'ce1'], sauf: [K.accentsLettres], reglages: { styles: ATTACHE } },
    'une-lettre-par-page': { classes: ['ms', 'gs', 'cp'], slug: 'cartes-alphabet-une-lettre-par-page', reglages: { disposition: UNE_PAR_PAGE } },
    // nouvelle : les lettres à signe (accents, cédille, ligatures) ; « identifier et nommer les accents » est une compétence du CP
    'lettres-speciales': { classes: ['cp', 'ce1'], sauf: [K.cursive], reglages: { serie: SPECIALES } },
  },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
