// Orthographe — définition : QUI peut faire quoi (modèle : ../exemple-corpus/definition.ts, exercice de français à corpus).
// Programme (src/data/programme.ts : contraintes pluriels, féminins) ; décisions : plans/09, « Décisions français », 1 et 2.
//   Accords : CP-CE1, féminin en -e et pluriel en -s (BO n° 41 p. 92-93) ; CE2, pluriels en -x et -al/-aux, féminins qui
//   s'entendent (blanche, grosse) (p. 94). Chaque question porte `niv`, l'année où elle entre au programme (src/data/orthographe.js) :
//   un niveau propose les questions de son année et des années précédentes.
//   Lettres manquantes : CP, correspondances graphèmes-phonèmes ; CE1, mots irréguliers fréquents (p. 90).
//   Homophones grammaticaux (a/à, et/est…) : dans aucun texte du programme en vigueur ; « pour aller plus loin » du CE2
//   au CM2 (hors programme), jamais choisis par défaut. Le CM1 et le CM2 proposent les mêmes questions que le CE2.
// L'ancien réglage « CP → CM2 » (toutes les questions) est supprimé (décision du 2026-10-06) : la fiche publiée
// exercices-orthographe-cp-cm2 disparaît (redirection au déploiement : docs/TODO.md).
// Défaut : CE1, thème Accords (le bilan d'une classe est la fiche « Accords »).
// Contenu toujours en français (exercice de français), même avec l'interface en breton.
// Les valeurs de `theme` et la clé `nb` sont aussi celles des réglages mémorisés des visiteurs : elles ne changent pas.
import { definir, choix } from '../../noyau/definir.ts'
import { K, D } from '../../noyau/ids.ts'

/** Thèmes, dans l'ordre des boutons, avec leur icône et le niveau d'entrée par défaut de leurs questions. */
export const THEMES = [
  { id: 'accords', icone: '🤝', niv: 'cp' },
  { id: 'lettres', icone: '🔡', niv: 'cp' },
  { id: 'homophones', icone: '👂', niv: 'ce2' },
] as const

const RAISON_HOMOPHONES = 'Les homophones grammaticaux ne figurent dans aucun texte du programme en vigueur : pour aller plus loin'
const SANS = choix(['accords', 'lettres'], { defaut: 'accords' })
const AVEC = choix(['accords', 'lettres'], { defaut: 'accords', horsProgramme: [{ option: 'homophones', raison: RAISON_HOMOPHONES }] })

export default definir({
  id: 'orthographe',
  route: '/francais/orthographe',
  domaine: D.vocabulaire,
  autresDomaines: [D.grammaire],
  contenu: 'fr',
  emoji: '🔤',
  niveauDefaut: 'ce1',
  // cycle 2 : orthographe lexicale et accords ; cours moyen : les accords (la couverture annoncée jusqu'ici)
  competences: [K.orthographeLexicale, K.accordsGn],

  reglages: { nb: choix([5, 10, 15], { defaut: 10 }) },

  niveaux: {
    cp: { reglages: { theme: SANS } },
    ce1: { reglages: { theme: SANS } },
    ce2: { reglages: { theme: AVEC } },
    cm1: { reglages: { theme: AVEC }, sauf: [K.orthographeLexicale] },
    cm2: { reglages: { theme: AVEC }, sauf: [K.orthographeLexicale] },
  },

  // fiches par compétence ; la fiche « Accords » est le bilan de chaque classe (réglages par défaut)
  fiches: [
    ...(['cp', 'ce1', 'ce2'] as const).map(niveau => ({ id: 'lettres-manquantes', competence: K.orthographeLexicale, niveau, reglages: { theme: 'lettres' as const } })),
    { id: 'homophones', competence: K.orthographeLexicale, niveau: 'ce2', reglages: { theme: 'homophones' as const } },
  ],
})
