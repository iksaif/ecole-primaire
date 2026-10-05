// @ts-check
// Les mesures — données par niveau (objets, conversions proposées, balances, brocs…). Les exercices proposés viennent
// de la définition (options du niveau) ; ici, ce que chaque exercice tire. Le CE1 et le CE2 ont la même forme.

// objetsUnite : la phrase (catalogue de contenu, `phrases[id]`) se lit « texte valeur … » (« Une pomme pèse 150 … »).
const OBJETS_UNITE_CE1 = [
  { id: 'crayon', valeur: 15, unite: 'cm' },
  { id: 'gomme', valeur: 4, unite: 'cm' },
  { id: 'cahier', valeur: 17, unite: 'cm' },
  { id: 'cuillere', valeur: 12, unite: 'cm' },
  { id: 'porte', valeur: 2, unite: 'm' },
  { id: 'piscine', valeur: 25, unite: 'm' },
  { id: 'arbre', valeur: 15, unite: 'm' },
  { id: 'classe', valeur: 8, unite: 'm' },
  { id: 'parisMarseille', valeur: 775, unite: 'km' },
  { id: 'voitureHeure', valeur: 90, unite: 'km' },
  { id: 'villes', valeur: 30, unite: 'km' },
  { id: 'pomme', valeur: 150, unite: 'g' },
  { id: 'gommeMasse', valeur: 20, unite: 'g' },
  { id: 'stylo', valeur: 10, unite: 'g' },
  { id: 'chocolat', valeur: 100, unite: 'g' },
  { id: 'enfant', valeur: 25, unite: 'kg' },
  { id: 'chien', valeur: 15, unite: 'kg' },
  { id: 'pasteque', valeur: 4, unite: 'kg' },
  { id: 'voiture', valeur: 1000, unite: 'kg' },
  { id: 'baignoire', valeur: 150, unite: 'L' },
  { id: 'seau', valeur: 10, unite: 'L' },
  { id: 'arrosoir', valeur: 5, unite: 'L' },
  { id: 'aquarium', valeur: 50, unite: 'L' },
]
// CE1 : pas encore de contenances (litre : CE2)
const OBJETS_UNITE_CE1_SANS_L = OBJETS_UNITE_CE1.filter(o => o.unite !== 'L')
const OBJETS_CONTENANCE_CE1 = [
  { id: 'bouteille', valeur: 1, unite: 'L' },
  { id: 'seau', valeur: 10, unite: 'L' },
  { id: 'baignoire', valeur: 150, unite: 'L' },
  { id: 'arrosoir', valeur: 5, unite: 'L' },
  { id: 'brique', valeur: 1, unite: 'L' },
  { id: 'piscineGonflable', valeur: 500, unite: 'L' },
]


export const DONNEES = {
  ce1: {
    // programme du CE1 : longueurs (m, cm, km) et masses (g, kg) ; les contenances commencent au CE2
    regle: { max: 20, segMin: 2, segMax: 15, px: 32, mm: false },  // en cm entiers
    fiche: { segMin: 3, segMax: 12, mm: false },                   // segments imprimés (tiennent sur A4)
    unites: ['cm', 'm', 'km', 'g', 'kg'],
    objetsUnite: OBJETS_UNITE_CE1_SANS_L,
    // CE1 : 1 m = 100 cm ; 1 km = 1 000 m et 1 kg = 1 000 g seulement (nombres ≤ 1 000)
    conversions: ['m-cm', 'mcm-cm', 'cm-m', 'km-m', 'm-km', 'kg-g', 'g-kg'],
    kmMax: 1, kgMax: 1,
    comparaisons: ['m-cm', 'mcm-cm', 'km-m', 'kg-g'],
    boiteMasses: [1, 2, 2, 5, 10, 20, 20, 50, 100, 200, 200, 500],   // en g (boîte de masses marquées)
    boiteKg: [1, 1, 2, 5],                                           // en kg
    masses: ['equilibre', 'equilibre', 'equilibreKg', 'boites', 'seuil'],
    seuils: [100, 200, 500, 1000],                                   // en g
    calendrier: ['demain', 'hier', 'dansN', 'semaine', 'moisApres', 'moisAvant', 'numMois', 'semainesJours', 'moisAnnee'],
    dansN: [2, 5],
  },
  ce2: {
    regle: { max: 15, segMin: 2, segMax: 12, px: 44, mm: true },   // mesure en cm et mm
    fiche: { segMin: 3, segMax: 11, mm: true },
    unites: ['mm', 'cm', 'm', 'km', 'g', 'kg', 'L', 'dL', 'cL'],
    objetsUnite: [
      ...OBJETS_UNITE_CE1,
      { id: 'fourmi', valeur: 4, unite: 'mm' },
      { id: 'piece', valeur: 2, unite: 'mm' },
      { id: 'cahierEpaisseur', valeur: 5, unite: 'mm' },
      { id: 'canette', valeur: 33, unite: 'cL' },
      { id: 'verre', valeur: 20, unite: 'cL' },
      { id: 'bol', valeur: 3, unite: 'dL' },
      { id: 'yaourt', valeur: 12, unite: 'cL' },
    ],
    conversions: ['cm-mm', 'cmmm-mm', 'mm-cm', 'm-cm', 'mcm-cm', 'cm-m', 'km-m', 'kmm-m', 'kg-g', 'kgg-g', 'g-kg', 'L-dL', 'L-cL', 'dL-cL'],
    kmMax: 9, kgMax: 9,
    comparaisons: ['cm-mm', 'm-cm', 'mcm-cm', 'km-m', 'kg-g', 'L-cL', 'L-dL'],
    boiteMasses: [1, 2, 2, 5, 10, 20, 20, 50, 100, 200, 200, 500],
    boiteKg: [1, 1, 2, 5],
    masses: ['equilibre', 'equilibreMix', 'equilibreKg', 'boites', 'seuil'],
    seuils: [100, 200, 500, 1000, 2000],
    contenances: ['broc', 'bouteilles', 'verres', 'unite'],
    brocs: [{ max: 10, u: 'dL' }, { max: 5, u: 'L' }, { max: 10, u: 'L' }],
    bouteilles: { max1: 5, max2: 4 },
    objetsContenance: [
      ...OBJETS_CONTENANCE_CE1,
      { id: 'verre', valeur: 20, unite: 'cL' },
      { id: 'canette', valeur: 33, unite: 'cL' },
      { id: 'bol', valeur: 3, unite: 'dL' },
      { id: 'tasse', valeur: 2, unite: 'dL' },
    ],
    unitesContenance: ['L', 'dL', 'cL', 'kg', 'm'],
    calendrier: ['dansN', 'moisApres', 'moisAvant', 'numMois', 'semainesJours', 'joursSemaines', 'joursMois', 'dansJours', 'dateDans'],
    dansN: [3, 10],
  },
}


export const JOURS_MOIS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
