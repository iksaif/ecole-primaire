// Orthographe — corpus de l'exercice : phrases à trous (homophones, accords) et mots à compléter (lettres manquantes).
// Chaque question porte `niv`, l'année où elle entre au programme (sinon le `niv` de son thème) ; `explication` : clé du
// catalogue d'interface. Donnée pure, jamais traduite : c'est du français étudié (exercice de français, `contenu: 'fr'`),
// comme src/data/conjugaison.js et src/data/dicteeMots.js.

export const QUESTIONS = {
  homophones: [
    // a / à
    { phrase: 'Il ___ une belle maison.',     bonne: 'a',   choix: ['a','à'],   explication: 'exp_a_avoir_il_a' },
    { phrase: 'Elle va ___ l\'école.',        bonne: 'à',   choix: ['a','à'],   explication: 'exp_a_preposition_de_lieu' },
    { phrase: 'Papa ___ faim.',               bonne: 'a',   choix: ['a','à'],   explication: 'exp_a_avoir_papa_a' },
    { phrase: 'Je vais ___ la piscine.',      bonne: 'à',   choix: ['a','à'],   explication: 'exp_a_preposition_de_lieu' },
    // ou / où
    { phrase: 'Tu veux du lait ___ du jus ?', bonne: 'ou',  choix: ['ou','où'], explication: 'exp_ou_choix_ou_bien' },
    { phrase: '___ est mon cartable ?',        bonne: 'Où',  choix: ['Ou','Où'], explication: 'exp_ou_lieu_remplace_a_quel' },
    { phrase: 'Chat ___ chien, j\'aime les deux.', bonne: 'ou', choix: ['ou','où'], explication: 'exp_ou_choix' },
    // on / ont
    { phrase: '___ mange à midi.',            bonne: 'On',  choix: ['On','Ont'], explication: 'exp_on_pronom_sujet' },
    { phrase: 'Ils ___ fini leurs devoirs.',  bonne: 'ont', choix: ['on','ont'], explication: 'exp_ont_avoir_au_pluriel_ils' },
    { phrase: '___ part en vacances demain.', bonne: 'On',  choix: ['On','Ont'], explication: 'exp_on_pronom_on_nous' },
    // est / et
    { phrase: 'Le chat ___ la souris.',       bonne: 'et',  choix: ['est','et'], explication: 'exp_et_conjonction_et_puis' },
    { phrase: 'Il ___ content.',              bonne: 'est', choix: ['est','et'], explication: 'exp_est_etre_il_est' },
    { phrase: 'Le soleil ___ chaud.',         bonne: 'est', choix: ['est','et'], explication: 'exp_est_etre_il_est' },
    { phrase: 'J\'aime les pommes ___ les poires.', bonne: 'et', choix: ['est','et'], explication: 'exp_et_conjonction' },
    // son / sont
    { phrase: 'Ils ___ partis tôt.',          bonne: 'sont', choix: ['son','sont'], explication: 'exp_sont_etre_au_pluriel_ils' },
    { phrase: '___ chien s\'appelle Rex.',    bonne: 'Son',  choix: ['Son','Sont'], explication: 'exp_son_determinant_possessif' },
    { phrase: 'Elles ___ heureuses.',         bonne: 'sont', choix: ['son','sont'], explication: 'exp_sont_etre_au_pluriel' },
    // ce / se
    { phrase: '___ livre est à moi.',         bonne: 'Ce',  choix: ['Ce','Se'],  explication: 'exp_ce_determinant_demonstratif' },
    { phrase: 'Il ___ lave les mains.',       bonne: 'se',  choix: ['ce','se'],  explication: 'exp_se_pronom_reflechi' },
    // mes / mais
    { phrase: 'Je cherche ___ lunettes.',     bonne: 'mes', choix: ['mes','mais'], explication: 'exp_mes_determinant_possessif_pluriel_de' },
    { phrase: 'J\'aime le sport ___ je suis fatigué.', bonne: 'mais', choix: ['mes','mais'], explication: 'exp_mais_conjonction_d_opposition' },
  ],

  accords: [
    // genre (CP : féminin en -e)
    { phrase: 'Un ___ garçon.',               bonne: 'petit',    choix: ['petit','petite'],    explication: 'exp_garcon_est_masculin_petit' },
    { phrase: 'Une ___ fille.',               bonne: 'petite',   choix: ['petit','petite'],    explication: 'exp_fille_est_feminin_petite' },
    { phrase: 'Un chien ___.',                bonne: 'content',  choix: ['content','contente'], explication: 'exp_chien_est_masculin_content' },
    // CE2 : féminin irrégulier, pluriel en -x
    { phrase: 'Une chatte ___.',              bonne: 'blanche',  choix: ['blanc','blanche'],   explication: 'exp_chatte_est_feminin_blanche', niv: 'ce2' },
    { phrase: 'Un beau ___.',                 bonne: 'château',  choix: ['château','châteaux'], explication: 'exp_un_singulier_chateau', niv: 'ce2' },
    { phrase: 'De beaux ___.',                bonne: 'châteaux', choix: ['château','châteaux'], explication: 'exp_beaux_pluriel_chateaux', niv: 'ce2' },
    // nombre (gros, grosse : CE2)
    { phrase: 'Les ___ chiens aboient.',      bonne: 'gros',     choix: ['gros','grosse'],     explication: 'exp_chiens_est_pluriel_masculin_gros', niv: 'ce2' },
    { phrase: 'La ___ voiture est rouge.',    bonne: 'grosse',   choix: ['gros','grosse'],     explication: 'exp_voiture_est_feminin_grosse', niv: 'ce2' },
    // pluriel des noms en -x, -al/-aux (CE2)
    { phrase: 'Un bateau → des ___.',         bonne: 'bateaux',  choix: ['bateaus','bateaux'], explication: 'exp_les_noms_en_eau_font', niv: 'ce2' },
    { phrase: 'Un jeu → des ___.',            bonne: 'jeux',     choix: ['jeus','jeux'],       explication: 'exp_les_noms_en_eu_font', niv: 'ce2' },
    { phrase: 'Un gâteau → des ___.',         bonne: 'gâteaux',  choix: ['gâteaus','gâteaux'], explication: 'exp_les_noms_en_eau_font', niv: 'ce2' },
    { phrase: 'Un genou → des ___.',          bonne: 'genoux',   choix: ['genous','genoux'],   explication: 'exp_pluriel_irregulier_genou_genoux', niv: 'ce2' },
    { phrase: 'Un animal → des ___.',         bonne: 'animaux',  choix: ['animals','animaux'], explication: 'exp_les_noms_en_al_font', niv: 'ce2' },
    { phrase: 'Un journal → des ___.',        bonne: 'journaux', choix: ['journals','journaux'], explication: 'exp_les_noms_en_al_font', niv: 'ce2' },
    // CP : féminin en -e, pluriel en -s (exemples du programme : deux lapins, une olive/des olives, de jolis vélos,
    // une boulangère/un boulanger — BO n° 41 p. 92)
    { phrase: 'Une ___ robe.',                bonne: 'grande',   choix: ['grand','grande'],    explication: 'exp_robe_est_feminin_grande' },
    { phrase: 'Une pomme ___.',               bonne: 'verte',    choix: ['vert','verte'],      explication: 'exp_pomme_est_feminin_verte' },
    { phrase: 'Des chats ___.',               bonne: 'noirs',    choix: ['noir','noirs'],      explication: 'exp_chats_est_pluriel_noirs' },
    { phrase: 'Un lapin → deux ___.',         bonne: 'lapins',   choix: ['lapin','lapins'],    explication: 'exp_pluriel_en_s_lapins' },
    { phrase: 'Une olive → des ___.',         bonne: 'olives',   choix: ['olive','olives'],    explication: 'exp_pluriel_en_s_olives' },
    { phrase: 'De ___ vélos.',                bonne: 'jolis',    choix: ['joli','jolis'],      explication: 'exp_velos_est_pluriel_jolis' },
    { phrase: 'Une boulangère → un ___.',     bonne: 'boulanger', choix: ['boulanger','boulangère'], explication: 'exp_un_masculin_boulanger' },
    // CE1 : chaîne d'accords dans le groupe nominal (+e et +s)
    { phrase: 'Les ___ maisons.',             bonne: 'jolies',   choix: ['joli','jolie','jolis','jolies'], explication: 'exp_maisons_est_feminin_pluriel_jolies', niv: 'ce1' },
    { phrase: 'Des robes ___.',               bonne: 'vertes',   choix: ['verts','verte','vertes'], explication: 'exp_robes_est_feminin_pluriel_vertes', niv: 'ce1' },
  ],

  lettres: [
    // Doubles consonnes
    { type: 'saisie', phrase: 'Le la___in mange des carottes.', bonne: 'lapin',    indice: 'la___in' },
    { type: 'saisie', phrase: 'La ma___on est grande.',         bonne: 'maison',   indice: 'ma___on' },
    { type: 'saisie', phrase: 'J\'aime le choco___at.',         bonne: 'chocolat', indice: 'choco___at' },
    { type: 'saisie', phrase: 'Le papi___on est joli.',         bonne: 'papillon', indice: 'papi___on' },
    // Mots à compléter (saisie libre du mot entier)
    { type: 'saisie', phrase: 'Je man___ une pomme.',   bonne: 'mange',   indice: 'man___' },
    { type: 'saisie', phrase: 'Il fa___ froid.',         bonne: 'fait',    indice: 'fa___', niv: 'ce1' },
    { type: 'saisie', phrase: 'Elle es___ contente.',    bonne: 'est',     indice: 'es___' },
    { type: 'saisie', phrase: 'Le sol___ brille.',       bonne: 'soleil',  indice: 'sol___' },
    { type: 'saisie', phrase: 'Mon ___ s\'appelle Rex.', bonne: 'chien',   indice: '___ien' },
    { type: 'saisie', phrase: 'La ___ est belle.',       bonne: 'fleur',   indice: '___eur' },
    // Mots avec h muet / h aspiré
    { phrase: 'L\'___ est bleu.',                bonne: 'hibou', choix: ['ibou','hibou'],   explication: 'exp_hibou_s_ecrit_avec_un', niv: 'ce1' },
    { phrase: 'L\'___ chante.',                  bonne: 'oiseau', choix: ['wazeau','oiseau'], explication: 'exp_oiseau_commence_par_oi' },
    // Confusion son c/qu
    { phrase: 'Le ___ rit.',                     bonne: 'clown', choix: ['cloun','clown'],   explication: 'exp_clown_vient_de_l_anglais', niv: 'ce1' },
    { phrase: 'Je ___ une chanson.',             bonne: 'chante', choix: ['chante','shante'], explication: 'exp_chanter_s_ecrit_ch_ante' },
  ],
}
