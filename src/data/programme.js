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
//   - Non relus : les livrets d'accompagnement ; « Questionner le monde » (cycle 2), hors de ces BO.
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
//   - `officiel`, `source` et `lien` d'un domaine sont indexés par cycle (1, 2, 3) : le nom change d'un cycle à l'autre.

export const NIVEAUX = ['ps', 'ms', 'gs', 'cp', 'ce1', 'ce2', 'cm1', 'cm2']
export const CYCLE_DE = { ps: 1, ms: 1, gs: 1, cp: 2, ce1: 2, ce2: 2, cm1: 3, cm2: 3 }

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
const PARENTS = {
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

const src = (texte, page, extrait) => ({ texte, page, url: `${SOURCES[texte].url}#page=${page}`, extrait })
const parCycle = (cycles, f) => Object.fromEntries(cycles.map(c => [c, f(c)]))

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
    // « Grandeurs et mesures » et le calendrier relève de « Questionner le monde » (non relu)
    id: 'temps-espace', court: 'Se repérer dans le temps et l’espace', matiere: 'autres', cycles: [1],
    officiel: { 1: 'Se repérer dans le temps et l’espace' },
    source: { 1: src('bo19', 23, 'Se repérer dans le temps et l’espace') },
    lien: { 1: PARENTS[1] },
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
]

// ── Compétences utiles à nos activités (pas tout le programme) ──
const c = (id, domaine, libelle, niveaux, source, extra = {}) => ({ id, domaine, libelle, niveaux, source, ...extra })
const depuis = n => NIVEAUX.slice(NIVEAUX.indexOf(n))     // de n jusqu'au CM2
const entre = (a, b) => NIVEAUX.slice(NIVEAUX.indexOf(a), NIVEAUX.indexOf(b) + 1)

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
]

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
]

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
const plage = (a, b, pas = 1) => Array.from({ length: Math.floor((b - a) / pas) + 1 }, (_, i) => a + i * pas)

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
export const CONTRAINTES = [
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
export const domaineDe = id => DOMAINES.find(d => d.id === id) ?? null
export const competenceDe = id => COMPETENCES.find(k => k.id === id) ?? null
export const competencesDu = (domaine, niveau) =>
  COMPETENCES.filter(k => k.domaine === domaine && (!niveau || k.niveaux.includes(niveau)))
export const contraintesDe = niveau => CONTRAINTES.find(k => k.niveau === niveau) ?? null
// Nom officiel d'un domaine pour un niveau (« Nombres, calcul et résolution de problèmes » au CP)
export function nomOfficiel(id, niveau) {
  const d = domaineDe(id)
  return d?.officiel[CYCLE_DE[niveau]] ?? null
}
// Lien « programme » à afficher pour un domaine et un niveau
export function lienProgramme(id, niveau) {
  const d = domaineDe(id)
  return d?.lien[CYCLE_DE[niveau]] ?? null
}
