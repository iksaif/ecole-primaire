// Trier les images — textes de CONTENU : le nom des images et des boîtes (corpus.ts), les consignes (dites à l'écran, écrites sur la fiche)
// et ce que la fiche écrit. Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les textes de l'INTERFACE
// (réglages, retours du jeu) sont dans src/langues/<langue>/textes/trier.ts.
// `mot.<emoji>` : le nom de l'image (texte alternatif, lu par les lecteurs d'écran) ; `boite.<id>` : le nom d'une boîte.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Trier les images',
  consigne: {
    groupes: 'Dans quel groupe va cette image ?',
    matieres: 'En quoi est fait cet objet ?',
    deplacements: 'Comment cet animal se déplace-t-il ?',
    mange: 'Que mange cet animal ?',
  },
  consigneFiche: {
    groupes: 'Entoure le groupe où va chaque image.',
    matieres: 'Entoure la matière dont est fait chaque objet.',
    deplacements: 'Entoure comment chaque animal se déplace.',
    mange: 'Entoure ce que mange chaque animal.',
    plusieurs: 'Entoure la bonne boîte pour chaque image.',
  },
  boite: {
    animaux: 'animaux',
    fruits: 'fruits',
    vehicules: 'véhicules',
    vetements: 'vêtements',
    bois: 'bois',
    metal: 'métal',
    tissu: 'tissu',
    papier: 'papier',
    verre: 'verre',
    vole: 'vole',
    nage: 'nage',
    marche: 'marche',
    carotte: 'carotte',
    os: 'os',
    poisson: 'poisson',
    herbe: 'herbe',
    graine: 'graines',
    banane: 'banane',
    fromage: 'fromage',
    miel: 'miel',
  },
  mot: {
    chien: 'chien',
    chat: 'chat',
    lapin: 'lapin',
    vache: 'vache',
    cochon: 'cochon',
    lion: 'lion',
    pomme: 'pomme',
    banane: 'banane',
    fraise: 'fraise',
    orange: 'orange',
    raisin: 'raisin',
    citron: 'citron',
    voiture: 'voiture',
    bus: 'bus',
    velo: 'vélo',
    avion: 'avion',
    bateau: 'bateau',
    tshirt: 'tee-shirt',
    pantalon: 'pantalon',
    robe: 'robe',
    echarpe: 'écharpe',
    gant: 'gant',
    chaussette: 'chaussette',
    chaise: 'chaise',
    porte: 'porte',
    echelle: 'échelle',
    cle: 'clé',
    conserve: 'boîte de conserve',
    cloche: 'cloche',
    cuillere: 'cuillère',
    journal: 'journal',
    enveloppe: 'enveloppe',
    cahier: 'cahier',
    livre: 'livre',
    lunettes: 'lunettes',
    ampoule: 'ampoule',
    pot: 'pot en verre',
    papillon: 'papillon',
    abeille: 'abeille',
    hibou: 'hibou',
    aigle: 'aigle',
    poisson: 'poisson',
    baleine: 'baleine',
    dauphin: 'dauphin',
    requin: 'requin',
    cheval: 'cheval',
    elephant: 'éléphant',
    girafe: 'girafe',
    ours: 'ours',
    souris: 'souris',
    poule: 'poule',
    singe: 'singe',
  },
}, {
  br: {
    titre: 'Rummata ar skeudennoù', // br: à relire
    consigne: {
      groupes: 'E peseurt strollad emañ ar skeudenn-mañ ?', // br: à relire
      matieres: 'Eus petra eo great an traoù-mañ ?', // br: à relire
      deplacements: 'Penaos e vev an aneval-mañ ?', // br: à relire
      mange: 'Petra a zebr an aneval-mañ ?', // br: à relire
    },
    consigneFiche: {
      groupes: "Kelc'h ar strollad a zere evit pep skeudenn.", // br: à relire
      matieres: "Kelc'h an danvez great pep tra ganti.", // br: à relire
      deplacements: "Kelc'h penaos e vev pep aneval.", // br: à relire
      mange: "Kelc'h ar pezh a zebr pep aneval.", // br: à relire
      plusieurs: "Kelc'h ar voestad vat evit pep skeudenn.", // br: à relire
    },
    boite: {
      animaux: 'loened', // br: à relire
      fruits: 'frouezh', // br: à relire
      vehicules: 'karrioù', // br: à relire
      vetements: 'dilhad', // br: à relire
      bois: 'koad', // br: à relire
      metal: 'metal', // br: à relire
      tissu: 'mezher', // br: à relire
      papier: 'paper', // br: à relire
      verre: 'gwer', // br: à relire
      vole: 'nijal', // br: à relire
      nage: 'neuial', // br: à relire
      marche: 'kerzhet', // br: à relire
      carotte: 'karotenn', // br: à relire
      os: 'askorn', // br: à relire
      poisson: 'pesk', // br: à relire
      herbe: 'geot', // br: à relire
      graine: 'greun', // br: à relire
      banane: 'bananenn', // br: à relire
      fromage: 'fourmaj', // br: à relire
      miel: 'mel', // br: à relire
    },
    mot: {
      chien: 'ki', // br: à relire
      chat: 'kazh', // br: à relire
      lapin: 'konikl', // br: à relire
      vache: "bioc'h", // br: à relire
      cochon: "pemoc'h", // br: à relire
      lion: 'leon', // br: à relire
      pomme: 'aval', // br: à relire
      banane: 'bananenn', // br: à relire
      fraise: 'sivienn', // br: à relire
      orange: 'orañjez', // br: à relire
      raisin: 'rezin', // br: à relire
      citron: 'sitroñsenn', // br: à relire
      voiture: 'karr', // br: à relire
      bus: 'bus', // br: à relire
      velo: "marc'h houarn", // br: à relire
      avion: 'karr-nij', // br: à relire
      bateau: 'bag', // br: à relire
      tshirt: 'tricot', // br: à relire
      pantalon: 'bragoù', // br: à relire
      robe: 'sae', // br: à relire
      echarpe: 'gwilioud', // br: à relire
      gant: 'maneg', // br: à relire
      chaussette: 'chaousetenn', // br: à relire
      chaise: 'kador', // br: à relire
      porte: 'dor', // br: à relire
      echelle: 'skeul', // br: à relire
      cle: "alc'hwez", // br: à relire
      conserve: 'boestad-gwarez', // br: à relire
      cloche: "klec'h", // br: à relire
      cuillere: 'loa', // br: à relire
      journal: 'kazetenn', // br: à relire
      enveloppe: 'golo-lizher', // br: à relire
      cahier: 'kaier', // br: à relire
      livre: 'levr', // br: à relire
      lunettes: 'lunedoù', // br: à relire
      ampoule: 'goulaouenn', // br: à relire
      pot: 'pod gwer', // br: à relire
      papillon: 'balafenn', // br: à relire
      abeille: 'gwenanenn', // br: à relire
      hibou: 'kaouenn', // br: à relire
      aigle: 'erer', // br: à relire
      poisson: 'pesk', // br: à relire
      baleine: 'balumenn', // br: à relire
      dauphin: 'dolfin', // br: à relire
      requin: 'rekin', // br: à relire
      cheval: "marc'h", // br: à relire
      elephant: 'olifant', // br: à relire
      girafe: 'jirafenn', // br: à relire
      ours: 'arzh', // br: à relire
      souris: 'logodenn', // br: à relire
      poule: 'yar', // br: à relire
      singe: 'marmouz', // br: à relire
    },
  },
})
