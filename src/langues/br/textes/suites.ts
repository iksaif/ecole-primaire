// Textes de l'interface — suites de nombres (breton). Traduction automatique : les passages marqués
// « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/suites.ts'

export default {
  titre: 'An heuliadoù niveroù', // br: à relire
  description: "Kendalc'hel un heuliad, kavout an termen a vank pe ar pazenn", // br: à relire
  exercices: 'Strivadennoù', // br: à relire
  poursuivre: "Kendalc'hel an heuliad", // br: à relire
  complete: 'Kavout an termen a vank', // br: à relire
  regle: 'Kavout ar pazenn', // br: à relire
  sens: 'Pe zu ?', // br: à relire
  monte: 'Pignat', // br: à relire
  descend: 'Diskenn', // br: à relire
  pas: 'Kontañ…', // br: à relire
  deEnDe: 'kontañ a {pas} e {pas}', // br: à relire
  nbSuitesFiche: 'Niver a heuliadoù war ar fichenn', // br: à relire
  consignePoursuivre: "Kendalc'hit an heuliad niveroù.", // br: à relire
  consigneComplete: 'Klokait an heuliad.', // br: à relire
  consigneRegle: 'Peseurt niver a vez ouzhpennet pe lamet bep tro ?', // br: à relire
  laReponse: 'Ar respont mat a oa {attendu}', // br: à relire
  presque: 'Tost-tost ! {pas} a zo etre ar respont hag ar respont mat : kontit a {pas} e {pas}.', // br: à relire
} satisfies Traductions<typeof fr>
