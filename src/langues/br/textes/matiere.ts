// Textes de l'interface — page d'une matière (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/matiere.ts'

export default {
  fil: 'Roudenn', // br: à relire
  accueil: 'Degemer',
  fichesTitre: 'Fichennoù prest (PDF da bellgargañ) : amañ emañ →', // br: à relire
  fichesTexte: 'Dindan, personalizit ho fichennoù hag ho poelladennoù.', // br: à relire
  fichesBouton: 'Fichennoù prest →', // br: à relire
  classe: { one: 'Klas', other: 'Klasoù' }, // br: à relire
  chargement: 'O kargañ an danvezioù…', // br: à relire
  videTitre: 'Danvezioù ar mirout-mañ a zeu abred.', // br: à relire
  videTexte: 'Emañ al lec\'hienn o vezañ adkemeret : ar poelladennoù hag ar fichennoù a zeu en-dro unan hag unan. Domanioù ar programm zo dija amañ.', // br: à relire
  aVenirTitre: 'A zeu : domanioù ar programm', // br: à relire
  aVenirTexte: 'Danvez ebet c\'hoazh evit an domanioù-mañ ({classes}). Netra faos da c\'hortoz.', // br: à relire
  aVenirBadge: 'a zeu', // br: à relire
  cycle: 'Kelc\'h {n}', // br: à relire
  programme: 'Gwelet ar programm', // br: à relire
} satisfies Traductions<typeof fr>
