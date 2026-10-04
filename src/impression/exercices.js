// Fiches d'exercices pré-générées (pages /telechargements/exercices-…) : pour chaque exercice et chaque classe,
// NB_VARIANTES fiches différentes. Le script de build ouvre la page de l'exercice en mode impression
// (?mode=imprimer), clique le bouton de niveau (`bouton`, expression régulière sur son texte), puis
// enregistre l'aperçu en PDF — c'est exactement la fiche que l'app produit. Fichier lu aussi par node : il
// n'importe que des données pures.
import { ACTIVITES } from '../data/activites.js'
import { classesEntre, CM } from '../data/classes.js'

export const NB_VARIANTES = 4

// bouton : niveau à choisir ; clics : réglages à activer en plus (texte des boutons, expressions régulières)
const C = (classe, bouton, clics = []) => ({ classe, bouton, clics })

// Fiches par compétence (plan 09, étape 5) : pour une classe, on ne coche que les options `seul` et on décoche les
// autres options de `choix` (celles de l'exercice) ; `clics` règle le reste. Les options sont des expressions
// régulières sur le libellé français du bouton, éventuellement précédées de la section (« Retenue › Mélangé »). Le
// build les retrouve sur la page en français et réutilise leur position pour les consignes en breton.
// classes : classes concernées (toutes celles de l'exercice si absent) ; competence : id de src/data/programme.js, ou
// { classe: id } quand il dépend de la classe
export const NB_VARIANTES_COMPETENCE = 2
const F = (id, titre, competence, seul, o = {}) => ({ id, titre, competence, seul, ...o })

