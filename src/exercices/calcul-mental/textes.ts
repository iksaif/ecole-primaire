// Calcul mental — textes de CONTENU : ce que les fiches et les énoncés écrivent (« Double de 7 = ? », en-tête de la fiche, libellés
// des opérations, titres des fiches publiées). Lus par T (générateur, fiche) ; la vue passe par `traducteur(CONTENU, …)`. Les
// textes de l'INTERFACE (boutons, réglages, jeu) sont dans src/langues/<langue>/textes/calculMental.ts.
// Les identifiants d'opérations (« + », « Compléments à 10 »…) sont des valeurs de réglages : seuls leurs libellés sont traduits ;
// « +, −, ×, ÷, ± 9 / ± 11, × 10 / × 100 » s'affichent tels quels.
// `fiche.<id>` : titre court, titre et description d'une fiche par compétence (pages /telechargements/), la même clé que son `id`
// dans definition.ts ; une fiche sans entrée prend un titre calculé d'après sa compétence.
import { catalogue } from '../../langues/catalogue.ts'

export const CONTENU = catalogue({
  titre: 'Calcul mental',
  doubleDe: 'Double de {n} = ?',
  moitieDe: 'Moitié de {n} = ?',
  pOperations: 'Opérations : {ops}',
  pNbQuestions: '{n} questions',
  op_complements10: 'Compléments à 10',
  op_complements100: 'Compléments à 100',
  op_versDizaine: 'Vers la dizaine (37 + ? = 40)',
  op_dizaines: '± dizaines (45 + 30)',
  op_passage: 'Passage de dizaine (47 + 6)',
  op_doubles: 'Doubles',
  op_moities: 'Moitiés',
  fiche: {
    'tables-addition-cp': {
      court: "Tables d'addition (≤ 10)",
      titre: "Fiche de calcul : tables d'addition, résultats jusqu'à 10",
      description: "30 additions des tables d'addition (résultats jusqu'à 10) et termes manquants, en gros chiffres, avec corrigé. Calcul mental CP.",
    },
    'additions-jusqu-a-20': {
      court: "Additions jusqu'à 20",
      titre: "Fiche de calcul : additions jusqu'à 20",
      description: '30 additions dont le résultat ne dépasse pas 20, en gros chiffres : fiche de calcul gratuite avec corrigé pour le CP et le CE1.',
    },
    'additions-soustractions-ce1': {
      court: 'Additions / soustractions CE1',
      titre: "Fiche de calcul : additions et soustractions jusqu'à 100 (CE1)",
      description: "Additions et soustractions jusqu'à 100 sans et avec passage de dizaine, mélangées. Fiche de calcul CE1 gratuite à imprimer, avec corrigé.",
    },
    'calcul-mental-ce1': {
      court: 'Calcul mental CE1 (mélange)',
      titre: 'Fiche de calcul mental CE1 : révisions mélangées',
      description: 'Une fiche complète de calcul mental pour le CE1 : tables de 2 à 5, additions, soustractions, compléments et doubles mélangés, avec corrigé.',
    },
    'table-2': {
      court: 'Table de 2',
      titre: 'Fiche de calcul : la table de multiplication de 2',
      description: 'Fiche gratuite à imprimer pour réviser la table de 2 : produits (2 × 7, 7 × 2) et facteurs manquants (2 × … = 12), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-3': {
      court: 'Table de 3',
      titre: 'Fiche de calcul : la table de multiplication de 3',
      description: 'Fiche gratuite à imprimer pour réviser la table de 3 : produits (3 × 7, 7 × 3) et facteurs manquants (3 × … = 18), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-4': {
      court: 'Table de 4',
      titre: 'Fiche de calcul : la table de multiplication de 4',
      description: 'Fiche gratuite à imprimer pour réviser la table de 4 : produits (4 × 7, 7 × 4) et facteurs manquants (4 × … = 24), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-5': {
      court: 'Table de 5',
      titre: 'Fiche de calcul : la table de multiplication de 5',
      description: 'Fiche gratuite à imprimer pour réviser la table de 5 : produits (5 × 7, 7 × 5) et facteurs manquants (5 × … = 30), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-10': {
      court: 'Table de 10',
      titre: 'Fiche de calcul : la table de multiplication de 10',
      description: 'Fiche gratuite à imprimer pour réviser la table de 10 : produits (10 × 7, 7 × 10) et facteurs manquants (10 × … = 60), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-6': {
      court: 'Table de 6',
      titre: 'Fiche de calcul : la table de multiplication de 6',
      description: 'Fiche gratuite à imprimer pour réviser la table de 6 : produits (6 × 7, 7 × 6) et facteurs manquants (6 × … = 36), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-7': {
      court: 'Table de 7',
      titre: 'Fiche de calcul : la table de multiplication de 7',
      description: 'Fiche gratuite à imprimer pour réviser la table de 7 : produits (7 × 7, 7 × 7) et facteurs manquants (7 × … = 42), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-8': {
      court: 'Table de 8',
      titre: 'Fiche de calcul : la table de multiplication de 8',
      description: 'Fiche gratuite à imprimer pour réviser la table de 8 : produits (8 × 7, 7 × 8) et facteurs manquants (8 × … = 48), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'table-9': {
      court: 'Table de 9',
      titre: 'Fiche de calcul : la table de multiplication de 9',
      description: 'Fiche gratuite à imprimer pour réviser la table de 9 : produits (9 × 7, 7 × 9) et facteurs manquants (9 × … = 54), avec corrigé. Calcul mental CE1, CE2, CM1.',
    },
    'tables-2-a-5': {
      court: 'Tables de 2 à 5 mélangées',
      titre: 'Fiche de calcul : tables de multiplication de 2, 3, 4 et 5 mélangées',
      description: 'Fiche de calcul mental à imprimer : 40 multiplications mélangées des tables de 2, 3, 4 et 5, avec facteurs manquants et corrigé. Idéal pour le CE1 et le CE2.',
    },
    'tables-6-a-9': {
      court: 'Tables de 6 à 9 mélangées',
      titre: 'Fiche de calcul : tables de multiplication de 6, 7, 8 et 9 mélangées',
      description: 'Les tables les plus difficiles : 40 multiplications mélangées des tables de 6, 7, 8 et 9, avec facteurs manquants. Fiche gratuite avec corrigé, CE2, CM1, CM2.',
    },
    'toutes-les-tables': {
      court: 'Toutes les tables (60 calculs)',
      titre: 'Fiche de calcul : toutes les tables de multiplication (60 calculs)',
      description: 'Grande révision des tables de multiplication de 2 à 10 : 60 multiplications mélangées sur une page, avec corrigé. Pour le CE2, le CM1 et le CM2.',
    },
    'divisions-combien-de-fois': {
      court: 'Combien de fois ? (CE2)',
      titre: 'Fiche de calcul : combien de fois ? (divisions CE2)',
      description: 'Premières divisions au CE2 : « combien de fois 6 dans 42 ? » à partir des tables de multiplication. Fiche gratuite à imprimer avec corrigé.',
    },
    'divisions-tables-cm1': {
      court: 'Divisions CM1',
      titre: 'Fiche de calcul : divisions avec le signe ÷ (CM1)',
      description: 'Divisions exactes dans les tables de multiplication (42 ÷ 6 = …) pour le CM1 et le CM2. Fiche de calcul mental à imprimer avec corrigé.',
    },
    'complements-a-10': {
      court: 'Compléments à 10',
      titre: 'Fiche de calcul : les compléments à 10',
      description: 'Fiche gratuite pour apprendre les compléments à 10 (7 + … = 10) : les « amoureux de 10 », en gros chiffres, avec corrigé. CP et CE1.',
    },
    'complements-a-100': {
      court: 'Compléments à 100',
      titre: 'Fiche de calcul : les compléments à 100',
      description: 'Compléments à 100 avec des dizaines entières (30 + … = 100) puis des nombres quelconques (37 + … = 100) : fiche de calcul mental avec corrigé, CE1 et CE2.',
    },
    'complements-dizaine': {
      court: 'Compléments à la dizaine',
      titre: 'Fiche de calcul : compléter à la dizaine supérieure',
      description: 'Atteindre la dizaine supérieure (37 + … = 40) : la stratégie clé pour calculer avec passage de dizaine. Fiche à imprimer avec corrigé, CE1.',
    },
    'ajouter-retirer-10': {
      court: '+ 10 / − 10',
      titre: 'Fiche de calcul : ajouter 10 et retirer 10',
      description: "Ajouter ou retirer 10 à un nombre jusqu'à 100 : fiche de calcul mental CP et CE1 pour comprendre les dizaines, avec corrigé.",
    },
    'ajouter-retirer-9-11': {
      court: '+ 9 / − 9 / + 11 / − 11',
      titre: 'Fiche de calcul : ajouter et retirer 9 et 11',
      description: "La stratégie « + 10 − 1 » : ajouter et retirer 9 et 11 à des nombres jusqu'à 100. Fiche de calcul mental CE1, CE2 avec corrigé.",
    },
    'multiplier-par-10-et-100': {
      court: '× 10 et × 100',
      titre: 'Fiche de calcul : multiplier par 10 et par 100',
      description: 'Multiplier un nombre entier par 10 et par 100 : fiche de calcul mental CE2 et CM1, avec corrigé. Gratuite à imprimer.',
    },
    'doubles-moities-cp': {
      court: 'Doubles et moitiés CP',
      titre: 'Fiche de calcul : doubles et moitiés (CP)',
      description: "Les doubles des nombres jusqu'à 10 et les moitiés des nombres pairs jusqu'à 20, comme demandé au CP. Fiche gratuite en gros chiffres avec corrigé.",
    },
    'doubles-moities-ce1': {
      court: 'Doubles et moitiés CE1',
      titre: 'Fiche de calcul : doubles et moitiés (CE1)',
      description: "Doubles jusqu'à 20 et moitiés jusqu'à 40, puis nombres ronds (double de 25, moitié de 50, de 30…). Fiche de calcul mental CE1 avec corrigé.",
    },
  },
}, {
  br: {
    titre: 'Jediñ e penn',
    doubleDe: 'An doubl eus {n} = ?',
    moitieDe: 'An hanter eus {n} = ?',
    pOperations: 'Oberiadurioù : {ops}',
    pNbQuestions: '{n} goulenn',
    op_complements10: 'Klokadurioù da 10', // br: à relire (« klokadur » = complément)
    op_complements100: 'Klokadurioù da 100',
    op_versDizaine: 'Betek an degad (37 + ? = 40)',
    op_dizaines: '± degadoù (45 + 30)',
    op_passage: 'Tremen an degad (47 + 6)', // br: à relire
    op_doubles: 'Doubloù',
    op_moities: 'Hanterioù',
    fiche: {
      'tables-addition-cp': {
        court: 'Taolennoù sammañ (≤ 10)', // br: à relire
        titre: "Fichenn jediñ : taolennoù sammañ, disoc'hoù betek 10", // br: à relire
        description: 'Taolennoù sammañ betek 10 — fiche de calcul CP en breton : 30 sammadenn ha termenoù o vankout, gant ar reizhadenn.', // br: à relire
      },
      'additions-jusqu-a-20': {
        court: 'Sammadennoù betek 20', // br: à relire
        titre: 'Fichenn jediñ : sammadennoù betek 20', // br: à relire
        description: "Sammadennoù betek 20 — fiche d'additions jusqu'à 20 en breton : 30 sammadenn, sifroù bras, gant ar reizhadenn. CP, CE1.", // br: à relire
      },
      'additions-soustractions-ce1': {
        court: 'Sammadennoù / lamadennoù CE1', // br: à relire
        titre: 'Fichenn jediñ : sammadennoù ha lamadennoù betek 100 (CE1)', // br: à relire
        description: 'Sammadennoù ha lamadennoù betek 100 — fiche additions et soustractions CE1 en breton, gant ar reizhadenn.', // br: à relire
      },
      'calcul-mental-ce1': {
        court: 'Jediñ e penn CE1 (mesket)', // br: à relire
        titre: 'Fichenn jediñ e penn CE1 : adwelet mesket', // br: à relire
        description: 'Jediñ e penn CE1 — fiche de calcul mental CE1 en breton : taolennoù lieskementiñ, sammadennoù, lamadennoù, klokaat hag an doubl, gant ar reizhadenn.', // br: à relire
      },
      'table-2': {
        court: 'Taolenn lieskementiñ 2', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 2', // br: à relire
        description: 'Taolenn lieskementiñ 2 — fiche de la table de 2 en breton : liesadennoù (2 × 7, 7 × 2) ha faktorioù o vankout (2 × … = 12), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-3': {
        court: 'Taolenn lieskementiñ 3', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 3', // br: à relire
        description: 'Taolenn lieskementiñ 3 — fiche de la table de 3 en breton : liesadennoù (3 × 7, 7 × 3) ha faktorioù o vankout (3 × … = 18), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-4': {
        court: 'Taolenn lieskementiñ 4', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 4', // br: à relire
        description: 'Taolenn lieskementiñ 4 — fiche de la table de 4 en breton : liesadennoù (4 × 7, 7 × 4) ha faktorioù o vankout (4 × … = 24), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-5': {
        court: 'Taolenn lieskementiñ 5', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 5', // br: à relire
        description: 'Taolenn lieskementiñ 5 — fiche de la table de 5 en breton : liesadennoù (5 × 7, 7 × 5) ha faktorioù o vankout (5 × … = 30), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-10': {
        court: 'Taolenn lieskementiñ 10', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 10', // br: à relire
        description: 'Taolenn lieskementiñ 10 — fiche de la table de 10 en breton : liesadennoù (10 × 7, 7 × 10) ha faktorioù o vankout (10 × … = 60), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-6': {
        court: 'Taolenn lieskementiñ 6', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 6', // br: à relire
        description: 'Taolenn lieskementiñ 6 — fiche de la table de 6 en breton : liesadennoù (6 × 7, 7 × 6) ha faktorioù o vankout (6 × … = 36), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-7': {
        court: 'Taolenn lieskementiñ 7', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 7', // br: à relire
        description: 'Taolenn lieskementiñ 7 — fiche de la table de 7 en breton : liesadennoù (7 × 7, 7 × 7) ha faktorioù o vankout (7 × … = 42), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-8': {
        court: 'Taolenn lieskementiñ 8', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 8', // br: à relire
        description: 'Taolenn lieskementiñ 8 — fiche de la table de 8 en breton : liesadennoù (8 × 7, 7 × 8) ha faktorioù o vankout (8 × … = 48), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'table-9': {
        court: 'Taolenn lieskementiñ 9', // br: à relire
        titre: 'Fichenn jediñ : taolenn lieskementiñ 9', // br: à relire
        description: 'Taolenn lieskementiñ 9 — fiche de la table de 9 en breton : liesadennoù (9 × 7, 7 × 9) ha faktorioù o vankout (9 × … = 54), gant ar reizhadenn. Fichenn digoust da voullañ.', // br: à relire
      },
      'tables-2-a-5': {
        court: 'Taolennoù 2 betek 5 mesket', // br: à relire
        titre: 'Fichenn jediñ : taolennoù lieskementiñ 2, 3, 4 ha 5 mesket', // br: à relire
        description: 'Taolennoù lieskementiñ 2 betek 5 — fiche de calcul en breton : 40 liesadenn mesket, faktorioù o vankout ha reizhadenn. CE1, CE2.', // br: à relire
      },
      'tables-6-a-9': {
        court: 'Taolennoù 6 betek 9 mesket', // br: à relire
        titre: 'Fichenn jediñ : taolennoù lieskementiñ 6, 7, 8 ha 9 mesket', // br: à relire
        description: 'Taolennoù lieskementiñ 6 betek 9 — fiche de calcul en breton : 40 liesadenn mesket gant faktorioù o vankout ha reizhadenn. CE2, CM1, CM2.', // br: à relire
      },
      'toutes-les-tables': {
        court: 'An holl daolennoù (60 jedadenn)', // br: à relire
        titre: 'Fichenn jediñ : an holl daolennoù lieskementiñ (60 jedadenn)', // br: à relire
        description: 'An holl daolennoù lieskementiñ — toutes les tables de multiplication en breton : 60 liesadenn mesket war ur bajenn, gant ar reizhadenn. CE2, CM1, CM2.', // br: à relire
      },
      'divisions-combien-de-fois': {
        court: 'Pet gwech ? (CE2)', // br: à relire
        titre: 'Fichenn jediñ : pet gwech ? (rannadennoù CE2)', // br: à relire
        description: 'Pet gwech 6 e 42 ? — fiche premières divisions CE2 en breton (« combien de fois ? »), gant ar reizhadenn.', // br: à relire
      },
      'divisions-tables-cm1': {
        court: 'Rannadennoù CM1', // br: à relire
        titre: 'Fichenn jediñ : rannadennoù gant an arouez ÷ (CM1)', // br: à relire
        description: 'Rannadennoù (42 ÷ 6 = …) — fiche de divisions CM1, CM2 en breton, gant ar reizhadenn.', // br: à relire
      },
      'complements-a-10': {
        court: 'Klokaat betek 10', // br: à relire
        titre: 'Fichenn jediñ : klokaat betek 10', // br: à relire
        description: 'Klokaat betek 10 — fiche des compléments à 10 en breton (7 + … = 10), sifroù bras, gant ar reizhadenn. CP, CE1.', // br: à relire
      },
      'complements-a-100': {
        court: 'Klokaat betek 100', // br: à relire
        titre: 'Fichenn jediñ : klokaat betek 100', // br: à relire
        description: 'Klokaat betek 100 — fiche des compléments à 100 en breton (30 + … = 100, 37 + … = 100), gant ar reizhadenn. CE1, CE2.', // br: à relire
      },
      'complements-dizaine': {
        court: 'Klokaat betek an dekad', // br: à relire
        titre: "Fichenn jediñ : klokaat betek an dekad war-lerc'h", // br: à relire
        description: 'Klokaat betek an dekad — fiche compléments à la dizaine supérieure en breton (37 + … = 40), gant ar reizhadenn. CP, CE1.', // br: à relire
      },
      'ajouter-retirer-10': {
        court: '+ 10 / − 10', // br: à relire
        titre: 'Fichenn jediñ : ouzhpennañ 10 ha lemel 10', // br: à relire
        description: 'Ouzhpennañ ha lemel 10 — fiche ajouter et retirer 10 en breton, niveroù betek 100, gant ar reizhadenn. CP, CE1.', // br: à relire
      },
      'ajouter-retirer-9-11': {
        court: '+ 9 / − 9 / + 11 / − 11', // br: à relire
        titre: 'Fichenn jediñ : ouzhpennañ ha lemel 9 hag 11', // br: à relire
        description: 'Ouzhpennañ ha lemel 9 hag 11 — fiche ajouter et retirer 9 et 11 en breton (« + 10 − 1 »), gant ar reizhadenn. CE1, CE2.', // br: à relire
      },
      'multiplier-par-10-et-100': {
        court: '× 10 ha × 100', // br: à relire
        titre: 'Fichenn jediñ : liesaat dre 10 ha dre 100', // br: à relire
        description: 'Liesaat dre 10 ha dre 100 — fiche multiplier par 10 et par 100 en breton, gant ar reizhadenn. CE2, CM1.', // br: à relire
      },
      'doubles-moities-cp': {
        court: 'An doubl hag an hanter CP', // br: à relire
        titre: 'Fichenn jediñ : an doubl hag an hanter (CP)', // br: à relire
        description: 'An doubl hag an hanter — fiche doubles et moitiés CP en breton : doubl betek 10, hanter betek 20, sifroù bras.', // br: à relire
      },
      'doubles-moities-ce1': {
        court: 'An doubl hag an hanter CE1', // br: à relire
        titre: 'Fichenn jediñ : an doubl hag an hanter (CE1)', // br: à relire
        description: 'An doubl hag an hanter — fiche doubles et moitiés CE1 en breton : doubl betek 20, hanter betek 40 ha niveroù ront.', // br: à relire
      },
    },
  },
})
