// Référentiel du programme officiel (MS → CM2) : domaines, compétences utiles à nos activités, contraintes par niveau.
// Données pures (aucune dépendance) : sert à ranger les fiches et affiches par domaine, à afficher les liens vers le
// programme et à tester que les options des formulaires restent dans le champ de chaque niveau (plan 09).
//
// Textes relus le 2026-10-04 (PDF téléchargés et lus en entier pour les parties citées) :
//   - Cycle 1, langage et mathématiques : BO n° 41 du 31 octobre 2024, annexes 1 et 2 (arrêté du 22-10-2024),
//     en vigueur à la rentrée 2025.
//     https://www.education.gouv.fr/bo/2024/Hebdo41/MENE2415135A
//   - Cycle 1, programme complet : BO n° 19 du 7 mai 2026 (arrêté du 16-4-2026, NOR MENE2608627A), en vigueur à la
//     rentrée 2026. Il reprend tel quel le langage et les mathématiques du BO n° 41 (renvoi explicite, p. 11 et 23 du
//     PDF du BO) et ajoute notamment « Se repérer dans le temps et l'espace ».
//   - Cycle 2, français et mathématiques : BO n° 41 du 31 octobre 2024, annexes 3 et 4, en vigueur à la rentrée 2025.
//   - Cycle 3, français et mathématiques : BO n° 16 du 17 avril 2025 (arrêté du 10-4-2025, NOR MENE2504620A), en
//     vigueur au CM1 à la rentrée 2025 et au CM2 à la rentrée 2026 (donc partout à la date de relecture).
//     https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A
//   - Repères annuels de progression Éduscol : il n'y en a plus de séparés pour les nouveaux programmes. Selon la page
//     Éduscol https://eduscol.education.gouv.fr/6910/reperes-annuels-de-progression-et-attendus-de-fin-d-annee-du-cp-la-troisieme
//     ils sont « inclus dans les nouveaux programmes, sous forme d'objectifs annuels » (page non lue directement :
//     403 Cloudflare ; constat repris d'un résultat de recherche). Les programmes eux-mêmes sont bien rédigés année
//     par année (CP, CE1, CE2, CM1, CM2) et, au cycle 1, par âge.
//   - Exemples de réussite du cycle 3 en français (Éduscol, CM1, CM2, 6e), publiés à part : cherchés le 2026-10-04 pour
//     les homophones et les homonymes seulement (SOURCES.exemplesCM1…), pas relus en entier.
//   - « Le monde » (matière `monde` ; `autres` dans l'ancien activites.js) : textes parus après les BO ci-dessus, lus en entier le
//     2026-10-06 (PDF de chaque annexe sur education.gouv.fr ; pages du PDF de l'annexe) :
//       · Cycle 1, « Découvrir le monde du vivant, de la matière et des objets » : BO n° 19 du 7 mai 2026 (déjà cité).
//       · Cycles 2 et 3, sciences et technologie : arrêté du 5-6-2026 (NOR MENE2611650A), BO n° 24 du 11 juin 2026,
//         annexes 1 (cycle 2) et 2 (cycle 3). Il remplace « Questionner le monde » (cycle 2) et le programme de sciences
//         de 2023 (cycle 3). Application : CP et CM1 à la rentrée 2026 ; CE1, CE2, CM2 à la rentrée 2027.
//       · Cycles 2 et 3, histoire-géographie : arrêté du 22-4-2026 (NOR MENE2608631A), BO n° 22 du 28 mai 2026, annexes 3
//         (cycle 2) et 4 (cycle 3). Il remplace « Questionner l'espace et le temps » (cycle 2) et le programme de 2020
//         (cycle 3). Même calendrier d'application : CP et CM1 en 2026, CE1, CE2, CM2 en 2027.
//       · Enseignement moral et civique : arrêté du 29-5-2024 (NOR MENE2413934A), BO n° 24 du 13 juin 2024, du CP à la
//         terminale ; en application partout depuis la rentrée 2026 (CP et CM1 en 2024, CE1 et CM2 en 2025, CE2 en 2026).
//     En 2026-2027, les classes de CE1, CE2 et CM2 suivent donc encore les anciens programmes (« Questionner le monde » et
//     « Questionner l'espace et le temps » de 2020, sciences cycle 3 de 2023, histoire-géographie cycle 3 de 2020), que
//     nous n'avons PAS relus : le référentiel retient le texte nouveau, et chaque compétence concernée le dit dans
//     `interpretation`. Le BO n° 16 du 17 avril 2025 ne contient que le français et les mathématiques du cycle 3 : ni
//     sciences, ni histoire-géographie, ni EMC.
//   - Non relus : les livrets d'accompagnement ; les anciens programmes ci-dessus (2015, 2020, 2023).
//
// Le texte de ces PDF est dans docs/programmes/ (une section « Page N » par page du PDF, comme les `page` ci-dessous).
//
// Conventions
//   - `source` : { texte, page, url, extrait } ; `page` est la page du PDF (pas la page imprimée), `url` y mène
//     directement (#page=), `extrait` reprend ou résume le passage. Ce qui est une interprétation est marqué
//     `interpretation: '…'`.
//   - Cycle 1 : le programme est écrit par âge (« avant 4 ans », « à partir de 4 ans », « à partir de 5 ans ou dès que
//     les apprentissages précédents ont pu être observés »). Nous lisons « avant 4 ans » = PS, « à partir de 4 ans » = MS
//     et « à partir de 5 ans » = GS : c'est une interprétation (le texte laisse l'enseignant avancer plus tôt). PS
//     ajoutée le 2026-10-04 (plans/10-couverture-ps.md ; pages vérifiées dans docs/programmes/).
//   - `niveaux` d'une compétence : l'année d'introduction d'abord, puis les années suivantes (jusqu'au CM2) où elle
//     reste travaillée ou réinvestie.
//   - Le Monde : chaque domaine est un domaine du programme de sciences, d'histoire-géographie ou d'EMC ; les noms sont
//     ceux des textes. Le cycle 1 les range sous « Découvrir le monde du vivant, de la matière et des objets » : nous
//     séparons le vivant, le corps et la santé, la matière, les objets (rattachement aux domaines des cycles 2 et 3 :
//     interprétation de la continuité, comme en mathématiques). Le quiz de culture générale de l'app reste hors programme.
//   - `officiel`, `source` et `lien` d'un domaine sont indexés par cycle (1, 2, 3) : le nom change d'un cycle à l'autre.

// classes et cycles : src/data/classes.ts (réexportés ici pour les modules qui les lisent avec le programme)
import { NIVEAUX, CYCLE_DE, classesEntre, classesDepuis } from './classes.ts'
import type { Classe, Cycle } from './classes.ts'
import { AVEC_DEV } from '../dev.ts'
export { NIVEAUX, CYCLE_DE }
export type { Classe as Niveau, Cycle }

/**
 * Les matières, dans l'ordre d'affichage. `monde` : sciences, histoire-géographie, EMC (ancien `autres`). `regionale` : apprendre
 * la langue régionale ; le référentiel n'a pas (encore) de domaine de cette matière : les ressources n'y entreront qu'avec des
 * domaines déclarés ici (voir src/ressources/README.md).
 */
export const MATIERES = ['maths', 'francais', 'monde', 'regionale'] as const
export type Matiere = (typeof MATIERES)[number]

// Les entrées fictives des exemples (DOMAINES_EXEMPLE, COMPETENCES_EXEMPLE) comptent dans les types : K et D les exposent
export type DomaineId = (typeof DOMAINES)[number]['id'] | (typeof DOMAINES_EXEMPLE)[number]['id']
export type CompetenceId = (typeof COMPETENCES)[number]['id'] | (typeof COMPETENCES_EXEMPLE)[number]['id']

// ── Types ──
// Les identifiants (DomaineId, CompetenceId) sont dérivés des données : une compétence qui cite un domaine inconnu,
// ou un test qui cite une compétence inexistante, ne compile pas. Les données gardent leur forme d'origine.

/** Clé de SOURCES : le texte officiel cité. */
export type SourceId = keyof typeof SOURCES

/** Où le programme dit ce qu'on en retient : page du PDF (pas la page imprimée), lien direct, extrait. */
export interface Source {
  texte: SourceId
  page: number
  url: string
  extrait: string
}

/** Une valeur par cycle (les domaines n'existent pas tous à chaque cycle). */
export type ParCycle<T> = Partial<Record<Cycle, T>>

export interface Domaine {
  id: string
  court: string
  matiere: Matiere
  cycles: readonly Cycle[]
  /** nom officiel du domaine, par cycle */
  officiel: ParCycle<string>
  source: ParCycle<Source>
  lien: ParCycle<string>
  /** entrée fictive des exemples : développement seulement (voir DOMAINES_EXEMPLE) */
  devSeulement?: true
}

export interface Competence {
  id: string
  domaine: DomaineId
  libelle: string
  /** l'année d'introduction d'abord, puis les années suivantes où elle reste travaillée */
  niveaux: readonly Classe[]
  source: Source
  /** ce qui est une interprétation du texte, et pourquoi */
  interpretation?: string
  /** entrée fictive des exemples : développement seulement (voir COMPETENCES_EXEMPLE) */
  devSeulement?: true
}

export interface HorsProgramme {
  id: string
  domaine: DomaineId
  niveaux: readonly Classe[]
  libelle: string
  /** où l'on a cherché */
  recherche: string
  sources: readonly Source[]
  interpretation: string
}

/** Fractions au programme d'un niveau (clés : voir le commentaire de CONTRAINTES). */
export interface ContrainteFractions {
  denominateurs?: readonly number[]
  denominateurMax?: number
  decimales?: readonly number[]
  superieuresA1: boolean
  operateur: boolean | 'unitaires'
}

/**
 * Ce que le programme fixe pour un niveau (valeurs simples, vérifiables par un test). Toutes les clés sauf `niveau`
 * sont facultatives : une clé absente n'est pas bornée à ce niveau. Une faute de frappe dans CONTRAINTES ne compile pas.
 */
export interface Contraintes {
  niveau: Classe
  nombreMax?: number
  nombreChiffresMax?: number
  comptineMax?: number
  ecritureChiffresMax?: number
  nombresEnLettresMax?: number
  calculMentalMax?: number
  problemesMax?: number
  facteurMax?: number
  doubles?: readonly number[]
  moities?: readonly number[]
  operationsPosees?: readonly string[]
  fractions?: ContrainteFractions | null
  decimalesMax?: number
  monnaie?: { eurosMax: number | null, centimes: boolean, virgule: boolean }
  heure?: 'entiere' | 'quart' | 'minute' | 'seconde'
  heureMax12?: boolean
  unitesLongueur?: readonly string[]
  unitesMasse?: readonly string[]
  unitesContenance?: readonly string[]
  unitesAire?: readonly string[]
  tableauConversion?: boolean
  tableauUnites?: boolean
  tableauProportionnalite?: boolean
  calculatrice?: false | 'occasionnelle'
  divisibilite?: readonly number[]
  figures?: readonly string[]
  solides?: readonly string[]
  solidesDecrits?: readonly string[]
  patrons?: readonly string[]
  symetrie?: false | 'completer' | 'construire'
  conjugaison?: { temps: readonly string[], groupes: readonly string[], irreguliers: readonly string[] }
  classesMots?: readonly string[]
  pluriels?: readonly string[]
  feminins?: readonly string[]
  cursive?: 'initiation' | 'minuscules' | 'majuscules' | 'automatise' | null
  lettres?: 'prenom-capitales' | 'prenom' | 'alphabet'
  comparaisonGlobale?: { rapportMin: number, max: number }
  formesTriees?: readonly string[]
  assemblageMax?: number
  motifs?: 'alternance'
  masse?: boolean
  zero?: boolean
  graphisme?: readonly string[]
  temps?: 'journee'
  lectureMotsParMinute?: number
  /** la source de chaque contrainte, par clé */
  sources: Partial<Record<keyof Contraintes, Source>>
  /** ce qui est une interprétation */
  interpretation?: string
  note?: string
}

export const SOURCES = {
  bo41: {
    titre: 'BO n° 41 du 31 octobre 2024 — cycle 1 (langage, mathématiques) et cycle 2 (français) ; pages du PDF complet du BO',
    url: 'https://www.education.gouv.fr/sites/default/files/document/Bulletin%20officiel%20n%C2%B0%2041%20du%2031%20octobre%202024-404808.pdf',
    page: 'https://www.education.gouv.fr/bo/2024/Hebdo41/MENE2415135A',
  },
  c2maths: {
    titre: 'Programme de mathématiques du cycle 2 (annexe 4 du BO n° 41 du 31 octobre 2024) ; pages du PDF de l’annexe',
    url: 'https://www.education.gouv.fr/sites/default/files/document/Annexe%204%20%E2%80%93%20Programme%20de%20math%C3%A9matiques%20du%20cycle%202-403821.pdf',
    page: 'https://www.education.gouv.fr/bo/2024/Hebdo41/MENE2415135A',
  },
  bo19: {
    titre: 'BO n° 19 du 7 mai 2026 — programme d’enseignement de l’école maternelle (cycle 1) ; pages du PDF complet du BO',
    url: 'https://www.education.gouv.fr/sites/default/files/document/boenjs19okpdf-516110.pdf',
    page: 'https://www.education.gouv.fr/bo/2026/Hebdo19-0',
  },
  c3maths: {
    titre: 'Programme de mathématiques pour le cycle 3 (annexe du BO n° 16 du 17 avril 2025)',
    url: 'https://www.education.gouv.fr/sites/default/files/programme-de-math-matiques-pour-le-cycle-3-439827.pdf',
    page: 'https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A',
  },
  c3francais: {
    titre: 'Programme de français pour le cycle 3 (annexe du BO n° 16 du 17 avril 2025)',
    url: 'https://www.education.gouv.fr/sites/default/files/programme-de-fran-ais-pour-le-cycle-3-439824.pdf',
    page: 'https://www.education.gouv.fr/bo/2025/Hebdo16/MENE2504620A',
  },
  exemplesCM1: {
    titre: 'Exemples pour la mise en œuvre du programme de français, CM1 (Éduscol, 2025) ; exemples de réussite',
    url: 'https://eduscol.education.gouv.fr/sites/default/files/document/exemplesmiseenoeuvrecm1-francaispdf-111546.pdf',
    page: 'https://eduscol.education.gouv.fr/4800/ressources-d-accompagnement-du-programme-de-francais-au-cycle-3',
  },
  exemplesCM2: {
    titre: 'Exemples pour la mise en œuvre du programme de français, CM2 (Éduscol, 2025) ; exemples de réussite',
    url: 'https://eduscol.education.gouv.fr/sites/default/files/document/exemplesmiseenoeuvrecm2francaispdf-111540.pdf',
    page: 'https://eduscol.education.gouv.fr/4800/ressources-d-accompagnement-du-programme-de-francais-au-cycle-3',
  },
  exemples6e: {
    titre: 'Exemples pour la mise en œuvre du programme de français, 6e (Éduscol, 2025) ; exemples de réussite',
    url: 'https://eduscol.education.gouv.fr/sites/default/files/document/exemplesmiseenoeuvre6e-francaispdf-111534.pdf',
    page: 'https://eduscol.education.gouv.fr/4800/ressources-d-accompagnement-du-programme-de-francais-au-cycle-3',
  },
  c2sciences: {
    titre: 'Programme de sciences et technologie du cycle 2 (annexe 1 de l’arrêté du 5 juin 2026, BO n° 24 du 11 juin 2026) ; pages du PDF de l’annexe',
    url: 'https://www.education.gouv.fr/sites/default/files/document/annexe-1-programme-de-sciences-et-technologie-du-cycle-2-519020.pdf',
    page: 'https://www.education.gouv.fr/bo/2026/Hebdo24/MENE2611650A',
  },
  c3sciences: {
    titre: 'Programme de sciences et technologie du cycle 3 (annexe 2 de l’arrêté du 5 juin 2026, BO n° 24 du 11 juin 2026) ; pages du PDF de l’annexe',
    url: 'https://www.education.gouv.fr/sites/default/files/document/annexe-2-programme-de-sciences-et-technologie-du-cycle-3-519023.pdf',
    page: 'https://www.education.gouv.fr/bo/2026/Hebdo24/MENE2611650A',
  },
  c2histgeo: {
    titre: 'Programme d’histoire-géographie du cycle 2 (annexe 3 de l’arrêté du 22 avril 2026, BO n° 22 du 28 mai 2026) ; pages du PDF de l’annexe',
    url: 'https://www.education.gouv.fr/sites/default/files/document/annexe-3-programme-d-histoire-geographie-cycle-2-516776.pdf',
    page: 'https://www.education.gouv.fr/bo/2026/Hebdo22/MENE2608631A',
  },
  c3histgeo: {
    titre: 'Programme d’histoire-géographie du cycle 3 (annexe 4 de l’arrêté du 22 avril 2026, BO n° 22 du 28 mai 2026) ; pages du PDF de l’annexe',
    url: 'https://www.education.gouv.fr/sites/default/files/document/annexe-4-programme-d-histoire-geographie-cycle-3-516779.pdf',
    page: 'https://www.education.gouv.fr/bo/2026/Hebdo22/MENE2608631A',
  },
  emc: {
    titre: 'Programme d’enseignement moral et civique du CP à la terminale (annexe de l’arrêté du 29 mai 2024, BO n° 24 du 13 juin 2024) ; pages du PDF de l’annexe',
    url: 'https://www.education.gouv.fr/sites/default/files/document/Annexe%20%E2%80%94%20Programme%20d%E2%80%99enseignement%20moral%20et%20civique%20du%20cours%20pr%C3%A9paratoire%20%C3%A0%20la%20classe%20terminale%20des%20voies%20g%C3%A9n%C3%A9rale,%20technologique%20et%20professionnelle%20et%20des%20classes%20pr%C3%A9parant%20au%20CAP-402159.pdf',
    page: 'https://www.education.gouv.fr/bo/2024/Hebdo24/MENE2413934A',
  },
  // Anciens programmes, plus en vigueur : seulement pour dater une notion qui a disparu (copies académiques du texte)
  c2ancien2015: {
    titre: 'Ancien programme du cycle 2 (BO spécial n° 11 du 26 novembre 2015), copie de l’académie de Versailles — abrogé',
    url: 'https://sti.ac-versailles.fr/IMG/pdf/c2.pdf',
  },
  c2ancien2020: {
    titre: 'Ancien programme du cycle 2 consolidé (BO n° 31 du 30 juillet 2020), copie de la circonscription Mulhouse 1 — abrogé',
    url: 'https://circ-ien-mulhouse1.site.ac-strasbourg.fr/wp-content/uploads/2021/06/2020-07-C2.pdf',
  },
  c1consolide: {
    titre: 'Programme de l’école maternelle consolidé (Éduscol, d’après les BO n° 41 de 2024 et n° 19 de 2026)',
    url: 'https://eduscol.education.gouv.fr/sites/default/files/document/programme-cycle-1-consolide-127565.pdf',
  },
}

