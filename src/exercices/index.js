// @ts-check
// Registre des exercices au format « définition » (src/exercices/README.md). Imports statiques, avec extensions :
// le même fichier se lit dans l'app (Vite), par node (build, scripts) et dans les tests, sans import.meta.glob
// (que node ne connaît pas). Un dossier de src/exercices/ absent d'ici fait échouer tests/exercices.test.mjs.
// Les vues n'importent pas ce registre (il entraînerait tous les générateurs) : chacune importe son dossier.
import heureDefinition from './heure/definition.js'
import * as heureGenerateur from './heure/generateur.js'
import * as heureFiche from './heure/fiche.js'
import { TEXTES as heureTextes } from './heure/textes.js'
import monnaieDefinition from './monnaie/definition.js'
import * as monnaieGenerateur from './monnaie/generateur.js'
import * as monnaieFiche from './monnaie/fiche.js'
import { TEXTES as monnaieTextes } from './monnaie/textes.js'
import conjugaisonDefinition from './conjugaison/definition.js'
import * as conjugaisonGenerateur from './conjugaison/generateur.js'
import * as conjugaisonFiche from './conjugaison/fiche.js'
import { TEXTES as conjugaisonTextes } from './conjugaison/textes.js'

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
 * @property {Record<string, any[]>} [options] valeurs proposées pour chaque réglage à choix : choix multiple si le
 *   défaut (`reglages[cle]`) est une liste, choix unique sinon (ex. `centimes: [false, true]`)
 * @property {Record<string, any[]>} [bonus] valeurs proposées hors programme (sous-ensemble de `options`), jamais par défaut
 * @property {{ reglage?: string, option: any, raison: string }[]} [horsProgramme] écarts assumés au programme, avec leur
 *   raison : une valeur de réglage (`reglage` + `option`, affichée « hors programme ») ou une compétence (`option` seul)
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
 * @property {{ questions: Function, questionsFiche: Function, verifier: Function, ecartsAuProgramme: Function, bonneReponse?: Function, ecartsFiche?: Function }} generateur
 *   questions({ niveau, reglages, rng, T, nb }) ; questionsFiche({ niveau, reglages, rng, T }) ;
 *   verifier(q, rep) ; ecartsAuProgramme(questions, contraintesDe(niveau)) → [] si tout est au programme ;
 *   bonneReponse(q) (facultatif) : une réponse juste, que verifier doit accepter (tests) ;
 *   ecartsFiche(html, contraintesDe(niveau)) (facultatif) : ce que le HTML de la fiche montre hors programme (tests)
 * @property {{ fiche: Function }} fiche fiche({ questions, reglages, T, langue }) → document HTML
 * @property {Record<string, object>} textes catalogues de l'exercice par langue (interface et contenu), lus par T
 */

/** @type {ModuleExercice[]} */
export const REGISTRE = [
  { definition: heureDefinition, generateur: heureGenerateur, fiche: heureFiche, textes: heureTextes },
  { definition: monnaieDefinition, generateur: monnaieGenerateur, fiche: monnaieFiche, textes: monnaieTextes },
  { definition: conjugaisonDefinition, generateur: conjugaisonGenerateur, fiche: conjugaisonFiche, textes: conjugaisonTextes },
]

/** @param {string} id */
export const exerciceDe = id => REGISTRE.find(e => e.definition.id === id) ?? null
