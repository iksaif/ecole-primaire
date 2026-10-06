// Exercices d'exemple : le registre de développement. Séparé de REGISTRE (index.js) pour qu'ils ne se mêlent jamais au
// catalogue public (activités, fiches à télécharger, couverture, compteur de `npm run qualite`) : le build et le site
// ne lisent que REGISTRE. Ce fichier n'est importé que par la page /dev (sous import.meta.env.DEV) et par les tests,
// qui vérifient les exemples comme n'importe quel exercice (tests/exercices.test.mjs, tests/instantanes.test.mjs).
import type { ModuleExercice } from '../noyau/types.ts'
import type { ReglagesDeDefinition } from '../noyau/definir.ts'
import definition from './exemple/definition.ts'
import * as generateur from './exemple/generateur.ts'
import * as fiche from './exemple/fiche.ts'
import { CONTENU } from './exemple/textes.ts'
import definitionCorpus from './exemple-corpus/definition.ts'
import * as generateurCorpus from './exemple-corpus/generateur.ts'
import * as ficheCorpus from './exemple-corpus/fiche.ts'
import { CONTENU as CONTENU_CORPUS } from './exemple-corpus/textes.ts'

// `satisfies` : le module respecte le contrat du noyau (ModuleExercice) sans perdre ses types précis
const exemple = { definition, generateur, fiche, textes: CONTENU } satisfies ModuleExercice<generateur.Question, generateur.Reponse, ReglagesDeDefinition<typeof definition>>

const exempleCorpus = { definition: definitionCorpus, generateur: generateurCorpus, fiche: ficheCorpus, textes: CONTENU_CORPUS } satisfies ModuleExercice<generateurCorpus.Question, generateurCorpus.Reponse, ReglagesDeDefinition<typeof definitionCorpus>>

export const REGISTRE_DEV = [exemple, exempleCorpus]
