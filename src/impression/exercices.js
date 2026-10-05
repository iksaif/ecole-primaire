// Fiches d'exercices pré-générées (pages /telechargements/exercices-…) : pour chaque exercice et chaque classe,
// NB_VARIANTES fiches différentes. Le script de build ouvre la page de l'exercice en mode impression
// (?mode=imprimer), clique le bouton de niveau (`bouton`, expression régulière sur son texte), puis
// enregistre l'aperçu en PDF — c'est exactement la fiche que l'app produit. Fichier lu aussi par node : il
// n'importe que des données pures.
import { ACTIVITES } from '../data/activites.js'
import { classesEntre } from '../data/classes.js'
import HEURE from '../exercices/heure/definition.js'
import MONNAIE from '../exercices/monnaie/definition.js'
import MESURES from '../exercices/mesures/definition.js'
import CONJUGAISON from '../exercices/conjugaison/definition.js'
import GRAMMAIRE from '../exercices/grammaire/definition.js'
import VOCABULAIRE from '../exercices/vocabulaire/definition.js'
import ORTHOGRAPHE from '../exercices/orthographe/definition.js'
import LETTRES from '../exercices/lettres/definition.js'
import NUMERATION from '../exercices/numeration/definition.js'
import FRACTIONS from '../exercices/fractions/definition.js'
import GEOMETRIE from '../exercices/geometrie/definition.js'
import ORDONNER from '../exercices/ordonner/definition.js'
import CALCUL_MENTAL from '../exercices/calcul-mental/definition.js'
import PROBLEMES from '../exercices/problemes/definition.js'
import CALCUL_POSE from '../exercices/calcul-pose/definition.js'

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
// classes qui ont la fiche `id` dans la définition d'un exercice
const classesFiche = (definition, id) => definition.fiches.filter(f => f.id === id).map(f => f.niveau)

