// Les textes de l'affiche des pronoms personnels sujets (français seulement).
import type { TextesAffiche } from '../types.ts'

export const TEXTES: TextesAffiche = {
  fr: {
    titre: 'Les pronoms personnels sujets',
    'variante.ce1.court': 'Pronoms personnels',
    'variante.ce1.titre': 'Affiche des pronoms personnels sujets : je, tu, il, elle, on, nous, vous, ils, elles',
    'variante.ce1.description': 'Les pronoms personnels sujets rangés par personne, au singulier et au pluriel, avec une image et un exemple : je chante, tu chantes…',
    'reglage.exemple': 'Un exemple avec un verbe',
    'valeur.exemple.true': 'Oui (je chante…)',
    'valeur.exemple.false': 'Les pronoms seuls',
    singulier: 'un seul (singulier)',
    pluriel: 'plusieurs (pluriel)',
    'personne.1': 'qui parle',
    'personne.2': 'à qui je parle',
    'personne.3': 'de qui je parle',
  },
}
