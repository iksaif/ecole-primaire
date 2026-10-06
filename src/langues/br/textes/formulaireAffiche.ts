// Textes de l'interface — formulaire d'une affiche (breton). Traduction automatique : voir nav.ts.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/formulaireAffiche.ts'

export default {
  version: 'Stumm', // br: à relire
  langue: 'Yezh ar skritell', // br: à relire
  langues: 'Yezhoù diskouezet', // br: à relire
  titre: 'Titl ar skritell', // br: à relire
  titreVide: 'Diret : ar titl boas a vo implijet', // br: à relire
  hasard: 'Danvez dibabet dre zegouezh', // br: à relire
  nouvelle: 'Unan nevez', // br: à relire
  feuille: 'An dalenn', // br: à relire
  policeTexte: 'Nodrezh an destenn', // br: à relire
  format: 'Furmad',
  orientation: 'Tuadur', // br: à relire
  paysage: 'Gweledva', // br: à relire
  portrait: 'Poltred',
  prereglages: 'Dibaboù prest', // br: à relire
  polices: 'Nodrezhoù', // br: à relire
} satisfies Traductions<typeof fr>
