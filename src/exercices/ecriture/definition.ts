// Écriture — fiches sur lignage Seyès : le modèle en noir au début de la ligne, des copies grises à repasser, puis des lignes pour
// écrire seul. Exercice « fiche seule » (décision du 2026-10-06 : pas de partie à l'écran) et sans hasard (une fiche ne tire rien).
//
// Les niveaux ne changent que la taille du lignage proposée d'abord (4 mm en GS → 2 mm en CE2). Le contenu suit la langue de
// l'interface : les en-têtes (Prénom, Date) et le titre par défaut ; les lettres régionales et les fiches régionales viennent des
// données de la langue. Les fiches publiées (publiees.ts) servent souvent plusieurs classes (« GS · CP · CE1 ») et n'existent que
// dans leur langue : `classes` et `langues` des fiches.
import { definir, cases, choix } from '../../noyau/definir.ts'
import type { FicheExercice } from '../../noyau/types.ts'
import { K, D } from '../../noyau/ids.ts'
import { CONTENUS, INTERLIGNES, NB_LIGNES, TOUS_STYLES, TOUTES_LETTRES } from './donnees.ts'
import type { ReglagesEcriture } from './donnees.ts'
import { FICHES_PUBLIEES } from './publiees.ts'

/** Le lignage proposé d'abord dans une classe (en mm d'interligne). */
const lignage = (defaut: (typeof INTERLIGNES)[number]) => ({ reglages: { interligne: choix(INTERLIGNES, { defaut }) } })

// la compétence principale d'une fiche publiée : celle de sa première classe (le geste d'écriture en GS, la cursive ensuite)
const fiches: FicheExercice<ReglagesEcriture>[] = FICHES_PUBLIEES.map(f => ({
  id: f.id, slug: f.slug, niveau: f.classes[0], classes: f.classes, langues: [f.langue],
  competence: f.classes[0] === 'gs' ? K.gesteEcritureMaternelle : K.cursive,
  reglages: f.reglages,
}))

export default definir({
  id: 'ecriture',
  route: '/francais/ecriture',
  domaine: D.ecriture,
  emoji: '✏️',
  jeu: false,
  aleatoire: false,
  bilanParClasse: false,
  corrige: false,
  competences: [K.gesteEcritureMaternelle, K.cursive, K.copie],
  niveauDefaut: 'cp',
  reglages: {
    styles: cases(TOUS_STYLES, { defaut: ['attache-min'] }),
    contenu: choix(CONTENUS),
    lettres: cases(TOUTES_LETTRES, { defaut: ['a', 'b', 'c'] }),
    lier: choix([false, true]),
    mots: 'papa\nmaman\nécole\nmaison\nbonjour' as string,
    texte: "Aujourd'hui, il fait beau.\nLe chat dort sur le tapis." as string,
    titre: '' as string,
    sauter: choix([true, false]),
    repasser: choix(NB_LIGNES, { defaut: 1 }),
    copie: choix(NB_LIGNES, { defaut: 1 }),
    couleur: choix([true, false]),
  },
  niveaux: {
    gs: lignage(4),
    cp: lignage(3),
    ce1: lignage(2.5),
    ce2: lignage(2),
  },
  fiches,
})
