// Troisième exemple, minimal mais riche : « lettres à écrire ». Il montre ce que les deux autres ne montrent pas :
//   - un format et une orientation FIXES (A4 portrait : ni l'un ni l'autre n'est proposé dans le formulaire) ;
//   - des champs libres : un TEXTE (le mot) et des NOMBRES (de, à : bornes incluses, un pas) ;
//   - des conditions « visible si » riches : valeur (`serie` = mot), appartenance (`dans`), liste qui contient (`contient`),
//     ET (`tous`) et OU (`un`), y compris pour un type de police (`polices.attache`) ;
//   - des valeurs proposées qui dépendent d'un autre réglage (`offertes` : les lettres suivent la langue de la feuille) ;
//   - des préréglages (jeux de réglages nommés qui pré-remplissent le formulaire, modifiables ensuite) ;
//   - une mesure de texte injectée (`contexte.mesure`) : le dessin ajuste la taille du texte à la largeur, sans canvas ni DOM.
// Une affiche ordinaire n'a besoin de rien de cela : voir exemple/ (le point de départ) et README.md.
import { definirAffiche, choix, cases, texte, nombre } from '../definir.ts'
import { D, K } from '../../noyau/ids.ts'
import { CODES, donneesRegionales } from '../../langues/registre.ts'
import type { Langue } from '../../langues/registre.ts'
import type { ReglagesDeAffiche } from '../types.ts'

const MINUSCULES = [...'abcdefghijklmnopqrstuvwxyz']

/** Les lettres d'une langue : l'alphabet régional s'il en a un (ch, c'h…), sinon les 26 lettres du français. */
export const alphabetDe = (langue: string): readonly string[] =>
  donneesRegionales(langue as Langue)?.alphabet ?? MINUSCULES

// toutes les lettres déclarées (le breton ajoute ch et c'h) : chaque langue en propose une partie (`offertes`)
const TOUTES = [...new Set(CODES.flatMap(alphabetDe).concat(MINUSCULES))].sort((a, b) => a.localeCompare(b, 'fr'))
export const LETTRES = TOUTES

const definition = definirAffiche({
  id: 'exemple-riche',
  domaine: D.exemple,
  route: '/dev/affiches',
  // une langue par feuille (choix dans le formulaire) ; la liste des lettres suit cette langue
  langues: CODES,
  // fixes : un seul format, une seule orientation
  formats: ['A4'],
  orientations: ['portrait'],
  police: { mode: 'parType', types: ['script', 'attache'], defauts: { script: 'Andika', attache: 'Playwrite FR Trad' } },
  competences: [K.exempleLire],
  reglages: {
    serie: choix(['alphabet', 'mot', 'nombres']),
    lettres: cases(TOUTES, { defaut: ['a', 'b', 'c'] }),
    mot: texte({ defaut: 'bonjour', max: 20 }),
    de: nombre({ defaut: 0, min: 0, max: 99 }),
    a: nombre({ defaut: 10, min: 0, max: 99 }),
    styles: cases(['script', 'attache']),
    pointilles: choix([false, true]),
  },
  formulaire: {
    groupes: [
      { id: 'contenu', reglages: ['serie', 'lettres', 'mot', 'de', 'a'] },
      { id: 'ecriture', reglages: ['styles', 'pointilles'] },
    ],
    visibleSi: {
      lettres: { reglage: 'serie', valeur: 'alphabet' },
      mot: { reglage: 'serie', valeur: 'mot' },
      de: { reglage: 'serie', valeur: 'nombres' },
      a: { reglage: 'serie', valeur: 'nombres' },
      // ET (tous) et OU (un) : les pointillés à repasser n'ont de sens qu'en script, pour des lettres ou un mot
      pointilles: { tous: [{ reglage: 'styles', contient: 'script' }, { un: [{ reglage: 'serie', valeur: 'alphabet' }, { reglage: 'serie', dans: ['mot'] }] }] },
      // une police par type, proposée seulement si ce type est écrit
      'polices.script': { reglage: 'styles', contient: 'script' },
      'polices.attache': { reglage: 'styles', contient: 'attache' },
    },
  },
  // les lettres proposées suivent la langue de la feuille ; le défaut (a b c) reste proposé dans les deux
  offertes: { lettres: c => alphabetDe(String(c.langue)) },
  prereglages: {
    'premieres-lettres': { serie: 'alphabet', lettres: ['a', 'b', 'c', 'd', 'e'], styles: ['script'] },
    'mon-prenom': { serie: 'mot', mot: 'Léa', styles: ['script', 'attache'] },
    'compter-jusqua-dix': { serie: 'nombres', de: 1, a: 10 },
  },
  variantes: { ecrire: { classes: ['cp'] } },
})

export default definition
export type Reglages = ReglagesDeAffiche<typeof definition>
