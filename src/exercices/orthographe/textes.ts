// Orthographe — textes de CONTENU, toujours en français (`contenu: 'fr'` : la fiche n'a pas de breton) : titre, noms des thèmes et
// consignes de la fiche. « corrige » vient de la section `communs`. Les textes de l'INTERFACE (réglages, jeu, explications des réponses)
// sont dans src/langues/<langue>/textes/orthographe.ts ; les phrases sont dans le corpus src/data/orthographe.js.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Orthographe',
  theme: { homophones: 'Homophones', accords: 'Accords', lettres: 'Lettres manquantes' },
  entoure: 'Entoure le mot qui convient.',
  complete: 'Complète le mot.',
})
