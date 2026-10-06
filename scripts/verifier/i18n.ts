// Vérifie les catalogues de traduction et prépare la relecture.
//   npm run i18n              clés manquantes / en trop entre français et breton, passages « à relire »
//   npm run i18n:relecture    + écrit i18n-relecture.html : tableau clé / français / breton à faire relire
// Trois sortes de catalogues, une vérification chacune (verifier/i18n/) :
//   ancien.ts   src/i18n/<langue>/**/*.js          (ancien monde : un fichier par composant)
//   typees.ts   src/langues/<langue>/textes/*.ts   (interface de la base)
//   contenu.ts  src/exercices/<id>/textes.ts       (contenu des exercices)
// Sortie en échec (code 1) s'il manque une clé : un texte manquant s'afficherait en français.
import { parseArgs } from 'node:util'
import { verifierAncien } from './i18n/ancien.ts'
import { verifierContenu } from './i18n/contenu.ts'
import { ecrirePageRelecture } from './i18n/relecture.ts'
import { verifierTypees } from './i18n/typees.ts'

const { values } = parseArgs({ options: { relecture: { type: 'boolean', default: false } } })
const relecture = values.relecture

const ancien = await verifierAncien(relecture)
const typees = await verifierTypees(relecture)
console.log(`${typees.sections} sections typées (src/langues), ${typees.textes} textes ; ${typees.aRelire} marqués « à relire »`)
const contenu = await verifierContenu(relecture)
console.log(`${contenu.catalogues} catalogues de contenu d'exercice (src/exercices), ${contenu.textes} textes ; ${contenu.aRelire} marqués « à relire »`)

const bilans = [ancien, typees, contenu]
const somme = (champ: 'textes' | 'aRelire' | 'problemes'): number => bilans.reduce((n, b) => n + b[champ], 0)
console.log(`\n${ancien.catalogues} catalogues, ${somme('textes')} textes ; ${somme('aRelire')} marqués « à relire » ; ${somme('problemes')} problème(s)`)

if (relecture) ecrirePageRelecture(bilans.flatMap(b => b.lignes))
process.exit(somme('problemes') ? 1 : 0)
