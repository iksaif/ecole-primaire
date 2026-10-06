// Fiches « toutes prêtes » générées en PDF au moment du build (scripts/telechargements.mjs)
// et proposées sur des pages statiques /telechargements/<slug>/ (référencement).
// Le mode normal reste la génération à la demande dans l'app.

import { LANGUES_REGIONALES } from '../data/languesRegionales.js'
import { TELECHARGEMENTS_AFFICHES } from './affiches/catalogue.js'
import { COMPETENCES } from '../data/programme.js'

// Chaque entrée a un `domaine` (id de src/data/programme.js) et un `genre` ('affiche' | 'fiche') : le build range
// les téléchargements par domaine puis par genre (plan 09). Les fiches d'écriture relèvent toutes de l'écriture,
// même quand les mots copiés sont des nombres ou des jours.
const ECRITURE = { categorie: 'ecriture', type: 'ecriture', domaine: 'ecriture', genre: 'fiche', competences: ['cursive', 'copie', 'geste-ecriture-maternelle'] }

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')
const TOUS_STYLES = ['script-maj', 'script-min', 'attache-maj', 'attache-min']
const NOMS_STYLES = {
  'script-maj': 'script majuscule', 'script-min': 'script minuscule',
  'attache-maj': 'attaché majuscule', 'attache-min': 'attaché minuscule',
}

export const CATEGORIES = [
  { id: 'ecriture', titre: "✏️ Fiches d'écriture", titreBr: '✏️ Fichennoù skrivañ', introBr: "War linennoù Seyès, gant ar skouer e du, lizherennoù gris da adtresañ ha linennoù evit skrivañ e-unan.", intro: "Sur lignage Seyès, avec le modèle en noir, des lettres grises à repasser puis des lignes pour écrire seul." },
]

const ecritureBase = { contenu: 'lettres', lier: false, interligne: 3, sauter: false, repasser: 2, copie: 1, couleur: true }

const lettres = ALPHABET.map(l => ({
  slug: `fiche-ecriture-lettre-${l}`,
  ...ECRITURE,
  titre: `Fiche d'écriture : la lettre ${l.toUpperCase()} (script et attaché)`,
  court: `Lettre ${l.toUpperCase()}`,
  description: `Fiche d'écriture gratuite à imprimer pour apprendre à écrire la lettre ${l.toUpperCase()} ${l} en script et en attaché (cursive), majuscule et minuscule, sur lignes Seyès. GS, CP, CE1.`,
  niveaux: 'GS · CP · CE1',
  config: { ...ecritureBase, sauter: true, repasser: 1, styles: TOUS_STYLES, lettres: [l], titre: `La lettre ${l.toUpperCase()} ${l}` },
  lien: '/imprimer/ecriture',
}))

const alphabets = TOUS_STYLES.map(st => ({
  slug: `fiche-ecriture-alphabet-${st.replace('-maj', '-majuscule').replace('-min', '-minuscule')}`,
  ...ECRITURE,
  titre: `Fiches d'écriture : l'alphabet en ${NOMS_STYLES[st]}`,
  court: `Alphabet ${NOMS_STYLES[st]}`,
  description: `Les 26 lettres de l'alphabet en ${NOMS_STYLES[st]} à repasser puis à recopier, sur lignes Seyès. Fiches d'écriture gratuites à imprimer (PDF).`,
  niveaux: 'GS · CP · CE1',
  config: { ...ecritureBase, styles: [st], lettres: ALPHABET, repasser: 1, titre: `L'alphabet en ${NOMS_STYLES[st]}` },
  lien: '/imprimer/ecriture',
}))

const mots = [
  {
    slug: 'fiche-ecriture-chiffres', court: 'Les chiffres',
    titre: "Fiche d'écriture : les chiffres de 0 à 9",
    description: 'Apprendre à écrire les chiffres de 0 à 9 : modèle, chiffres à repasser et lignes pour écrire seul, sur lignes Seyès.',
    niveaux: 'GS · CP',
    config: { ...ecritureBase, styles: ['script-min'], lettres: '0123456789'.split(''), titre: 'Les chiffres de 0 à 9' },
  },
  {
    slug: 'fiche-ecriture-jours-de-la-semaine-attache', court: 'Jours de la semaine',
    titre: "Fiche d'écriture : les jours de la semaine en attaché",
    description: "Écrire les jours de la semaine en écriture attachée (cursive) : lundi, mardi, mercredi… à repasser puis à recopier sur lignes Seyès.",
    niveaux: 'CP · CE1',
    config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, mots: 'lundi\nmardi\nmercredi\njeudi\nvendredi\nsamedi\ndimanche', titre: 'Les jours de la semaine' },
  },
  {
    slug: 'fiche-ecriture-mois-de-l-annee-attache', court: "Mois de l'année",
    titre: "Fiche d'écriture : les mois de l'année en attaché",
    description: "Écrire les douze mois de l'année en écriture attachée (cursive), à repasser puis à recopier sur lignes Seyès.",
    niveaux: 'CP · CE1 · CE2',
    config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, copie: 0, mots: 'janvier\nfévrier\nmars\navril\nmai\njuin\njuillet\naoût\nseptembre\noctobre\nnovembre\ndécembre', titre: "Les mois de l'année" },
  },
  {
    slug: 'fiche-ecriture-nombres-en-lettres-attache', court: 'Nombres en lettres (1 à 10)',
    titre: "Fiche d'écriture : les nombres de un à dix en lettres (attaché)",
    description: 'Écrire les nombres en lettres de un à dix en écriture attachée (cursive) sur lignes Seyès. Fiche gratuite à imprimer.',
    niveaux: 'CP · CE1',
    config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, mots: 'un\ndeux\ntrois\nquatre\ncinq\nsix\nsept\nhuit\nneuf\ndix', titre: 'Les nombres de un à dix' },
  },
].map(e => ({ ...e, ...ECRITURE, lien: '/imprimer/ecriture' }))