// Pages destinées aux parents (education.gouv.fr) et ressources pour les enseignants (Éduscol).
// Choix : il n'existe pas de page « parent » par domaine ; on renvoie à la page « Programmes et horaires » du cycle.
const PARENTS: Record<Cycle, string> = {
  1: 'https://www.education.gouv.fr/cid33/programmes-et-horaires-a-l-ecole-maternelle.html',
  2: 'https://www.education.gouv.fr/programmes-et-horaires-l-ecole-elementaire-9011',
  3: 'https://www.education.gouv.fr/programmes-et-horaires-l-ecole-elementaire-9011',
}
export const RESSOURCES = {
  cycle1: 'https://eduscol.education.gouv.fr/4341/enseigner-au-cycle-1',
  cycle2: 'https://eduscol.education.gouv.fr/4347/enseigner-au-cycle-2',
  cycle3: 'https://eduscol.education.gouv.fr/4356/enseigner-au-cycle-3',
  maths2: 'https://eduscol.education.gouv.fr/4746/ressources-d-accompagnement-du-programme-de-mathematiques-au-cycle-2',
  maths3: 'https://eduscol.education.gouv.fr/5712/ressources-d-accompagnement-du-programme-de-mathematiques-au-cycle-3',
  francais2: 'https://eduscol.education.fr/156/francais-cycle-2-socle-commun',
  francais3: 'https://eduscol.education.gouv.fr/4800/ressources-d-accompagnement-du-programme-de-francais-au-cycle-3',
}

const src = (texte: SourceId, page: number, extrait: string): Source => ({ texte, page, url: `${SOURCES[texte].url}#page=${page}`, extrait })
const parCycle = <T>(cycles: readonly Cycle[], f: (cycle: Cycle) => T): ParCycle<T> => Object.fromEntries(cycles.map(c => [c, f(c)]))

