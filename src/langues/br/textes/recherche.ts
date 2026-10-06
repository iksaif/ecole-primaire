// Textes de l'interface — recherche (breton). Traduction automatique : les passages marqués « br: à relire »
// sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/recherche.ts'

export default {
  titre: 'Klask', // br: à relire
  champ: 'Klask', // br: à relire
  placeholder: 'Klask ur poelladenn, ur fichenn, ur varregezh…', // br: à relire
  fermer: 'Serriñ ar c’hlask', // br: à relire
  resultats: 'Disoc’hoù', // br: à relire
  aide: 'Skrivit un nebeud lizherennoù evit klask. N’eo ket ret lakaat an daveennoù.', // br: à relire
  classe: 'Klas : {classes}', // br: à relire
  toutesLesClasses: 'An holl glasoù', // br: à relire
  masques: { one: '{n} disoc’h kuzhet (klasoù all)', other: '{n} disoc’h kuzhet (klasoù all)' }, // br: à relire
  nombre: { zero: 'Disoc’h ebet', one: '{n} disoc’h', two: '{n} zisoc’h', few: '{n} disoc’h', many: '{n} disoc’h', other: '{n} disoc’h' }, // br: à relire
  aucun: 'Disoc’h ebet evit « {requete} » e {classes}.', // br: à relire
  aucunPartout: 'Disoc’h ebet evit « {requete} ».', // br: à relire
  essayerToutes: 'Klask en holl glasoù', // br: à relire
  autres: '+ {n} all', // br: à relire
  groupes: {
    exercice: 'Poelladennoù', // br: à relire
    affiche: 'Skritelloù', // br: à relire
    fiche: 'Fichennoù prest', // br: à relire
    competence: 'Barregezhioù ar programm', // br: à relire
    page: 'Pajennoù', // br: à relire
  },
  aideClavier: {
    choisir: '↑ ↓ evit dibab', // br: à relire
    ouvrir: '↵ evit digeriñ', // br: à relire
    fermer: 'Échap evit serriñ', // br: à relire
    accents: 'Daveennoù diret', // br: à relire
  },
} satisfies Traductions<typeof fr>
