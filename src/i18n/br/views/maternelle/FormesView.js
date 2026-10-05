// Textes de l'interface — FormesView (breton). Traduction automatique : les passages marqués
// « br: à relire » sont à faire vérifier par un brittophone (`npm run i18n:relecture`).
export default {
    titre: 'Ar stummoù',
    exercice: 'Poelladenn',
    niv_ps: '🐣 PS — rummañ', niv_ms: '🌱 MS — anavezout', niv_gs: '🌳 GS — envel', // br: à relire
    meme: 'An hevelep stumm', memeDesc: 'Kav ar stumm heñvel ouzh ar patrom', // br: à relire
    consigneMeme: "Stok ouzh ar stumm a zo heñvel.", // br: à relire
    erreurMeme: '❌ Sell mat ouzh stumm ar patrom', // br: à relire
    noteFichePS: "Fichenn : liv an holl stummoù heñvel ouzh ar patrom.", // br: à relire
    fConsignePS: 'Liv an holl stummoù evel hemañ.', // br: à relire
    reconnaitre: 'Anaout', reconnaitreDesc: 'Kav anv ar stumm',
    compter: "Kontañ ar c'hostezioù", combienCotes: 'Pet kostez en deus ar stumm-mañ ?', // br: à relire
    trouver: 'Kavout ar stumm', trouverDesc: 'Diskouez ar stumm a vez goulennet',
    commentSappelle: 'Petra eo anv ar stumm-mañ ?',
    montre: 'Diskouez :',
    changer: '⚙️ Cheñch',
    res100: 'Dispar ! Anaout a rez an holl stummoù ! 🏆',
    res75: 'Mat-tre ! 🌟',
    res50: "Mat ! Sell ouzh ar stummoù en-dro dit 💪",
    res0: 'Kalon vat ! Sell ouzh ar stummoù er c\'hlas 📐',
    // br: à relire
    noteFiche: 'Fichenn : liv pep stumm gant e liv, ha kont anezho.',
    fConsigne: 'Liv pep stumm gant al liv mat.',
    fCompte: 'Pet a zo ? Skriv an niver.',
    rouge: 'ruz', bleu: 'glas', vert: 'gwer', jaune: 'melen',
    // Corrections ; {nom} = nom de la forme dans la langue du contenu
    erreurNom: '❌ Ar respont mat a oa {nom}',
    // br: à relire (« kostez » = côté d'un polygone)
    erreurCotes: ({ n }) => `❌ ${n === 0 ? 'Kostez eeun ebet' : 'Niver a gostezioù : ' + n}`,
    erreurForme: '❌ Ar respont mat a oa {nom}',
    choixForme: 'Stumm {n}', // br: à relire
  }
