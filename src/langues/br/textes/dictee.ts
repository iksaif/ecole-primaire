// Textes de l'interface — dictée (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`).
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/dictee.ts'

export default {
  description: 'Selaou ha skriv ar gerioù — mouezh dre gomputer', // br: à relire
  titre: 'Skrivadeg', // br: à relire (dictée)
  categories: 'Rummadoù — {n}',
  mode: 'Mod',
  motsSeuls: 'Gerioù hepken',
  motsSeulsDesc: 'Ar skoliad a glev ar ger hag e skriv',
  phrases: 'Frazennoù',
  phrasesDesc: 'Ur ger en ur frazenn, ar skoliad a skriv ar frazenn',
  cleApiOpt: "(diret — evit krouiñ frazennoù liesseurt)",
  cleAucune: "Alc'hwez ebet — frazennoù prientet",
  nbMots: 'Niver a c\'herioù',
  tous: 'An holl',
  vitesse: 'Tizh ar vouezh',
  generation: 'O krouiñ…',
  afficherIndice: '👁️ Diskouez ar frazenn gant toulloù (tun)', // br: à relire (indice)
  masquerIndice: 'Kuzhat an tun',
  arreter: 'Paouez',
  ecouterPhrase: 'Selaou ar frazenn',
  ecouterMot: 'Selaou ar ger',
  consigne: "Selaou mat, ha skriv ar pezh a glevez :",
  reecouter: '🔁 Adselaou',
  accents: 'Diwall ouzh an akcentoù : {r}', // br: à relire (« attention aux accents » : terme à vérifier)
  feedbackErr: '❌ Ar respont mat a oa : « {r} »',
  pagesFiche: 'Pajennoù ar fichenn', // br: à relire
  pageListe: 'Gerioù da zeskiñ', // br: à relire
  pageDictee: 'Skrivadeg da ober gant un oadour', // br: à relire
  passer: 'Tremen', // br: à relire
  passe: '(tremenet)', // br: à relire
  cat: {
    mots_outils: 'Gerioù-benveg',
    pronoms: 'Raganvioù',
    jours: 'Devezhioù',
    nombres: 'Niveroù',
    lieux: 'Lec\'hioù',
    transports: 'Treuzdougen',
    animaux: 'Loened',
    fruits: 'Frouezh',
    famille: 'Familh',
    verbes: 'Verboù',
    determinants: 'Gerioù-mont',
    corps_humain: 'Korf mab-den',
    maison: 'Ti',
    ecole: 'Skol',
    verbes_courants: 'Verboù boutin',
    adjectifs: 'Anvioù-gwan',
    saisons: 'Koulzadoù',
    aliments: 'Boued',
    mots_invariables: 'Gerioù digemm',
    mots_en_tion: 'Gerioù e -tion',
    mots_en_eur: 'Gerioù e -eur',
    nature_et_environnement: 'Natur hag endro',
    vocabulaire_scientifique: 'Geriaoueg skiantel',
    adverbes: 'Adverboù',
    vocabulaire_civique: 'Geriaoueg keodedel',
    vocabulaire_geographique: 'Geriaoueg douaroniel',
    mots_difficiles_courants: 'Gerioù boutin diaes',
    connecteurs_logiques: 'Gerioù-liamm',
    vocabulaire_litteraire: 'Geriaoueg lennegel',
    mots_latins_grecs_courants: 'Gerioù latin/gresianek boutin',
  },
} as const satisfies Traductions<typeof fr>
