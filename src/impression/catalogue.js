// Fiches « toutes prêtes » générées en PDF au moment du build (scripts/telechargements.mjs)
// et proposées sur des pages statiques /telechargements/<slug>/ (référencement).
// Le mode normal reste la génération à la demande dans l'app.

import { langueRegionale } from '../data/languesRegionales.js'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')
const BR = langueRegionale('br')
const listeBr = id => BR.listes.find(l => l.id === id).mots.join('\n')
const TOUS_STYLES = ['script-maj', 'script-min', 'attache-maj', 'attache-min']
const NOMS_STYLES = {
  'script-maj': 'script majuscule', 'script-min': 'script minuscule',
  'attache-maj': 'attaché majuscule', 'attache-min': 'attaché minuscule',
}

export const CATEGORIES = [
  { id: 'ecriture', titre: "✏️ Fiches d'écriture", titreBr: '✏️ Fichennoù skrivañ', introBr: "War linennoù Seyès, gant ar skouer e du, lizherennoù gris da adtresañ ha linennoù evit skrivañ e-unan.", intro: "Sur lignage Seyès, avec le modèle en noir, des lettres grises à repasser puis des lignes pour écrire seul." },
  { id: 'alphabet', titre: "🔤 Affiches de l'alphabet", titreBr: '🔤 Skritelloù al lizherenneg', introBr: "Al lizherennoù e skript hag a-stag, pennlizherennoù ha lizherennoù bihan, da lakaat war ar voger pe er c'haier.", intro: 'Les lettres en script et en attaché, majuscules et minuscules, à afficher au mur ou à coller dans le cahier.' },
  { id: 'calcul',   titre: '🧮 Fiches de calcul', titreBr: '🧮 Fichennoù jediñ', introBr: 'Taolennoù liesañ ha sammañ, klokaat, doubl hag hanter, jediñ e penn — gant ar reizhadenn.', intro: 'Tables de multiplication et d\'addition, compléments, doubles et moitiés, calcul mental du programme — avec le corrigé.' },
  { id: 'nombres',  titre: '🔢 Les nombres en lettres — français et breton', titreBr: '🔢 An niveroù e lizherennoù — galleg ha brezhoneg', introBr: 'Skritelloù ha fichennoù-eñvor evit deskiñ skrivañ an niveroù e lizherennoù, e galleg hag e brezhoneg.', intro: 'Affiches et fiches mémo pour apprendre à écrire les nombres en lettres, en français et en breton.' },
]

const ecritureBase = { contenu: 'lettres', lier: false, interligne: 3, sauter: false, repasser: 2, copie: 1, couleur: true }

const lettres = ALPHABET.map(l => ({
  slug: `fiche-ecriture-lettre-${l}`,
  categorie: 'ecriture',
  type: 'ecriture',
  titre: `Fiche d'écriture : la lettre ${l.toUpperCase()} (script et attaché)`,
  court: `Lettre ${l.toUpperCase()}`,
  description: `Fiche d'écriture gratuite à imprimer pour apprendre à écrire la lettre ${l.toUpperCase()} ${l} en script et en attaché (cursive), majuscule et minuscule, sur lignes Seyès. GS, CP, CE1.`,
  niveaux: 'GS · CP · CE1',
  config: { ...ecritureBase, sauter: true, repasser: 1, styles: TOUS_STYLES, lettres: [l], titre: `La lettre ${l.toUpperCase()} ${l}` },
  lien: '/imprimer/ecriture',
}))

