// Grammaire — textes de CONTENU, toujours en français (`contenu: 'fr'` : la fiche n'a pas de breton). Ce sont les textes français de
// l'interface (src/langues/fr/textes/grammaire.ts) : la fiche écrit les mêmes consignes, libellés et corrigés que le jeu, en français.
// Le générateur demande ses textes calculés (consignes, explications, solutions) à un traducteur : celui du jeu (l'interface) ou celui-ci.
import { catalogue } from '../../langues/catalogue.ts'
import textesFr from '../../langues/fr/textes/grammaire.ts'

export const CONTENU = catalogue(textesFr)
