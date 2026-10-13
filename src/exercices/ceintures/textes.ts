// Les ceintures — textes de CONTENU : ce que les fiches écrivent (titre, objectifs des pistes fournies, mots des feuilles). Français et breton.
// Les noms des couleurs, des supports et des pistes sont ceux de l'interface (section `ceintures`, lue par `traduire` : une seule source). Breton : « à relire ».
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Mes ceintures',
  signature: 'Signature',
  livret: 'Mon livret de ceintures',
  diplome: 'Diplôme',
  passeport: 'Passeport',
  decerne: 'décernée à',
  commentFaire: 'Comment faire ? Je m’entraîne, puis je demande un brevet quand je suis prêt·e. Si je n’y arrive pas, ce n’est pas grave : « pas encore ».',
  piste: {
    tables: {
      objectifs: '×2, ×5 et ×10|×3 et ×4|×6 et ×7|×8 et ×9|Toutes les tables, dans les deux sens|Tables et divisions, sans hésiter (30 en 3 minutes)',
    },
    'calcul-mental': {
      objectifs: 'Ajouter et enlever 1, 2, 10|Doubles et moitiés|Compléments à 10 et à 100|Additions et soustractions de tête|Multiplier par 10, 100|Calculs mêlés, vite et juste',
    },
    lettres: {
      objectifs: 'Reconnaître les voyelles|Reconnaître les consonnes|Relier capitales et minuscules|Relier script et attaché|Nommer toutes les lettres',
    },
  },
}, {
  br: {
    titre: 'Ma gourizioù', // br: à relire
    signature: 'Sinadur', // br: à relire
    livret: 'Ma levrig gourizioù', // br: à relire
    diplome: 'Diplom', // br: à relire
    passeport: 'Paseporzh', // br: à relire
    decerne: 'roet da', // br: à relire
    commentFaire: 'Penaos ober ? Em c’hoari a ran, ha goulenn a ran ur brevet pa vezan prest. Ma ne vez ket mat, n’eo ket drase : « n’eo ket c’hoazh ». ', // br: à relire
    piste: {
      tables: {
        objectifs: '×2, ×5 ha ×10|×3 ha ×4|×6 ha ×7|×8 ha ×9|An holl daolennoù, en daou zu|Taolennoù ha rannadennoù, hep ehan (30 e 3 munut)', // br: à relire
      },
      'calcul-mental': {
        objectifs: 'Ouzhpennañ ha lemel 1, 2, 10|Daouoù ha hanterioù|Klokaat da 10 ha da 100|Sammadennoù ha lamadennoù e penn|Miliñ gant 10, 100|Jedadennoù kemmesk, buan ha mat', // br: à relire
      },
      lettres: {
        objectifs: 'Anavezout ar vogalennoù|Anavezout ar c’hensonennoù|Stagañ pennlizherennoù ha lizherennoù bihan|Stagañ skript ha a-stag|Envel an holl lizherennoù', // br: à relire
      },
    },
  },
})
