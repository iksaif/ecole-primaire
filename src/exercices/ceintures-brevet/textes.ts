// Les brevets de ceintures — textes de CONTENU : ce que le brevet écrit. Les noms des ceintures et le titre de la piste sont ceux de l'interface (`traduire`). Breton : « à relire ».
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Brevet',
  consigne: '{n} questions, sans calculatrice. Pour réussir : {bonnes} bonnes réponses sur {n}. Prends ton temps.',
  tablesDe: 'tables : {liste}',
  resultat: 'Résultat',
  validee: 'Ceinture validée',
  pasEncore: 'Pas encore',
}, {
  br: {
    titre: 'Brevet',
    consigne: '{n} goulenn, hep jedoù. Evit tapout anezhañ : {bonnes} respont mat diwar {n}. Kemer da amzer.', // br: à relire
    tablesDe: 'taolennoù : {liste}', // br: à relire
    resultat: 'Disoc’h', // br: à relire
    validee: 'Gouriz gounezet', // br: à relire
    pasEncore: 'N’eo ket c’hoazh', // br: à relire
  },
})
