// Compteurs qui suivent les imports (lus au texte : import / from / import()). Tous « max » : ils ne peuvent que baisser, jusqu'à 0.
//   importeursAncienSocle  fichiers de src/, scripts/ et tests/, hors src/noyau/, qui importent l'ancien socle (src/composables/*,
//                    les anciens composants ConfigExercice…, exercices/outils.js, les raccourcis legacy data/programme.js,
//                    data/classes.js, utils/hasard.js, utils/reponses.js, impression/document.js) : jusqu'à 0 (suppression de
//                    l'ancien socle avec le dernier exercice migré vers src/noyau/, plan 10)
//   ancienMondeNonReporte  fichiers de src/ (js, ts, vue) qu'aucun point d'entrée de la base n'atteint par ses imports
//                    (ENTREES ci-dessous) : ce qui reste de l'ancien monde (exercices, affiches, impressions, catalogues)
//                    déconnecté en attendant son report (plan 11). Approximation : un fichier atteint seulement par un chemin
//                    construit à l'exécution compte comme non atteint.
import { existsSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { lire } from '../../lib/fichiers.ts'
import { racine } from '../../lib/racine.ts'
import type { Compteur } from './compteur.ts'
import { code, fichiersDe } from './sources.ts'

// un import statique, dynamique ou `charger('/src/…')`
const ANCIEN_SOCLE = new RegExp(
  ['composables/[A-Za-z]+(?:\\.js)?', 'components/(?:ConfigExercice|OptionsFiche|ChoixReglage|ChoixReponses|SaisieReponse|QuestionJeu|ResultatsJeu|ResultatsEtoiles|TableauCorrection|OrdonnerClics|ChoixPolice)\\.vue',
    'exercices/outils(?:\\.js)?', 'data/(?:classes|programme)\\.js', 'utils/(?:hasard|reponses)\\.js', 'impression/document\\.js']
    .map(m => `['"\`][^'"\`]*${m}['"\`]`).join('|'))

const importeursAncienSocle: Compteur = () => [...code, ...fichiersDe('tests')]
  .filter(f => !f.startsWith('src/noyau/') && !f.startsWith('src/exercices/exemple/'))
  .filter(f => ANCIEN_SOCLE.test(lire(f))).length

// Les points d'entrée de la base : l'app, le build des fiches, la config de Vite.
const ENTREES = ['src/main.ts', 'scripts/build/fiches/commande.ts', 'vite.config.js']
const IMPORT = /(?:\bfrom|\bimport)\s*\(?\s*['"]([^'"]+)['"]/g
const estFichier = (f: string): boolean => existsSync(join(racine, f)) && statSync(join(racine, f)).isFile()

/** Le fichier qu'un import relatif désigne (avec ses extensions implicites), ou null (paquet, fichier absent). */
function resoudre(depuis: string, spec: string): string | null {
  if (!spec.startsWith('.')) return null
  const base = join(dirname(depuis), spec).replace(/\\/g, '/')
  const variantes = [base, base.replace(/\.js$/, '.ts'), `${base}.ts`, `${base}.js`, `${base}.vue`, `${base}/index.ts`, `${base}/index.js`]
  return variantes.find(estFichier) ?? null
}

const ancienMondeNonReporte: Compteur = () => {
  const vus = new Set<string>(), pile = [...ENTREES]
  for (let f = pile.pop(); f !== undefined; f = pile.pop()) {
    if (vus.has(f)) continue
    vus.add(f)
    for (const m of lire(f).matchAll(IMPORT)) {
      const cible = resoudre(f, m[1])
      if (cible && /\.(js|mjs|ts|vue)$/.test(cible)) pile.push(cible)
    }
  }
  const tous = fichiersDe('src')
  const non = tous.filter(f => !f.endsWith('.d.ts') && !vus.has(f))
  return { valeur: non.length, detail: `${non.length} fichiers de src/ non atteints (sur ${tous.length})` }
}

export const compteursImports: Record<string, Compteur> = { importeursAncienSocle, ancienMondeNonReporte }