const LISTE = [
  // ── Maths ──
  { id: 'calcul-mental', route: '/maths/calcul-mental', groupe: 'maths', titre: { fr: 'Calcul mental', br: 'Jediñ e penn' },
    // classes et fiches : celles de la définition (src/exercices/calcul-mental/definition.js)
    classes: [
      C('cp', '^CP$', ['^Compléments à 10$|^Klokadurioù da 10$', '^Doubles$|^Doubloù$']),
      C('ce1', '^CE1$', ['^×$', '^Doubles$|^Doubloù$', '^Moitiés$|^Hanterioù$']),
      C('ce2', '^CE2$', ['^×$', '^÷$', '^Compléments à 100$|^Klokadurioù da 100$']),
      C('cm1', '^CM1$', ['^×$', '^÷$']),
      C('cm2', '^CM2$', ['^×$', '^÷$']),
    ],
    choix: ['^\\+$', '^−$', '^×$', '^÷$', '^Compléments à 10$', '^Compléments à 100$', '^Vers la dizaine', '^± dizaines', '^± 9', '^Passage de dizaine', '^Doubles$', '^Moitiés$', '^× 10'],
    fiches: [
      F('tables-addition', "les tables d'addition", 'tables-addition', ['^\\+$', '^−$'], { classes: classesFiche(CALCUL_MENTAL, 'tables-addition') }),
      F('tables-multiplication', 'les tables de multiplication', 'tables-multiplication', ['^×$'], { classes: classesFiche(CALCUL_MENTAL, 'tables-multiplication') }),
      F('division', 'la division', 'sens-division', ['^÷$'], { classes: classesFiche(CALCUL_MENTAL, 'division') }),
      F('complements', 'les compléments à 10', 'complement-dizaine', ['^Compléments à 10$'], { classes: classesFiche(CALCUL_MENTAL, 'complements').filter(n => n === 'cp') }),
      F('complements', 'les compléments à la dizaine et à 100', 'complement-dizaine', ['^Compléments à 100$', '^Vers la dizaine'], { classes: classesFiche(CALCUL_MENTAL, 'complements').filter(n => n !== 'cp') }),
      F('dizaines', 'ajouter des dizaines, passer la dizaine', 'ajouter-dizaines', ['^± dizaines', '^Passage de dizaine'], { classes: classesFiche(CALCUL_MENTAL, 'dizaines') }),
      F('ajouter-9', 'ajouter ou retirer 9 et 11', 'ajouter-9', ['^± 9'], { classes: classesFiche(CALCUL_MENTAL, 'ajouter-9') }),
      F('doubles-moities', 'doubles et moitiés', 'doubles-moities', ['^Doubles$', '^Moitiés$'], { classes: classesFiche(CALCUL_MENTAL, 'doubles-moities') }),
      F('multiplier-10-100', 'multiplier par 10 et par 100', 'multiplier-10-100', ['^× 10'], { classes: classesFiche(CALCUL_MENTAL, 'multiplier-10-100') }),
    ] },
  { id: 'calcul-pose', route: '/maths/calcul-pose', groupe: 'maths', titre: { fr: 'Calcul posé', br: 'Jedadurioù lakaet' },
    // classes et fiches : celles de la définition ; chaque niveau a la taille des nombres de son programme par défaut
    classes: Object.keys(CALCUL_POSE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    fiches: [
      F('addition', "l'addition posée", 'addition-posee', ['Opération › Addition'], { clics: ['Retenue › ^Mélangé$'], classes: classesFiche(CALCUL_POSE, 'addition') }),
      F('soustraction', 'la soustraction posée', 'soustraction-posee', ['Opération › Soustraction'], { clics: ['Retenue › ^Mélangé$'], classes: classesFiche(CALCUL_POSE, 'soustraction') }),
    ] },
  { id: 'nombres', route: '/maths/numeration', groupe: 'maths', titre: { fr: 'Les nombres', br: 'An niveroù' },
    // classes et fiches : celles de la définition (src/exercices/numeration/definition.js)
    classes: Object.keys(NUMERATION.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Décomposer', 'Représentation', 'Écrire en chiffres', 'Écrire en lettres', 'Comparer', 'Suivant', 'Droite graduée', 'Ranger'],
    fiches: [
      F('numeration', 'lire, écrire et décomposer les nombres', Object.fromEntries(NUMERATION.fiches.filter(f => f.id === 'numeration').map(f => [f.niveau, f.competence])), ['Décomposer', 'Représentation', 'Écrire en chiffres']),
      F('en-lettres', 'écrire les nombres en lettres', 'nombres-en-lettres', ['Écrire en lettres']),
      F('comparer-ranger', 'comparer et ranger', 'comparer-ranger', ['Comparer', 'Ranger']),
      F('suites', 'les suites de nombres', 'suites-nombres', ['Suivant'], { classes: NUMERATION.fiches.filter(f => f.id === 'suites').map(f => f.niveau) }),
      F('droite', 'la droite graduée', 'droite-graduee', ['Droite graduée']),
    ] },
  { id: 'problemes', route: '/maths/problemes', groupe: 'maths', titre: { fr: 'Problèmes', br: 'Kudennoù' },
    classes: Object.keys(PROBLEMES.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Ajout', 'Comparaison', 'Parties et tout', 'Multiplication', 'Partage', 'Fois plus', 'Plusieurs étapes'],
    fiches: [
      F('additifs', "problèmes d'addition et de soustraction", 'problemes-additifs', ['Ajout', 'Comparaison', 'Parties et tout']),
      F('multiplicatifs', 'problèmes de multiplication et de partage', 'problemes-multiplicatifs', ['Multiplication', 'Partage']),
      F('etapes', 'problèmes en plusieurs étapes', 'problemes-etapes', ['Plusieurs étapes']),
    ] },
  { id: 'fractions', route: '/maths/fractions', groupe: 'maths', titre: { fr: 'Les fractions', br: 'An darnaouennoù' },
    // classes et fiches : celles de la définition (src/exercices/fractions/definition.js)
    classes: Object.keys(FRACTIONS.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Quelle fraction', 'Colorier', 'En lettres', 'La moitié de', 'Fractions égales', 'Lire sur la droite', 'Placer sur la droite'],
    fiches: [
      F('unitaires', 'un demi, un tiers, un quart…', 'fractions-unitaires', ['Quelle fraction', 'Colorier', 'En lettres'], { clics: ['Fractions › Un demi'] }),
      F('moitie', 'la moitié de…', 'doubles-moities', ['La moitié de']),
      F('fractions-1', 'les fractions jusqu’à 1 (2/3, 3/4…)', 'fractions-inferieures-1', ['Quelle fraction', 'Colorier', 'En lettres'], { clics: ['Fractions › Aussi'], classes: classesFiche(FRACTIONS, 'fractions-1') }),
      F('egales', 'les fractions égales', 'fractions-egales', ['Fractions égales'], { classes: classesFiche(FRACTIONS, 'egales') }),
      F('droite', 'les fractions sur la droite', 'fractions-mesure', ['Lire sur la droite', 'Placer sur la droite'], { classes: classesFiche(FRACTIONS, 'droite') }),
    ] },
  { id: 'heure', route: '/maths/heure', groupe: 'maths', titre: { fr: "Lire l'heure", br: 'Lenn an eur' },
    classes: Object.keys(HEURE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ["Lire l'heure", 'Placer les aiguilles', 'Matin', 'Durées', 'h et min', 'Emploi du temps'],
    fiches: [
      F('lire', "lire et placer l'heure (demies et quarts)", 'heure-demi-quart', ["Lire l'heure", 'Placer les aiguilles', 'Matin'], { classes: ['ce1'] }),
      F('lire', "lire et placer l'heure à la minute près", 'heure-minutes', ["Lire l'heure", 'Placer les aiguilles'], { classes: ['ce2'] }),
      // classes : celles de la définition (pas de durées au CP)
      F('durees', 'les durées', 'durees', ['Durées', 'h et min', 'Emploi du temps'], { classes: HEURE.fiches.filter(f => f.id === 'durees').map(f => f.niveau) }),
    ] },
  { id: 'monnaie', route: '/maths/monnaie', groupe: 'maths', titre: { fr: 'La monnaie', br: 'Ar moneiz' },
    // classes et fiches : celles de la définition (src/exercices/monnaie/definition.js)
    classes: Object.keys(MONNAIE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Compter une somme', 'Faire une somme', 'Le moins de pièces', 'Rendre la monnaie', 'Comparer', '1 € = 100 c'],
    fiches: [
      F('compter', 'compter et faire une somme', 'monnaie-euros', ['Compter une somme', 'Faire une somme', 'Le moins de pièces', 'Comparer']),
      F('rendre', 'rendre la monnaie', 'monnaie-euros', ['Rendre la monnaie']),
      F('centimes', 'les euros et les centimes', 'monnaie-centimes', ['Compter une somme', 'Faire une somme', '1 € = 100 c'], { clics: ['Options › Avec centimes'], classes: MONNAIE.fiches.filter(f => f.id === 'centimes').map(f => f.niveau) }),
    ] },
  { id: 'mesures', route: '/maths/mesures', groupe: 'maths', titre: { fr: 'Mesures', br: 'Muzulioù' },
    // classes et fiches : celles de la définition (src/exercices/mesures/definition.js)
    classes: Object.keys(MESURES.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Mesurer à la règle', 'Unité adaptée', 'Conversions', 'Comparer', 'Masses', 'Contenances', 'Calendrier'],
    fiches: [
      F('longueurs', 'les longueurs', 'longueurs', ['Mesurer à la règle', 'Unité adaptée', 'Conversions', 'Comparer']),
      F('masses', 'les masses', 'masses', ['Masses']),
      F('contenances', 'les contenances', 'contenances', ['Contenances'], { classes: MESURES.fiches.filter(f => f.id === 'contenances').map(f => f.niveau) }),
    ] },
  { id: 'geometrie', route: '/maths/geometrie', groupe: 'maths', titre: { fr: 'Géométrie', br: 'Mentoniezh' },
    // classes et fiches : celles de la définition (src/exercices/geometrie/definition.js)
    classes: Object.keys(GEOMETRIE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Symétrie', 'Reproduction', 'Repérage', 'Figures', 'Solides', 'Angles droits', 'Propriétés', 'Cercle', 'Patrons'],
    fiches: [
      F('reproduction', 'reproduire des figures', 'tracer-figures', ['Reproduction'], { classes: classesFiche(GEOMETRIE, 'reproduction') }),
      F('reperage', 'se repérer sur un quadrillage', 'reperage-deplacements', ['Repérage'], { classes: classesFiche(GEOMETRIE, 'reperage') }),
      F('figures', 'les figures planes', 'figures-planes', ['Figures'], { classes: ['ce1'] }),
      F('figures', 'les figures planes et le cercle', 'figures-planes', ['Figures', 'Propriétés', 'Cercle'], { classes: ['ce2'] }),
      F('solides', 'les solides', 'solides', ['Solides'], { classes: classesFiche(GEOMETRIE, 'solides') }),
      F('symetrie', 'la symétrie', 'symetrie', ['Symétrie'], { classes: classesFiche(GEOMETRIE, 'symetrie') }),
      F('angles', "l'angle droit", 'angle-droit', ['Angles droits'], { classes: classesFiche(GEOMETRIE, 'angles') }),
      F('patrons', 'les patrons du cube', 'patrons', ['Patrons'], { classes: classesFiche(GEOMETRIE, 'patrons') }),
    ] },
  // ── Français (contenu en français, consignes traduites) ──
  { id: 'dictee', route: '/francais/dictee', groupe: 'francais', titre: { fr: 'Dictée', br: 'Skrivadeg' },
    // classes : celles de la définition (src/exercices/dictee/definition.js) ; CM1 et CM2 ont un même corpus : une seule
    // fiche publiée (exercices-dictee-cm1-cm2), faite au CM1
    classes: [...['cp', 'ce1', 'ce2'].map(n => C(n, `^${n.toUpperCase()}$`)), C('cm1-cm2', '^CM1$')] },
  { id: 'grammaire', route: '/francais/grammaire', groupe: 'francais', titre: { fr: 'Grammaire', br: 'Yezhadur' },
    // classes et fiches : celles de la définition (src/exercices/grammaire/definition.js)
    classes: Object.keys(GRAMMAIRE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Mots dans l', 'Phrase ou pas', 'Majuscule et point', 'Types de phrases', 'forme négative', 'Affirmative ou négative', 'Phrase simple',
      'Trouver le verbe', 'Trouver les noms', 'Trouver les déterminants', 'Trouver les adjectifs', "Nature d'un mot", 'Nom principal',
      'Trouver le sujet', 'Il, elle', 'complément de phrase', 'Où \\? Quand', 'Complément du verbe', 'Masculin', 'Singulier', 'Mettre au pluriel', "Accorder l'adjectif", 'Il chante'],
    fiches: [
      ['phrase', 'la phrase', ['Mots dans l', 'Phrase ou pas', 'Majuscule et point', 'Types de phrases', 'forme négative', 'Affirmative ou négative', 'Phrase simple']],
      ['nature', 'la nature des mots', ['Trouver les noms', 'Trouver les déterminants', 'Trouver les adjectifs', "Nature d'un mot", 'Nom principal']],
      ['sujet-verbe', 'le verbe et son sujet', ['Trouver le verbe', 'Trouver le sujet', 'Il, elle', 'Il chante']],
      ['accords', 'genre, nombre et accords', ['Masculin', 'Singulier', 'Mettre au pluriel', "Accorder l'adjectif"]],
      ['complements', 'les compléments', ['complément de phrase', 'Où \\? Quand', 'Complément du verbe']],
    ].map(([id, titre, seul]) => {
      const fiches = GRAMMAIRE.fiches.filter(f => f.id === id)
      return F(id, titre, fiches[0].competence, seul, { classes: fiches.map(f => f.niveau) })
    }) },
  { id: 'conjugaison', route: '/francais/conjugaison', groupe: 'francais', titre: { fr: 'Conjugaison', br: 'Displegañ' },
    // classes et fiches : celles de la définition (src/exercices/conjugaison/definition.js) ; par temps, avec les
    // verbes du niveau (décision de l'utilisateur) ; au CP, le présent seul : le bilan suffit
    classes: Object.keys(CONJUGAISON.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['^Présent$', '^Imparfait$', '^Futur$', '^Passé composé$', '^Passé simple$', '^Plus-que-parfait$'],
    fiches: [['present', 'le présent', '^Présent$'], ['imparfait', "l'imparfait", '^Imparfait$'], ['futur', 'le futur', '^Futur$'],
      ['passe-compose', 'le passé composé', '^Passé composé$'], ['passe-simple', 'le passé simple', '^Passé simple$'],
      ['plus-que-parfait', 'le plus-que-parfait', '^Plus-que-parfait$']]
      .map(([id, titre, re]) => {
        const fiches = CONJUGAISON.fiches.filter(f => f.id === id)
        return F(id, titre, fiches[0].competence, [re], { classes: fiches.map(f => f.niveau) })
      }) },
  { id: 'vocabulaire', route: '/francais/vocabulaire', groupe: 'francais', titre: { fr: 'Vocabulaire', br: 'Geriaoueg' },
    // classes et fiches : celles de la définition (src/exercices/vocabulaire/definition.js)
    classes: Object.keys(VOCABULAIRE.niveaux).map(n => C(n, `^${n.toUpperCase()}$`)),
    choix: ['Ranger des mots', 'Lettre avant', 'Mots-repères', 'Définitions', 'Le sens dans la phrase', 'Contraires', 'Mots de même sens', 'se disent pareil',
      'Sens propre', 'Familles de mots', 'Préfixes', 'Suffixes', 'Mot étiquette', 'Intrus dans une catégorie'],
    fiches: [
      ['ordre-alphabetique', "l'ordre alphabétique et le dictionnaire", ['Ranger des mots', 'Lettre avant', 'Mots-repères', 'Définitions', 'Le sens dans la phrase']],
      ['sens', 'le sens des mots', ['Contraires', 'Mots de même sens', 'Sens propre']],
      ['familles', 'familles de mots, préfixes et suffixes', ['Familles de mots', 'Préfixes', 'Suffixes']],
      ['categories', 'les catégories de mots', ['Mot étiquette', 'Intrus dans une catégorie']],
    ].map(([id, titre, seul]) => {
      const fiches = VOCABULAIRE.fiches.filter(f => f.id === id)
      return F(id, titre, fiches[0].competence, seul, { classes: fiches.map(f => f.niveau) })
    }) },
  { id: 'orthographe', route: '/francais/orthographe', groupe: 'francais', titre: { fr: 'Orthographe', br: 'Reizhskrivañ' },
    // cp-cm2 : tous les niveaux, homophones (fiche publiée avant les niveaux : réglage `tous`, bouton « CP → CM2 ») ; puis
    // une fiche « Accords » par niveau (le CM1 et le CM2 proposeraient les mêmes questions que le CE2 : pas de fiche) ;
    // les classes sont celles de la définition (src/exercices/orthographe/definition.js)
    classes: [C('cp-cm2', '^CP → CM2$'), ...Object.keys(ORTHOGRAPHE.niveaux).filter(n => !['cm1', 'cm2'].includes(n)).map(n => C(n, `^${n.toUpperCase()}$`))],
    // le bilan d'une classe est la fiche « Accords » (thème par défaut)
    choix: ['Accords', 'Lettres manquantes', 'Homophones'],
    fiches: [
      ['lettres-manquantes', 'les lettres manquantes', 'Lettres manquantes'],
      ['homophones', 'les homophones (pour aller plus loin)', 'Homophones'],
    ].map(([id, titre, seul]) => {
      const fiches = ORTHOGRAPHE.fiches.filter(f => f.id === id)
      return F(id, titre, fiches[0].competence, [seul], { classes: fiches.map(f => f.niveau) })
    }) },
  // ── Maternelle ──
  { id: 'compter', route: '/maternelle/compter', groupe: 'maternelle', titre: { fr: 'Compter les objets', br: 'Kontañ an traoù' },
    classes: [C('ps', '\\bPS\\b'), C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'comparer', route: '/maternelle/comparer', groupe: 'maternelle', titre: { fr: 'Comparer les quantités', br: "Keñveriañ ar c'hementadoù" },
    classes: [C('ps', '\\bPS\\b'), C('ms', '\\bMS\\b'), C('gs', '\\bGS\\b')] },
  { id: 'ranger', route: '/maternelle/ordonner', groupe: 'maternelle', titre: { fr: 'Ranger les nombres', br: 'Renkañ an niveroù' },
    classes: Object.keys(ORDONNER.niveaux).map(n => C(n, `\\b${n.toUpperCase()}\\b`)) },
  { id: 'lettres', route: '/maternelle/lettres', groupe: 'maternelle', titre: { fr: 'Les lettres', br: 'Al lizherennoù' },
    // une seule fiche publiée (exercices-lettres-gs-cp), celle du niveau par défaut : les niveaux de la définition
    classes: [C(Object.keys(LETTRES.niveaux).join('-'), null)] },
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
