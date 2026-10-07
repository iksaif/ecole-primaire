// Conjugaison — textes de CONTENU, toujours en français (`contenu: 'fr'` : la fiche n'a pas de breton) : titre, noms des temps et des
// groupes, consignes de la fiche. « corrige » vient de `communs`. Les textes de l'INTERFACE (réglages, jeu, et les mêmes noms de temps et
// de groupes, traduits) sont dans src/langues/<langue>/textes/conjugaison.ts. Formes : src/data/conjugaison.js.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Conjugaison',
  groupe: { aux: 'auxiliaire', g1: '1er groupe', g2: '2e groupe', g3: '3e groupe' },
  temps: {
    present: 'Présent', imparfait: 'Imparfait', futur: 'Futur', 'passe-compose': 'Passé composé', 'passe-simple': 'Passé simple',
    'plus-que-parfait': 'Plus-que-parfait',
  },
  ficheLacunes: 'Complète les terminaisons',
  ficheComplet: 'Écris les formes complètes',
})
