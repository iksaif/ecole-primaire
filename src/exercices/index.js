// @ts-check
// Registre des exercices au format « définition » (src/exercices/README.md). Imports statiques, avec extensions :
// le même fichier se lit dans l'app (Vite), par node (build, scripts) et dans les tests, sans import.meta.glob
// (que node ne connaît pas). Un dossier de src/exercices/ absent d'ici fait échouer tests/exercices.test.mjs.
// Les vues n'importent pas ce registre (il entraînerait tous les générateurs) : chacune importe son dossier.
import heureDefinition from './heure/definition.js'
import * as heureGenerateur from './heure/generateur.js'
import * as heureFiche from './heure/fiche.js'
import { TEXTES as heureTextes } from './heure/textes.js'

/**
 * Réglages d'un exercice : valeurs simples ou listes de valeurs choisies (ids).
 * @typedef {Record<string, string | number | boolean | string[]>} Reglages
 */

/**
 * Un niveau d'un exercice. Les réglages par défaut restent dans le programme du niveau ; ce qui en sort est
 * déclaré : `bonus` (proposé, jamais par défaut, affiché « bonus ») ou `horsProgramme` (avec la raison).
 * @typedef {object} NiveauExercice
 * @property {string[]} competences ids de src/data/programme.js (COMPETENCES), au programme du niveau
 * @property {Reglages} reglages réglages par défaut du niveau
 * @property {Record<string, string[]>} [options] valeurs proposées pour chaque réglage à choix multiple
 * @property {Record<string, string[]>} [bonus] valeurs proposées hors programme (sous-ensemble de `options`)
 * @property {{ option: string, raison: string }[]} [horsProgramme] écarts assumés au programme, avec leur raison
 */

/**
 * Fiche prégénérée par compétence (pages /telechargements/exercices-<id>-<niveau>-<fiche>/). Le bilan d'une
 * classe n'est pas listé : ce sont les réglages par défaut du niveau.
 * @typedef {object} FicheExercice
 * @property {string} id partie du slug publié (ne change pas)
 * @property {string} competence id de src/data/programme.js
 * @property {string} niveau classe
 * @property {Reglages} reglages réglages qui s'ajoutent à ceux du niveau
 */

/**
 * Définition d'un exercice : la seule déclaration de ses niveaux, compétences et fiches.
 * @typedef {object} DefinitionExercice
 * @property {string} id
 * @property {string} route route de l'app (« /maths/heure »)
 * @property {string} domaine id d'un domaine de src/data/programme.js
 * @property {'fr' | 'interface'} contenu langue du contenu : 'fr' pour le français, sinon celle de l'interface
 * @property {string} niveauDefaut
 * @property {Reglages} [reglages] réglages communs à tous les niveaux (défauts)
 * @property {Record<string, NiveauExercice>} niveaux par classe (ids de src/data/classes.js)
 * @property {FicheExercice[]} fiches
 */

/**
 * @typedef {object} ModuleExercice
 * @property {DefinitionExercice} definition
 * @property {{ questions: Function, questionsFiche: Function, verifier: Function, ecartsAuProgramme: Function }} generateur
 *   questions({ niveau, reglages, rng, T, nb }) ; questionsFiche({ niveau, reglages, rng, T }) ;
 *   verifier(q, rep) ; ecartsAuProgramme(questions, contraintesDe(niveau)) → [] si tout est au programme
 * @property {{ fiche: Function }} fiche fiche({ questions, reglages, T, langue }) → document HTML
 * @property {Record<string, object>} textes catalogues de l'exercice par langue (interface et contenu), lus par T
 */

/** @type {ModuleExercice[]} */
export const REGISTRE = [
  { definition: heureDefinition, generateur: heureGenerateur, fiche: heureFiche, textes: heureTextes },
]

/** @param {string} id */
export const exerciceDe = id => REGISTRE.find(e => e.definition.id === id) ?? null
