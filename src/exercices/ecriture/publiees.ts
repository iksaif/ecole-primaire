// Écriture — les fiches toutes prêtes publiées (pages /telechargements/<slug>/), reprises telles quelles de l'ancien catalogue : leurs
// slugs, leurs classes, leurs réglages et leurs textes (titre, nom court, description) ne changent pas. definition.ts en fait les
// `fiches` de l'exercice ; textes.ts en tire les textes `fiche.<id>.*`.
//   - en français : une fiche par lettre, l'alphabet dans chaque écriture, les chiffres, les jours, les mois, les nombres ;
//   - pour chaque langue régionale (son `fichesEcriture`, src/langues/<langue>/donnees.ts) : l'alphabet, des listes de mots, une fiche par
//     lettre. Ces fiches n'existent que dans cette langue (`langues: [code]`).
import { LANGUES, REGIONALES, donneesRegionales } from '../../langues/registre.ts'
import type { Classe } from '../../data/classes.ts'
import { K } from '../../noyau/ids.ts'
import type { CompetenceId } from '../../noyau/types.ts'
import { ALPHABET, TOUS_STYLES } from './donnees.ts'
import type { ReglagesEcriture, Style } from './donnees.ts'

/** Une fiche publiée : de quoi la déclarer (definition.ts) et ses textes de catalogue (textes.ts). */
export interface FichePubliee {
  /** identifiant dans l'exercice (unique) */
  id: string
  slug: string
  classes: readonly Classe[]
  /** langue de contenu de la fiche (une seule : la fiche n'existe pas dans les autres) */
  langue: string
  reglages: ReglagesEcriture
  /** les compétences de la langue régionale que travaille une fiche régionale (son alphabet, ses jours, ses mois, ses nombres) */
  competencesRegionales?: readonly CompetenceId[]
  titre: string
  court: string
  description: string
}

// réglages communs des fiches publiées (les fiches ne dépendent pas des défauts du niveau : elles disent tout)
const BASE: ReglagesEcriture = {
  styles: ['attache-min'], contenu: 'lettres', lettres: [], lier: false, mots: '', texte: '', titre: '',
  interligne: 3, sauter: false, repasser: 2, copie: 1, couleur: true,
}

const NOMS_STYLES: Readonly<Record<Style, string>> = {
  'script-maj': 'script majuscule', 'script-min': 'script minuscule',
  'attache-maj': 'attaché majuscule', 'attache-min': 'attaché minuscule',
}
const GS_CE1: readonly Classe[] = ['gs', 'cp', 'ce1']
const majuscule = (l: string): string => l[0].toUpperCase() + l.slice(1)
// écrire l'alphabet ou une lettre de la langue régionale : reconnaître ses lettres, et ses graphèmes propres (épeler, au CP et au CE1)
const ALPHABET_REGIONAL: readonly CompetenceId[] = [K.alphabetLangueRegionale, K.epelerLangueRegionale]

// ── Français ──

const lettres: FichePubliee[] = ALPHABET.map(l => ({
  id: `lettre-${l}`, slug: `fiche-ecriture-lettre-${l}`, classes: GS_CE1, langue: 'fr',
  reglages: { ...BASE, sauter: true, repasser: 1, styles: [...TOUS_STYLES], lettres: [l], titre: `La lettre ${l.toUpperCase()} ${l}` },
  titre: `Fiche d'écriture : la lettre ${l.toUpperCase()} (script et attaché)`,
  court: `Lettre ${l.toUpperCase()}`,
  description: `Fiche d'écriture gratuite à imprimer pour apprendre à écrire la lettre ${l.toUpperCase()} ${l} en script et en attaché (cursive), majuscule et minuscule, sur lignes Seyès. GS, CP, CE1.`,
}))

/** « attache-min » → « attache-minuscule » (le slug publié) */
const nomDeStyle = (style: Style): string => style.replace('-maj', '-majuscule').replace('-min', '-minuscule')

const alphabets: FichePubliee[] = TOUS_STYLES.map(style => ({
  id: `alphabet-${nomDeStyle(style)}`, slug: `fiche-ecriture-alphabet-${nomDeStyle(style)}`, classes: GS_CE1, langue: 'fr',
  reglages: { ...BASE, styles: [style], lettres: [...ALPHABET], repasser: 1, titre: `L'alphabet en ${NOMS_STYLES[style]}` },
  titre: `Fiches d'écriture : l'alphabet en ${NOMS_STYLES[style]}`,
  court: `Alphabet ${NOMS_STYLES[style]}`,
  description: `Les 26 lettres de l'alphabet en ${NOMS_STYLES[style]} à repasser puis à recopier, sur lignes Seyès. Fiches d'écriture gratuites à imprimer (PDF).`,
}))

