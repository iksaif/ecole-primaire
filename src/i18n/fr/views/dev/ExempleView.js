// Textes de l'interface et du contenu — exemple d'exercice (français).
// Clés partagées avec src/i18n/br/views/dev/ExempleView.js (vérifier avec `npm run i18n`).
// Les textes communs (niveau, nbQuestions, valider, suivant, corrigé, bonus…) sont dans commun.js : ne pas les redire.
export default {
    titre: 'Suites de nombres',
    exercices: 'Exercices',
    complete: 'Compléter la suite',
    regle: 'Trouver la règle',
    sens: 'Dans quel sens ?',
    monte: 'On monte',
    descend: 'On descend',
    pas: 'On compte…',
    deEnDe: 'de {pas} en {pas}',
    consigneComplete: 'Complète la suite de nombres.',
    consigneRegle: 'À chaque fois, on ajoute ou on enlève quel nombre ?',
    laReponse: 'La réponse : {attendu}',
    presque: 'Presque ! Tu es à {pas} de la bonne réponse : compte bien de {pas} en {pas}.',
    // pluriel selon n (Intl.PluralRules) : un texte { one, other } ; en breton, `other` suffit
    consigneFiche: { one: 'Complète la suite de nombres.', other: 'Complète les {n} suites de nombres.' },
    regleFiche: 'on change de',
    corrigeRegle: 'de {pas} en {pas}',
  }
