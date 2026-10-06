// @ts-check
// Registre des exercices au format « définition » (src/exercices/README.md). Imports statiques, avec extensions :
// le même fichier se lit dans l'app (Vite), par node (build, scripts) et dans les tests, sans import.meta.glob
// (que node ne connaît pas). Un dossier de src/exercices/ absent d'ici fait échouer tests/exercices.test.mjs.
// Les vues n'importent pas ce registre (il entraînerait tous les générateurs) : chacune importe son dossier.
import conjugaisonDefinition from './conjugaison/definition.js'
import * as conjugaisonGenerateur from './conjugaison/generateur.js'
import * as conjugaisonFiche from './conjugaison/fiche.js'
import { TEXTES as conjugaisonTextes } from './conjugaison/textes.js'
import problemesDefinition from './problemes/definition.js'
import * as problemesGenerateur from './problemes/generateur.js'
import * as problemesFiche from './problemes/fiche.js'
import { TEXTES as problemesTextes } from './problemes/textes.js'
import motifsDefinition from './motifs/definition.js'
import * as motifsGenerateur from './motifs/generateur.js'
import * as motifsFiche from './motifs/fiche.js'
import { TEXTES as motifsTextes } from './motifs/textes.js'
import longueursDefinition from './longueurs/definition.js'
import * as longueursGenerateur from './longueurs/generateur.js'
import * as longueursFiche from './longueurs/fiche.js'
import { TEXTES as longueursTextes } from './longueurs/textes.js'
import formesDefinition from './formes/definition.js'
import * as formesGenerateur from './formes/generateur.js'
import * as formesFiche from './formes/fiche.js'
import { TEXTES as formesTextes } from './formes/textes.js'
import mesuresDefinition from './mesures/definition.js'
import * as mesuresGenerateur from './mesures/generateur.js'
import * as mesuresFiche from './mesures/fiche.js'
import { TEXTES as mesuresTextes } from './mesures/textes.js'
import geometrieDefinition from './geometrie/definition.js'
import * as geometrieGenerateur from './geometrie/generateur.js'
import * as geometrieFiche from './geometrie/fiche.js'
import { TEXTES as geometrieTextes } from './geometrie/textes.js'
import grammaireDefinition from './grammaire/definition.js'
import * as grammaireGenerateur from './grammaire/generateur.js'
import * as grammaireFiche from './grammaire/fiche.js'
import { TEXTES as grammaireTextes } from './grammaire/textes.js'
import fractionsDefinition from './fractions/definition.js'
import * as fractionsGenerateur from './fractions/generateur.js'
import * as fractionsFiche from './fractions/fiche.js'
import { TEXTES as fractionsTextes } from './fractions/textes.js'
import vocabulaireDefinition from './vocabulaire/definition.js'
import * as vocabulaireGenerateur from './vocabulaire/generateur.js'
import * as vocabulaireFiche from './vocabulaire/fiche.js'
import { TEXTES as vocabulaireTextes } from './vocabulaire/textes.js'
import orthographeDefinition from './orthographe/definition.js'
import * as orthographeGenerateur from './orthographe/generateur.js'
import * as orthographeFiche from './orthographe/fiche.js'
import { TEXTES as orthographeTextes } from './orthographe/textes.js'
import dicteeDefinition from './dictee/definition.js'
import * as dicteeGenerateur from './dictee/generateur.js'
import * as dicteeFiche from './dictee/fiche.js'
import { TEXTES as dicteeTextes } from './dictee/textes.js'
import lettresDefinition from './lettres/definition.js'
import * as lettresGenerateur from './lettres/generateur.js'
import * as lettresFiche from './lettres/fiche.js'
import { TEXTES as lettresTextes } from './lettres/textes.js'

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
 * @property {Record<string, any[]>} [options] valeurs proposées pour un réglage commun à choix (ex. `nbQ: [5, 10, 15]`) :
 *   une valeur mémorisée hors de la liste reprend le défaut ; les options d'un niveau l'emportent
 * @property {Record<string, NiveauExercice>} niveaux par classe (ids de src/data/classes.js)
 * @property {FicheExercice[]} fiches
 */

/**
 * @typedef {object} ModuleExercice
 * @property {DefinitionExercice} definition
 * @property {{ questions: Function, questionsFiche: Function, verifier: Function, ecartsAuProgramme: Function, bonneReponse?: Function, ecartsFiche?: Function, manquesAuProgramme?: Function }} generateur
 *   questions({ niveau, reglages, rng, T, nb? }) : nb (facultatif) = nombre de questions voulu, quand l'exercice le laisse
 *   choisir (réglage nbQ) ; un exercice dont la partie est fixée par ses données (les 6 lignes d'un tableau) l'ignore ;
 *   questionsFiche({ niveau, reglages, rng, T }) ;
 *   verifier(q, rep) → booléen, ou { ok, nuance } (nuance : remarque sur une réponse presque juste, ex. 'accents' ;
 *   lireVerdict dans outils.js) ; ecartsAuProgramme(questions, contraintesDe(niveau)) → [] si tout est au programme ;
 *   bonneReponse(q) (facultatif) : une réponse juste, que verifier doit accepter (tests) ;
 *   ecartsFiche(html, contraintesDe(niveau)) (facultatif) : ce que le HTML de la fiche montre hors programme (tests) ;
 *   manquesAuProgramme(reglages, contraintesDe(niveau)) (facultatif) : ce que le programme du niveau demande et que
 *   « tout au programme » ne propose pas (tests)
 * @property {{ fiche: Function }} fiche fiche({ questions, reglages, T, langue }) → document HTML
 * @property {Record<string, object>} textes catalogues de l'exercice par langue (interface et contenu), lus par T
 */

/** @type {ModuleExercice[]} */
export const REGISTRE = [
  { definition: conjugaisonDefinition, generateur: conjugaisonGenerateur, fiche: conjugaisonFiche, textes: conjugaisonTextes },
  { definition: problemesDefinition, generateur: problemesGenerateur, fiche: problemesFiche, textes: problemesTextes },
  { definition: motifsDefinition, generateur: motifsGenerateur, fiche: motifsFiche, textes: motifsTextes },
  { definition: longueursDefinition, generateur: longueursGenerateur, fiche: longueursFiche, textes: longueursTextes },
  { definition: formesDefinition, generateur: formesGenerateur, fiche: formesFiche, textes: formesTextes },
  { definition: mesuresDefinition, generateur: mesuresGenerateur, fiche: mesuresFiche, textes: mesuresTextes },
  { definition: geometrieDefinition, generateur: geometrieGenerateur, fiche: geometrieFiche, textes: geometrieTextes },
  { definition: grammaireDefinition, generateur: grammaireGenerateur, fiche: grammaireFiche, textes: grammaireTextes },
  { definition: fractionsDefinition, generateur: fractionsGenerateur, fiche: fractionsFiche, textes: fractionsTextes },
  { definition: vocabulaireDefinition, generateur: vocabulaireGenerateur, fiche: vocabulaireFiche, textes: vocabulaireTextes },
  { definition: orthographeDefinition, generateur: orthographeGenerateur, fiche: orthographeFiche, textes: orthographeTextes },
  { definition: dicteeDefinition, generateur: dicteeGenerateur, fiche: dicteeFiche, textes: dicteeTextes },
  { definition: lettresDefinition, generateur: lettresGenerateur, fiche: lettresFiche, textes: lettresTextes },
]

/** @param {string} id */
export const exerciceDe = id => REGISTRE.find(e => e.definition.id === id) ?? null