const LISTE = [
  // ── Maths ──
  { id: 'calcul-mental', route: '/maths/calcul-mental', groupe: 'maths', titre: { fr: 'Calcul mental', br: 'Jediñ e penn' },
    classes: [
      C('cp', '^CP$', ['^Compléments à 10$|^Klokadurioù da 10$', '^Doubles$|^Doubloù$']),
      C('ce1', '^CE1$', ['^×$', '^Doubles$|^Doubloù$', '^Moitiés$|^Hanterioù$']),
      C('ce2', '^CE2$', ['^×$', '^÷$', '^Compléments à 100$|^Klokadurioù da 100$']),
      C('cm1', '^CM1$', ['^×$', '^÷$']),
      C('cm2', '^CM2$', ['^×$', '^÷$']),
    ],
    choix: ['^\\+$', '^−$', '^×$', '^÷$', '^Compléments à 10$', '^Compléments à 100$', '^Vers la dizaine', '^± dizaines', '^± 9', '^Passage de dizaine', '^Doubles$', '^Moitiés$', '^× 10'],
    fiches: [
      F('tables-addition', "les tables d'addition", 'tables-addition', ['^\\+$', '^−$'], { classes: ['cp', 'ce1', 'ce2'] }),
      F('tables-multiplication', 'les tables de multiplication', 'tables-multiplication', ['^×$'], { classes: ['ce1', 'ce2', ...CM] }),
      F('division', 'la division', 'sens-division', ['^÷$'], { classes: ['ce2', ...CM] }),
      F('complements', 'les compléments à 10', 'complement-dizaine', ['^Compléments à 10$'], { classes: ['cp'] }),
      F('complements', 'les compléments à la dizaine et à 100', 'complement-dizaine', ['^Compléments à 100$', '^Vers la dizaine'], { classes: ['ce1', 'ce2', ...CM] }),
      F('dizaines', 'ajouter des dizaines, passer la dizaine', 'ajouter-dizaines', ['^± dizaines', '^Passage de dizaine'], { classes: ['ce1', 'ce2', ...CM] }),
      F('ajouter-9', 'ajouter ou retirer 9 et 11', 'ajouter-9', ['^± 9'], { classes: ['ce1', 'ce2', ...CM] }),
      F('doubles-moities', 'doubles et moitiés', 'doubles-moities', ['^Doubles$', '^Moitiés$']),
      F('multiplier-10-100', 'multiplier par 10 et par 100', 'multiplier-10-100', ['^× 10'], { classes: ['ce1', 'ce2', ...CM] }),
    ] },
  { id: 'calcul-pose', route: '/maths/calcul-pose', groupe: 'maths', titre: { fr: 'Calcul posé', br: 'Jedadurioù lakaet' },
    classes: [C('cp', '^2'), C('ce1', '^3'), C('cm1', '^4')],
    fiches: [
      F('addition', "l'addition posée", 'addition-posee', ['Opération › Addition'], { clics: ['Retenue › ^Mélangé$'] }),
      F('soustraction', 'la soustraction posée', 'soustraction-posee', ['Opération › Soustraction'], { clics: ['Retenue › ^Mélangé$'], classes: ['ce1', 'cm1'] }),
    ] },
  { id: 'nombres', route: '/maths/numeration', groupe: 'maths', titre: { fr: 'Les nombres', br: 'An niveroù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Décomposer', 'Représentation', 'Écrire en chiffres', 'Écrire en lettres', 'Comparer', 'Suivant', 'Droite graduée', 'Ranger'],
    fiches: [
      F('numeration', 'lire, écrire et décomposer les nombres', { ce1: 'numeration-1000', ce2: 'numeration-10000' }, ['Décomposer', 'Représentation', 'Écrire en chiffres']),
      F('en-lettres', 'écrire les nombres en lettres', 'nombres-en-lettres', ['Écrire en lettres']),
      F('comparer-ranger', 'comparer et ranger', 'comparer-ranger', ['Comparer', 'Ranger']),
      F('suites', 'les suites de nombres', 'suites-nombres', ['Suivant']),
      F('droite', 'la droite graduée', 'droite-graduee', ['Droite graduée']),
    ] },
  { id: 'problemes', route: '/maths/problemes', groupe: 'maths', titre: { fr: 'Problèmes', br: 'Kudennoù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Ajout', 'Comparaison', 'Parties et tout', 'Multiplication', 'Partage', 'Fois plus', 'Plusieurs étapes'],
    fiches: [
      F('additifs', "problèmes d'addition et de soustraction", 'problemes-additifs', ['Ajout', 'Comparaison', 'Parties et tout']),
      F('multiplicatifs', 'problèmes de multiplication et de partage', 'problemes-multiplicatifs', ['Multiplication', 'Partage']),
      F('etapes', 'problèmes en plusieurs étapes', 'problemes-etapes', ['Plusieurs étapes']),
    ] },
  { id: 'fractions', route: '/maths/fractions', groupe: 'maths', titre: { fr: 'Les fractions', br: 'An darnaouennoù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Quelle fraction', 'Colorier', 'En lettres', 'La moitié de', 'Fractions égales', 'Lire sur la droite', 'Placer sur la droite'],
    fiches: [
      F('unitaires', 'un demi, un tiers, un quart…', 'fractions-unitaires', ['Quelle fraction', 'Colorier', 'En lettres'], { clics: ['Fractions › Un demi'] }),
      F('moitie', 'la moitié de…', 'doubles-moities', ['La moitié de']),
      F('fractions-1', 'les fractions jusqu’à 1 (2/3, 3/4…)', 'fractions-inferieures-1', ['Quelle fraction', 'Colorier', 'En lettres'], { clics: ['Fractions › Aussi'], classes: ['ce2'] }),
      F('egales', 'les fractions égales', 'fractions-egales', ['Fractions égales'], { classes: ['ce2'] }),
      F('droite', 'les fractions sur la droite', 'fractions-mesure', ['Lire sur la droite', 'Placer sur la droite'], { classes: ['ce2'] }),
    ] },
  { id: 'heure', route: '/maths/heure', groupe: 'maths', titre: { fr: "Lire l'heure", br: 'Lenn an eur' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ["Lire l'heure", 'Placer les aiguilles', 'Matin', 'Durées', 'h et min', 'Emploi du temps'],
    fiches: [
      F('lire', "lire et placer l'heure (demies et quarts)", 'heure-demi-quart', ["Lire l'heure", 'Placer les aiguilles', 'Matin'], { classes: ['ce1'] }),
      F('lire', "lire et placer l'heure à la minute près", 'heure-minutes', ["Lire l'heure", 'Placer les aiguilles'], { classes: ['ce2'] }),
      F('durees', 'les durées', 'durees', ['Durées', 'h et min', 'Emploi du temps']),
    ] },
  { id: 'monnaie', route: '/maths/monnaie', groupe: 'maths', titre: { fr: 'La monnaie', br: 'Ar moneiz' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Compter une somme', 'Faire une somme', 'Le moins de pièces', 'Rendre la monnaie', 'Comparer', '1 € = 100 c'],
    fiches: [
      F('compter', 'compter et faire une somme', 'monnaie-euros', ['Compter une somme', 'Faire une somme', 'Le moins de pièces', 'Comparer']),
      F('rendre', 'rendre la monnaie', 'monnaie-euros', ['Rendre la monnaie']),
      F('centimes', 'les euros et les centimes', 'monnaie-centimes', ['Compter une somme', 'Faire une somme', '1 € = 100 c'], { clics: ['Options › Avec centimes'], classes: ['ce2'] }),
    ] },
  { id: 'mesures', route: '/maths/mesures', groupe: 'maths', titre: { fr: 'Mesures', br: 'Muzulioù' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Mesurer à la règle', 'Unité adaptée', 'Conversions', 'Comparer', 'Masses', 'Contenances', 'Calendrier'],
    fiches: [
      F('longueurs', 'les longueurs', 'longueurs', ['Mesurer à la règle', 'Unité adaptée', 'Conversions', 'Comparer']),
      F('masses', 'les masses', 'masses', ['Masses']),
      F('contenances', 'les contenances', 'contenances', ['Contenances'], { classes: ['ce2'] }),
    ] },
  { id: 'geometrie', route: '/maths/geometrie', groupe: 'maths', titre: { fr: 'Géométrie', br: 'Mentoniezh' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Symétrie', 'Reproduction', 'Repérage', 'Figures', 'Solides', 'Angles droits', 'Propriétés', 'Cercle', 'Patrons'],
    fiches: [
      F('reproduction', 'reproduire des figures', 'tracer-figures', ['Reproduction']),
      F('reperage', 'se repérer sur un quadrillage', 'reperage-deplacements', ['Repérage']),
      F('figures', 'les figures planes', 'figures-planes', ['Figures'], { classes: ['ce1'] }),
      F('figures', 'les figures planes et le cercle', 'figures-planes', ['Figures', 'Propriétés', 'Cercle'], { classes: ['ce2'] }),
      F('solides', 'les solides', 'solides', ['Solides']),
      F('symetrie', 'la symétrie', 'symetrie', ['Symétrie'], { classes: ['ce2'] }),
      F('angles', "l'angle droit", 'angle-droit', ['Angles droits'], { classes: ['ce2'] }),
      F('patrons', 'les patrons du cube', 'patrons', ['Patrons'], { classes: ['ce2'] }),
    ] },
  // ── Français (contenu en français, consignes traduites) ──
  { id: 'dictee', route: '/francais/dictee', groupe: 'francais', titre: { fr: 'Dictée', br: 'Skrivadeg' },
    classes: [C('cp', '^CP$'), C('ce1', '^CE1$'), C('ce2', '^CE2$'), C('cm1-cm2', '^CM$')] },
  { id: 'grammaire', route: '/francais/grammaire', groupe: 'francais', titre: { fr: 'Grammaire', br: 'Yezhadur' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$'), C('cm1', '^CM1$'), C('cm2', '^CM2$')],
    choix: ['Mots dans l', 'Phrase ou pas', 'Majuscule et point', 'Types de phrases', 'forme négative', 'Affirmative ou négative', 'Phrase simple',
      'Trouver le verbe', 'Trouver les noms', 'Trouver les déterminants', 'Trouver les adjectifs', "Nature d'un mot", 'Nom principal',
      'Trouver le sujet', 'Il, elle', 'complément de phrase', 'Où \\? Quand', 'Complément du verbe', 'Masculin', 'Singulier', 'Mettre au pluriel', "Accorder l'adjectif", 'Il chante'],
    fiches: [
      F('phrase', 'la phrase', 'phrase', ['Mots dans l', 'Phrase ou pas', 'Majuscule et point', 'Types de phrases', 'forme négative', 'Affirmative ou négative', 'Phrase simple']),
      F('nature', 'la nature des mots', 'classes-mots', ['Trouver les noms', 'Trouver les déterminants', 'Trouver les adjectifs', "Nature d'un mot", 'Nom principal']),
      F('sujet-verbe', 'le verbe et son sujet', 'sujet-verbe', ['Trouver le verbe', 'Trouver le sujet', 'Il, elle', 'Il chante']),
      F('accords', 'genre, nombre et accords', 'accords-gn', ['Masculin', 'Singulier', 'Mettre au pluriel', "Accorder l'adjectif"]),
      F('complements', 'les compléments', 'complements', ['complément de phrase', 'Où \\? Quand', 'Complément du verbe'], { classes: CM }),
    ] },
  { id: 'conjugaison', route: '/francais/conjugaison', groupe: 'francais', titre: { fr: 'Conjugaison', br: 'Displegañ' },
    classes: [C('cp', '^CP$'), C('ce1', '^CE1$'), C('ce2', '^CE2$'), C('cm1', '^CM1$'), C('cm2', '^CM2$')],
    // par temps, avec les verbes du niveau (décision de l'utilisateur) ; au CP, le présent seul : le bilan suffit
    choix: ['^Présent$', '^Imparfait$', '^Futur$', '^Passé composé$', '^Passé simple$', '^Plus-que-parfait$'],
    fiches: [
      ...[['present', 'le présent', '^Présent$'], ['imparfait', "l'imparfait", '^Imparfait$'], ['futur', 'le futur', '^Futur$'], ['passe-compose', 'le passé composé', '^Passé composé$']]
        .map(([id, titre, re]) => F(id, titre, 'conjugaison-4-temps', [re], { classes: ['ce1', 'ce2', ...CM] })),
      F('passe-simple', 'le passé simple', 'conjugaison-passe-simple', ['^Passé simple$'], { classes: ['cm2'] }),
      F('plus-que-parfait', 'le plus-que-parfait', 'conjugaison-passe-simple', ['^Plus-que-parfait$'], { classes: ['cm2'] }),
    ] },
  { id: 'vocabulaire', route: '/francais/vocabulaire', groupe: 'francais', titre: { fr: 'Vocabulaire', br: 'Geriaoueg' },
    classes: [C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    choix: ['Ranger des mots', 'Lettre avant', 'Mots-repères', 'Définitions', 'Le sens dans la phrase', 'Contraires', 'Mots de même sens', 'se disent pareil',
      'Sens propre', 'Familles de mots', 'Préfixes', 'Suffixes', 'Mot étiquette', 'Intrus dans une catégorie'],
    fiches: [
      F('ordre-alphabetique', "l'ordre alphabétique et le dictionnaire", 'ordre-alphabetique', ['Ranger des mots', 'Lettre avant', 'Mots-repères', 'Définitions', 'Le sens dans la phrase']),
      F('sens', 'le sens des mots', 'synonymes-antonymes', ['Contraires', 'Mots de même sens', 'Sens propre']),
      F('familles', 'familles de mots, préfixes et suffixes', 'familles-mots', ['Familles de mots', 'Préfixes', 'Suffixes']),
      F('categories', 'les catégories de mots', 'familles-mots', ['Mot étiquette', 'Intrus dans une catégorie'], { classes: ['ce1'] }),
    ] },
  { id: 'orthographe', route: '/francais/orthographe', groupe: 'francais', titre: { fr: 'Orthographe', br: 'Reizhskrivañ' },
    // cp-cm2 : tous les niveaux, homophones (fiche publiée avant les niveaux) ; puis une fiche « Accords » par niveau
    classes: [C('cp-cm2', '^CP → CM2$'), C('cp', '^CP$'), C('ce1', '^CE1$'), C('ce2', '^CE2$')],
    // le bilan d'une classe est la fiche « Accords » (thème par défaut)
    choix: ['Accords', 'Lettres manquantes', 'Homophones'],
    fiches: [
      F('lettres-manquantes', 'les lettres manquantes', 'orthographe-lexicale', ['Lettres manquantes'], { classes: ['cp', 'ce1', 'ce2'] }),
      F('homophones', 'les homophones (pour aller plus loin)', 'orthographe-lexicale', ['Homophones'], { classes: ['ce2'] }),
    ] },
  // ── Maternelle ──
  { id: 'compter', route: '/maternelle/compter', groupe: 'maternelle', titre: { fr: 'Compter les objets', br: 'Kontañ an traoù' },
    classes: [C('ps', '\\bPS\\b'), C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'comparer', route: '/maternelle/comparer', groupe: 'maternelle', titre: { fr: 'Comparer les quantités', br: "Keñveriañ ar c'hementadoù" },
    classes: [C('ps', '\\bPS\\b'), C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'ranger', route: '/maternelle/ordonner', groupe: 'maternelle', titre: { fr: 'Ranger les nombres', br: 'Renkañ an niveroù' },
    classes: [C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'lettres', route: '/maternelle/lettres', groupe: 'maternelle', titre: { fr: 'Les lettres', br: 'Al lizherennoù' },
    classes: [C('gs-cp', null)] },
  { id: 'longueurs', route: '/maternelle/longueurs', groupe: 'maternelle', titre: { fr: 'Plus long, plus court', br: 'Hiroc’h, berroc’h' }, // br: à relire
    classes: [C('ps', '\\bPS\\b'), C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'motifs', route: '/maternelle/motifs', groupe: 'maternelle', titre: { fr: 'Les motifs', br: 'Ar patromoù' }, // br: à relire
    classes: [C('ps', '\\bPS\\b'), C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  // ms-gs : slug publié avant les niveaux, garde le niveau par défaut (MS : disque, carré, triangle) ; puis PS et GS
  { id: 'formes', route: '/maternelle/formes', groupe: 'maternelle', titre: { fr: 'Les formes', br: 'Ar stummoù' },
    classes: [C('ps', '\\bPS\\b'), C('ms-gs', null), C('gs', '\\bGS\\b')] },
  // ── Culture générale ──
  { id: 'quiz', route: '/autres', groupe: 'autres', titre: { fr: 'Quiz culture générale', br: 'Quiz sevenadur hollek' },
    classes: [C('cp-cm2', null)] },
]

// domaine du programme : celui de l'activité de même route (activites.js) ; null hors programme (culture générale)
export const EXERCICES = LISTE.map(ex => ({ ...ex, genre: 'exercice', domaine: ACTIVITES.find(a => a.to === ex.route)?.domaine ?? null }))

// fiches par compétence d'une classe d'un exercice
export const fichesDe = (ex, classe) => (ex.fiches ?? []).filter(f => !f.classes || f.classes.includes(classe))
  .map(f => ({ ...f, competence: typeof f.competence === 'object' ? f.competence[classe] : f.competence }))

// « ce1 » → ['ce1'] ; « cp-cm2 » → toutes les classes de CP à CM2
export function classesDe(code) {
  const [a, b] = code.split('-')
  return b ? classesEntre(a, b) : [a]
}
export const etiquetteClasse = code => code.split('-').map(c => c.toUpperCase()).join(' → ')