// Les affiches de l'alphabet sont au format « définition » : src/affiches/alphabet/ (registre src/affiches/index.ts)

// Les affiches des nombres en lettres sont au format « définition » : src/affiches/nombres/ (registre src/affiches/index.ts)

// Fiches propres à chaque langue régionale (alphabet, listes de mots, une fiche par lettre, affiches),
// générées à partir de sa définition dans src/data/languesRegionales.js
function fichesRegionales(r) {
  const nom = r.nom, f = r.fiches
  const maj = l => l[0].toUpperCase() + l.slice(1)
  const liste = ids => ids.flatMap(id => r.listes.find(l => l.id === id).mots).join('\n')
  const premieres = r.alphabet.slice(0, 5).join(', ')
  return [
    {
      slug: `fiche-ecriture-alphabet-${nom}`, court: `Alphabet ${nom}`, ...ECRITURE,
      titre: `Fiche d'écriture : l'alphabet ${nom} (${r.titreAlphabet.toLowerCase().replace(/^al /, '')}) en attaché`,
      description: `Les ${r.alphabet.length} lettres de l'alphabet ${nom} (${premieres}…) en attaché majuscule et minuscule, à repasser puis à recopier sur lignes Seyès.`,
      niveaux: 'GS · CP · CE1', lien: '/imprimer/ecriture',
      config: { ...ecritureBase, styles: ['attache-maj', 'attache-min'], lettres: r.alphabet, repasser: 1, copie: 0, titre: `${r.titreAlphabet} — l'alphabet ${nom}` },
    },
    ...f.listes.map(l => {
      const mots = liste(l.listes)
      const titreListe = r.listes.find(x => x.id === l.listes[0]).titre
      return {
        slug: `fiche-ecriture-${l.slug}-${nom}`, court: `${l.court} en ${nom}`, ...ECRITURE,
        titre: `Fiche d'écriture : ${l.titre} en ${nom}`,
        description: `Écrire ${l.titre} en ${nom} en attaché : ${mots.split('\n').slice(0, 7).join(', ')}… Sur lignes Seyès.`,
        niveaux: l.niveaux, lien: '/imprimer/ecriture',
        config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, copie: l.copie ?? 0, mots,
          titre: titreListe.includes(nom) ? titreListe : `${titreListe} — ${l.resume} en ${nom}` },
      }
    }),
    // une fiche par lettre (digrammes compris)
    ...r.alphabet.map(l => ({
      slug: `fiche-ecriture-${f.motLettre}-${l.replace("'", '-')}`, court: `${maj(f.motLettre)} ${maj(l)}`, ...ECRITURE,
      titre: `Fiche d'écriture : la lettre ${maj(l)} de l'alphabet ${nom}`,
      description: `Fiche d'écriture pour apprendre à écrire la lettre ${maj(l)} ${l} de l'alphabet ${nom} (${r.titreAlphabet.toLowerCase().replace(/^al /, '')}) en script et en attaché, majuscule et minuscule, sur lignes Seyès.`,
      niveaux: 'GS · CP · CE1', lien: '/imprimer/ecriture',
      config: { ...ecritureBase, sauter: true, repasser: 1, styles: TOUS_STYLES, lettres: [l], titre: `${f.titreLettre} ${maj(l)} ${l}` },
    })),
  ].map(t => ({ ...t, langues: [r.id] }))
}

// compétences d'une fiche au programme d'au moins une de ses classes (« GS · CP · CE1 ») : les fiches d'écriture
// déclarent le geste d'écriture de maternelle, qui ne vaut que pour celles de GS
const auProgramme = (competences = [], niveaux = '') => {
  const classes = niveaux.toLowerCase().split(/[·,\s]+/)
  return competences.filter(id => COMPETENCES.find(k => k.id === id)?.niveaux.some(n => classes.includes(n)))
}

// « Personnaliser » et page « Le programme » : le générateur réglé sur cette fiche (?preset=<slug>, voir presetDe)
export const avecPreset = (lien, slug) => `${lien}${lien.includes('?') ? '&' : '?'}preset=${slug}`

// Langues de chaque fiche : français par défaut ; les fiches bretonnes et bilingues vont sur les deux sites
const avecLangues = (liste, langues) => liste.map(t => ({ langues, ...t }))

export const TELECHARGEMENTS = [
  ...[
    ...avecLangues([...lettres, ...alphabets, ...mots], ['fr']),
    // contenu en langue régionale (alphabet, jours, mois, nombres, lettres une à une)
    ...LANGUES_REGIONALES.filter(r => r.fiches).flatMap(fichesRegionales),
  ].map(t => ({ ...t, lien: avecPreset(t.lien, t.slug), competences: auProgramme(t.competences, t.niveaux) })),
  // affiches de la droite numérique, de la numération, de l'horloge, des euros, de conjugaison, des formes (français) :
  // leur lien règle déjà l'affiche (?affiche=…&variante=…)
  ...TELECHARGEMENTS_AFFICHES,
]

// Réglages d'une fiche du catalogue (?preset=<slug> dans un générateur), ou null
export const presetDe = slug => (slug && TELECHARGEMENTS.find(t => t.slug === slug)?.config) || null

// Fiches publiées sur un site selon sa langue (fr : ecoleprimaire.app, br : skoolik.app)
// langues : liste des langues du site, ex. ['fr', 'br'] pour skoolik.app (écoles bilingues)
export const catalogueDuSite = langues => TELECHARGEMENTS.filter(t => t.langues.some(l => [].concat(langues).includes(l)))
