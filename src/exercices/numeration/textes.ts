// Les nombres — textes de CONTENU : ce que les énoncés, la fiche et son corrigé écrivent. Lus par T (générateur, fiche) ; la vue
// passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE (boutons, réglages, retours du jeu) sont dans
// src/langues/<langue>/textes/numeration.ts.
//   langue            code de la langue du contenu : il choisit l'écriture des nombres en lettres (le générateur n'a pas d'autre accès à la langue) ;
//   lib.<champ>       titre d'une case (« centaines ») ; cdu.<champ>, base10.<pièce> : « 3 centaines », « 1 barre » (pluriel selon n :
//                     en breton le nom reste au singulier après un nombre) ;
//   c<…>, justeApres… consignes et énoncés ; p<…> : la fiche ; fiche.<id> : titre court, titre et description d'une fiche par
//                     compétence (pages /telechargements/), la même clé que son `id` dans definition.ts.
import { catalogue } from '../../langues/catalogue.ts'
import { REGIONALES } from '../../langues/registre.ts'

export const CONTENU = catalogue({
  langue: 'fr',
  titre: "Les nombres jusqu'à {n}",
  lib: { milliers: 'milliers', centaines: 'centaines', dizaines: 'dizaines', unites: 'unités' },
  // unités de numération dans « 3 centaines 4 dizaines 7 unités »
  cdu: {
    milliers: { one: '{n} millier', other: '{n} milliers' },
    centaines: { one: '{n} centaine', other: '{n} centaines' },
    dizaines: { one: '{n} dizaine', other: '{n} dizaines' },
    unites: { one: '{n} unité', other: '{n} unités' },
  },
  // matériel base 10 dans « 2 plaques, 3 barres, 5 cubes »
  base10: {
    millier: { one: '{n} gros cube', other: '{n} gros cubes' },
    centaine: { one: '{n} plaque', other: '{n} plaques' },
    dizaine: { one: '{n} barre', other: '{n} barres' },
    unite: { one: '{n} cube', other: '{n} cubes' },
  },
  et: 'et',
  cDecomposer: 'Décompose le nombre en {liste}.',
  cEcrisNombre: 'Écris le nombre.',
  cRepresente: 'Quel nombre est représenté ?',
  cEnChiffres: 'Écris ce nombre en chiffres.',
  cEnLettres: "Comment s'écrit ce nombre en lettres ?",
  cSigne: 'Choisis le bon signe : < , = ou >',
  justeApres: 'Le nombre juste après {n}',
  justeAvant: 'Le nombre juste avant {n}',
  cTrouve: 'Trouve le nombre.',
  cCalcule: 'Calcule.',
  cSuite: 'Complète la suite.',
  cDroite: 'Quel nombre montre la flèche ? (on avance de {pas} à chaque graduation)',
  libDroite: 'Droite de {a} à {b}',
  cRanger: 'Clique sur les nombres du plus petit au plus grand.',

  // ─── Fiche ───
  pRepresente: 'Quel nombre est représenté ?',
  pLegende: '({m}plaque = 100, barre = 10, cube = 1)',
  pLegendeM: 'gros cube = 1000, ',
  pCestLeNombre: "C'est le nombre",
  pEnChiffres: 'en chiffres :',
  pEcrisLettres: 'Écris {n} en lettres :',
  pComparerAide: '(< , = ou >)',
  pFlecheQ: 'Quel nombre montre la flèche ?',
  pFlecheAide: '(on avance de {pas} à chaque graduation)',
  pFlecheMontre: 'La flèche montre',
  pRange: 'Range du plus petit au plus grand :',
  pSuite: 'Complète la suite :',
  pNbQuestions: '{n} questions',

  fiche: {
    numeration: {
      court: 'Lire, écrire et décomposer les nombres',
      titre: 'Fiche de numération : lire, écrire et décomposer les nombres',
      description: 'Décomposer un nombre en centaines, dizaines et unités, le représenter avec des plaques, des barres et des cubes, écrire un nombre en chiffres : fiche de numération gratuite à imprimer, avec corrigé.',
    },
    'en-lettres': {
      court: 'Écrire les nombres en lettres',
      titre: 'Fiche de numération : écrire les nombres en lettres',
      description: "Choisir la bonne écriture en lettres d'un nombre écrit en chiffres : fiche gratuite à imprimer, avec corrigé.",
    },
    'comparer-ranger': {
      court: 'Comparer et ranger les nombres',
      titre: 'Fiche de numération : comparer et ranger les nombres',
      description: 'Comparer deux nombres avec <, = ou >, ranger des nombres du plus petit au plus grand : fiche gratuite à imprimer, avec corrigé.',
    },
    suites: {
      court: 'Les suites de nombres',
      titre: 'Fiche de numération : les suites de nombres',
      description: 'Trouver le nombre juste avant ou juste après, ajouter ou retirer 10 ou 100, compléter une suite de nombres : fiche gratuite à imprimer, avec corrigé.',
    },
    droite: {
      court: 'La droite graduée',
      titre: 'Fiche de numération : lire un nombre sur la droite graduée',
      description: 'Trouver le nombre que montre une flèche sur une droite graduée de 1 en 1, de 10 en 10 ou de 100 en 100 : fiche gratuite à imprimer, avec corrigé.',
    },
  },
}, {
  br: {
    // le code de la langue régionale vient du registre (aucun littéral de langue en dur)
    langue: REGIONALES[0],
    titre: 'An niveroù betek {n}',
    lib: { milliers: 'miladoù', centaines: 'kantadoù', dizaines: 'degadoù', unites: 'unanennoù' },
    // le nom reste au singulier après un nombre (« 3 kantad »)
    cdu: {
      milliers: { other: '{n} milad' },
      centaines: { other: '{n} kantad' },
      dizaines: { other: '{n} degad' },
      unites: { other: '{n} unanenn' },
    },
    base10: {
      millier: { other: '{n} kub bras' },
      centaine: { other: '{n} plakenn' },
      dizaine: { other: '{n} barrenn' },
      unite: { other: '{n} kub' },
    },
    et: 'ha',
    cDecomposer: 'Dispenn an niver e {liste}.', // br: à relire (« dispenn » = décomposer)
    cEcrisNombre: 'Skriv an niver.',
    cRepresente: 'Pe niver a welez ?',
    cEnChiffres: 'Skriv an niver-mañ e sifroù.',
    cEnLettres: 'Penaos e skriver an niver-mañ e lizherennoù ?',
    cSigne: 'Dibab an arouez mat : < , = pe >',
    justeApres: "An niver diouzhtu war-lerc'h {n}",
    justeAvant: 'An niver diouzhtu a-raok {n}',
    cTrouve: 'Kav an niver.',
    cCalcule: 'Jed.',
    cSuite: 'Klok an heuliad.', // br: à relire
    cDroite: 'Pe niver a ziskouez ar bir ? (+ {pas} bep derez)', // br: à relire (« derez » = graduation)
    libDroite: 'Linenn eus {a} betek {b}',
    cRanger: "Klik war an niveroù eus ar bihanañ d'ar brasañ.",

    pRepresente: 'Pe niver a welez ?',
    pLegende: '({m}plakenn = 100, barrenn = 10, kub = 1)',
    pLegendeM: 'kub bras = 1000, ',
    pCestLeNombre: 'An niver eo',
    pEnChiffres: 'e sifroù :',
    pEcrisLettres: 'Skriv {n} e lizherennoù :',
    pComparerAide: '(< , = pe >)', // br: à relire
    pFlecheQ: 'Pe niver a ziskouez ar bir ?',
    pFlecheAide: '(+ {pas} bep derez)', // br: à relire
    pFlecheMontre: 'Ar bir a ziskouez',
    pRange: "Renk eus ar bihanañ d'ar brasañ :",
    pSuite: 'Kloka an heuliad :', // br: à relire
    pNbQuestions: '{n} goulenn',

    fiche: {
      numeration: {
        court: 'Lenn, skrivañ ha dispenn an niveroù', // br: à relire
        titre: 'Fichenn niveriñ : lenn, skrivañ ha dispenn an niveroù', // br: à relire
        description: 'Dispenn un niver e kantadoù, degadoù hag unanennoù, skeudenniñ anezhañ gant plakennoù, barrennoù ha kubioù, skrivañ anezhañ e sifroù : fichenn niveriñ digoust da voullañ, gant ar reizhadenn.', // br: à relire
      },
      'en-lettres': {
        court: 'Skrivañ an niveroù e lizherennoù', // br: à relire
        titre: 'Fichenn niveriñ : skrivañ an niveroù e lizherennoù', // br: à relire
        description: "Dibab ar mod mat da skrivañ e lizherennoù un niver skrivet e sifroù : fichenn digoust da voullañ, gant ar reizhadenn.", // br: à relire
      },
      'comparer-ranger': {
        court: 'Keñveriañ ha renkañ an niveroù', // br: à relire
        titre: 'Fichenn niveriñ : keñveriañ ha renkañ an niveroù', // br: à relire
        description: "Keñveriañ div niver gant <, = pe >, renkañ niveroù eus ar bihanañ d'ar brasañ : fichenn digoust da voullañ, gant ar reizhadenn.", // br: à relire
      },
      suites: {
        court: 'Heuliadoù an niveroù', // br: à relire
        titre: 'Fichenn niveriñ : heuliadoù an niveroù', // br: à relire
        description: "Kavout an niver diouzhtu a-raok pe war-lerc'h, ouzhpennañ pe dennañ 10 pe 100, klokaat un heuliad niveroù : fichenn digoust da voullañ, gant ar reizhadenn.", // br: à relire
      },
      droite: {
        court: 'Al linenn dereziet', // br: à relire
        titre: 'Fichenn niveriñ : lenn un niver war al linenn dereziet', // br: à relire
        description: 'Kavout an niver a ziskouez ur bir war ur linenn dereziet : fichenn digoust da voullañ, gant ar reizhadenn.', // br: à relire
      },
    },
  },
})
