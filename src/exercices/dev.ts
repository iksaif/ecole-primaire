// Exercices d'exemple, inscrits au registre (index.ts) avec `exemple: true`. Ce fichier n'est importé que par index.ts,
// par import dynamique sous le contrôle de Vite (src/dev.ts) : il n'existe pas dans un build de production. Les exemples
// n'entrent jamais au catalogue public (fiches à télécharger, couverture, compteur de `npm run qualite`) : tout consommateur
// qui publie filtre `exemple`. Les tests les vérifient comme n'importe quel exercice (tests/exercices.test.mjs, …).
import type { EntreeRegistre } from './index.ts'
import { module as exemple } from './exemple/index.ts'
import { module as exempleCorpus } from './exemple-corpus/index.ts'

export const EXEMPLES: readonly EntreeRegistre[] = [{ ...exemple, exemple: true }, { ...exempleCorpus, exemple: true }]
