// Vocabulaire — textes de CONTENU, toujours en français (`contenu: 'fr'` : la fiche n'a pas de breton) : titre, consigne de chaque partie
// de la fiche, et les textes calculés que la fiche écrit (question « lettre avant / après », corrigé). « corrige » vient de `communs`.
// Les mêmes clés de textes calculés (lettreAvant, sol…) existent dans les textes d'INTERFACE (src/langues/<langue>/textes/vocabulaire.ts) :
// le générateur les demande à un traducteur, celui de la fiche (ce catalogue) ou celui du jeu (l'interface). Corpus : src/data/vocabulaire.js.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Vocabulaire',
  f: {
    alpha: "Range les mots dans l'ordre alphabétique.",
    lettre: 'Écris la lettre qui vient juste avant ou juste après.',
    contraires: 'Entoure le contraire du mot en gras.',
    synonymes: 'Entoure le mot qui a le même sens que le mot en gras.',
    definitions: 'Entoure le mot qui correspond à la définition.',
    familles: "Barre l'intrus : le mot qui n'est pas de la même famille.",
    categorie: 'Écris le mot étiquette.',
    intrus: "Barre l'intrus.",
    prefixes: 'Écris le mot avec le bon préfixe : re, dé, in ou im.',
    dictionnaire: 'Entoure les mots-repères entre lesquels on trouve le mot en gras.',
    contexte: 'Entoure le sens du mot en gras dans la phrase.',
    homonymes: 'Complète avec le bon mot.',
    sensFigure: 'Coche : sens propre (P) ou sens figuré (F) ?',
    suffixes: 'Écris le mot avec le bon suffixe : -eur, -ette, -ment, -age ou -ier.',
  },
  lettreP: 'P',
  lettreF: 'F',
  // textes calculés (aussi dans l'interface)
  lettreAvant: 'Quelle lettre vient juste avant {l} ?',
  lettreApres: 'Quelle lettre vient juste après {l} ?',
  solAvant: 'Avant {l} : {r} ({a} – {l} – {c})',
  solApres: 'Après {l} : {r} ({a} – {l} – {c})',
  solIntrus: '{liste} — intrus : {i}',
  solIntrusCat: '{liste} ({e}) — intrus : {i}',
  solDico: '{m} : entre {a} et {c}',
  sensPropre: 'sens propre',
  sensFigure: 'sens figuré',
})
