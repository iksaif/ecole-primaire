// Écriture — textes de CONTENU : ce que la fiche écrit (titre par défaut, noms des écritures, en-tête Prénom / Date), en français et en
// breton, et les textes des fiches publiées (`fiche.<id>.titre|court|description`, en français : ceux de l'ancien catalogue, publiés).
// Les textes de l'INTERFACE (réglages, familles de lettres, listes) sont dans src/langues/<langue>/textes/ecriture.ts.
import { catalogue } from '../../langues/catalogue.ts'
import { FICHES_PUBLIEES } from './publiees.ts'

const fiche = Object.fromEntries(FICHES_PUBLIEES.map(f => [f.id, { titre: f.titre, court: f.court, description: f.description }]))

export const CONTENU = catalogue({
  // titre par défaut : « Écriture — attaché minuscule, script minuscule »
  titre: 'Écriture — ',
  separateurStyles: ', ',
  style: {
    'script-maj': 'Script majuscule',
    'script-min': 'Script minuscule',
    'attache-maj': 'Attaché majuscule',
    'attache-min': 'Attaché minuscule',
  },
  prenom: 'Prénom',
  date: 'Date',
  fiche,
}, {
  br: {
    titre: 'Skrivañ — ',
    separateurStyles: ' ; ', // les noms des écritures ont déjà une virgule
    style: {
      'script-maj': 'Skript, pennlizherennoù',
      'script-min': 'Skript, lizherennoù bihan',
      'attache-maj': 'A-stag, pennlizherennoù',
      'attache-min': 'A-stag, lizherennoù bihan',
    },
    prenom: 'Anv-bihan',
    date: 'Deiziad',
    // les textes des fiches publiées restent en français (le catalogue les montre en français tant qu'ils n'ont pas de traduction)
    fiche,
  },
})