const listes: FichePubliee[] = [
  {
    id: 'chiffres', slug: 'fiche-ecriture-chiffres', classes: ['gs', 'cp'], langue: 'fr',
    reglages: { ...BASE, styles: ['script-min'], lettres: '0123456789'.split(''), titre: 'Les chiffres de 0 à 9' },
    titre: "Fiche d'écriture : les chiffres de 0 à 9", court: 'Les chiffres',
    description: 'Apprendre à écrire les chiffres de 0 à 9 : modèle, chiffres à repasser et lignes pour écrire seul, sur lignes Seyès.',
  },
  {
    id: 'jours', slug: 'fiche-ecriture-jours-de-la-semaine-attache', classes: ['cp', 'ce1'], langue: 'fr',
    reglages: { ...BASE, contenu: 'mots', styles: ['attache-min'], repasser: 1, mots: 'lundi\nmardi\nmercredi\njeudi\nvendredi\nsamedi\ndimanche', titre: 'Les jours de la semaine' },
    titre: "Fiche d'écriture : les jours de la semaine en attaché", court: 'Jours de la semaine',
    description: 'Écrire les jours de la semaine en écriture attachée (cursive) : lundi, mardi, mercredi… à repasser puis à recopier sur lignes Seyès.',
  },
  {
    id: 'mois', slug: 'fiche-ecriture-mois-de-l-annee-attache', classes: ['cp', 'ce1', 'ce2'], langue: 'fr',
    reglages: { ...BASE, contenu: 'mots', styles: ['attache-min'], repasser: 1, copie: 0, mots: 'janvier\nfévrier\nmars\navril\nmai\njuin\njuillet\naoût\nseptembre\noctobre\nnovembre\ndécembre', titre: "Les mois de l'année" },
    titre: "Fiche d'écriture : les mois de l'année en attaché", court: "Mois de l'année",
    description: "Écrire les douze mois de l'année en écriture attachée (cursive), à repasser puis à recopier sur lignes Seyès.",
  },
  {
    id: 'nombres', slug: 'fiche-ecriture-nombres-en-lettres-attache', classes: ['cp', 'ce1'], langue: 'fr',
    reglages: { ...BASE, contenu: 'mots', styles: ['attache-min'], repasser: 1, mots: 'un\ndeux\ntrois\nquatre\ncinq\nsix\nsept\nhuit\nneuf\ndix', titre: 'Les nombres de un à dix' },
    titre: "Fiche d'écriture : les nombres de un à dix en lettres (attaché)", court: 'Nombres en lettres (1 à 10)',
    description: 'Écrire les nombres en lettres de un à dix en écriture attachée (cursive) sur lignes Seyès. Fiche gratuite à imprimer.',
  },
]

// ── Langues régionales ──

/** Les fiches d'une langue régionale, d'après ses données (alphabet, listes de mots, `fichesEcriture`). */
function fichesRegionales(code: (typeof REGIONALES)[number]): FichePubliee[] {
  const donnees = donneesRegionales(code)
  if (!donnees) return []
  const nom = LANGUES[code].nom.fr
  const { motLettre, titreLettre } = donnees.fichesEcriture
  // « Al lizherenneg » → « lizherenneg » (entre parenthèses dans les titres)
  const nomAlphabet = donnees.titreAlphabet.toLowerCase().replace(/^al /, '')
  const motsDe = (ids: readonly string[]): string[] => ids.flatMap(id => donnees.listes.find(l => l.id === id)?.mots ?? [])

  const alphabet: FichePubliee = {
    id: `${code}-alphabet`, slug: `fiche-ecriture-alphabet-${nom}`, classes: GS_CE1, langue: code, competencesRegionales: ALPHABET_REGIONAL,
    reglages: { ...BASE, styles: ['attache-maj', 'attache-min'], lettres: [...donnees.alphabet], repasser: 1, copie: 0, titre: `${donnees.titreAlphabet} — l'alphabet ${nom}` },
    titre: `Fiche d'écriture : l'alphabet ${nom} (${nomAlphabet}) en attaché`,
    court: `Alphabet ${nom}`,
    description: `Les ${donnees.alphabet.length} lettres de l'alphabet ${nom} (${donnees.alphabet.slice(0, 5).join(', ')}…) en attaché majuscule et minuscule, à repasser puis à recopier sur lignes Seyès.`,
  }

  const parListe: FichePubliee[] = donnees.fichesEcriture.listes.map(liste => {
    const mots = motsDe(liste.listes)
    const titreListe = donnees.listes.find(l => l.id === liste.listes[0])?.titre ?? ''
    // le titre de la liste quand il nomme déjà la langue (« Les nombres de 1 à 10 en breton »), sinon complété
    const titreImprime = titreListe.includes(nom) ? titreListe : `${titreListe} — ${liste.resume} en ${nom}`
    return {
      id: `${code}-${liste.slug}`, slug: `fiche-ecriture-${liste.slug}-${nom}`, classes: liste.classes, langue: code, competencesRegionales: [liste.competence],
      reglages: { ...BASE, contenu: 'mots', styles: ['attache-min'], repasser: 1, copie: liste.copie ?? 0, mots: mots.join('\n'), titre: titreImprime },
      titre: `Fiche d'écriture : ${liste.titre} en ${nom}`,
      court: `${liste.court} en ${nom}`,
      description: `Écrire ${liste.titre} en ${nom} en attaché : ${mots.slice(0, 7).join(', ')}… Sur lignes Seyès.`,
    }
  })

  // une fiche par lettre, digrammes compris (c'h → slug « c-h »)
  const parLettre: FichePubliee[] = donnees.alphabet.map(l => ({
    id: `${code}-lettre-${l.replace("'", '-')}`, slug: `fiche-ecriture-${motLettre}-${l.replace("'", '-')}`, classes: GS_CE1, langue: code,
    competencesRegionales: ALPHABET_REGIONAL,
    reglages: { ...BASE, sauter: true, repasser: 1, styles: [...TOUS_STYLES], lettres: [l], titre: `${titreLettre} ${majuscule(l)} ${l}` },
    titre: `Fiche d'écriture : la lettre ${majuscule(l)} de l'alphabet ${nom}`,
    court: `${majuscule(motLettre)} ${majuscule(l)}`,
    description: `Fiche d'écriture pour apprendre à écrire la lettre ${majuscule(l)} ${l} de l'alphabet ${nom} (${nomAlphabet}) en script et en attaché, majuscule et minuscule, sur lignes Seyès.`,
  }))

  return [alphabet, ...parListe, ...parLettre]
}

export const FICHES_PUBLIEES: readonly FichePubliee[] = [...lettres, ...alphabets, ...listes, ...REGIONALES.flatMap(fichesRegionales)]