// ── Domaines ──
// Cycle 1 : les noms sont ceux des « thématiques » du domaine « L'acquisition des premiers outils mathématiques »
// (BO n° 41, annexe 2) ou des parties du domaine « Le développement et la structuration du langage oral et écrit »
// (annexe 1) ; les rattacher aux domaines des cycles 2 et 3 est une interprétation (continuité affichée par les textes).
export const DOMAINES = [
  // Mathématiques
  {
    id: 'nombres-calcul', court: 'Nombres et calcul', matiere: 'maths', cycles: [1, 2, 3],
    officiel: { 1: 'Découvrir les nombres ; Utiliser les nombres pour résoudre des problèmes', 2: 'Nombres, calcul et résolution de problèmes', 3: 'Nombres, calcul et résolution de problèmes' },
    source: { 1: src('bo41', 59, 'Découvrir les nombres'), 2: src('c2maths', 3, 'Nombres, calcul et résolution de problèmes'), 3: src('c3maths', 5, 'Nombres, calcul et résolution de problèmes') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'grandeurs-mesures', court: 'Grandeurs et mesures', matiere: 'maths', cycles: [1, 2, 3],
    officiel: { 1: 'Explorer des grandeurs : la longueur, la masse', 2: 'Grandeurs et mesures', 3: 'Grandeurs et mesures' },
    source: { 1: src('bo41', 69, 'Explorer des grandeurs : la longueur, la masse'), 2: src('c2maths', 25, 'Grandeurs et mesures'), 3: src('c3maths', 16, 'Grandeurs et mesures') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'espace-geometrie', court: 'Espace et géométrie', matiere: 'maths', cycles: [1, 2, 3],
    officiel: { 1: 'Explorer les solides et les formes planes', 2: 'Espace et géométrie', 3: 'Espace et géométrie' },
    source: { 1: src('bo41', 68, 'Explorer les solides et les formes planes'), 2: src('c2maths', 31, 'Espace et géométrie'), 3: src('c3maths', 20, 'Espace et géométrie') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'donnees', court: 'Données', matiere: 'maths', cycles: [2, 3],
    officiel: { 2: 'Organisation et gestion de données', 3: 'Organisation et gestion de données et probabilités' },
    source: { 2: src('c2maths', 37, 'Organisation et gestion de données'), 3: src('c3maths', 24, 'Organisation et gestion de données et probabilités') },
    lien: parCycle([2, 3], c => PARENTS[c]),
  },
  {
    id: 'proportionnalite', court: 'Proportionnalité', matiere: 'maths', cycles: [3],
    officiel: { 3: 'La proportionnalité' },
    source: { 3: src('c3maths', 26, 'La proportionnalité') },
    lien: { 3: PARENTS[3] },
  },
  {
    id: 'pensee-informatique', court: 'Pensée informatique', matiere: 'maths', cycles: [3],
    officiel: { 3: 'Initiation à la pensée informatique' },
    source: { 3: src('c3maths', 27, 'Initiation à la pensée informatique') },
    lien: { 3: PARENTS[3] },
  },
  {
    id: 'motifs', court: 'Motifs organisés', matiere: 'maths', cycles: [1],
    officiel: { 1: 'Se familiariser avec les motifs organisés' },
    source: { 1: src('bo41', 70, 'Se familiariser avec les motifs organisés') },
    lien: { 1: PARENTS[1] },
  },
  {
    // domaine du BO n° 19 (2026), hors mathématiques au cycle 1 ; au cycle 2, l'heure et les durées sont dans
    // « Grandeurs et mesures » et le calendrier relève de l'histoire-géographie (voir « Le monde » plus bas)
    id: 'temps-espace', court: 'Se repérer dans le temps et l’espace', matiere: 'monde', cycles: [1],
    officiel: { 1: 'Se repérer dans le temps et l’espace' },
    source: { 1: src('bo19', 23, 'Se repérer dans le temps et l’espace') },
    lien: { 1: PARENTS[1] },
  },
  // Le monde (matière `monde`) : sciences et technologie, histoire-géographie, EMC (voir l'en-tête). Au cycle 1, le
  // temps et l'espace sont dans `temps-espace` ci-dessus ; au cycle 2, le calendrier et les repères d'espace relèvent
  // de l'histoire-géographie (domaines `histoire` et `geographie`).
  {
    id: 'vivant', court: 'Les êtres vivants', matiere: 'monde', cycles: [1, 2, 3],
    officiel: { 1: 'Découvrir le monde du vivant', 2: 'Les êtres vivants dans leur environnement', 3: 'Les êtres vivants dans leur environnement' },
    source: { 1: src('bo19', 30, 'Découvrir le monde du vivant'), 2: src('c2sciences', 5, 'Les êtres vivants dans leur environnement'), 3: src('c3sciences', 9, 'Les êtres vivants dans leur environnement') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'corps-sante', court: 'Le corps humain et la santé', matiere: 'monde', cycles: [1, 2, 3],
    officiel: { 1: 'Découvrir le corps humain et la santé', 2: 'Le corps humain et la santé', 3: 'Le corps humain et la santé' },
    source: { 1: src('bo19', 31, 'Découvrir le corps humain et la santé'), 2: src('c2sciences', 8, 'Le corps humain et la santé'), 3: src('c3sciences', 14, 'Le corps humain et la santé') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'matiere', court: 'La matière', matiere: 'monde', cycles: [1, 2, 3],
    officiel: { 1: 'Découvrir les états de la matière et les mélanges', 2: 'La matière, les mesures, l’électricité', 3: 'La matière, les mouvements et les signaux' },
    source: { 1: src('bo19', 33, 'Découvrir les états de la matière et les mélanges'), 2: src('c2sciences', 3, 'La matière, les mesures, l’électricité'), 3: src('c3sciences', 3, 'La matière, les mouvements et les signaux') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'objets-techniques', court: 'Objets et technologie', matiere: 'monde', cycles: [1, 2, 3],
    officiel: { 1: 'Découvrir les objets et les matériaux', 2: 'Les objets techniques au cœur de la société', 3: 'Les objets techniques au cœur de la société' },
    source: { 1: src('bo19', 32, 'Découvrir les objets et les matériaux'), 2: src('c2sciences', 10, 'Les objets techniques au cœur de la société'), 3: src('c3sciences', 16, 'Les objets techniques au cœur de la société') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'histoire', court: 'Histoire', matiere: 'monde', cycles: [2, 3],
    officiel: { 2: 'Histoire', 3: 'Histoire' },
    source: { 2: src('c2histgeo', 3, 'Histoire (cours préparatoire, thème 1)'), 3: src('c3histgeo', 4, 'Histoire (cours moyen première année)') },
    lien: parCycle([2, 3], c => PARENTS[c]),
  },
  {
    id: 'geographie', court: 'Géographie', matiere: 'monde', cycles: [2, 3],
    officiel: { 2: 'Géographie', 3: 'Géographie' },
    source: { 2: src('c2histgeo', 6, 'Géographie (cours préparatoire : des clés pour se repérer)'), 3: src('c3histgeo', 11, 'Géographie (cours moyen première année)') },
    lien: parCycle([2, 3], c => PARENTS[c]),
  },
  {
    id: 'emc', court: 'Enseignement moral et civique', matiere: 'monde', cycles: [2, 3],
    officiel: { 2: 'Enseignement moral et civique', 3: 'Enseignement moral et civique' },
    source: { 2: src('emc', 7, 'CP : Se reconnaitre comme individu et élève'), 3: src('emc', 11, 'CM1 : Faire société') },
    lien: parCycle([2, 3], c => PARENTS[c]),
  },
  // Français (au cycle 1 : domaine « Le développement et la structuration du langage oral et écrit »)
  {
    id: 'lecture', court: 'Lecture', matiere: 'francais', cycles: [1, 2, 3],
    officiel: { 1: 'Passer de l’oral à l’écrit : se préparer à apprendre à lire', 2: 'Lecture', 3: 'Lecture' },
    source: { 1: src('bo41', 51, 'Passer de l’oral à l’écrit : se préparer à apprendre à lire'), 2: src('bo41', 75, 'Lecture'), 3: src('c3francais', 2, 'Lecture') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'ecriture', court: 'Écriture', matiere: 'francais', cycles: [1, 2, 3],
    officiel: { 1: 'Passer de l’oral à l’écrit : se préparer à apprendre à écrire', 2: 'Écriture', 3: 'Écriture' },
    source: { 1: src('bo41', 55, 'Passer de l’oral à l’écrit : se préparer à apprendre à écrire'), 2: src('bo41', 80, 'Écriture'), 3: src('c3francais', 8, 'Écriture') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'oral', court: 'Oral', matiere: 'francais', cycles: [1, 2, 3],
    officiel: { 1: 'Acquérir le langage oral', 2: 'Oral', 3: 'Oral' },
    source: { 1: src('bo41', 46, 'Acquérir le langage oral'), 2: src('bo41', 85, 'Oral'), 3: src('c3francais', 10, 'Oral') },
    lien: parCycle([1, 2, 3], c => PARENTS[c]),
  },
  {
    id: 'vocabulaire', court: 'Vocabulaire', matiere: 'francais', cycles: [2, 3],
    officiel: { 2: 'Vocabulaire', 3: 'Vocabulaire' },
    source: { 2: src('bo41', 87, 'Vocabulaire'), 3: src('c3francais', 13, 'Vocabulaire') },
    lien: parCycle([2, 3], c => PARENTS[c]),
  },
  {
    // la conjugaison est une partie de ce domaine dans les deux cycles
    id: 'grammaire', court: 'Grammaire et conjugaison', matiere: 'francais', cycles: [2, 3],
    officiel: { 2: 'Grammaire et orthographe', 3: 'Grammaire et orthographe grammaticale' },
    source: { 2: src('bo41', 91, 'Grammaire et orthographe'), 3: src('c3francais', 15, 'Grammaire et orthographe grammaticale') },
    lien: parCycle([2, 3], c => PARENTS[c]),
  },
  {
    id: 'culture-litteraire', court: 'Culture littéraire', matiere: 'francais', cycles: [3],
    officiel: { 3: 'Culture littéraire et artistique' },
    source: { 3: src('c3francais', 6, 'Culture littéraire et artistique') },
    lien: { 3: PARENTS[3] },
  },
] as const satisfies readonly Domaine[]

// ── Entrées fictives des exemples (src/exercices/exemple/, src/affiches/exemple/) ──
// Pour que les exemples ne dépendent pas des vraies données. Présentes avec `npm run dev` et dans node (tests, scripts),
// absentes d'un build de production (import.meta.env.PROD : remplacé par Vite, puis le code mort est retiré) ; `DOMAINES`
// et `COMPETENCES` ne les contiennent jamais, donc ni la couverture, ni le catalogue, ni la page « Le programme » ne les
// voient. Seuls domaineDe, competenceDe et competencesDu les connaissent.
// condition écrite ici avec les littéraux de Vite (src/dev.ts) : en production le code mort est retiré, ids et textes compris
const AVEC_EXEMPLES: boolean = import.meta.env ? (import.meta.env.DEV || !!import.meta.env.VITE_AVEC_DEV) : AVEC_DEV

export const DOMAINES_EXEMPLE = AVEC_EXEMPLES ? [
  { id: 'exemple', court: 'Exemple (développement)', matiere: 'maths', cycles: [1, 2, 3], officiel: {}, source: {}, lien: {}, devSeulement: true },
] as const satisfies readonly Domaine[] : []

// ── Compétences utiles à nos activités (pas tout le programme) ──
const c = <const I extends string, const D extends DomaineId>(
  id: I, domaine: D, libelle: string, niveaux: readonly Classe[], source: Source, extra: { interpretation?: string, devSeulement?: true } = {},
) => ({ id, domaine, libelle, niveaux, source, ...extra })
const depuis = classesDepuis     // de n jusqu'au CM2
const entre = classesEntre

// Le monde, sciences et histoire-géographie : CE1, CE2 et CM2 suivent les nouveaux programmes à la rentrée 2027 seulement
// (en 2026-2027 : anciens programmes, non relus) ; la note est ajoutée à l'`interpretation` de chaque compétence concernée.
const APRES_2026: readonly Classe[] = ['ce1', 'ce2', 'cm2']
const m = <const I extends string, const D extends DomaineId>(
  id: I, domaine: D, libelle: string, niveaux: readonly Classe[], source: Source, interpretation?: string,
) => {
  const concernees = niveaux.filter(n => APRES_2026.includes(n)).map(n => n.toUpperCase())
  const note = concernees.length ? `${concernees.join(', ')} : texte applicable à la rentrée 2027 (en 2026-2027, ces classes suivent encore l’ancien programme, non relu)` : ''
  const texte = [interpretation, note].filter(Boolean).join(' ; ')
  return c(id, domaine, libelle, niveaux, source, texte ? { interpretation: texte } : {})
}

export const COMPETENCES = [
  // Nombres et calcul — cycle 1
  c('denombrer-6', 'nombres-calcul', 'Compter une collection jusqu’à 6, écrire les chiffres de 1 à 6, réciter la comptine jusqu’à 12', ['ms'],
    src('bo41', 62, 'À partir de 4 ans : constituer une collection d’un cardinal donné (jusqu’à six objets) ; écrire en chiffres les nombres de un à six ; comptine de un à douze')),
  c('denombrer-10', 'nombres-calcul', 'Compter jusqu’à 10 (voire au-delà), écrire les nombres de 1 à 10, réciter la comptine jusqu’à 30', ['gs'],
    src('bo41', 63, 'À partir de 5 ans : collection d’un cardinal donné (jusqu’à dix, voire au-delà) ; écrire en chiffres les nombres de un à dix ; comptine jusqu’à trente (p. 64)')),
  c('denombrer-3', 'nombres-calcul', 'Compter une petite collection jusqu’à 3 (voire 4), la montrer avec ses doigts, réciter la comptine jusqu’à 6', ['ps'],
    src('bo41', 60, 'Avant 4 ans : dénombrer et constituer une collection jusqu’à trois, voire quatre ; doigts, constellations ; un de plus ; comptine de un à six (p. 61)')),
  c('comparer-quantites', 'nombres-calcul', 'Comparer deux quantités (plus, moins, autant)', ['ps', 'ms', 'gs'],
    src('bo41', 61, 'Avant 4 ans : comparer globalement (sans dénombrer) deux collections dont les quantités diffèrent d’un facteur au moins égal à deux ; objectif repris à 4 et 5 ans (p. 62-63)')),
  c('composer-decomposer', 'nombres-calcul', 'Composer et décomposer les petits nombres (« trois, c’est deux et un »)', ['ps', 'ms', 'gs'],
    src('bo41', 61, 'Avant 4 ans : deux, trois, voire quatre (« un et un font deux ») ; nombres inférieurs ou égaux à six à 4 ans (p. 62), à dix à 5 ans (p. 63)')),
  c('bande-numerique', 'nombres-calcul', 'Ranger les nombres sur la bande numérique (jusqu’à 6, puis jusqu’à 10)', ['ms', 'gs'],
    src('bo41', 65, 'Se familiariser avec le début de la bande numérique (nombres ≤ 6, 4 ans) ; construire la bande numérique jusqu’à dix (5 ans)')),
  c('problemes-maternelle', 'nombres-calcul', 'Résoudre de petits problèmes : réunir, ajouter, retirer, partager', ['ps', 'ms', 'gs'],
    src('bo41', 66, 'Avant 4 ans : parties-tout avec du matériel (la valise : deux peluches et encore une) ; problèmes d’ajout et de retrait, de groupement, de partage équitable (p. 66-67)')),
  // Nombres et calcul — cycles 2 et 3
  c('numeration-100', 'nombres-calcul', 'Lire, écrire et décomposer les nombres jusqu’à 100 (dizaines et unités)', ['cp'],
    src('c2maths', 3, 'CP : « Les connaissances et les savoir-faire attendus concernent les nombres entiers jusqu’à cent. »')),
  c('numeration-1000', 'nombres-calcul', 'Lire, écrire et décomposer les nombres jusqu’à 1 000 (centaines)', ['ce1'],
    src('c2maths', 10, 'CE1 : « Les connaissances et savoir-faire attendus concernent les nombres jusqu’à mille. »')),
  c('numeration-10000', 'nombres-calcul', 'Lire, écrire et décomposer les nombres jusqu’à 10 000', ['ce2'],
    src('c2maths', 19, 'CE2 : « Les connaissances et savoir-faire attendus concernent les nombres jusqu’à 10 000. »')),
  c('numeration-6-chiffres', 'nombres-calcul', 'Les grands nombres jusqu’à 999 999 (classe des milliers)', ['cm1'],
    src('c3maths', 5, 'CM1 : nombres s’écrivant avec au plus six chiffres ; au plus quatre chiffres pendant les périodes 1 et 2')),
  c('numeration-9-chiffres', 'nombres-calcul', 'Les grands nombres jusqu’à 999 999 999 (classe des millions)', ['cm2'],
    src('c3maths', 9, 'CM2 : nombres s’écrivant avec au plus neuf chiffres ; au plus six chiffres pendant les périodes 1 et 2')),
  c('nombres-en-lettres', 'nombres-calcul', 'Écrire les nombres en lettres (jusqu’à 50 au CP, puis dans tout le champ de l’année)', ['cp', 'ce1', 'ce2'],
    src('c2maths', 4, 'CP : « À la fin du CP, l’élève maitrise l’écriture en lettres des nombres jusqu’à cinquante. » ; CE1 p. 11 et CE2 p. 19 : écrire en chiffres et en lettres (six-cent-trente-cinq…)')),
  c('comparer-ranger', 'nombres-calcul', 'Comparer, encadrer et ranger des nombres avec =, < et >', depuis('cp'),
    src('c2maths', 4, 'Comparer, encadrer, intercaler des nombres entiers en utilisant les symboles =, < et > (CP ; repris CE1 p. 11, CE2 p. 20, CM1 et CM2 c3maths p. 5 et 9)')),
  c('droite-graduee', 'nombres-calcul', 'Placer des nombres sur une demi-droite graduée', depuis('cp'),
    src('c2maths', 4, 'CP : savoir placer des nombres sur une demi-droite graduée de un en un ; CE1 p. 11, CE2 p. 20 ; CM1 c3maths p. 5')),
  c('ordinaux', 'nombres-calcul', 'Les nombres ordinaux (premier, deuxième…) et le rang dans une file', ['cp', 'ce1'],
    src('c2maths', 4, 'Connaitre les nombres ordinaux ; repérer un rang ou une position dans une file (CP, CE1 p. 11)')),
  c('suites-nombres', 'nombres-calcul', 'Trouver la règle d’une suite de nombres ou de motifs et la poursuivre', depuis('ce1'),
    src('c2maths', 11, 'CE1 : suites évolutives (« 1, 2, 4, 7, 11… ») ; CM1 c3maths p. 9 et CM2 p. 13 : identifier et formuler une règle pour poursuivre une suite')),
  c('parite-multiples', 'nombres-calcul', 'Nombres pairs et impairs, puis multiples', depuis('ce1'),
    src('c2maths', 14, 'CE1 : connaitre la notion de parité ; CE2 p. 21 : « facteur », « produit », « multiple » ; CM1 c3maths p. 5 : multiples de 2, 5 et 10')),
  c('criteres-divisibilite', 'nombres-calcul', 'Reconnaître les multiples de 2, de 5 et de 10 (critères de divisibilité)', ['cm1', 'cm2'],
    src('c3maths', 5, '« Seuls les critères de divisibilité par 2, par 5 et par 10 figurent au programme. » (CM1 ; CM2 p. 9)')),
  c('diviseurs', 'nombres-calcul', 'Trouver les diviseurs d’un nombre (jusqu’à 100) et les diviseurs communs', ['cm2'],
    src('c3maths', 9, 'CM2 : déterminer des diviseurs d’un nombre ≤ 100, tous les diviseurs d’un nombre ≤ 30, les diviseurs communs à deux nombres ≤ 30')),
  c('fractions-unitaires', 'nombres-calcul', 'Moitié, demi, quart ; lire et représenter 1/2, 1/3, 1/4, 1/5, 1/6, 1/8, 1/10', depuis('ce1'),
    src('c2maths', 12, 'CE1 : « familiariser les élèves avec les mots moitié, demi et quart », puis fractions unitaires dès la période 2 ; dénominateur 2, 3, 4, 5, 6, 8 ou 10')),
  c('fractions-inferieures-1', 'nombres-calcul', 'Lire, écrire et représenter des fractions d’un tout (jusqu’à 1)', depuis('ce1'),
    src('c2maths', 12, 'CE1 : savoir interpréter, représenter, écrire et lire des fractions inférieures ou égales à 1')),
  c('fractions-comparer', 'nombres-calcul', 'Comparer des fractions', depuis('ce1'),
    src('c2maths', 13, 'CE1 : comparer des fractions de même dénominateur, ou de numérateur 1 ; CE2 p. 21 : comparer des fractions inférieures à 1 ; CM1 c3maths p. 6')),
  c('fractions-additionner', 'nombres-calcul', 'Additionner et soustraire des fractions', depuis('ce1'),
    src('c2maths', 13, 'CE1 : de même dénominateur ; CE2 p. 21 ; CM1 c3maths p. 6 ; CM2 p. 10')),
  c('fractions-egales', 'nombres-calcul', 'Trouver des fractions égales (3/4 = 6/8)', depuis('ce2'),
    src('c2maths', 20, 'CE2 : savoir établir des égalités de fractions inférieures ou égales à 1')),
  c('fractions-mesure', 'nombres-calcul', 'Mesurer avec une bande-unité graduée en quarts ou en dixièmes', depuis('ce2'),
    src('c2maths', 20, 'CE2 : partager une unité de longueur en fractions d’unité et mesurer des longueurs non entières')),
  c('fractions-superieures-1', 'nombres-calcul', 'Fractions plus grandes que 1 : 7/4 = 1 + 3/4, les placer sur une droite graduée', ['cm1', 'cm2'],
    src('c3maths', 5, 'CM1 : étendre l’étude aux fractions supérieures à 1 ; écrire une fraction > 1 comme somme d’un entier et d’une fraction < 1 (p. 6)')),
  c('fraction-quantite', 'nombres-calcul', 'Calculer une fraction d’une quantité (un tiers de 12, deux tiers de 12 €)', ['cm1', 'cm2'],
    src('c3maths', 6, 'CM1 : opérateur multiplicatif pour les fractions unitaires (« un tiers de 12 billes ») ; CM2 p. 10 : « deux tiers de 12 € »')),
  c('decimaux', 'nombres-calcul', 'Nombres décimaux : dixièmes et centièmes (CM1), puis millièmes (CM2)', ['cm1', 'cm2'],
    src('c3maths', 6, 'CM1 : « les nombres décimaux rencontrés ne vont pas au-delà des centièmes » ; CM2 p. 10 : « s’étend aux millièmes »')),
  c('tables-addition', 'nombres-calcul', 'Connaître les tables d’addition dans les deux sens', entre('cp', 'ce2'),
    src('c2maths', 6, 'CP : A + B = C ou C = A + B, avec A et B entre 0 et 10 ; CE1 p. 14, CE2 p. 22')),
  c('tables-multiplication', 'nombres-calcul', 'Connaître les tables de multiplication dans les deux sens', depuis('ce1'),
    src('c2maths', 14, 'CE1 : A × B = C ou C = A × B, A et B entre 0 et 10 ; apprentissage étalé sur l’année, renforcé au CE2 (p. 22) et au cours moyen (c3maths p. 7)')),
  c('doubles-moities', 'nombres-calcul', 'Connaître les doubles et les moitiés des nombres usuels', depuis('cp'),
    src('c2maths', 6, 'Listes de valeurs par année : CP p. 6, CE1 p. 14, CE2 p. 22 ; CM2 c3maths p. 11 : moitié des nombres impairs jusqu’à 15 et des décimaux simples')),
  c('complement-dizaine', 'nombres-calcul', 'Trouver le complément à la dizaine supérieure (74 + … = 80)', depuis('cp'),
    src('c2maths', 6, 'CP : trouver le complément d’un nombre à la dizaine supérieure')),
  c('ajouter-dizaines', 'nombres-calcul', 'Ajouter ou retirer 1, 2, 10, 20, 30… puis des centaines', depuis('cp'),
    src('c2maths', 6, 'CP : ajouter ou soustraire 1 ou 2, 10, 20, 30… ; CE1 p. 15 : un nombre entier de dizaines ou de centaines')),
  c('ajouter-9', 'nombres-calcul', 'Ajouter ou retirer 9, 19, 29… (passer par la dizaine)', depuis('cp'),
    src('c2maths', 7, 'CP : ajouter 9 ; CE1 p. 15 : ajouter 9, 19 ou 29, soustraire 9 ; CE2 p. 23 : 8, 9, 18, 19…, 39 ; CM2 c3maths p. 11 : jusqu’à 98 ou 99')),
  c('multiplier-10-100', 'nombres-calcul', 'Multiplier par 10, 100, 1 000 (puis diviser un décimal par 10, 100, 1 000)', depuis('ce1'),
    src('c2maths', 15, 'CE1 : multiplier par 10 un nombre < 100 ; CE2 p. 22 : par 10 ou 100 ; CM1 c3maths p. 7 : par 1 000, décimal × et ÷ 10 ; CM2 p. 11 : décimal × et ÷ 10, 100, 1 000')),
  c('addition-posee', 'nombres-calcul', 'Poser et calculer une addition en colonnes', depuis('cp'),
    src('c2maths', 5, 'CP : poser et effectuer des additions en colonnes')),
  c('soustraction-posee', 'nombres-calcul', 'Poser et calculer une soustraction en colonnes', depuis('ce1'),
    src('c2maths', 13, 'CE1 : poser et effectuer des additions et des soustractions en colonnes')),
  c('multiplication-posee', 'nombres-calcul', 'Poser et calculer une multiplication', depuis('ce2'),
    src('c2maths', 21, 'CE2 : multiplications d’un nombre à deux ou trois chiffres par un nombre à un ou deux chiffres ; CM1 c3maths p. 7 : deux entiers, décimal × entier < 10')),
  c('division-posee', 'nombres-calcul', 'Poser et calculer une division (diviseur à un chiffre)', ['cm1', 'cm2'],
    src('c3maths', 7, 'CM1 : divisions euclidiennes avec un diviseur à un chiffre ; CM2 p. 11 : divisions décimales, diviseur à un chiffre')),
  c('operations-decimaux', 'nombres-calcul', 'Additionner et soustraire des nombres décimaux posés en colonnes', ['cm1', 'cm2'],
    src('c3maths', 7, 'CM1 : poser en colonnes et effectuer des additions et des soustractions de nombres décimaux')),
  c('sens-multiplication', 'nombres-calcul', 'Comprendre le sens de la multiplication (puis le signe ×)', depuis('cp'),
    src('c2maths', 5, 'CP : comprendre le sens de la multiplication ; CE1 p. 13 : comprendre et utiliser le symbole « × »')),
  c('sens-division', 'nombres-calcul', 'Comprendre le sens de la division (partage, « combien de fois »)', depuis('ce2'),
    src('c2maths', 21, 'CE2 : comprendre le sens de la division et utiliser le symbole ÷')),
  c('egalites-a-trous', 'nombres-calcul', 'Trouver le nombre manquant dans une égalité (178 − … = 6 × 8)', ['cm1', 'cm2'],
    src('c3maths', 9, 'Algèbre, CM1 : trouver le nombre manquant dans une égalité à trous (CM2 p. 13)'),
    { interpretation: 'les « égalités à trous » sont aussi utilisées en calcul mental dès le CP (exemples de réussite), mais ne sont un objectif nommé qu’au CM1' }),
  c('problemes-additifs', 'nombres-calcul', 'Résoudre des problèmes d’addition et de soustraction (parties-tout, comparaison)', depuis('cp'),
    src('c2maths', 9, 'CP : problèmes additifs en une étape (parties-tout), en deux étapes (champ ≤ 30) ; CE1 p. 17 : comparaison')),
  c('problemes-multiplicatifs', 'nombres-calcul', 'Résoudre des problèmes de multiplication et de partage', depuis('cp'),
    src('c2maths', 9, 'CP : problèmes multiplicatifs en une étape (champ ≤ 30) ; CE1 p. 18 ; CE2 p. 25 : comparaison multiplicative (« fois plus »)')),
  c('problemes-etapes', 'nombres-calcul', 'Résoudre des problèmes en deux ou trois étapes', depuis('cp'),
    src('c2maths', 9, 'CP : additifs en deux étapes ; CE1 p. 19 : mixtes en deux étapes ; CE2 p. 25 : deux ou trois étapes ; CM1 c3maths p. 8')),
  // Grandeurs et mesures
  c('comparer-longueurs-maternelle', 'grandeurs-mesures', 'Comparer et ranger des objets selon leur longueur', ['ps', 'ms', 'gs'],
    src('bo41', 69, 'Avant 4 ans : même longueur, plus long quand les longueurs sont très différentes ; 4 ans : comparer directement, classer, ordonner ; 5 ans : comparer indirectement (bande témoin), ordonner jusqu’à cinq objets (p. 70)')),
  c('comparer-masses-maternelle', 'grandeurs-mesures', 'Comparer la masse de deux objets (plus lourd, plus léger)', ['ms', 'gs'],
    src('bo41', 70, '« la masse n’est introduite qu’à partir de quatre ans » (p. 69) ; 5 ans : ordonner les masses de trois objets, balance Roberval')),
  c('longueurs', 'grandeurs-mesures', 'Mesurer avec la règle ; m et cm (CP), km (CE1), dm et mm (CE2), du mm au km (CM1)', depuis('cp'),
    src('c2maths', 25, 'CP : unités mètre et centimètre, 1 m = 100 cm ; CE1 p. 27 : + km ; CE2 p. 29 : m, dm, cm, mm, km ; CM1 c3maths p. 17 : du millimètre au kilomètre')),
  c('masses', 'grandeurs-mesures', 'Peser et comparer des masses ; g et kg (CE1), tonne (CE2), mg (CM1)', depuis('cp'),
    src('c2maths', 26, 'CP : comparer des objets selon leur masse ; CE1 p. 27 : g, kg, 1 kg = 1 000 g ; CE2 p. 30 : + tonne ; CM1 c3maths p. 17 : du milligramme au kilogramme et la tonne')),
  c('contenances', 'grandeurs-mesures', 'Contenances : L, dL, cL (CE2), puis du mL à l’hL (CM1)', depuis('ce2'),
    src('c2maths', 30, 'CE2 : unités litre, décilitre, centilitre ; 1 L = 10 dL = 100 cL ; CM1 c3maths p. 17 : du millilitre à l’hectolitre')),
  c('perimetre', 'grandeurs-mesures', 'Le périmètre d’un polygone', depuis('ce2'),
    src('c2maths', 29, 'CE2 : savoir ce qu’est le périmètre ; le déterminer avec une règle graduée ; CM1 c3maths p. 17')),
  c('aires', 'grandeurs-mesures', 'Comparer et mesurer des aires (cm², puis dm² et m²)', ['cm1', 'cm2'],
    src('c3maths', 17, 'CM1 : aire introduite, cm² ; CM2 p. 18 : cm², dm², m², aire du carré et du rectangle')),
  c('angles', 'grandeurs-mesures', 'Comparer des angles ; l’angle droit mesure 90°', ['cm1', 'cm2'],
    src('c3maths', 17, 'CM1 : comparer des angles ; CM2 p. 18 : unité degré, angle droit = 90°, pas de rapporteur')),
  c('monnaie-euros', 'grandeurs-mesures', 'Compter, payer et rendre la monnaie en euros (montants entiers jusqu’à 100 €)', depuis('cp'),
    src('c2maths', 26, 'CP : « Les montants sont des nombres entiers d’euros toujours inférieurs ou égaux à cent. »')),
  c('monnaie-centimes', 'grandeurs-mesures', 'Euros et centimes : 1 € = 100 c, écriture à virgule (3,50 €)', depuis('ce1'),
    src('c2maths', 28, 'CE1 : centimes au plus tard en période 2, écriture à virgule à partir de la période 3 ; CE2 p. 30 : poser des additions et soustractions de montants')),
  c('heure-entiere', 'grandeurs-mesures', 'Lire l’heure sur une horloge : les heures entières', depuis('cp'),
    src('c2maths', 26, 'CP : lire une heure en heures entières ; positionner les aiguilles (heures entières ≤ 12) ; « se limite aux heures entières »')),
  c('heure-demi-quart', 'grandeurs-mesures', 'Lire l’heure : et demie, et quart, moins le quart ; heures du matin et de l’après-midi', depuis('ce1'),
    src('c2maths', 28, 'CE1 : heures entières, heures et demi-heure, heures et quarts d’heure ; heures entières supérieures à douze')),
  c('heure-minutes', 'grandeurs-mesures', 'Lire l’heure à la minute près', depuis('ce2'),
    src('c2maths', 31, 'CE2 : lire l’heure sur une horloge à aiguilles ; positionner les aiguilles en heures et minutes')),
  c('durees', 'grandeurs-mesures', 'Calculer une durée (h, min), puis avec les secondes (CM2)', depuis('ce1'),
    src('c2maths', 29, 'CE1 : unités heure et minute, durées en heures, demi-heures et quarts d’heure ; CE2 p. 31 ; CM2 c3maths p. 18 : introduction des secondes')),
  // Espace et géométrie
  c('formes-maternelle', 'espace-geometrie', 'Trier les objets selon leur forme (PS), reconnaître (MS) puis nommer (GS) carré, rectangle, triangle et disque', ['ps', 'ms', 'gs'],
    src('bo41', 68, 'Avant 4 ans : reconnaitre, trier et classer des objets selon leur forme, sans les faire nommer prématurément ; 4 ans (p. 69) : reconnaitre et classer triangle, carré, disque ; 5 ans : décrire et nommer carré, rectangle, triangle, disque'),
    { interpretation: 'PS : aucune liste de formes dans le texte ; nous utilisons disque, carré, triangle (liste de 4 ans) sans les faire nommer' }),
  c('solides-maternelle', 'espace-geometrie', 'Reconnaître puis décrire cube, pavé, boule, pyramide, cylindre, cône', ['ms', 'gs'],
    src('bo41', 69, '4 ans : reconnaitre et classer cube, boule, pyramide à base carrée, cylindre ; 5 ans : décrire cube, pavé, boule, pyramides, cylindre, cône')),
  c('assemblages-maternelle', 'espace-geometrie', 'Reproduire un assemblage (puzzle, pavage, tour de cubes)', ['ps', 'ms', 'gs'],
    src('bo41', 69, 'Avant 4 ans : au plus quatre éléments ; puis assemblages de solides (au maximum cinq) et de formes planes (au maximum huit à 5 ans)')),
  c('figures-planes', 'espace-geometrie', 'Reconnaître, nommer et décrire les figures planes (liste par année)', depuis('cp'),
    src('c2maths', 32, 'CP : disque, carré, rectangle, triangle ; CE1 p. 34 : + cercle, triangle rectangle ; CE2 p. 36 : + losange ; CM1 c3maths p. 20 : triangles isocèle et équilatéral, quadrilatère ; CM2 p. 21 : + trapèze, trapèze rectangle, pentagone, hexagone')),
  c('angle-droit', 'espace-geometrie', 'Repérer et tracer un angle droit avec l’équerre', depuis('ce1'),
    src('c2maths', 34, 'CE1 : utiliser l’équerre pour vérifier qu’un angle est droit ; code de l’angle droit')),
  c('tracer-figures', 'espace-geometrie', 'Reproduire ou tracer des figures sur quadrillage, à la règle puis à l’équerre et au compas', depuis('cp'),
    src('c2maths', 32, 'CP : construire un carré, un rectangle, un triangle sur papier quadrillé ou pointé ; CE1 p. 34 : règle graduée, équerre, compas')),
  c('solides', 'espace-geometrie', 'Reconnaître, nommer et décrire les solides (faces, sommets, arêtes)', depuis('cp'),
    src('c2maths', 32, 'CP : reconnaitre cube, boule, cône, cylindre, pavé ; nommer cube, pavé, boule ; « face » ; CE1 p. 33 : + pyramide, face/sommet/arête ; CM1 c3maths p. 21 : + prisme droit')),
  c('patrons', 'espace-geometrie', 'Construire un cube à partir d’un patron (puis patron du pavé au CM2)', depuis('ce2'),
    src('c2maths', 35, 'CE2 : construire un cube à partir d’un patron ; CM1 c3maths p. 21 : reconnaître et construire un patron du cube ; CM2 p. 22 : patron du pavé')),
  c('symetrie', 'espace-geometrie', 'Axes de symétrie ; compléter une figure symétrique sur quadrillage', depuis('ce2'),
    src('c2maths', 36, 'CE2 : reconnaitre un axe de symétrie (pliage, calque) ; compléter une figure (axe vertical ou horizontal) ; CM1 c3maths p. 21 : construire le symétrique')),
  c('reperage-deplacements', 'espace-geometrie', 'Se repérer et coder un déplacement sur un quadrillage', depuis('cp'),
    src('c2maths', 33, 'CP : produire une suite d’instructions qui codent un déplacement ; CE1 p. 35 ; CM1 c3maths p. 21')),
  // Données, proportionnalité
  c('tableaux-diagrammes', 'donnees', 'Lire et remplir un tableau, un diagramme en barres', depuis('cp'),
    src('c2maths', 37, 'CP : présenter des données sous forme d’un tableau ou d’un diagramme en barres ; tableau à double entrée ; CE1-CE2 p. 38 ; CM2 c3maths p. 25 : diagramme circulaire, courbe')),
  c('probabilites', 'donnees', 'Possible, impossible, certain : premières probabilités', ['cm1', 'cm2'],
    src('c3maths', 24, 'CM1 : identifier des expériences aléatoires et toutes les issues possibles ; CM2 p. 25 : probabilité en cas d’équiprobabilité')),
  c('proportionnalite', 'proportionnalite', 'Résoudre un problème de proportionnalité (« 3 fois plus de pains, 3 fois plus cher »)', ['cm1', 'cm2'],
    src('c3maths', 26, 'CM1 : identifier une situation de proportionnalité, la résoudre par la linéarité ; pas de tableau de proportionnalité au cours moyen')),
  c('programmes-calcul', 'pensee-informatique', 'Suivre un programme de calcul ou de construction pas à pas', ['cm1', 'cm2'],
    src('c3maths', 28, 'CM1 : exécuter des programmes de calcul, codages de déplacements ; CM2 : jusqu’à trois instructions, produire des programmes de construction')),
  c('motifs-maternelle', 'motifs', 'Reproduire et continuer un motif (rouge, bleu, rouge, bleu…)', ['ps', 'ms', 'gs'],
    src('bo41', 71, 'Avant 4 ans : mémoriser, reproduire, compléter un motif répétitif très simple ; copier, identifier, compléter, prolonger un motif (p. 70) ; motifs évolutifs seulement à partir de cinq ans')),
  c('moments-journee', 'temps-espace', 'Les moments de la journée : matin, soir, jour, nuit ; avant, après, maintenant', ['ps', 'ms'],
    src('bo19', 24, 'Avant 4 ans : différencier le matin et le soir, le jour et la nuit ; 4 ans : reconnaitre le matin, le midi, l’après-midi, le soir, la nuit')),
  c('chronologie-maternelle', 'temps-espace', 'Remettre dans l’ordre des moments vécus, puis les étapes d’une histoire', ['ps', 'ms', 'gs'],
    src('bo19', 25, 'Avant 4 ans : ordonner entre eux des moments rituels vécus ; 4 ans : chronologie d’une histoire simple ; 5 ans : étapes d’un processus')),
  c('reperes-espace', 'temps-espace', 'Dans, sur, sous, devant, derrière, à côté : situer un objet', ['ps', 'ms', 'gs'],
    src('bo19', 27, 'Vocabulaire spatial : ici, là-bas, au-dessus, en dessous, dans, dedans, dehors, à côté, devant, derrière ; situer des objets entre eux à 4 ans'),
    { interpretation: 'progression par âge résumée d’après les p. 26-28, à relire avant d’en tirer des contraintes' }),
  c('categories-mots', 'oral', 'Ranger des mots-images par catégorie, trouver l’intrus', ['ps', 'ms', 'gs'],
    src('bo41', 47, 'Avant 4 ans : retrouver un intrus, attribuer un objet à une catégorie ; puis intrus dans une catégorie (4 ans), hyperonymes (5 ans)')),
  c('jours-mois', 'temps-espace', 'Les jours de la semaine (MS), les mois et les saisons (GS)', ['ms', 'gs'],
    src('bo19', 24, '4 ans : savoir que la semaine est une suite de sept jours, nommer les jours ; 5 ans : énoncer la date, nommer la plupart des mois, connaitre les saisons (p. 25)')),
  // Lecture
  c('syllabes-orales', 'lecture', 'Scander, compter et manipuler les syllabes d’un mot à l’oral', ['ps', 'ms', 'gs'],
    src('bo41', 51, 'Avant 4 ans : prononcer son prénom, puis une comptine en scandant les syllabes ; 4 ans (p. 52) : manipuler les syllabes (ajout, suppression, permutation…) ; 5 ans : rimes, phonèmes')),
  c('nom-lettres', 'lecture', 'Connaître le nom des lettres et associer capitale, script et cursive', ['ps', 'ms', 'gs', 'cp'],
    src('bo41', 52, 'Avant 4 ans (p. 51) : reconnaitre et nommer certaines lettres de son prénom, retrouver l’étiquette de son prénom en capitales ; 4 ans : lettres du prénom, correspondance lettres scriptes majuscules et minuscules et lettres cursives minuscules ; 5 ans : nom de toutes les lettres (capitale, script, cursive), b/d, p/q')),
  c('son-lettres', 'lecture', 'Connaître le son des lettres', ['gs', 'cp'],
    src('bo41', 53, '5 ans : connaitre le nom des lettres de l’alphabet et leur valeur sonore hormis les occlusives')),
  c('decodage', 'lecture', 'Déchiffrer des syllabes, des mots puis des phrases (correspondances lettres-sons)', ['cp', 'ce1'],
    src('bo41', 77, 'CP : déchiffrer selon la progression des CGP ; 30 mots par minute en fin de CP ; CE1 p. 78 : décoder toutes les CGP')),
  c('fluence', 'lecture', 'Lire à voix haute avec fluidité (30, 70 puis 90 mots par minute)', entre('cp', 'cm2'),
    src('bo41', 77, 'Fin CP : 30 mots par minute ; CE1 p. 78 : 70 ; CE2 p. 79 : 90 ; cycle 3 c3francais p. 4 : lire avec fluidité')),
  c('comprendre-texte', 'lecture', 'Comprendre un texte lu (personnages, informations, ordre des événements)', entre('cp', 'cm2'),
    src('bo41', 77, 'CP : dégager le sens global d’un texte entendu ou lu ; repris chaque année ; cycle 3 c3francais p. 4')),
  // Écriture
  c('geste-ecriture-maternelle', 'ecriture', 'Tracer des formes de base (PS), les lettres capitales (MS), puis écrire en cursive (GS)', ['ps', 'ms', 'gs'],
    src('bo41', 56, 'Avant 4 ans : tracer quelques formes de base (traits verticaux, horizontaux, points, boucles, cercles) ; 4 ans : tracer des lettres capitales, s’initier aux tracés de l’écriture cursive ; 5 ans : tracer des lettres en écriture cursive, les enchainer')),
  c('cursive', 'ecriture', 'Écrire en cursive : minuscules (CP), majuscules (CE1), automatiser (CE2)', entre('cp', 'ce2'),
    src('bo41', 80, 'CP : cursive en minuscules ; CE1 : automatise les minuscules, majuscules cursives en 2e partie d’année ; CE2 : automatise minuscules et majuscules')),
  c('copie', 'ecriture', 'Copier sans erreur (lettre, syllabe, mot, phrase)', entre('cp', 'ce2'),
    src('bo41', 81, 'Copier et acquérir des stratégies de copie (CP ; CE1 p. 83 ; CE2 p. 84)')),
  c('dictee', 'ecriture', 'Écrire sous la dictée des syllabes, des mots puis des phrases', depuis('cp'),
    src('bo41', 81, 'Encoder puis écrire sous dictée : lettres, syllabes, mots puis phrases (CP ; CE1 p. 83 ; CE2 p. 84) ; cycle 3 c3francais p. 17 : dictées hebdomadaires')),
  // Vocabulaire et orthographe lexicale
  c('ordre-alphabetique', 'vocabulaire', 'Ranger des mots dans l’ordre alphabétique, chercher dans le dictionnaire', depuis('cp'),
    src('bo41', 88, 'CP : commencer à mobiliser l’ordre alphabétique pour utiliser un dictionnaire adapté ; CE1 p. 89, CE2 p. 90 ; cycle 3 c3francais p. 14 : utiliser des dictionnaires')),
  c('synonymes-antonymes', 'vocabulaire', 'Trouver des synonymes et des contraires', depuis('cp'),
    src('bo41', 88, 'CP : savoir trouver des synonymes et des antonymes ; cycle 3 c3francais p. 14')),
  c('familles-mots', 'vocabulaire', 'Familles de mots, préfixes et suffixes', depuis('cp'),
    src('bo41', 89, 'CP : lettre muette finale par un mot de la même famille (chat/chaton) ; CE1 p. 89 : préfixes et suffixes ; CE2 p. 91')),
  c('orthographe-lexicale', 'vocabulaire', 'Mémoriser l’orthographe des mots fréquents et des mots invariables', depuis('cp'),
    src('bo41', 89, 'CP : mémoriser l’orthographe des mots réguliers fréquents ; CE1 p. 90 : réguliers et irréguliers, corpus de mots invariables ; CE2 p. 91'),
    { interpretation: 'les « mots irréguliers » du CE1 (p. 90) sont lus comme des mots du lexique (exemples : mots invariables, lettres muettes), pas comme des formes verbales : les formes irrégulières il fait, il dit, il va… sont dictées au CE2, l’année où ces verbes sont conjugués (p. 94 : « Il orthographie correctement les formes verbales étudiées en situation de dictée »)' }),
  c('accents-lettres', 'vocabulaire', 'Accents et lettres à plusieurs sons (s, c, g ; an/am, on/om…)', entre('cp', 'ce2'),
    src('bo41', 89, 'CP : identifier et nommer les accents ; valeur sonore de s, c, g ; an/am, en/em, on/om, in/im ; CE1 p. 90')),
  // Grammaire et conjugaison
  c('phrase', 'grammaire', 'La phrase : majuscule, point ; phrases déclarative, interrogative, impérative ; forme négative', depuis('cp'),
    src('bo41', 92, 'CP : notion de phrase simple (majuscule, ponctuation, sens), trois types de phrases, formes négative et exclamative ; CE1 p. 93 ; CM1 c3francais p. 17')),
  c('classes-mots', 'grammaire', 'Nature des mots : nom, verbe, déterminant, adjectif, pronom (liste par année)', depuis('cp'),
    src('bo41', 92, 'CP : corpus de noms, verbes, déterminants, adjectifs, pronoms personnels ; CE1 p. 93 : nommer nom commun/propre ; CE2 p. 94 : + adverbe ; CM1 c3francais p. 17 ; CM2 p. 19')),
  c('sujet-verbe', 'grammaire', 'Trouver le verbe et son sujet ; accorder le verbe avec le sujet', depuis('cp'),
    src('bo41', 92, 'CP : s’initier à la relation sujet-verbe ; CE1 p. 93 : identifier ; CE2 p. 94 ; CM1 c3francais p. 18 : accorder le sujet et le verbe')),
  c('accords-gn', 'grammaire', 'Masculin, féminin, singulier, pluriel ; accords dans le groupe nominal', depuis('cp'),
    src('bo41', 92, 'CP : masculin/féminin, singulier/pluriel, chaine d’accords ; CE1 p. 93 ; CE2 p. 94 : pluriels en -x, -al/-aux ; CM1 c3francais p. 18')),
  c('radical-terminaison', 'grammaire', 'Radical et terminaison d’un verbe ; trouver l’infinitif', depuis('ce1'),
    src('bo41', 93, 'CE1 : identifier le radical et la terminaison d’un verbe du premier groupe et trouver son infinitif ; CE2 p. 94 ; CM1 c3francais p. 18')),
  c('conjugaison-present-etre-avoir', 'grammaire', 'Conjuguer être et avoir au présent', depuis('cp'),
    src('bo41', 92, 'CP : « Apprendre à conjuguer être et avoir au présent de l’indicatif »')),
  c('conjugaison-4-temps', 'grammaire', 'Présent, imparfait, futur, passé composé : être, avoir et les verbes en -er', depuis('ce1'),
    src('bo41', 93, 'CE1 : présent, imparfait, futur puis passé composé de l’indicatif ; être, avoir et verbes du premier groupe')),
  c('conjugaison-irreguliers', 'grammaire', 'Les mêmes temps pour faire, aller, dire, venir, pouvoir, voir, vouloir, prendre', depuis('ce2'),
    src('bo41', 94, 'CE2 : + verbes irréguliers du 3e groupe (faire, aller, dire, venir, pouvoir, voir, vouloir, prendre)')),
  c('conjugaison-2e-groupe', 'grammaire', 'Les mêmes temps pour les verbes du 2e groupe (finir)', ['cm1', 'cm2'],
    src('c3francais', 18, 'CM1 : présent, imparfait, futur, passé composé d’être, avoir, 1er et 2e groupes et des 8 irréguliers')),
  c('conjugaison-passe-simple', 'grammaire', 'Passé simple et plus-que-parfait', ['cm2'],
    src('c3francais', 19, 'CM2 : passé simple, plus-que-parfait d’être, avoir, 1er et 2e groupes et des 8 irréguliers')),
  c('complements', 'grammaire', 'Compléments du verbe (COD, COI) et compléments circonstanciels', ['cm1', 'cm2'],
    src('c3francais', 17, 'CM1 : COD/COI dans des phrases prototypiques, groupes circonstanciels sans les distinguer ; CM2 p. 19 : CC de temps, lieu, cause ; attribut du sujet')),
  // ── Le monde (matière `monde`) : cycle 1 (BO n° 19), cycles 2 et 3 (sciences BO n° 24 de 2026, histoire-géographie
  // BO n° 22 de 2026, EMC BO n° 24 de 2024) ; m() ajoute la note « application à la rentrée 2027 » pour CE1, CE2 et CM2 ──
  c('environnement-proche', 'temps-espace', 'Reconnaître l’école, le quartier ou le village et ses lieux (mairie, commerces, jardin)', ['ps', 'ms', 'gs'],
    src('bo19', 29, 'Avant 4 ans : explorer les lieux de l’école et leur associer des éléments caractéristiques ; 4 ans : caractériser l’environnement extérieur proche ; 5 ans : reconnaitre les espaces proches de l’école et leurs usages, observer l’habitat')),
  // Le vivant
  m('parties-animaux-plantes', 'vivant', 'Nommer les parties d’un animal (tête, pattes, ailes) et d’une plante (racine, tige, feuille, fleur)', ['ps', 'ms', 'gs'],
    src('bo19', 30, 'Avant 4 ans : repérer et nommer les caractéristiques morphologiques des plantes et des animaux ; 5 ans (p. 31) : identifier des éléments morphologiques spécifiques, légender un dessin ou une photographie')),
  m('cycle-vie-vivants', 'vivant', 'Les étapes de la vie d’un animal ou d’une plante (œuf, petit, adulte ; graine, fleur)', ['ms', 'gs'],
    src('bo19', 30, '4 ans : reconnaitre une ou plusieurs étapes d’un cycle de vie ; 5 ans (p. 31) : nommer et ordonner les étapes du cycle de vie d’une plante ou d’un animal (naissance, éclosion, germination, larve, nymphe…)')),
  m('deplacements-animaux', 'vivant', 'Comment un animal se déplace (vole, marche, rampe, saute, nage) et dans quel milieu il vit', ['ms', 'gs', 'ce2'],
    src('bo19', 30, '4 ans : observer et nommer le mode de déplacement de quelques animaux en relation avec leur milieu de vie ; CE2 : c2sciences p. 7, associer les organes locomoteurs (aile, patte, nageoire) à un mode de locomotion')),
  m('besoins-vivants', 'vivant', 'Ce dont ont besoin les animaux et les plantes pour vivre (eau, lumière, nourriture)', ['ms', 'gs', 'ce1'],
    src('bo19', 30, '4 ans : identifier et décrire les besoins essentiels de quelques animaux et végétaux ; CE1 : c2sciences p. 6, besoins d’une plante (eau et lumière) par l’expérience, régime alimentaire des animaux')),
  m('vivant-non-vivant', 'vivant', 'Trier ce qui est vivant, non vivant ou fabriqué par des êtres vivants (nid, laine, œuf)', ['cp'],
    src('c2sciences', 5, 'CP : caractériser et justifier à l’aide de critères simples ce qui est vivant, non vivant ou élaboré par des êtres vivants')),
  m('observer-environnement', 'vivant', 'Observer un milieu proche, nommer les êtres vivants qui y vivent et leur milieu de vie', ['cp', 'ce1', 'ce2'],
    src('c2sciences', 5, 'CP : décrire les êtres vivants de l’environnement proche et les caractéristiques du milieu ; CE1 p. 6 : le peuplement change avec les saisons ; CE2 p. 7 : sorties, classification du vivant, sol comme milieu vivant')),
  m('chaines-alimentaires', 'vivant', 'Qui mange qui : herbivores, carnivores, omnivores ; chaînes et réseaux alimentaires', ['ce1', 'ce2', 'cm1'],
    src('c2sciences', 6, 'CE1 : identifier le régime alimentaire d’animaux (herbivores, carnivores, omnivores) ; CE2 p. 7 : élaborer une courte chaine alimentaire ; CM1 c3sciences p. 11 : représenter par un réseau les liens alimentaires')),
  m('croissance-reproduction', 'vivant', 'Grandir et se reproduire : de la graine au fruit, jeune, larve et adulte, ovipares et vivipares', ['ce2', 'cm1'],
    src('c2sciences', 7, 'CE2 : ordonner les étapes de la vie d’une plante à fleurs, distinguer formes juvénile, larvaire et adulte ; CM1 c3sciences p. 11 : étapes du développement des animaux, ovipare et vivipare')),
  m('classer-especes', 'vivant', 'Classer des espèces en groupes et les identifier avec une clé de détermination', ['cm1', 'cm2'],
    src('c3sciences', 10, 'CM1 : à partir de quatre à six espèces, classification en groupes emboités ; identifier des espèces avec une clé de détermination (CM2 p. 11 : clé de détermination pour des fossiles)')),
  m('proteger-environnement', 'vivant', 'Agir pour protéger l’environnement : gestes simples et projet de classe', ['gs', 'cp', 'ce1', 'ce2', 'cm2'],
    src('bo19', 34, '5 ans : commencer à agir de manière autonome pour le respect de l’environnement ; CP à CE2 : c2sciences p. 6-8, « Agir pour protéger l’environnement » ; CM2 c3sciences p. 12 : projet d’éducation au développement durable')),
  m('meteo-climat', 'vivant', 'Mesurer le temps qu’il fait (température, pluie, vent) et distinguer météo et climat', ['cm1', 'cm2'],
    src('c3sciences', 11, 'CM1 : réaliser et exploiter des mesures météorologiques (thermomètre, pluviomètre, anémomètre) ; CM2 p. 12 : climat local, différence entre climat et météorologie'),
    'sous la rubrique « La Terre, une planète active », rangée dans le domaine « Les êtres vivants dans leur environnement » du texte'),
  // Le corps humain et la santé
  m('parties-corps', 'corps-sante', 'Nommer les parties du corps et les articulations', ['ps', 'ms', 'gs', 'cp'],
    src('bo19', 31, 'Avant 4 ans : nommer et représenter quelques parties du corps ; 4 ans : parties du corps ; 5 ans : articulations (cheville, genou, coude, poignet…) ; CP : c2sciences p. 8, principales articulations et quelques os')),
  m('cinq-sens', 'corps-sante', 'Les cinq sens et les organes associés (yeux, nez, langue, peau, oreille)', ['ps', 'ms', 'gs'],
    src('bo19', 31, 'Avant 4 ans : découvrir les sens utilisés lors d’expériences sensorielles ; 4 ans : associer les yeux et la vue, le nez et l’odorat, la langue et le gout, la peau et le toucher, l’oreille et l’audition')),
  m('hygiene-vie', 'corps-sante', 'Les gestes pour rester en forme : se laver les mains et les dents, dormir, bouger, limiter les écrans', ['ps', 'ms', 'gs', 'cp', 'ce1'],
    src('bo19', 31, 'Avant 4 ans : quelques règles d’hygiène (se laver les mains) ; 4 ans : règles d’hygiène corporelle ; CP : c2sciences p. 9, règles d’hygiène de vie (sommeil, activité, écrans) ; CE1 p. 9 : hygiène buccodentaire')),
  m('croissance-corps', 'corps-sante', 'Grandir : observer et mesurer sa croissance (taille, pointure, dents de lait)', ['ms', 'gs', 'ce1'],
    src('bo19', 31, '4 ans : observer des changements liés à sa croissance (vêtements, chaussures, toise) ; CE1 : c2sciences p. 9, suivre la croissance avec un mètre-ruban, dents de lait et dents définitives')),
  m('aliments-equilibre', 'corps-sante', 'Les familles d’aliments, leur origine et l’équilibre alimentaire', ['cp', 'ce1'],
    src('c2sciences', 8, 'CP : catégories d’aliments (fruits et légumes, viandes, poissons et œufs, produits laitiers, féculents…) et origine animale, végétale, minérale ; CE1 p. 9 : apports des aliments, composer des menus équilibrés')),
  m('mouvement-effort', 'corps-sante', 'Os, muscles et articulations : comment on bouge, et ce que l’effort change (souffle, pouls)', ['ce2'],
    src('c2sciences', 10, 'CE2 : modéliser un mouvement de flexion/extension (rôle des muscles et des articulations), relier l’activité physique au rythme respiratoire et cardiaque (pouls)')),
  m('cerveau-attention', 'corps-sante', 'Le cerveau, l’attention et la mémoire : mieux apprendre', ['ce1', 'ce2', 'cm1'],
    src('c2sciences', 9, 'CE1 : le rôle de l’attention dans les apprentissages ; CE2 p. 10 : notions sur le fonctionnement du cerveau pour mieux apprendre ; CM1 c3sciences p. 14 : le cerveau et ses grandes fonctions, stratégies d’attention et de mémorisation')),
  m('digestion', 'corps-sante', 'La digestion : le trajet des aliments dans le corps et le rôle du sang', ['cm2'],
    src('c3sciences', 15, 'CM2 : nommer et localiser les organes du système digestif et leur fonction, rôle de la circulation sanguine dans l’approvisionnement des organes')),
  // La matière
  m('eau-etats', 'matiere', 'L’eau sous ses formes : glace, eau liquide, vapeur ; fondre et geler', ['ms', 'gs', 'cp', 'ce1', 'cm2'],
    src('bo19', 34, '4 ans : fusion de la glace ; 5 ans : identifier et nommer l’état de l’eau dans différentes situations ; CP : c2sciences p. 4, états solide et liquide de l’eau ; CE1 : changement d’état et réversibilité ; CM2 c3sciences p. 6 : ébullition, évaporation, liquéfaction')),
  m('air-existe', 'matiere', 'L’air existe : le sentir, le mettre en évidence', ['ps', 'ms', 'gs', 'ce1'],
    src('bo19', 33, 'Avant 4 ans : constater les effets d’un déplacement d’air sur des objets ; 4 ans : mettre en évidence la présence d’air en le mettant en mouvement ; CE1 : c2sciences p. 4, expériences sur la matérialité de l’air')),
  m('melanges-dissolution', 'matiere', 'Faire des mélanges : ce qui se dissout dans l’eau (sel, sucre) et ce qui ne se dissout pas (sable, riz)', ['ps', 'ms', 'gs', 'cm1', 'cm2'],
    src('bo19', 33, 'Avant 4 ans : réaliser et observer des mélanges ; 4 ans : distinguer les solides qui se dissolvent dans l’eau de ceux qui ne se dissolvent pas ; CM1 c3sciences p. 4 : mélanges homogènes et hétérogènes, séparer par tamisage, décantation, filtration')),
  m('solide-liquide-gaz', 'matiere', 'Solide, liquide, gaz : reconnaître l’état d’une matière à sa forme et à son volume', ['ce2', 'cm2'],
    src('c2sciences', 5, 'CE2 : différencier les états solide (forme et volume propres) et liquide (volume propre, surface horizontale) ; CM2 c3sciences p. 6 : ajouter l’état gazeux')),
  m('masse-mesurer', 'matiere', 'Comparer et mesurer des masses avec une balance ; passer du gramme au kilogramme', ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    src('c2sciences', 3, 'CP : comparer les masses de différents objets ; CE1 p. 4 : mesurer avec une balance ; CE2 p. 4 : convertir gramme et kilogramme ; CM1 c3sciences p. 4 : tarer une balance ; CM2 p. 5 : tonne, kilogramme, gramme, milligramme')),
  m('electricite', 'matiere', 'Réaliser un circuit électrique simple (pile, interrupteur, ampoule) ; matériaux conducteurs et isolants', ['ce1', 'ce2', 'cm1', 'cm2'],
    src('c2sciences', 4, 'CE1 : circuit à une boucle avec pile, interrupteur et ampoule, circuit ouvert ou fermé, isolants et conducteurs ; CM2 c3sciences p. 7 : un ou deux récepteurs, schémas normalisés, règles de sécurité électrique'),
    'seul le CE1 et le CM2 sont cités par le texte ; CE2 et CM1 sont des années de réinvestissement, lues à partir du principe du programme de revisiter les notions d’un cycle à l’autre'),
  m('lumiere-ombres', 'matiere', 'Lumière et ombres : transparent, opaque, ombre portée, phases de la Lune', ['cm1'],
    src('c3sciences', 5, 'CM1 : classer des matériaux transparents, opaques ou translucides, produire des ombres et relier leur position et leur taille à celles de la source, observer et nommer les phases de la Lune')),
  // Les objets et la technologie
  m('materiaux-objets', 'objets-techniques', 'Reconnaître des matériaux (papier, bois, métal, plastique) et trier des objets selon leurs propriétés', ['ps', 'ms', 'gs'],
    src('bo19', 32, 'Avant 4 ans : reconnaitre et comparer des matériaux usuels, identifier les objets en papier, carton, plastique, métal ; 4 ans (p. 32-33) : différencier des matériaux selon leurs propriétés et un objet du matériau qui le constitue')),
  m('construire-fabriquer', 'objets-techniques', 'Construire et fabriquer un objet en suivant un modèle, une recette ou une fiche technique', ['ps', 'ms', 'gs'],
    src('bo19', 32, 'Avant 4 ans : réaliser une construction, fabriquer un objet ; 4 ans (p. 32-33) : à partir d’un modèle ; 5 ans (p. 33) : en suivant une recette ou une fiche technique')),
  m('instructions-robot', 'objets-techniques', 'Donner des instructions dans le bon ordre à un robot (avancer, tourner) pour atteindre une case', ['gs', 'ce1', 'ce2', 'cm1', 'cm2'],
    src('bo19', 33, '5 ans : élaborer une suite d’instructions pour réaliser une tâche simple (3 à 5 instructions pour conduire un robot sur un quadrillage) ; CE1 : c2sciences p. 11, commander un robot ; CE2 p. 12, programme par blocs ; CM1-CM2 c3sciences p. 17-18')),
  m('objet-technique-besoin', 'objets-techniques', 'Un objet technique répond à un besoin (s’habiller selon la météo, se déplacer) et évolue avec le temps', ['cp', 'ce1', 'ce2', 'cm1'],
    src('c2sciences', 10, 'CP : identifier qu’un objet technique est obtenu par intervention des êtres humains et répond à un besoin ; CE2 p. 12 : diversité d’objets pour un même besoin ; CM1 c3sciences p. 17 : évolutions d’un objet')),
  m('parties-objet-technique', 'objets-techniques', 'Décrire les parties d’un objet (forme, matériau, fonction), l’électrique ou non, le démonter', ['ce1', 'ce2', 'cm1'],
    src('c2sciences', 11, 'CE1 : identifier les parties d’un objet technique (forme, matériau, fonction), objets avec ou sans énergie électrique ; CE2 p. 12 : pièces d’un objet démonté ; CM1 c3sciences p. 17 : fonctions des composants, croquis')),
  m('maquette-technologie', 'objets-techniques', 'Concevoir et fabriquer une maquette : idées, matériaux adaptés, essais et comparaison', ['cm2'],
    src('c3sciences', 18, 'CM2 : rechercher des idées de solutions à l’aide de croquis, associer une contrainte à un choix de matériau, organiser le travail de conception d’une maquette, comparer des solutions')),
  // Histoire
  m('jour-nuit-saisons', 'histoire', 'Le jour et la nuit, les quatre saisons', ['cp'],
    src('c2histgeo', 3, 'CP, thème 1 : expliquer l’alternance du jour et de la nuit avec un globe, nommer les saisons et donner leurs caractéristiques'),
    'continuité de « moments-journee » et « jours-mois » du cycle 1 (texte du cycle 2 : « dans la continuité du cycle 1 », p. 1)'),
  m('calendrier-mesure-temps', 'histoire', 'Le calendrier : jours, semaines, mois, année ; sablier, pendule, montre et réveil', ['cp'],
    src('c2histgeo', 3, 'CP, thème 2 : l’année (12 mois), la semaine (7 jours), la journée (24 heures) ; repérer, ordonner et nommer les jours ; utiliser divers calendriers ; observer et utiliser sablier, pendule, montre et réveil')),
  m('situer-evenements', 'histoire', 'Situer des événements dans le temps : hier, demain, avant, après (passé, présent, futur)', ['cp'],
    src('c2histgeo', 3, 'CP, thème 3 : situer et planifier sur un calendrier des évènements avec les temps verbaux et marqueurs temporels adaptés (hier, avant-hier, dans un mois…) ; compléter une frise chronologique de la journée ou de la vie de l’élève')),
  m('frise-chronologique', 'histoire', 'Construire et lire une frise chronologique', ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    src('c2histgeo', 3, 'CP : compléter une frise chronologique de la journée, de la vie de l’élève ; CE1 p. 4 : positionner des évènements récents et anciens ; CM1 et CM2 c3histgeo p. 4-8 : situer règnes et évènements sur une frise')),
  m('periodes-histoire', 'histoire', 'Les grandes périodes de l’histoire : Préhistoire, Antiquité, Moyen Âge, Temps modernes, époque contemporaine', ['ce1', 'ce2', 'cm1', 'cm2'],
    src('c2histgeo', 4, 'CE1, thème 2 : repérer et mémoriser sur une frise les grandes périodes de l’histoire, par convention en Europe (Préhistoire jusqu’à 3000 av. J.-C., Antiquité jusqu’à 476, Moyen Âge 476-1492, Temps modernes 1492-1789, époque contemporaine) ; passé proche et passé lointain, siècle, millénaire (thème 1)')),
  m('traces-du-passe', 'histoire', 'Les traces du passé : fossiles, ruines, monuments, objets, écrits ; le métier d’archéologue', ['ce1'],
    src('c2histgeo', 4, 'CE1, thème 3 : comprendre que le passé laisse des traces ; identifier et situer dans le temps des traces (fossiles, ossements, ruines, monuments, objets, écrits, images, témoignages) ; métiers d’archéologue, d’historien')),
  m('prehistoire', 'histoire', 'La Préhistoire : chasseurs-cueilleurs du Paléolithique, agriculteurs et éleveurs du Néolithique', ['ce2'],
    src('c2histgeo', 5, 'CE2, thème 1 : mode de vie nomade des chasseurs-cueilleurs au Paléolithique, mode de vie sédentaire au Néolithique (agriculture, élevage), art pariétal, apparition de l’écriture vers 3000 av. J.-C.')),
  m('rome-gaule', 'histoire', 'Vivre à Rome et en Gaule romaine : maisons, thermes, forum, aqueduc, Vercingétorix', ['ce2'],
    src('c2histgeo', 5, 'CE2, thème 2 : vie quotidienne à Rome, usage d’un monument caractéristique, étendue de l’empire romain, Gaule romaine ; repères : 52 av. J.-C. siège d’Alésia, règne d’Auguste')),
  m('royaume-de-france', 'histoire', 'La construction du royaume de France : Capétiens et Valois, le sacre du roi', ['ce2'],
    src('c2histgeo', 5, 'CE2, thème 3 : grandes étapes de la construction du royaume de France sur des cartes, cérémonie du sacre, dynasties Capétiens et Valois ; repères : 987 Hugues Capet, guerre de Cent Ans')),
  m('moyen-age', 'histoire', 'Le Moyen Âge : château, seigneurie, paysans, villes, abbayes et cathédrales (XIe-XIIIe siècles)', ['cm1'],
    src('c3histgeo', 4, 'CM1, thème 1 : fonctions d’un château, seigneurie et paroisse, vie des paysans et des habitants des villes, rôle de l’Église, art roman et art gothique')),
  m('monarchie-ancien-regime', 'histoire', 'La monarchie en France : François Ier, Henri IV, Louis XIV et Versailles ; la société des trois ordres', ['cm1'],
    src('c3histgeo', 5, 'CM1, thème 2 : situer sur une frise les règnes de François Ier, Henri IV et Louis XIV, château de Versailles et pouvoir absolu, société d’ordres (clergé, noblesse, tiers état) ; repères 1515, 1598, 1643-1715')),
  m('revolution-1789', 'histoire', '1789 : la fin de la monarchie absolue (Bastille, Déclaration des droits de l’Homme et du citoyen)', ['cm1'],
    src('c3histgeo', 6, 'CM1, thème 4 : contexte en 1789, idées des Lumières, compléter une frise de l’année 1789, droits énoncés dans la Déclaration ; repères 14 juillet, 4 août, 26 août 1789')),
  m('republique-xixe', 'histoire', 'De la République à l’Empire, puis à la IIIe République : lois fondatrices, école et laïcité (1792-1914)', ['cm2'],
    src('c3histgeo', 6, 'CM2, thème 1 : chute du roi, naissance de la République (1792), Bonaparte empereur (1804) ; thème 2 : lois fondatrices (suffrage universel masculin, abolition de l’esclavage, liberté de la presse, lois scolaires, laïcité), symboles de la République ; repères 1848, 1882-1886, 1905')),
  m('guerres-mondiales', 'histoire', 'Les deux guerres mondiales vues de France (1914-1918 et 1939-1945)', ['cm2'],
    src('c3histgeo', 7, 'CM2, thèmes 4 et 5 : situer la Première Guerre mondiale sur une frise, vie des soldats, armistice du 11 novembre 1918 ; étapes de la Seconde Guerre mondiale en France, Occupation, Résistance ; repères 1914-1918, 18 juin 1940, 6 juin 1944, 8 mai 1945')),
  // Géographie
  m('plan-ecole', 'geographie', 'Se repérer dans la classe et l’école, lire et faire un plan, décrire un trajet', ['cp'],
    src('c2histgeo', 6, 'CP, thème 1 : nommer et situer les éléments de la classe (à gauche, à droite, au-dessus, devant, derrière…), faire le plan de la classe, se déplacer dans l’école avec un plan, décrire un trajet'),
    'continuité de « reperes-espace » du cycle 1'),
  m('planisphere-continents', 'geographie', 'Reconnaître le planisphère, les continents et les océans ; situer la France', ['cp', 'ce1', 'ce2', 'cm1', 'cm2'],
    src('c2histgeo', 6, 'CP, thème 2 : reconnaitre un planisphère, localiser les continents et les océans (Atlantique, Pacifique, Indien), situer la France ; CE1 p. 6 : localiser les grands foyers de peuplement ; CM1 c3histgeo p. 11 : aires régionales du monde')),
  m('villes-peuplement', 'geographie', 'Où vivent les êtres humains : ville et village, grandes villes du monde', ['ce1'],
    src('c2histgeo', 6, 'CE1, thème 1 : grands foyers de peuplement, principales villes du monde, différence entre ville et village, entre ville et campagne')),
  m('climats-reliefs', 'geographie', 'Les paysages du monde : zones climatiques, forêts et déserts, montagnes, plaines, fleuves', ['ce1'],
    src('c2histgeo', 7, 'CE1, thème 2 : trois zones climatiques (tropicale, tempérée, froide), types de végétation, reliefs (montagne, plaine, plateau, vallée), fleuve et rivière ; repères : Amazone, Mississippi, Nil, Andes, Alpes, Atlas, Himalaya, Rocheuses')),
  m('france-cartes', 'geographie', 'La France sur une carte : villes, massifs montagneux, fleuves, où vit la population', ['ce2', 'cm2'],
    src('c2histgeo', 7, 'CE2, thème 1 : localiser les espaces de fortes et faibles densités, les cinq principales agglomérations, les massifs (Alpes, Corse, Jura, Massif central, Pyrénées, Vosges) et fleuves (Garonne, Loire, Maroni, Rhin, Rhône, Seine) ; CM2 c3histgeo p. 12 : agglomérations, axes de transport'),
    'le CM2 reprend les mêmes repères sur fond de carte (c3histgeo p. 12-13)'),
  m('regions-departements', 'geographie', 'Le découpage de la France : communes, départements, les 18 régions et leurs capitales', ['cm2'],
    src('c3histgeo', 12, 'CM2, thème 1 : découpage administratif du territoire français, les dix-huit Régions administratives et leur capitale régionale, le département de l’élève')),
  m('modes-de-vie-monde', 'geographie', 'Vivre dans le monde : se nourrir, inégalités, se déplacer, communiquer avec Internet', ['cm1'],
    src('c3histgeo', 11, 'CM1 : la diversité des modes de vie dans le monde ; thème 1 se nourrir, thème 2 les inégalités (aires régionales à localiser), thème 3 se déplacer (modes de transport et infrastructures), thème 4 communiquer avec Internet')),
  m('union-europeenne', 'geographie', 'L’Europe et l’Union européenne : situer dix pays membres, traités de Rome et de Maastricht', ['cm2'],
    src('c3histgeo', 13, 'CM2, thème 3 : différence entre Europe (continent) et Union européenne (construction politique), localiser et nommer dix pays membres dont les six fondateurs ; repères 1957 traité de Rome, 1992 traité de Maastricht')),
  // Enseignement moral et civique
  c('regles-vie-ecole', 'emc', 'Respecter les règles de l’école et de la classe : droits et devoirs de l’élève', ['cp', 'ce1', 'ce2'],
    src('emc', 7, 'CP : s’approprier les règles de l’école (droits et devoirs) ; CE1 p. 9 : règles communes et civilité, respecter les biens personnels et collectifs ; CE2 p. 10 : élaboration collective de règles de vie')),
  c('emotions-respect', 'emc', 'Reconnaître les émotions, respecter les autres et leurs différences, refuser la violence et le harcèlement', ['cp', 'ce1', 'cm1'],
    src('emc', 7, 'CP : comprendre ses émotions et ses sentiments ; CE1 p. 8-9 : prendre en compte les émotions d’autrui, empathie, stéréotype et préjugé, situations de violence et de harcèlement ; CM1 p. 11-12 : égalité, dignité, fraternité et empathie')),
  c('symboles-republique', 'emc', 'Les symboles de la République : drapeau, Marseillaise, devise, Marianne, 14 juillet', ['cp', 'ce1', 'ce2', 'cm2'],
    src('emc', 8, 'CP : identifier le drapeau français, reconnaitre La Marseillaise ; CE1 p. 9 : devise « Liberté, Égalité, Fraternité », 1er couplet et refrain ; CM2 p. 13 : drapeau, hymne, devise, Marianne, fête nationale du 14 juillet, drapeau européen')),
  c('laicite', 'emc', 'La laïcité à l’école : liberté de croire ou de ne pas croire', ['ce1', 'ce2', 'cm1', 'cm2'],
    src('emc', 9, 'CE1 : aborder la laïcité comme liberté de croire, de ne pas croire ou de changer de croyance, Charte de la laïcité ; CM2 p. 14 : « Laïcité (vue en CE1) », pourquoi l’école est laïque')),
  c('dangers-alerter', 'emc', 'Reconnaître un danger et donner l’alerte (numéros d’urgence, premiers secours, route)', ['ce1', 'ce2', 'cm1'],
    src('emc', 9, 'CE1 : identifier les dangers, savoir où trouver les numéros d’urgence et passer un message d’alerte (APS, APER) ; CE2 p. 10 : situations dangereuses hors de l’école, permis piéton ; CM1 p. 11 : reconnaitre un danger, alerter, se mettre en sécurité')),
  c('bien-commun-institutions', 'emc', 'Le bien commun et l’intérêt général : service public, éco-gestes, élus de la commune', ['ce2', 'cm1'],
    src('emc', 10, 'CE2 : bien commun, intérêt général et intérêt particulier, institutions et associations au service du bien commun, éco-gestes ; le maire élu local, le président de la République élu ; CM1 p. 11 : civisme, sobriété numérique')),
  c('democratie-vote', 'emc', 'La démocratie : voter, élire, participer aux décisions ; droits et devoirs du citoyen', ['ce2', 'cm1', 'cm2'],
    src('emc', 11, 'CE2 p. 10 : organiser une élection de délégué, conseils d’élèves ; CM1 : signification de « démocratie » et suffrage direct ; CM2 p. 12-13 : citoyenneté et nationalité, droits civils et politiques, devoirs (respecter les lois, impôt, voter)')),
  c('droits-libertes-egalite', 'emc', 'Les droits, les libertés et l’égalité : droits de l’enfant, discriminations, liberté d’expression', ['cp', 'cm1', 'cm2'],
    src('emc', 13, 'CM2 : libertés et droits fondamentaux (Déclaration des droits de l’homme et du citoyen, droits de l’enfant), lutte contre les discriminations et les préjugés ; CP p. 8 : droits de l’enfant, égalité filles-garçons ; CM1 p. 11 : égalité en droit, dignité')),
] as const satisfies readonly Competence[]

export const COMPETENCES_EXEMPLE = AVEC_EXEMPLES ? [
  c('exemple-compter', 'exemple', 'Compter de n en n et compléter une suite (fictive)', depuis('cp'),
    src('c2maths', 1, 'Entrée fictive des exemples : ne correspond à aucun texte du programme'), { devSeulement: true }),
  c('exemple-regle', 'exemple', 'Trouver la règle d’une suite (fictive)', depuis('ce1'),
    src('c2maths', 1, 'Entrée fictive des exemples : ne correspond à aucun texte du programme'), { devSeulement: true }),
  c('exemple-synonymes', 'exemple', 'Choisir le synonyme d’un mot (fictive, pour l’exemple à corpus)', depuis('ce1'),
    src('c2maths', 1, 'Entrée fictive des exemples : ne correspond à aucun texte du programme'), { devSeulement: true }),
  c('exemple-lire', 'exemple', 'Lire et placer des repères (fictive, pour l’exemple d’affiche)', entre('ms', 'ce1'),
    src('c2maths', 1, 'Entrée fictive des exemples : ne correspond à aucun texte du programme'), { devSeulement: true }),
] as const satisfies readonly Competence[] : []

// ── Pour aller plus loin : notions que nos exercices proposent, mais qui ne sont dans aucun texte relu pour ces
// niveaux. Elles ne sont jamais choisies par défaut et sont signalées comme telles dans les formulaires.
// `recherche` dit où l'on a cherché ; `niveaux` : où nous les proposons.
export const HORS_PROGRAMME = [
  {
    id: 'homophones-grammaticaux', domaine: 'grammaire', niveaux: ['ce2', 'cm1', 'cm2'],
    libelle: 'Homophones grammaticaux : a/à, et/est, on/ont, son/sont, ou/où, ce/se, mes/mais',
    recherche: '« homophone », « a / à », « et / est », « son / sont », « distinguer » : BO n° 41 (cycle 2, p. 85-94 relues), programme du cycle 3 (p. 13-19), exemples de réussite Éduscol CM1, CM2 et 6e — aucune occurrence (le seul « homophones » est en 6e : morphèmes -mane / -man, exemples 6e p. 11)',
    sources: [
      src('bo41', 94, 'CE2 : aucune mention des homophones grammaticaux ; les outils pour les distinguer sont au programme (être et avoir à l’imparfait dès le CE1 p. 93, classes de mots)'),
      src('c2ancien2015', 23, 'ancien programme (2015) : « Homophones : les formes verbales a / est / ont / sont distinguées des homophones (à / et / on / son) » ; la mention disparaît du programme consolidé de 2020 (c2ancien2020) et du BO n° 41'),
    ],
    interpretation: 'les manuels conformes aux programmes de 2025 continuent de les faire travailler au CE2 (substitution par avait, était) : proposés du CE2 au CM2 « pour aller plus loin », jamais par défaut ; dans la fiche « CP → CM2 » (exercices-orthographe-cp-cm2), publiée avant les niveaux',
  },
  {
    id: 'homonymes-ce2', domaine: 'vocabulaire', niveaux: ['ce2'],
    libelle: 'Homonymes (verre, vert, ver ; mer, mère, maire)',
    recherche: '« homonyme » : absent du BO n° 41 (cycle 2) ; le cycle 2 parle de polysémie (CP p. 88, CE2 p. 90-91)',
    sources: [
      src('c3francais', 16, 'terminologie utilisée au cycle 3 : « Radical, préfixe, suffixe, synonyme, antonyme, homonyme, polysémie »'),
      src('exemplesCM1', 11, 'CM1 : « Il différencie des homonymes en s’appuyant sur la dérivation ou en ayant recours au dictionnaire, exemple : comte, comtesse/conte »'),
    ],
    interpretation: 'gardé au CE2 « pour aller plus loin », sous le libellé « Mots qui se disent pareil » (le mot « homonyme » est du cycle 3)',
  },
] as const satisfies readonly HorsProgramme[]

// ── Contraintes par niveau (valeurs simples, vérifiables par un test) ──
// Les listes sont cumulatives : la valeur d'un niveau contient déjà celle des niveaux précédents.
const FIGURES_CP = ['disque', 'carre', 'rectangle', 'triangle']
const FIGURES_CE1 = [...FIGURES_CP, 'cercle', 'triangle-rectangle']
const FIGURES_CE2 = [...FIGURES_CE1, 'losange']
const FIGURES_CM1 = [...FIGURES_CE2, 'triangle-isocele', 'triangle-equilateral', 'quadrilatere']
const FIGURES_CM2 = [...FIGURES_CM1, 'trapeze', 'trapeze-rectangle', 'pentagone', 'hexagone']
const SOLIDES_CP = ['cube', 'pave', 'boule', 'cylindre', 'cone']
const SOLIDES_CE1 = [...SOLIDES_CP, 'pyramide']
const SOLIDES_CM1 = [...SOLIDES_CE1, 'prisme-droit']
const TEMPS_CYCLE = ['present', 'imparfait', 'futur', 'passe-compose']       // ids de src/data/conjugaison.js
const IRREGULIERS = ['faire', 'aller', 'dire', 'venir', 'pouvoir', 'voir', 'vouloir', 'prendre']
const plage = (a: number, b: number, pas = 1) => Array.from({ length: Math.floor((b - a) / pas) + 1 }, (_, i) => a + i * pas)

// Clés :
//   nombreMax            plus grand entier du champ numérique de l'année
//   nombreChiffresMax    nombre de chiffres de ce plus grand entier
//   comptineMax          comptine numérique (cycle 1)
//   ecritureChiffresMax  nombres écrits en chiffres (cycle 1)
//   nombresEnLettresMax  écriture en lettres attendue (CP : 50)
//   calculMentalMax      nombres en jeu et résultats en calcul mental
//   problemesMax         champ des problèmes en deux étapes ou multiplicatifs (CP : 30)
//   facteurMax           facteurs des tables d'addition et de multiplication (0 à 10)
//   doubles / moities    valeurs listées par le programme (minimum attendu, pas un maximum)
//   operationsPosees     opérations posées au programme
//   fractions            { denominateurs | denominateurMax, decimales, superieuresA1, operateur }
//   decimalesMax         chiffres après la virgule hors monnaie (0 = pas de nombres décimaux)
//   monnaie              { eurosMax, centimes, virgule }
//   heure                'entiere' | 'quart' | 'minute' | 'seconde' (précision de lecture et des durées)
//   heureMax12           au CP, les aiguilles ne se placent que pour des heures ≤ 12
//   unitesLongueur / unitesMasse / unitesContenance / unitesAire
//   tableauConversion    false : pas de tableau pour effectuer des conversions
//   tableauUnites        true : un tableau peut présenter les unités et leurs relations (cycle 3 seulement)
//   tableauProportionnalite  false au cours moyen
//   calculatrice         false (cycle 2) ; 'occasionnelle' (cours moyen : pas de calculatrice personnelle)
//   divisibilite         critères de divisibilité au programme
//   figures / solides / solidesDecrits / patrons / symetrie
//   conjugaison          { temps, groupes, irreguliers }
//   classesMots          natures de mots à nommer
//   pluriels             marques du pluriel des noms et adjectifs : 's' ; puis 'x' (-eau, -eu, -ou → -x) et 'al-aux'
//   feminins             marques du féminin : 'e' (petit → petite) ; puis 'audible' (blanc → blanche, joyeux → joyeuse)
//   cursive              'initiation' | 'minuscules' | 'majuscules' | 'automatise' (null en PS)
//   comparaisonGlobale   PS : { rapportMin, max } comparer à vue deux collections (rapport d'au moins 2)
//   formesTriees         PS : formes à trier sans les nommer ; assemblageMax : éléments d'un assemblage
//   motifs               PS : 'alternance' (AB) ; masse / zero : false avant 4 ans
//   graphisme            PS : formes de base à tracer ; temps : 'journee' (la semaine arrive à 4 ans)
//   lectureMotsParMinute fluence attendue en fin d'année
export const CONTRAINTES: readonly Contraintes[] = [
  {
    niveau: 'ps', nombreMax: 3, comptineMax: 6, ecritureChiffresMax: 3,
    comparaisonGlobale: { rapportMin: 2, max: 10 },
    figures: [], formesTriees: ['disque', 'carre', 'triangle'], solides: [],
    assemblageMax: 4, motifs: 'alternance', masse: false, zero: false,
    lettres: 'prenom-capitales', cursive: null,
    graphisme: ['vertical', 'horizontal', 'point', 'boucle', 'cercle'],
    temps: 'journee',
    sources: {
      nombreMax: src('bo41', 60, 'Avant 4 ans : dénombrer, constituer une collection jusqu’à trois, voire quatre'),
      comptineMax: src('bo41', 61, 'Réciter de façon ordonnée et segmentée la comptine jusqu’à six, en partant de un'),
      comparaisonGlobale: src('bo41', 61, 'Comparer globalement des collections dont les quantités diffèrent d’un facteur au moins égal à deux'),
      figures: src('bo41', 68, 'Reconnaitre, trier et classer des objets selon leur forme ; ne pas faire nommer prématurément'),
      assemblageMax: src('bo41', 69, 'À partir d’un modèle, reproduire un assemblage d’au plus quatre éléments'),
      motifs: src('bo41', 71, 'Mémoriser, reproduire un motif répétitif très simple'),
      masse: src('bo41', 69, 'la masse n’est introduite qu’à partir de quatre ans'),
      zero: src('bo41', 60, 'ne pas introduire prématurément le nombre zéro'),
      lettres: src('bo41', 51, 'Reconnaitre et nommer certaines lettres de son prénom ; retrouver l’étiquette de son prénom (lettres capitales)'),
      graphisme: src('bo41', 56, 'Tracer quelques formes de base : traits verticaux, traits horizontaux, points, boucles, cercles'),
      temps: src('bo19', 24, 'Avant 4 ans : différencier le matin et le soir, le jour et la nuit'),
    },
    interpretation: 'nombreMax 3 : « voire quatre » n’est pas systématique ; ecritureChiffresMax 3 = chiffre montré pour être associé à une quantité, jamais à tracer ; comparaisonGlobale.max 10 : le texte dit seulement de ne pas se limiter aux petites collections ; formesTriees : liste de 4 ans, sans la faire nommer',
  },
  {
    niveau: 'ms', nombreMax: 6, comptineMax: 12, ecritureChiffresMax: 6,
    figures: ['triangle', 'carre', 'disque'], solides: ['cube', 'boule', 'pyramide', 'cylindre'],
    lettres: 'prenom', cursive: 'initiation',
    sources: {
      nombreMax: src('bo41', 62, 'À partir de 4 ans : collection d’un cardinal donné jusqu’à six ; écrire les nombres de un à six ; comptine de un à douze'),
      figures: src('bo41', 69, 'À partir de 4 ans : solides (cube, boule, pyramide à base carrée, cylindre) et formes planes (triangle, carré, disque) à reconnaitre et classer'),
      lettres: src('bo41', 52, 'À partir de 4 ans : nommer les lettres de son prénom et quelques lettres ; correspondance scripte majuscule / minuscule / cursive minuscule'),
      cursive: src('bo41', 56, 'À partir de 4 ans : tracer des lettres capitales ; s’initier aux tracés de l’écriture cursive'),
    },
  },
  {
    niveau: 'gs', nombreMax: 10, comptineMax: 30, ecritureChiffresMax: 10,
    figures: FIGURES_CP, solides: [...SOLIDES_CE1],
    lettres: 'alphabet', cursive: 'minuscules',
    sources: {
      nombreMax: src('bo41', 63, 'À partir de 5 ans : jusqu’à dix, « voire au-delà » ; écrire de un à dix ; comptine jusqu’à trente (p. 64)'),
      figures: src('bo41', 69, 'À partir de 5 ans : nommer carré, rectangle, triangle, disque ; décrire cube, pavé, boule, pyramides à base carrée ou triangulaire, cylindre, cône'),
      lettres: src('bo41', 52, 'À partir de 5 ans : connaitre le nom des lettres de l’alphabet (capitale, scripte, cursive)'),
      cursive: src('bo41', 56, 'À partir de 5 ans : tracer des lettres en écriture cursive, les enchainer'),
    },
    interpretation: 'nombreMax 10 : le texte dit « jusqu’à dix, voire au-delà » ; un test peut tolérer un peu plus, pas 20 en exercice systématique',
  },
  {
    niveau: 'cp', nombreMax: 100, nombreChiffresMax: 2, nombresEnLettresMax: 50, calculMentalMax: 100, problemesMax: 30, facteurMax: 10,
    doubles: [...plage(1, 10), 20, 30, 40, 50], moities: [...plage(2, 20, 2), 40, 60, 80, 100],
    operationsPosees: ['addition'],
    fractions: null, decimalesMax: 0,
    monnaie: { eurosMax: 100, centimes: false, virgule: false },
    heure: 'entiere', heureMax12: true,
    unitesLongueur: ['m', 'cm'], unitesMasse: [], unitesContenance: [],
    tableauConversion: false, calculatrice: false,
    figures: FIGURES_CP, solides: SOLIDES_CP, solidesDecrits: ['cube', 'pave'], patrons: [], symetrie: false,
    conjugaison: { temps: ['present'], groupes: ['etre-avoir'], irreguliers: [] },
    classesMots: [], cursive: 'minuscules', lectureMotsParMinute: 30,
    pluriels: ['s'], feminins: ['e'],
    sources: {
      nombreMax: src('c2maths', 3, 'nombres entiers jusqu’à cent (jusqu’à cinquante-neuf au plus tard en période 2, cent en période 3)'),
      nombresEnLettresMax: src('c2maths', 4, '« À la fin du CP, l’élève maitrise l’écriture en lettres des nombres jusqu’à cinquante. »'),
      calculMentalMax: src('c2maths', 6, '« nombres en jeu et résultats cherchés sont tous inférieurs ou égaux à cent »'),
      problemesMax: src('c2maths', 9, 'problèmes en deux étapes et problèmes multiplicatifs : « champ numérique inférieur ou égal à 30 »'),
      doubles: src('c2maths', 6, 'doubles des nombres de 1 à 10 et de 20, 30, 40, 50 ; moitiés des pairs de 2 à 20 et de 40, 60, 80, 100'),
      operationsPosees: src('c2maths', 5, 'poser et effectuer des additions en colonnes'),
      monnaie: src('c2maths', 26, '« Les montants sont des nombres entiers d’euros toujours inférieurs ou égaux à cent. »'),
      heure: src('c2maths', 26, '« Au CP, le travail mené sur le repérage dans le temps se limite aux heures entières » ; aiguilles : heures entières ≤ 12'),
      unitesLongueur: src('c2maths', 25, 'unités mètre et centimètre ; masses : comparer seulement (p. 26)'),
      calculatrice: src('c2maths', 5, '« La calculatrice n’est pas utilisée au cycle 2 en dehors… »'),
      figures: src('c2maths', 32, 'disque, carré, rectangle, triangle ; solides : reconnaitre cube, boule, cône, cylindre, pavé, nommer cube, pavé, boule, décrire avec « face »'),
      conjugaison: src('bo41', 92, 'apprendre à conjuguer être et avoir au présent de l’indicatif'),
      classesMots: src('bo41', 92, 'constituer des corpus par classe de mots (sans les nommer comme objectif)'),
      pluriels: src('bo41', 92, 'marque du féminin (+e) : petit/petite ; marque du pluriel (+s) : deux lapins, des olives, de jolis vélos'),
      lectureMotsParMinute: src('bo41', 77, 'décoder 30 mots par minute au minimum fin CP'),
    },
    interpretation: 'tableauConversion : le texte (p. 29) parle de tout le cycle 2',
  },
  {
    niveau: 'ce1', nombreMax: 1000, nombreChiffresMax: 4, nombresEnLettresMax: 1000, calculMentalMax: 1000, facteurMax: 10,
    doubles: [...plage(1, 15), 20, 25, 30, 35, 40, 45, 50, 100, 150, 200, 250, 300, 500],
    moities: [...plage(2, 30, 2), 40, 50, 60, 70, 80, 90, 100, 200, 300, 400, 500, 600, 1000],
    operationsPosees: ['addition', 'soustraction'],
    fractions: { denominateurs: [2, 3, 4, 5, 6, 8, 10], superieuresA1: false, operateur: false },
    decimalesMax: 0,
    monnaie: { eurosMax: null, centimes: true, virgule: true },
    heure: 'quart', heureMax12: false,
    unitesLongueur: ['m', 'cm', 'km'], unitesMasse: ['g', 'kg'], unitesContenance: [],
    tableauConversion: false, calculatrice: false,
    figures: FIGURES_CE1, solides: SOLIDES_CE1, solidesDecrits: ['cube', 'pave', 'pyramide'], patrons: [], symetrie: false,
    conjugaison: { temps: TEMPS_CYCLE, groupes: ['etre-avoir', '1er-groupe'], irreguliers: [] },
    classesMots: ['determinant', 'nom-commun', 'nom-propre', 'adjectif', 'verbe', 'pronom-personnel-sujet'],
    cursive: 'majuscules', lectureMotsParMinute: 70,
    pluriels: ['s'], feminins: ['e'],
    sources: {
      nombreMax: src('c2maths', 10, 'nombres jusqu’à mille, dès la période 2'),
      calculMentalMax: src('c2maths', 14, '« nombres en jeu et résultats cherchés sont tous inférieurs ou égaux à 1 000 »'),
      doubles: src('c2maths', 14, 'doubles de 1 à 15, de 20, 25… 50, de 100, 150, 200, 250, 300, 500 ; moitiés des pairs de 2 à 30, des dizaines 40 à 100, des centaines 200 à 600 et 1 000'),
      operationsPosees: src('c2maths', 13, 'additions et soustractions en colonnes'),
      fractions: src('c2maths', 12, '« Les fractions rencontrées au CE1 ont un dénominateur égal à 2, 3, 4, 5, 6, 8 ou 10 » ; fractions d’un tout, « inférieures ou égales à 1 »'),
      monnaie: src('c2maths', 28, 'centimes au plus tard en période 2, écriture à virgule à partir de la période 3'),
      heure: src('c2maths', 28, 'heures entières, demi-heure, quarts d’heure ; heures entières supérieures à douze ; durées dans ces mêmes unités (p. 29)'),
      unitesLongueur: src('c2maths', 27, 'm, cm, km ; g et kg, 1 kg = 1 000 g ; pas de contenances avant le CE2 (p. 29-30)'),
      figures: src('c2maths', 34, 'cercle, carré, rectangle, triangle, triangle rectangle ; solides p. 33 : + pyramide ; face, sommet, arête'),
      conjugaison: src('bo41', 93, 'présent, imparfait, futur puis passé composé ; être, avoir et verbes du premier groupe'),
      classesMots: src('bo41', 93, 'déterminant, nom commun, nom propre, adjectif, verbe, pronom personnel sujet'),
      pluriels: src('bo41', 93, 'marques d’accord pour le nom et l’adjectif épithète : « pluriel en –s, féminin en –e »'),
      cursive: src('bo41', 80, 'majuscules cursives en 2e partie d’année'),
      lectureMotsParMinute: src('bo41', 78, 'vitesse de 70 mots par minute'),
    },
  },
  {
    niveau: 'ce2', nombreMax: 10000, nombreChiffresMax: 5, nombresEnLettresMax: 10000, calculMentalMax: 10000, facteurMax: 10,
    doubles: [...plage(1, 20), 25, 30, 35, 40, 45, 50, 60, 75, 100, 150, 200, 250, 300, 400, 500, 600],
    moities: [...plage(2, 40, 2), 50, 60, 70, 80, 90, 100, 120, 150, 200, 300, 400, 500, 600, 800, 1000, 1200],
    operationsPosees: ['addition', 'soustraction', 'multiplication'],
    fractions: { denominateurMax: 12, superieuresA1: false, operateur: false },
    decimalesMax: 0,
    monnaie: { eurosMax: null, centimes: true, virgule: true },
    heure: 'minute', heureMax12: false,
    unitesLongueur: ['m', 'dm', 'cm', 'mm', 'km'], unitesMasse: ['g', 'kg', 't'], unitesContenance: ['L', 'dL', 'cL'],
    tableauConversion: false, calculatrice: false,
    figures: FIGURES_CE2, solides: SOLIDES_CE1, solidesDecrits: ['cube', 'pave', 'pyramide'], patrons: ['cube'], symetrie: 'completer',
    conjugaison: { temps: TEMPS_CYCLE, groupes: ['etre-avoir', '1er-groupe'], irreguliers: IRREGULIERS },
    classesMots: ['determinant', 'nom-commun', 'nom-propre', 'adjectif', 'verbe', 'pronom-personnel-sujet', 'adverbe'],
    cursive: 'automatise', lectureMotsParMinute: 90,
    pluriels: ['s', 'x', 'al-aux'], feminins: ['e', 'audible'],
    sources: {
      nombreMax: src('c2maths', 19, 'nombres jusqu’à 10 000, dès la période 2'),
      calculMentalMax: src('c2maths', 22, '« inférieurs ou égaux à 10 000 »'),
      doubles: src('c2maths', 22, 'doubles de 1 à 20, de 20… 75, de 100… 600 ; moitiés des pairs de 2 à 40, des dizaines 40 à 150, des centaines 200 à 1 200'),
      operationsPosees: src('c2maths', 21, 'additions et soustractions (≤ 10 000), multiplication d’un nombre à 2 ou 3 chiffres par un nombre à 1 ou 2 chiffres ; additions et soustractions de montants en euros (p. 30-31)'),
      fractions: src('c2maths', 20, '« dénominateur inférieur ou égal à douze et sont toutes inférieures ou égales à un »'),
      heure: src('c2maths', 31, 'heures et minutes ; « temps courts, exprimés en heure et en minute » : pas de secondes au cycle 2'),
      unitesLongueur: src('c2maths', 29, 'm, dm, cm, mm, km ; g, kg, t (p. 30) ; L, dL, cL (p. 30)'),
      tableauConversion: src('c2maths', 29, '« Les élèves n’utilisent pas de tableaux de conversion au cycle 2, mais s’appuient sur les relations connues entre les unités »'),
      figures: src('c2maths', 36, 'carré, rectangle, triangle, triangle rectangle, losange ; symétrie : reconnaitre un axe, compléter une figure'),
      patrons: src('c2maths', 35, 'construire un cube à partir d’un patron'),
      conjugaison: src('bo41', 94, '+ faire, aller, dire, venir, pouvoir, voir, vouloir, prendre'),
      classesMots: src('bo41', 94, '+ adverbe'),
      pluriels: src('bo41', 94, 'pluriels irréguliers des noms (-x, -al/-aux) ; féminin quand il s’entend dans les noms (lecteur/lectrice) et les adjectifs (joyeux/joyeuse)'),
      lectureMotsParMinute: src('bo41', 79, 'vitesse de 90 mots par minute'),
    },
  },
  {
    niveau: 'cm1', nombreMax: 999999, nombreChiffresMax: 6,
    operationsPosees: ['addition', 'soustraction', 'multiplication', 'division'],
    fractions: { denominateurMax: 20, decimales: [100], superieuresA1: true, operateur: 'unitaires' },
    decimalesMax: 2,
    divisibilite: [2, 5, 10],
    heure: 'minute',
    unitesLongueur: ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km'], unitesMasse: ['mg', 'cg', 'dg', 'g', 'dag', 'hg', 'kg', 't'],
    unitesContenance: ['mL', 'cL', 'dL', 'L', 'daL', 'hL'], unitesAire: ['cm²'],
    tableauConversion: false, tableauUnites: true, tableauProportionnalite: false, calculatrice: 'occasionnelle',
    figures: FIGURES_CM1, solides: SOLIDES_CM1, solidesDecrits: ['cube', 'pave', 'pyramide', 'prisme-droit'], patrons: ['cube'], symetrie: 'construire',
    conjugaison: { temps: TEMPS_CYCLE, groupes: ['etre-avoir', '1er-groupe', '2e-groupe'], irreguliers: IRREGULIERS },
    classesMots: ['determinant', 'nom-commun', 'nom-propre', 'adjectif', 'verbe', 'pronom-personnel', 'adverbe', 'conjonction-coordination'],
    pluriels: ['s', 'x', 'al-aux'], feminins: ['e', 'audible'],
    sources: {
      nombreMax: src('c3maths', 5, 'au plus six chiffres ; « on se limite, pendant les deux premières périodes de l’année, aux nombres entiers s’écrivant avec au plus quatre chiffres »'),
      operationsPosees: src('c3maths', 7, 'additions et soustractions de décimaux, multiplications de deux entiers, décimal × entier < 10, divisions euclidiennes à diviseur à un chiffre'),
      fractions: src('c3maths', 6, '« dénominateur inférieur ou égal à 20, hormis les fractions décimales qui peuvent avoir un dénominateur égal à 100 » ; fractions > 1 ; opérateur pour les fractions unitaires'),
      decimalesMax: src('c3maths', 6, '« ne vont pas au-delà des centièmes et s’écrivent donc avec au plus deux chiffres après la virgule »'),
      divisibilite: src('c3maths', 5, '« Seuls les critères de divisibilité par 2, par 5 et par 10 figurent au programme »'),
      heure: src('c3maths', 18, 'heure et minute'),
      unitesLongueur: src('c3maths', 17, 'du millimètre au kilomètre ; du milligramme au kilogramme et la tonne ; du millilitre à l’hectolitre ; cm²'),
      tableauConversion: src('c3maths', 16, '« Un tableau peut être utilisé pour présenter les différentes unités… et leurs relations… Cependant, au cours moyen, les élèves n’utilisent pas de tableaux pour effectuer des conversions »'),
      tableauProportionnalite: src('c3maths', 26, '« les élèves n’utilisent pas de tableaux de proportionnalité au cours moyen »'),
      calculatrice: src('c3maths', 7, '« Au cours moyen, les élèves ne disposent pas de calculatrice personnelle »'),
      figures: src('c3maths', 20, 'triangle, triangle rectangle, isocèle, équilatéral, quadrilatère, carré, rectangle, losange ; symétrique sur quadrillage (p. 21)'),
      solides: src('c3maths', 21, '+ prisme droit ; reconnaître et construire un patron du cube'),
      conjugaison: src('c3francais', 18, 'présent, imparfait, futur, passé composé : être, avoir, 1er et 2e groupes, 8 irréguliers'),
      classesMots: src('c3francais', 17, 'articles, déterminants possessifs et démonstratifs ; conjonctions de coordination ; adverbes ; pronoms sujets et compléments'),
      pluriels: src('c3francais', 16, 'pluriels irréguliers (-x ; -al/aux), introduits au cycle 2, « stabilisés et complétés en fin de cycle 3 »'),
    },
    interpretation: 'unités : « du millimètre au kilomètre » est lu comme incluant dam et hm (idem pour les masses et contenances)',
  },
  {
    niveau: 'cm2', nombreMax: 999999999, nombreChiffresMax: 9,
    operationsPosees: ['addition', 'soustraction', 'multiplication', 'division'],
    fractions: { denominateurMax: 60, decimales: [100, 1000], superieuresA1: true, operateur: true },
    decimalesMax: 3,
    divisibilite: [2, 5, 10],
    heure: 'seconde',
    unitesLongueur: ['mm', 'cm', 'dm', 'm', 'dam', 'hm', 'km'], unitesMasse: ['mg', 'cg', 'dg', 'g', 'dag', 'hg', 'kg', 't'],
    unitesContenance: ['mL', 'cL', 'dL', 'L', 'daL', 'hL'], unitesAire: ['cm²', 'dm²', 'm²'],
    tableauConversion: false, tableauUnites: true, tableauProportionnalite: false, calculatrice: 'occasionnelle',
    figures: FIGURES_CM2, solides: SOLIDES_CM1, solidesDecrits: ['cube', 'pave', 'pyramide', 'prisme-droit'], patrons: ['cube', 'pave'], symetrie: 'construire',
    conjugaison: { temps: [...TEMPS_CYCLE, 'passe-simple', 'plus-que-parfait'], groupes: ['etre-avoir', '1er-groupe', '2e-groupe'], irreguliers: IRREGULIERS },
    classesMots: ['determinant', 'nom-commun', 'nom-propre', 'adjectif', 'verbe', 'pronom-personnel', 'adverbe', 'conjonction-coordination', 'preposition', 'conjonction-subordination'],
    pluriels: ['s', 'x', 'al-aux'], feminins: ['e', 'audible'],
    sources: {
      nombreMax: src('c3maths', 9, 'au plus neuf chiffres ; au plus six pendant les deux premières périodes ; le milliard en 6e (p. 13)'),
      operationsPosees: src('c3maths', 11, 'multiplication décimal × entier ; divisions décimales, diviseur à un chiffre'),
      fractions: src('c3maths', 10, '« dénominateur inférieur ou égal à 60, hormis les fractions décimales qui peuvent avoir un dénominateur égal à 100 ou à 1 000 »'),
      decimalesMax: src('c3maths', 10, '« L’étude des nombres décimaux s’étend aux millièmes »'),
      divisibilite: src('c3maths', 9, '« Seuls les critères de divisibilité par 2, 5 et 10 figurent au programme »'),
      heure: src('c3maths', 18, '« introduction des secondes »'),
      unitesAire: src('c3maths', 18, 'centimètre carré, décimètre carré et mètre carré'),
      tableauConversion: src('c3maths', 18, 'même phrase qu’au CM1 : tableau de présentation possible, pas de tableau pour convertir'),
      tableauProportionnalite: src('c3maths', 27, 'pas de tableaux de proportionnalité, ni coefficient, ni produit en croix au cours moyen'),
      figures: src('c3maths', 21, '+ trapèze, trapèze rectangle, pentagone et hexagone'),
      patrons: src('c3maths', 22, 'patron du cube ; reconnaître un patron du pavé'),
      conjugaison: src('c3francais', 19, 'passé simple, plus-que-parfait : être, avoir, 1er et 2e groupes, 8 irréguliers'),
      classesMots: src('c3francais', 19, 'prépositions, conjonctions de subordination'),
    },
    note: 'En 6e (hors de notre champ) : impératif présent et conditionnel présent (c3francais p. 21), le milliard (c3maths p. 13).',
  },
]

// ── Utilitaires ──
// Les listes typées « larges » (Domaine, Competence) : les fonctions acceptent un id quelconque (venu d'un lien, d'un
// réglage mémorisé…) et rendent null s'il est inconnu ; les identifiants précis (DomaineId, CompetenceId) servent aux
// données écrites en dur.
const DOMAINES_LISTE: readonly Domaine[] = [...DOMAINES, ...DOMAINES_EXEMPLE]
const COMPETENCES_LISTE: readonly Competence[] = [...COMPETENCES, ...COMPETENCES_EXEMPLE]
export const domaineDe = (id: string): Domaine | null => DOMAINES_LISTE.find(d => d.id === id) ?? null
export const competenceDe = (id: string): Competence | null => COMPETENCES_LISTE.find(k => k.id === id) ?? null
export const competencesDu = (domaine: string, niveau?: Classe | null): Competence[] =>
  COMPETENCES_LISTE.filter(k => k.domaine === domaine && (!niveau || k.niveaux.includes(niveau)))
export const contraintesDe = (niveau: Classe | string): Contraintes | null => CONTRAINTES.find(k => k.niveau === niveau) ?? null
// Nom officiel d'un domaine pour un niveau (« Nombres, calcul et résolution de problèmes » au CP)
export function nomOfficiel(id: string, niveau: Classe): string | null {
  const d = domaineDe(id)
  return d?.officiel[CYCLE_DE[niveau]] ?? null
}
// Lien « programme » à afficher pour un domaine et un niveau
export function lienProgramme(id: string, niveau: Classe): string | null {
  const d = domaineDe(id)
  return d?.lien[CYCLE_DE[niveau]] ?? null
}
