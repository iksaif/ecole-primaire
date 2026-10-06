// Exemple d'exercice — textes de CONTENU : ce que la fiche et les énoncés écrivent. Le générateur et la fiche les lisent avec
// T(cle, params) ; la vue les passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (boutons, réglages, jeu) sont dans
// src/langues/<langue>/textes/exemple.ts (section `exemple`, lue par `t('exemple.titre')`) ; les mots communs (« corrige »…)
// dans la section `communs`, que T lit aussi.
//
// `catalogue(français, { br })` : le français est la source ; le breton doit avoir exactement les mêmes clés, des pluriels pour
// des pluriels (une clé manquante ou en trop ne compile pas). Chaque texte breton nouveau : `// br: à relire`.
// Un exercice dont le contenu n'a pas de breton (français, corpus) : `catalogue({ … })` seul, voir exemple-corpus/textes.ts.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Suites de nombres',
  // pluriel selon n (Intl.PluralRules) : un texte { one, other } ; en breton, `other` suffit
  consigneFiche: { one: 'Complète la suite de nombres.', other: 'Complète les {n} suites de nombres.' },
  regleFiche: 'on change de',
  corrigeRegle: 'de {pas} en {pas}',
}, {
  br: {
    titre: 'Heuliadoù niveroù', // br: à relire
    consigneFiche: { one: 'Klok an heuliad niveroù.', other: 'Klok an {n} heuliad niveroù.' }, // br: à relire
    regleFiche: 'cheñchet e vez a', // br: à relire
    corrigeRegle: 'a {pas} e {pas}', // br: à relire
  },
})