const alphabets = TOUS_STYLES.map(st => ({
  slug: `fiche-ecriture-alphabet-${st.replace('-maj', '-majuscule').replace('-min', '-minuscule')}`,
  categorie: 'ecriture',
  type: 'ecriture',
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
].map(e => ({ ...e, categorie: 'ecriture', type: 'ecriture', lien: '/imprimer/ecriture' }))

const affiches = [
  { slug: 'affiche-alphabet-a4-paysage', court: 'Alphabet A4 paysage', format: 'A4', orientation: 'landscape', titre: "Affiche de l'alphabet A4 (script et attaché)" },
  { slug: 'affiche-alphabet-a3-paysage', court: 'Alphabet A3 paysage', format: 'A3', orientation: 'landscape', titre: "Affiche de l'alphabet A3 pour la classe (script et attaché)" },
  { slug: 'affiche-alphabet-a4-portrait', court: 'Alphabet A4 portrait', format: 'A4', orientation: 'portrait', titre: "Affiche de l'alphabet A4 portrait (script et attaché)" },
  { slug: 'affiche-alphabet-cursive', court: 'Alphabet en attaché', format: 'A4', orientation: 'landscape', styles: ['attache-maj', 'attache-min'], titre: "Affiche de l'alphabet en écriture attachée (cursive)" },
  { slug: 'cartes-alphabet-une-lettre-par-page', court: 'Une lettre par page', format: 'A4', orientation: 'landscape', disposition: 'carte', titre: "Alphabet : une grande lettre par page (frise de la classe)" },
].map(a => ({
  slug: a.slug, court: a.court, titre: a.titre,
  categorie: 'alphabet', type: 'alphabet',
  description: `${a.titre} : les lettres en script et en attaché, majuscules et minuscules, avec un mot illustré pour chaque lettre. Gratuit, à imprimer en PDF.`,
  niveaux: 'MS · GS · CP · CE1',
  config: {
    format: a.format, orientation: a.orientation, disposition: a.disposition ?? 'grille',
    styles: a.styles ?? TOUS_STYLES, mot: true, voyelles: true, lignes: false,
  },
  lien: '/imprimer/alphabet',
}))

const nombresBase = { langue: 'bilingue', miseEnPage: 'affiches', format: 'A4', orientation: 'portrait', representation: true, rectifiee: true, de: 0, a: 0, pas: 1 }
const dizaines = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => ({
  slug: `nombres-francais-breton-${d * 10}-${d * 10 + 10}`,
  court: `De ${d * 10} à ${d * 10 + 10}`,
  titre: `Les nombres de ${d * 10} à ${d * 10 + 10} en français et en breton`,
  description: `Affiche bilingue : les nombres de ${d * 10} à ${d * 10 + 10} écrits en chiffres, en lettres en français et en breton (brezhoneg). Pour l'école bilingue ou Diwan.`,
  niveaux: 'CP · CE1',
  config: { ...nombresBase, sections: [`d${d}`] },
}))
const nombres = [
  {
    slug: 'nombres-francais-breton-0-100', court: 'Tableau de 0 à 100',
    titre: 'Les nombres de 0 à 100 en français et en breton',
    description: 'Tableau bilingue des nombres de 0 à 100 en chiffres et en lettres, en français et en breton (brezhoneg). Gratuit à imprimer.',
    niveaux: 'CP · CE1 · CE2',
    config: { ...nombresBase, sections: ['cent'] },
  },
  {
    slug: 'affiches-nombres-francais-breton', court: 'Unités, dizaines, centaines',
    titre: 'Affiches des nombres en français et en breton : unités, dizaines, centaines, milliers',
    description: 'Cinq affiches bilingues français / breton : les unités, de 10 à 20, les dizaines, les centaines et les milliers, avec points, barres de dix et plaques de cent.',
    niveaux: 'CP · CE1 · CE2',
    config: { ...nombresBase, sections: ['unites', 'onze', 'dizaines', 'centaines', 'milliers'] },
  },
  ...dizaines,
  {
    slug: 'nombres-en-breton-0-100', court: 'Breton de 0 à 100',
    titre: 'Les nombres en breton de 0 à 100',
    description: 'Les nombres de 0 à 100 en breton (brezhoneg) : unan, daou, tri… ugent, tregont, hanter-kant, pevar-ugent, kant. Tableau à imprimer.',
    niveaux: 'CP · CE1 · CE2',
    config: { ...nombresBase, langue: 'br', sections: ['cent'] },
  },
  {
    slug: 'nombres-en-lettres-0-100', court: 'Français de 0 à 100',
    titre: 'Les nombres en lettres de 0 à 100 (orthographe rectifiée)',
    description: "Tableau des nombres de 0 à 100 écrits en lettres en français, avec l'orthographe rectifiée de 1990 utilisée à l'école (vingt-et-un, quatre-vingts…).",
    niveaux: 'CP · CE1 · CE2',
    config: { ...nombresBase, langue: 'fr', sections: ['cent'] },
  },
  {
    slug: 'nombres-en-lettres-dizaines-centaines', court: 'Dizaines et centaines (français)',
    titre: 'Écrire les nombres en lettres : dizaines, centaines et milliers',
    description: 'Affiches mémo pour écrire les nombres en lettres en français : unités, 10 à 20, dizaines, centaines et milliers, avec représentations.',
    niveaux: 'CE1 · CE2',
    config: { ...nombresBase, langue: 'fr', sections: ['unites', 'onze', 'dizaines', 'centaines', 'milliers'] },
  },
].map(e => ({ ...e, categorie: 'nombres', type: 'nombres', lien: '/imprimer/nombres' }))

const breton = [
  {
    slug: 'fiche-ecriture-alphabet-breton', court: 'Alphabet breton', type: 'ecriture', categorie: 'ecriture',
    titre: "Fiche d'écriture : l'alphabet breton (lizherenneg) en attaché",
    description: "Les 25 lettres de l'alphabet breton (a, b, ch, c'h, d…) en attaché majuscule et minuscule, à repasser puis à recopier sur lignes Seyès.",
    niveaux: 'GS · CP · CE1', lien: '/imprimer/ecriture',
    config: { ...ecritureBase, styles: ['attache-maj', 'attache-min'], lettres: BR.alphabet, repasser: 1, copie: 0, titre: "Al lizherenneg — l'alphabet breton" },
  },
  {
    slug: 'fiche-ecriture-jours-de-la-semaine-breton', court: 'Jours en breton', type: 'ecriture', categorie: 'ecriture',
    titre: "Fiche d'écriture : les jours de la semaine en breton",
    description: "Écrire les jours de la semaine en breton en attaché : Lun, Meurzh, Merc'her, Yaou, Gwener, Sadorn, Sul, et Dilun, Dimeurzh… Sur lignes Seyès.",
    niveaux: 'CP · CE1', lien: '/imprimer/ecriture',
    config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, copie: 0, mots: listeBr('jours') + '\n' + listeBr('jours-di'), titre: 'Deizioù ar sizhun — les jours en breton' },
  },
  {
    slug: 'fiche-ecriture-mois-breton', court: 'Mois en breton', type: 'ecriture', categorie: 'ecriture',
    titre: "Fiche d'écriture : les mois de l'année en breton",
    description: "Écrire les douze mois de l'année en breton en attaché : Genver, C'hwevrer, Meurzh, Ebrel, Mae, Mezheven, Gouere, Eost, Gwengolo, Here, Du, Kerzu.",
    niveaux: 'CP · CE1 · CE2', lien: '/imprimer/ecriture',
    config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, copie: 0, mots: listeBr('mois'), titre: 'Mizioù ar bloaz — les mois en breton' },
  },
  {
    slug: 'fiche-ecriture-nombres-breton', court: 'Nombres en breton (1 à 10)', type: 'ecriture', categorie: 'ecriture',
    titre: "Fiche d'écriture : les nombres de 1 à 10 en breton",
    description: 'Écrire les nombres en lettres en breton de unan à dek, en attaché, sur lignes Seyès : unan, daou, tri, pevar, pemp…',
    niveaux: 'CP · CE1', lien: '/imprimer/ecriture',
    config: { ...ecritureBase, contenu: 'mots', styles: ['attache-min'], repasser: 1, mots: listeBr('nombres-10'), titre: 'Les nombres de 1 à 10 en breton' },
  },
  ...[['A4', 'landscape', 'A4'], ['A3', 'landscape', 'A3']].map(([format, orientation, nom]) => ({
    slug: `affiche-alphabet-breton-${nom.toLowerCase()}`, court: `Alphabet breton ${nom}`, type: 'alphabet', categorie: 'alphabet',
    titre: `Affiche de l'alphabet breton ${nom} (al lizherenneg)`,
    description: `Affiche ${nom} de l'alphabet breton : 25 lettres avec ch et c'h, en script et en attaché, majuscules et minuscules. Pour l'école bilingue ou Diwan.`,
    niveaux: 'MS · GS · CP · CE1', lien: '/imprimer/alphabet',
    config: { format, orientation, disposition: 'grille', styles: TOUS_STYLES, mot: false, voyelles: true, lignes: false, alphabet: 'br' },
  })),
]

