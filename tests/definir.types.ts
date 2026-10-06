// Ce que le compilateur doit REFUSER (vérifié par `npm run types` : une directive @ts-expect-error sans erreur est une erreur).
// Fermer le type des réglages, des clés de texte et des ids est la promesse du noyau : si l'une de ces lignes se met à
// compiler, c'est la promesse qui casse.
import { choix, cases } from '../src/noyau/definir.ts'
import type { ConfigDe } from '../src/noyau/definir.ts'
import { K } from '../src/noyau/ids.ts'
import type { CompetenceId } from '../src/noyau/types.ts'
import type { Traducteur } from '../src/noyau/types.ts'
import type { CleContenu } from '../src/langues/catalogue.ts'
import DEF from '../src/exercices/exemple/definition.ts'
import type { CONTENU } from '../src/exercices/exemple/textes.ts'

declare const config: ConfigDe<typeof DEF>
export const ok: number = config.nbQ
// @ts-expect-error — réglage inconnu (type fermé : B1)
export const faute = config.typo
// @ts-expect-error — nbQ est un nombre
export const mauvaisType: string = config.nbQ

// @ts-expect-error — un réglage à choix : chaînes OU nombres, pas un mélange
export const melange = cases([1, 'a'])
// @ts-expect-error — idem pour un choix unique
export const melange2 = choix([1, 'a'])
// @ts-expect-error — bonus de l'autre sorte
export const melange3 = cases(['a'], { bonus: [5] })

// @ts-expect-error — K.inconnue n'existe pas
export const inconnue = K.inconnue
// @ts-expect-error — une chaîne qui n'est pas une compétence du programme
export const idInconnu: CompetenceId = 'n-importe-quoi'

declare const T: Traducteur<CleContenu<typeof CONTENU>>
export const cleOk = T('titre')
export const communOk = T('corrige')
// @ts-expect-error — clé absente du catalogue de l'exercice
export const cleInconnue = T('regleFichee')

// Un exercice « fiche seule » (jeu: false) est un ModuleExercice sans `questions` ni `verifier` : même modèle, pas de troisième genre
import type { ModuleExercice } from '../src/noyau/types.ts'
import type { ReglagesDeDefinition } from '../src/noyau/definir.ts'
import { catalogue } from '../src/langues/catalogue.ts'
import { D } from '../src/noyau/ids.ts'
import { definir } from '../src/noyau/definir.ts'
const ecriture = definir({
  id: 'ecriture', route: '/francais/ecriture', domaine: D.exemple, jeu: false, competences: [K.exempleLire],
  reglages: { texte: '', mots: ['papa'], format: 'A4-portrait', interligne: choix(['2', '3']) },
  niveaux: { ce1: {} },
})
export const ficheSeule = {
  definition: ecriture,
  generateur: { questionsFiche: () => ({ lignes: 5 }), ecartsAuProgramme: () => [] },
  fiche: { fiche: () => '' },
  textes: catalogue({ titre: 'Écriture' }),
} satisfies ModuleExercice<never, never, ReglagesDeDefinition<typeof ecriture>, { lignes: number }>

// Plages de classes (`pourClasses`, `fichesPourClasses`, `plageDeClasses`) : la notation et les réglages d'une fiche sont vérifiés
import { pourClasses, fichesPourClasses } from '../src/noyau/definir.ts'
import { plageDeClasses } from '../src/data/classes.ts'
import type { ClassesDe } from '../src/data/classes.ts'
export const plageOk: ClassesDe<'ce1-cm1'> = 'ce2'
// @ts-expect-error — le CP n'est pas dans « ce1-cm1 »
export const plageHors: ClassesDe<'ce1-cm1'> = 'cp'
// @ts-expect-error — « cm3 » n'est pas une classe
export const plageFausse = plageDeClasses('cp-cm3')
export const plages = definir({
  id: 'plages', route: '/maths/plages', domaine: D.exemple, competences: [K.exempleCompter],
  reglages: { n: choix([1, 2]) },
  niveaux: { cp: {}, ...pourClasses('ce1-ce2', { reglages: { pas: cases([1, 2]) } }) },
  fiches: [...fichesPourClasses('ce1-ce2', { id: 'a', competence: K.exempleCompter, reglages: { pas: [1] } })],
})
