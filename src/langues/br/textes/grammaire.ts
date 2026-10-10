// Textes de l'interface — grammaire (breton). Traduction automatique : les passages marqués « br: à relire » sont à faire vérifier par un
// brittophone (`npm run i18n:relecture`). Les mots français étudiés restent en français.
import type { Traductions } from '../../types.ts'
import type fr from '../../fr/textes/grammaire.ts'

export default {
  astuce: 'Gallout a rez dibab meur a boelladenn : mesket e vint.',
  ecouterPhrase: 'Selaou ar frazenn',
  cliqueEtiquettes: 'Klik war an tikedennoù en urzh…', // br: à relire (étiquette = tikedenn)
  effacerOrdre: '↺ Diverkañ',
  ecrisReponse: 'Skriv da respont…',
  validerCourt: 'Gwiriañ',
  suivantFleche: 'Da-heul →',
  correction: 'Reizhadenn',
  bonnePhrase: 'Ar frazenn vat eo : « {r} »',
  bonneReponseEst: 'Ar respont mat eo « {r} »',
  accents: 'Diwall ouzh an akcentoù : {r}', // br: à relire (« attention aux accents » : terme à vérifier)
  pasToutAFait: 'N\'eo ket mat penn-da-benn…',
  // Groupes et types d'exercices (réglages)
  // br: à relire
  type_ordre: 'Gerioù en urzh',
  type_phrase: 'Ur frazenn pe get ?',
  type_majuscule: 'Pennlizherenn ha poent',
  type_ponctuation: 'Seurtoù frazennoù . ? !',
  type_typePhrase: 'Disklêriañ, goulenn, gourc\'hemenn', // br: à relire
  type_complexe: 'Frazenn eeun / kemplezh',
  type_negation: 'Lakaat er stumm nac\'hus',
  type_negReconnaitre: 'Kadarnaus pe nac\'hus ?',
  type_verbe: 'Kavout ar verb',
  type_nom: 'Kavout an anvioù',
  type_det: 'Kavout ar gerioù-mont',
  type_adj: 'Kavout an anvioù-gwan',
  type_nature: 'Rummad ur ger',
  type_gnNoyau: 'Anv pennañ ar strollad anv',
  type_sujet: 'Kavout ar sujed',
  type_pronom: 'Il, elle, ils, elles',
  type_pronomPersonne: 'Raganvioù : je, tu, nous, vous…', // br: à relire (raganvioù gallek : ar poellad a zo e galleg)
  type_cplt: 'Kavout klokaenn ar frazenn',
  type_cpltQ: 'Pelec\'h ? Pegoulz ?',
  type_cpltNature: 'Klokaenn ar verb pe ar frazenn ?',
  type_genre: 'Gourel / benel',
  type_nombre: 'Unander / liester',
  type_pluriel: 'Lakaat el liester',
  type_accordGN: 'Kenglotañ an anv-gwan',
  type_accordSV: 'Il chante / ils chantent',
  // Choix de réponse « métalangage » (les choix en français étudié restent tels quels)
  choix_ouiPhrase: 'Ya, ur frazenn eo',
  choix_nonPhrase: 'Nann, n\'eo ket ur frazenn',
  choix_phraseSimple: 'frazenn eeun', // br: à relire
  choix_phraseComplexe: 'frazenn gemplezh', // br: à relire
  choix_affirmative: 'kadarnaus', // br: à relire
  choix_negative: 'nac\'hus', // br: à relire
  choix_complementVerbe: 'klokaenn ar verb', // br: à relire (complément = klokaenn)
  choix_complementPhrase: 'klokaenn ar frazenn', // br: à relire
  choix_ou: 'Pelec\'h ?',
  choix_quand: 'Pegoulz ?',
  choix_singulier: 'unander',
  choix_pluriel: 'liester',
  choix_masculin: 'gourel',
  choix_feminin: 'benel',
  choix_nom: 'anv',
  choix_verbe: 'verb',
  choix_determinant: 'ger-mont', // br: à relire (déterminant)
  choix_adjectif: 'anv-gwan',
  choix_pronom: 'raganv',
  choix_point: '. (poent)',
  choix_interrogation: '? (pik goulenn)', // br: à relire
  choix_exclamation: '! (pik estlammañ)', // br: à relire
  choix_declarative: 'disklêriañ', // br: à relire
  choix_interrogative: 'goulenn', // br: à relire
  choix_imperative: 'gourc\'hemenn', // br: à relire
  // Genre et nombre dans les explications
  gn_ms: 'gourel unander',
  gn_fs: 'benel unander',
  gn_mp: 'gourel liester',
  gn_fp: 'benel liester',
  nombre_s: 'en unander',
  nombre_p: 'el liester',
  // Types de phrases (selon le signe de fin) — br: à relire
  typePhrase_point: 'frazenn disklêriañ',
  typePhrase_interrogation: 'frazenn goulenn',
  typePhrase_exclamation: 'frazenn estlamm',
  // Consignes des questions (à l'écran) — br: à relire (ensemble des consignes)
  consigne_ordre: 'Lak ar gerioù en urzh evit ober ur frazenn.',
  consigne_phrase: 'Ur frazenn eo ?',
  consigne_majuscule: 'Peseurt frazenn a zo skrivet mat ?',
  consigne_ponctuation: 'Peseurt arouez a vez lakaet e dibenn ar frazenn ?',
  consigne_typePhrase: 'Peseurt seurt frazenn eo ?', // br: à relire
  consigne_complexe: 'Frazenn eeun pe frazenn gemplezh eo ?',
  consigne_negation: 'Peseurt frazenn a zo er stumm nac\'hus ?',
  consigne_negReconnaitre: 'Kadarnaus pe nac\'hus eo ar frazenn-mañ ?',
  consigne_verbe: 'Klik war ar verb.',
  consigne_nom: 'Klik war an holl anvioù.',
  consigne_det: 'Klik war an holl c\'herioù-mont.',
  consigne_adj: 'Klik war an holl anvioù-gwan.',
  consigne_nature: 'Petra eo rummad ar ger e tev ?',
  consigne_gnNoyau: 'Klik war anv pennañ ar strollad anv.',
  consigne_sujet: 'Klik war holl c\'herioù ar strollad sujed.',
  consigne_pronom: 'Gant peseurt raganv e c\'haller erlec\'hiañ ar sujed islinennet ?',
  consigne_pronomPersonne: 'Peseurt raganv-gour sujed a erlec\'h ar gerioù-se ?', // br: à relire
  consigne_cplt: 'Klik war holl c\'herioù klokaenn ar frazenn.',
  consigne_cpltQ: 'Ouzh peseurt goulenn e respont klokaenn ar frazenn islinennet ?',
  consigne_cpltNature: 'Klokaenn ar verb pe klokaenn ar frazenn eo ar strollad islinennet ?',
  consigne_genre: '« un » pe « une » ?',
  consigne_nombre: 'Unander pe liester ?',
  consigne_pluriel: 'Skriv ar strollad gerioù-mañ el liester.',
  consigne_accordGN: 'Dibab kenglotadur mat an anv-gwan.',
  consigne_accordSV: 'Dibab stumm mat ar verb (en amzer-vremañ).',
  consigne_ce2_verbe: 'Klik war an holl verboù displeget.',
  consigne_ce2_negReconnaitre: 'Kadarnaus eo ar frazenn-mañ ? Anez, peseurt nac\'hadur a zo enni ?', // br: à relire
  // Règles du pluriel (explication)
  regle_al: 'An anvioù a echu gant -al a ra o liester gant -aux.',
  regle_eu: 'An anvioù a echu gant -eu a gemer un x el liester.',
  regle_eau: 'An anvioù a echu gant -eau a gemer un x el liester.',
  regle_ou: 'Seizh anv a echu gant -ou a gemer un x el liester : bijou, caillou, chou, genou, hibou, joujou, pou.',
  regle_ou2: 'An anvioù a echu gant -ou a gemer un s el liester, nemet bijou, caillou, chou, genou, hibou, joujou, pou.',
  regle_s: 'Ur ger a echu dija gant -s ne cheñch ket el liester.',
  regle_x: 'Ur ger a echu dija gant -x ne cheñch ket el liester.',
  regle_z: 'Ur ger a echu dija gant -z ne cheñch ket el liester.',
  regle_defaut: 'El liester e cheñch ar ger-mont (le, la → les ; un, une → des…) hag e vez ouzhpennet un -s e dibenn an anvioù hag an anvioù-gwan.',
  // Consignes de la fiche imprimée — br: à relire (cocher = lakaat ur groaz, entourer = lakaat ur c'helc'h en-dro, souligner = islinennañ)
  fiche_ordre: 'Lak ar gerioù en urzh ha skriv ar frazenn.',
  fiche_phrase: 'Lak ur groaz er voest vat : ur frazenn eo ?',
  fiche_majuscule: 'Adskriv ar frazenn gant ur bennlizherenn hag ur poent.',
  fiche_ponctuation: 'Ouzhpenn an arouez vat en dibenn : . ? pe !',
  fiche_typePhrase: 'Kroazit seurt ar frazenn : disklêriañ, goulenn pe gourc\'hemenn.', // br: à relire
  fiche_complexe: 'Islinenn ar verboù displeget, ha lak ur groaz : frazenn eeun pe gemplezh ?',
  fiche_negation: 'Skriv ar frazenn er stumm nac\'hus.',
  fiche_negReconnaitre: 'Lak ur groaz : kadarnaus pe nac\'hus eo ar frazenn ?',
  fiche_verbe: 'Islinenn ar verb.',
  fiche_nom: 'Lak ur c\'helc\'h en-dro d\'an holl anvioù.',
  fiche_det: 'Lak ur c\'helc\'h en-dro d\'an holl c\'herioù-mont.',
  fiche_adj: 'Lak ur c\'helc\'h en-dro d\'an holl anvioù-gwan.',
  fiche_nature: 'Skriv rummad ar ger e tev : anv, verb, ger-mont, anv-gwan pe raganv.',
  fiche_gnNoyau: 'Islinenn anv pennañ ar strollad anv.',
  fiche_sujet: 'Lak ur c\'helc\'h en-dro d\'ar strollad sujed.',
  fiche_pronom: 'Skrivit ar raganv a erlec\'h ar sujed islinennet : il, elle, ils pe elles.', // br: à relire
  fiche_pronomPersonne: 'Skrivit ar raganv a erlec\'h ar gerioù-se : je, tu, il, elle, nous, vous, ils pe elles.', // br: à relire
  fiche_cplt: 'Lak ur c\'helc\'h en-dro da glokaenn ar frazenn.',
  fiche_cpltQ: 'Diskouez a ra ar glokaenn islinennet pelec\'h pe pegoulz ? Lak ur groaz.',
  fiche_cpltNature: 'Klokaenn ar verb (V) pe klokaenn ar frazenn (F) eo ar strollad islinennet ?',
  fiche_genre: 'Skriv un pe une.',
  fiche_nombre: 'Lak ur groaz : unander pe liester ?',
  fiche_pluriel: 'Skriv el liester.',
  fiche_accordGN: 'Kenglot an anv-gwan etre krommelloù.',
  fiche_accordSV: 'Skriv ar verb en amzer-vremañ.',
  fiche_ce2_verbe: 'Islinenn an holl verboù displeget.',
  fiche_ce2_negReconnaitre: 'Skriv K ma\'z eo kadarnaus ar frazenn, anez skriv an nac\'hadur (ne … pas, plus, jamais, rien).',
  fiche_cestPhrase: 'ur frazenn eo',
  fiche_pasPhrase: 'n\'eo ket ur frazenn',
  // case « complément de phrase » (P) à côté de V (verbe)
  fiche_lettrePhrase: 'F',
  avec: 'gant',
  // Explications des corrections ({…} : mots de la phrase étudiée, en français)
  expl_phraseOk: 'Ar gerioù a zo en urzh hag ur ster en deus ar frazenn.',
  expl_phraseVerbe: 'Mankout a ra ur verb : ne ouzer ket petra a c\'hoarvez.',
  expl_phraseOrdre: 'N\'emañ ket ar gerioù en urzh mat : ne gomprener ket.',
  expl_majuscule: 'Ur frazenn a grog gant ur bennlizherenn hag a echu gant ur poent.', // br: à relire (majuscule = pennlizherenn)
  expl_ponctuation: 'Ur {type} eo.',
  // br: à relire
  expl_typePhrase_declarative: 'Lavarout a ra un dra, reiñ a ra un titour : ur frazenn disklêriañ eo. Echuiñ a ra gant ur poent.',
  expl_typePhrase_interrogative: 'Goulenn a ra un dra : ur frazenn goulenn eo. Echuiñ a ra gant ur poent goulenn.', // br: à relire
  expl_typePhrase_imperative: 'Reiñ a ra un urzh pe ur c\'huzul, hep lavarout piv a ra : ur frazenn gourc\'hemenn eo. Echuiñ a ra gant ur poent, pe ur poent estlamm.', // br: à relire
  expl_complexe: '{n} verb displeget a zo ({verbes}) : ur frazenn gemplezh eo.',
  expl_simple: 'N\'eus nemet ur verb displeget ({verbes}) : ur frazenn eeun eo.',
  expl_negation: 'Lakaat a reer « {ne} … {mot} » en-dro d\'ar verb{elision}.',
  expl_negationElision: ' (n\' dirak ur vogalenn)',
  expl_negative: 'Emañ ar verb etre « {ne} … {mot} » : nac\'hus eo ar frazenn.',
  expl_affirmative: 'N\'eus ket a « ne … » en-dro d\'ar verb : kadarnaus eo ar frazenn.',
  expl_sujet: 'Ar sujed eo « {sujet} ». « {cestQui} »',
  expl_sujetInverse: ' Amañ emañ ar sujed goude ar verb.',
  expl_cplt: '« {groupe} » a zo ur glokaenn frazenn : diskouez a ra {question}. Gallout a reer he dilec\'hiañ pe he lemel.',
  expl_cpltOu: 'pelec\'h',
  expl_cpltQuand: 'pegoulz',
  expl_gnNoyau: 'An anv pennañ eo « {nom} » : ar gerioù all a genglot gantañ.',
  expl_verbes: 'Ar verboù displeget eo {verbes}.',
  expl_verbe: 'Ar verb eo {verbes}.',
  lib_nom: 'Anv',
  lib_noms: 'Anvioù',
  lib_det: 'Ger-mont',
  lib_dets: 'Gerioù-mont',
  lib_adj: 'Anv-gwan',
  lib_adjs: 'Anvioù-gwan',
  expl_cpltQ: '« {groupe} » a ziskouez {quoi}.',
  expl_cpltQLieu: 'al lec\'h (pelec\'h ?)',
  expl_cpltQMoment: 'ar mare (pegoulz ?)',
  expl_cpltPhrase: 'Gallout a reer dilec\'hiañ pe lemel « {groupe} » : ur glokaenn frazenn eo.',
  expl_cpltVerbe: '« {groupe} » a glok ar verb « {verbe} » : ne c\'haller ket he dilec\'hiañ e penn kentañ ar frazenn. Ur glokaenn verb eo.',
  expl_nomPropre: ' (anv divoutin)', // br: à relire (nom propre)
  expl_conjugue: ' displeget',
  expl_nature: 'Rummad ar ger « {mot} » : {nature}{precision}.',
  expl_pronom: '« {sujet} » a zo {gn} → « {phrase} »',
  expl_pronomPersonne_je: 'An hini a gomz eo a ra an ober : je.', // br: à relire
  expl_pronomPersonne_tu: 'An hini a gomzer outañ eo a ra an ober : tu.', // br: à relire
  expl_pronomPersonne_il: '« {mots} » : unan hepken, gourel → il.', // br: à relire
  expl_pronomPersonne_elle: '« {mots} » : unan hepken, benel → elle.', // br: à relire
  expl_pronomPersonne_nous: '« {mots} » : an hini a gomz, gant re all → nous.', // br: à relire
  expl_pronomPersonne_vous: '« {mots} » : an hini a gomzer outañ, gant re all → vous.', // br: à relire
  expl_pronomPersonne_ils: '« {mots} » : meur a hini, gant unan gourel d\'an nebeutañ → ils.', // br: à relire
  expl_pronomPersonne_elles: '« {mots} » : meur a hini, holl benel → elles.', // br: à relire
  expl_genre: 'Lavaret a reer « {det} {nom} » : « {nom} » a zo {genre}.',
  expl_nombre: '« {det} » a ziskouez emañ {nombre}.',
  expl_accordGN: '« {nom} » a zo {gn} → {bonne}.',
  expl_accordSV: 'Ar verb a genglot gant e sujed « {sujet} », a zo {nombre} → {bonne}.',
} as const satisfies Traductions<typeof fr>