// Une fiche par lettre de l'alphabet breton (ch et c'h compris) — pour skoolik.app
const slugLettre = l => l.replace("'", '-')
const lettresBretonnes = BR.alphabet.map(l => {
  const L = l[0].toUpperCase() + l.slice(1)
  return {
    slug: `fiche-ecriture-lizherenn-${slugLettre(l)}`, court: `Lizherenn ${L}`, type: 'ecriture', categorie: 'ecriture',
    titre: `Fiche d'écriture : la lettre ${L} de l'alphabet breton`,
    description: `Fiche d'écriture pour apprendre à écrire la lettre ${L} ${l} de l'alphabet breton (lizherenneg) en script et en attaché, majuscule et minuscule, sur lignes Seyès.`,
    niveaux: 'GS · CP · CE1', lien: '/imprimer/ecriture', langues: ['br'],
    config: { ...ecritureBase, sauter: true, repasser: 1, styles: TOUS_STYLES, lettres: [l], titre: `Al lizherenn ${L} ${l}` },
  }
})

// Langues de chaque fiche : français par défaut ; les fiches bretonnes et bilingues vont sur les deux sites
const avecLangues = (liste, langues) => liste.map(t => ({ langues, ...t }))

export const TELECHARGEMENTS = [
  ...avecLangues([...lettres, ...alphabets, ...mots, ...affiches], ['fr']),
  ...nombres.map(t => ({ langues: t.config.langue === 'fr' ? ['fr'] : ['fr', 'br'], ...t })),
  ...avecLangues(breton, ['fr', 'br']),
  ...lettresBretonnes,
]

// Fiches publiées sur un site selon sa langue (fr : ecoleprimaire.app, br : skoolik.app)
// langues : liste des langues du site, ex. ['fr', 'br'] pour skoolik.app (écoles bilingues)
export const catalogueDuSite = langues => TELECHARGEMENTS.filter(t => t.langues.some(l => [].concat(langues).includes(l)))
