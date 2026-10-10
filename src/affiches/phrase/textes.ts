// Les textes de l'affiche « La phrase » (français seulement). Les noms des types et des formes (déclarative, négative…) et « verbe » sont
// ceux de l'exercice de grammaire (src/langues/fr/textes/grammaire.ts) : un seul texte pour le même mot, sur l'affiche et dans le jeu.
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Qu’est-ce qu’une phrase ?',
    'variante.ce1.court': 'La phrase (CE1)',
    'variante.ce1.titre': 'Affiche de la phrase : majuscule et point, types de phrases, formes négative et exclamative',
    'variante.ce1.description': 'Ce qu’est une phrase, ses trois types (déclarative, interrogative, impérative) et leur ponctuation, les formes négative et exclamative, et les groupes de la phrase.',
    'reglage.groupes': 'Les groupes de la phrase',
    'valeur.groupes.true': 'Sujet, verbe, complément',
    'valeur.groupes.false': 'Pas de groupes',
    'regle.titre': 'Une phrase',
    'regle.texte': 'commence par une majuscule, finit par un point et veut dire quelque chose.',
    'regle.exemple': 'Le chat dort sur le tapis.',
    'types.titre': 'Les trois types de phrases',
    'type.declarative.role': 'je dis quelque chose',
    'type.declarative.exemple': 'Il fait beau.',
    'type.interrogative.role': 'je pose une question',
    'type.interrogative.exemple': 'Est-ce qu’il fait beau ?',
    'type.imperative.role': 'je demande de faire quelque chose',
    'type.imperative.exemple': 'Mets ton manteau.',
    'formes.titre': 'Deux formes de phrases',
    'forme.negative.role': 'avec ne … pas',
    'forme.negative.exemple': 'Il ne fait pas beau.',
    'forme.exclamative': 'exclamative',
    'forme.exclamative.role': 'je montre ce que je ressens',
    'forme.exclamative.exemple': 'Comme il fait beau !',
    'groupes.titre': 'Les groupes de la phrase',
    'groupe.sujet': 'groupe sujet',
    'groupe.complement': 'complément',
    'groupe.exemple.sujet': 'La maîtresse',
    'groupe.exemple.verbe': 'raconte',
    'groupe.exemple.complement': 'une histoire.',
    'groupe.question.sujet': 'Qui est-ce qui ?',
  },
}
