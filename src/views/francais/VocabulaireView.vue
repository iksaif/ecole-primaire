<template>
  <div class="container">
    <h1>📚 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <div v-if="phase === 'config'" class="config-box">

      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in NIVEAUX_DISPO" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div v-for="g in typesVisibles" :key="g.groupe" class="config-section">
        <div class="config-section-title">{{ t('g_' + g.id) }}</div>
        <div class="theme-grid">
          <button v-for="ty in g.items" :key="ty.id"
            class="theme-btn" :class="{ active: config.types.includes(ty.id) }"
            @click="toggleType(ty.id)">
            <span class="theme-icon">{{ ty.icon }}</span>
            <span class="theme-label">{{ t('type_' + ty.id) }}</span>
          </button>
        </div>
      </div>
      <p class="astuce">{{ t('astuce') }}</p>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;" @click="demarrer">
          {{ t('commencer') }}
        </button>
      </div>
      <div style="text-align:center;margin-top:.75rem;">
        <button class="btn btn-ghost" style="font-size:.95rem;" @click="imprimerFiche">{{ t('imprimerFiche') }}</button>
      </div>
    </div>

    <!-- ══ EXERCICE ══ -->
    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i"
             class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box">
        <div class="consigne">
          {{ v(question.consigne) }}
          <button v-if="question.lecture" class="btn-tts" :class="{ actif: enLecture }"
            :title="t('ecouterTitre')" @click="lire(question.lecture)">🔊</button>
        </div>

        <div v-if="question.html" class="phrase-display" v-html="v(question.html)"></div>

        <!-- Mode CHOIX -->
        <div v-if="question.mode === 'choix'" class="choix-grid" :class="{ colonne: question.colonne }">
          <button v-for="c in question.choix" :key="c"
            class="choix-btn" :class="choixClass(c)"
            :disabled="repondu" @click="validerChoix(c)">{{ libelleChoix(question, c) }}</button>
        </div>

        <!-- Mode ORDRE (ranger les mots) -->
        <template v-else-if="question.mode === 'ordre'">
          <div class="ordre-zone" :class="zoneCls">
            <template v-for="(e, k) in placees" :key="'p' + k">
              <span v-if="k > 0" class="ordre-sep">→</span>
              <button class="etiquette placee" :disabled="repondu" @click="retirerEtiquette(k)">{{ question.etiquettes[e] }}</button>
            </template>
            <span v-if="placees.length === 0" class="ordre-vide">{{ t('cliqueOrdre') }}</span>
          </div>
          <div class="etiquettes-reserve">
            <button v-for="(e, k) in question.etiquettes" :key="'r' + k" class="etiquette"
              :class="{ cachee: placees.includes(k) }"
              :disabled="repondu || placees.includes(k)" @click="placerEtiquette(k)">{{ e }}</button>
          </div>
          <div v-if="!repondu" style="text-align:center;margin-top:1rem;">
            <button class="btn btn-ghost" style="margin-right:.5rem;" :disabled="placees.length === 0" @click="placees = []">{{ t('effacer') }}</button>
            <button class="btn btn-primary" :disabled="placees.length < question.etiquettes.length" @click="validerOrdre">{{ t('valider') }}</button>
          </div>
        </template>

        <div class="feedback" :class="feedbackCls" v-if="repondu" v-html="feedbackHtml"></div>

        <div v-if="repondu" style="text-align:center;">
          <button class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
            {{ idx + 1 < questions.length ? t('suivant') : t('voirResultats') }}
          </button>
        </div>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div class="config-section-title" style="margin-bottom:.5rem;text-align:left;">{{ t('correction') }}</div>
      <table class="correction-table">
        <thead><tr><th>{{ t('thQuestion') }}</th><th>{{ t('correction') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(q, i) in questions" :key="i" :class="q._resultat ? 'ok' : 'erreur'">
            <td>
              <div class="corr-consigne">{{ v(q.consigne) }}</div>
              <div v-if="!q._resultat && q._donne" class="corr-donne">{{ t('taReponse') }} : {{ libelleChoix(q, q._donne) }}</div>
            </td>
            <td v-html="v(q.solution)"></td>
            <td>{{ q._resultat ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('changer') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useTTS } from '../../composables/useTTS'
import { useI18n } from '../../i18n'

const { enLecture, lire } = useTTS()

// Interface traduite ; le contenu étudié (mots, phrases, définitions, sens) reste en français.
// br: à relire — termes techniques en breton à faire valider par un brittophone.
const { t, langue } = useI18n({
  fr: {
    titre: 'Vocabulaire',
    g_dico: 'Ordre alphabétique et dictionnaire',
    g_sens: 'Le sens des mots',
    g_construction: 'Construction des mots et catégories',
    type_alpha: 'Ranger des mots',
    type_lettre: 'Lettre avant / après',
    type_dictionnaire: 'Mots-repères',
    type_definitions: 'Définitions',
    type_contexte: 'Le sens dans la phrase',
    type_contraires: 'Contraires',
    type_synonymes: 'Mots de même sens',
    type_homonymes: 'Homonymes',
    type_sensFigure: 'Sens propre / figuré',
    type_familles: 'Familles de mots (intrus)',
    type_prefixes: 'Préfixes re-, dé-, in-',
    type_suffixes: 'Suffixes -eur, -ette, -ment…',
    type_categorie: 'Mot étiquette',
    type_intrus: 'Intrus dans une catégorie',
    astuce: 'Tu peux choisir plusieurs exercices : ils seront mélangés.',
    ecouterTitre: 'Écouter',
    cliqueOrdre: "Clique sur les mots dans l'ordre alphabétique…",
    effacer: '↺ Effacer',
    suivant: 'Suivant →',
    correction: 'Correction',
    thQuestion: 'Question',
    changer: '⚙️ Changer',
    // consignes
    c_alpha: "Range les mots dans l'ordre alphabétique.",
    c_lettre: 'Quelle lettre vient juste avant ou juste après ?',
    c_contraires: 'Trouve le contraire.',
    c_synonymes: 'Trouve le mot qui a le même sens (ou presque).',
    c_definitions: 'Quel mot correspond à cette définition ?',
    c_familles: "Trouve l'intrus : le mot qui n'est pas de la même famille.",
    c_categorie: 'Trouve le mot étiquette qui va avec tous ces mots.',
    c_intrus: "Trouve l'intrus : le mot qui ne va pas avec les autres.",
    c_prefixes: 'Quel préfixe faut-il ajouter au début du mot ?',
    c_dictionnaire: 'Dans le dictionnaire, entre quels mots-repères se trouve ce mot ?',
    c_contexte: 'Que veut dire le mot en gras dans cette phrase ?',
    c_homonymes: 'Choisis le mot qui convient.',
    c_sensFigure: 'Le mot en gras est-il employé au sens propre ou au sens figuré ?',
    c_sensFigurePhrase: 'Cette phrase est-elle au sens propre ou au sens figuré ?',
    c_suffixes: 'Quel suffixe faut-il ajouter à la fin du mot ?',
    // explications et corrections
    exAlpha3: 'Les deux premières lettres sont les mêmes : on regarde la 3e lettre.',
    exAlpha2: 'Tous les mots commencent par la même lettre : on regarde la 2e lettre.',
    exAlpha1: 'On regarde la première lettre de chaque mot.',
    lettreAvant: 'Quelle lettre vient juste avant {l} ?',
    lettreApres: 'Quelle lettre vient juste après {l} ?',
    exLettre: "Dans l'alphabet : {a}, {l}, {c}.",
    solAvant: 'Avant {l} : {r} ({a} – {l} – {c})',
    solApres: 'Après {l} : {r} ({a} – {l} – {c})',
    exContraire: '« {r} » est le contraire de « {m} ».',
    exSynonyme: '« {r} » est un mot de même sens que « {m} ».',
    exFamille: "{liste} sont de la famille de « {f} ». « {i} » n'en fait pas partie.",
    solIntrus: '{liste} — intrus : {i}',
    exCategorie: 'Ce sont {e}.',
    exIntrus: '{liste} sont {e}. « {i} » est {un}.',
    solIntrusCat: '{liste} ({e}) — intrus : {i}',
    noteIm: ' On écrit « im » devant m, b, p.',
    exDico: "Dans l'ordre alphabétique : {a} → {m} → {c}.",
    solDico: '{m} : entre {a} et {c}',
    exContexte: 'Ici, « {m} » veut dire : {s}.',
    sensPropre: 'sens propre',
    sensFigure: 'sens figuré',
    fbOrdre: '❌ Le bon ordre est : {r}',
    fbChoix: '❌ La bonne réponse est « {r} »',
    bravoListe: ['Bravo ! 🎉', 'Parfait ! ⭐', 'Exact ! 👏', 'Bien joué ! 🌟'],
    res80: 'Très bien ! 🌟',
    res60: 'Bien ! Revois les erreurs 💪',
    res0: 'Courage ! Relis la correction et recommence 📚',
    // fiche imprimable
    f_alpha: "Range les mots dans l'ordre alphabétique.",
    f_lettre: 'Écris la lettre qui vient juste avant ou juste après.',
    f_contraires: 'Entoure le contraire du mot en gras.',
    f_synonymes: 'Entoure le mot qui a le même sens que le mot en gras.',
    f_definitions: 'Entoure le mot qui correspond à la définition.',
    f_familles: "Barre l'intrus : le mot qui n'est pas de la même famille.",
    f_categorie: 'Écris le mot étiquette.',
    f_intrus: "Barre l'intrus.",
    f_prefixes: 'Écris le mot avec le bon préfixe : re, dé, in ou im.',
    f_dictionnaire: 'Entoure les mots-repères entre lesquels on trouve le mot en gras.',
    f_contexte: 'Entoure le sens du mot en gras dans la phrase.',
    f_homonymes: 'Complète avec le bon mot.',
    f_sensFigure: 'Coche : sens propre (P) ou sens figuré (F) ?',
    f_suffixes: 'Écris le mot avec le bon suffixe : -eur, -ette, -ment, -age ou -ier.',
    lettreP: 'P',
    lettreF: 'F',
  },
  br: {
    titre: 'Geriaoueg',
    g_dico: 'Urzh al lizherenneg ha geriadur',
    g_sens: 'Ster ar gerioù',
    g_construction: 'Savadur ar gerioù ha rummadoù', // br: à relire
    type_alpha: 'Renkañ gerioù',
    type_lettre: "Lizherenn a-raok / war-lerc'h",
    type_dictionnaire: 'Gerioù-merk', // br: à relire (mots-repères du dictionnaire)
    type_definitions: 'Termenadurioù',
    type_contexte: 'Ar ster er frazenn',
    type_contraires: 'Gerioù enep',
    type_synonymes: 'Heñvelsterioù', // br: à relire
    type_homonymes: 'Kenstummoù', // br: à relire (homonymes)
    type_sensFigure: 'Ster rik / ster skeudennek', // br: à relire
    type_familles: 'Familhoù gerioù (ger estren)', // br: à relire (« intrus » = ger estren)
    type_prefixes: 'Rakgerioù re-, dé-, in-', // br: à relire (préfixe = rakger)
    type_suffixes: 'Lostgerioù -eur, -ette, -ment…', // br: à relire (suffixe = lostger)
    type_categorie: 'Ger-tikedenn', // br: à relire (mot étiquette)
    type_intrus: 'Ger estren en ur rummad',
    astuce: "Gallout a rez dibab meur a boelladenn : meskañ a vint.",
    ecouterTitre: 'Selaou',
    cliqueOrdre: 'Klik war ar gerioù dre urzh al lizherenneg…',
    effacer: '↺ Diverkañ',
    suivant: "Da-heul →",
    correction: 'Reizhadenn',
    thQuestion: 'Goulenn',
    changer: '⚙️ Cheñch',
    c_alpha: 'Renk ar gerioù dre urzh al lizherenneg.',
    c_lettre: "Peseurt lizherenn a zeu just a-raok pe just war-lerc'h ?",
    c_contraires: 'Kav ar ger enep.',
    c_synonymes: 'Kav ar ger en deus ar memes ster (pe dost).',
    c_definitions: 'Peseurt ger a glot gant an termenadur-mañ ?',
    c_familles: "Kav ar ger estren : ar ger n'eo ket eus ar memes familh.",
    c_categorie: "Kav ar ger-tikedenn a ya gant an holl c'herioù-se.",
    c_intrus: 'Kav ar ger estren : ar ger na ya ket gant ar re all.',
    c_prefixes: 'Peseurt rakger a rank bezañ ouzhpennet e penn kentañ ar ger ?',
    c_dictionnaire: 'Er geriadur, etre peseurt gerioù-merk emañ ar ger-mañ ?',
    c_contexte: 'Petra eo ster ar ger e tev er frazenn-mañ ?', // br: à relire (« e tev » = en gras)
    c_homonymes: 'Dibab ar ger a zere.',
    c_sensFigure: 'Hag implijet eo ar ger e tev gant e ster rik pe gant ur ster skeudennek ?',
    c_sensFigurePhrase: 'Hag emañ ar frazenn-mañ gant ar ster rik pe gant ar ster skeudennek ?',
    c_suffixes: 'Peseurt lostger a rank bezañ ouzhpennet e dibenn ar ger ?',
    exAlpha3: "Heñvel eo an div lizherenn gentañ : sellet e vez ouzh an 3de lizherenn.",
    exAlpha2: "Gant ar memes lizherenn e krog an holl c'herioù : sellet e vez ouzh an eil lizherenn.",
    exAlpha1: 'Sellet e vez ouzh lizherenn gentañ pep ger.',
    lettreAvant: 'Peseurt lizherenn a zeu just a-raok {l} ?',
    lettreApres: "Peseurt lizherenn a zeu just war-lerc'h {l} ?",
    exLettre: 'El lizherenneg : {a}, {l}, {c}.',
    solAvant: 'A-raok {l} : {r} ({a} – {l} – {c})',
    solApres: "War-lerc'h {l} : {r} ({a} – {l} – {c})",
    exContraire: '« {r} » eo ar ger enep da « {m} ».',
    exSynonyme: '« {r} » en deus ar memes ster ha « {m} ».',
    exFamille: "{liste} a zo eus familh « {f} ». N'emañ ket « {i} » er familh-se.",
    solIntrus: '{liste} — ger estren : {i}',
    exCategorie: 'Ar gerioù-se a zo « {e} ».',
    exIntrus: '{liste} a zo « {e} ». « {i} » a zo « {un} ».',
    solIntrusCat: '{liste} (« {e} ») — ger estren : {i}',
    noteIm: ' Skrivet e vez « im » a-raok m, b, p.',
    exDico: 'Dre urzh al lizherenneg : {a} → {m} → {c}.',
    solDico: '{m} : etre {a} ha {c}',
    exContexte: 'Amañ, « {m} » a dalvez : {s}.',
    sensPropre: 'ster rik', // br: à relire
    sensFigure: 'ster skeudennek', // br: à relire
    fbOrdre: '❌ An urzh mat eo : {r}',
    fbChoix: '❌ Ar respont mat eo « {r} »',
    bravoListe: ['Brav eo ! 🎉', 'Dispar ! ⭐', 'Just eo ! 👏', 'Mat-tre ! 🌟'],
    res80: 'Mat-tre ! 🌟',
    res60: 'Mat ! Adwel ar fazioù 💪',
    res0: "Kalon vat ! Adlenn ar reizhadenn hag adkrog 📚",
    f_alpha: 'Renk ar gerioù dre urzh al lizherenneg.',
    f_lettre: "Skriv al lizherenn a zeu just a-raok pe just war-lerc'h.",
    f_contraires: "Kelc'hia ar ger enep d'ar ger e tev.", // br: à relire (entourer = kelc'hiañ)
    f_synonymes: "Kelc'hia ar ger en deus ar memes ster hag ar ger e tev.",
    f_definitions: "Kelc'hia ar ger a glot gant an termenadur.",
    f_familles: "Barrenn ar ger estren : ar ger n'eo ket eus ar memes familh.", // br: à relire (barrer = barrennañ)
    f_categorie: 'Skriv ar ger-tikedenn.',
    f_intrus: 'Barrenn ar ger estren.',
    f_prefixes: 'Skriv ar ger gant ar rakger mat : re, dé, in pe im.',
    f_dictionnaire: "Kelc'hia ar gerioù-merk ma kaver ar ger e tev etrezo.",
    f_contexte: "Kelc'hia ster ar ger e tev er frazenn.",
    f_homonymes: 'Klok gant ar ger mat.',
    f_sensFigure: 'Merk : ster rik (R) pe ster skeudennek (S) ?',
    f_suffixes: 'Skriv ar ger gant al lostger mat : -eur, -ette, -ment, -age pe -ier.',
    lettreP: 'R',
    lettreF: 'S',
  },
})
// Champ de texte calculé à la volée (suit la langue) ou chaîne fixe
const v = x => (typeof x === 'function' ? x() : x)
// Libellé affiché pour un choix (seuls « sens propre / figuré » sont des mots d'interface)
function libelleChoix(q, c) {
  if (q?.type === 'sensFigure') {
    if (c === 'sens propre') return t('sensPropre')
    if (c === 'sens figuré') return t('sensFigure')
  }
  return c
}

// ════════════════════════════════════════════════════════════════════
// ── LOGIQUE PURE (début) — données + génération, testable hors Vue
// ════════════════════════════════════════════════════════════════════

// Chaque type indique les niveaux où il est proposé
const TYPES = [
  { id: 'dico', groupe: 'Ordre alphabétique et dictionnaire', items: [
    { id: 'alpha',        icon: '🔤', label: 'Ranger des mots',           niv: ['ce1', 'ce2'] },
    { id: 'lettre',       icon: '🅰️', label: 'Lettre avant / après',      niv: ['ce1'] },
    { id: 'dictionnaire', icon: '📕', label: 'Mots-repères',              niv: ['ce2'] },
    { id: 'definitions',  icon: '📖', label: 'Définitions',               niv: ['ce1', 'ce2'] },
    { id: 'contexte',     icon: '🔎', label: 'Le sens dans la phrase',    niv: ['ce2'] },
  ]},
  { id: 'sens', groupe: 'Le sens des mots', items: [
    { id: 'contraires', icon: '↔️', label: 'Contraires',           niv: ['ce1', 'ce2'] },
    { id: 'synonymes',  icon: '🟰', label: 'Mots de même sens',    niv: ['ce1', 'ce2'] },
    { id: 'homonymes',  icon: '👂', label: 'Homonymes',            niv: ['ce2'] },
    { id: 'sensFigure', icon: '🎭', label: 'Sens propre / figuré', niv: ['ce2'] },
  ]},
  { id: 'construction', groupe: 'Construction des mots et catégories', items: [
    { id: 'familles',  icon: '👨‍👩‍👧', label: 'Familles de mots (intrus)',   niv: ['ce1', 'ce2'] },
    { id: 'prefixes',  icon: '🧩', label: 'Préfixes re-, dé-, in-',        niv: ['ce1', 'ce2'] },
    { id: 'suffixes',  icon: '🔚', label: 'Suffixes -eur, -ette, -ment…',  niv: ['ce2'] },
    { id: 'categorie', icon: '🏷️', label: 'Mot étiquette',                 niv: ['ce1'] },
    { id: 'intrus',    icon: '🕵️', label: 'Intrus dans une catégorie',     niv: ['ce1'] },
  ]},
]
const IDS_TYPES = TYPES.flatMap(g => g.items.map(t => t.id))
function typesDuNiveau(niveau) {
  return TYPES.flatMap(g => g.items).filter(t => t.niv.includes(niveau)).map(t => t.id)
}

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'

const DONNEES = {
  ce1: {
    // Mots regroupés par première lettre (2e lettres toutes différentes dans un groupe)
    alpha: {
      b: ['balle', 'bébé', 'biscuit', 'bonbon', 'brosse', 'bus', 'blé'],
      c: ['cabane', 'cerise', 'chat', 'citron', 'cochon', 'crayon', 'cuisine'],
      d: ['dame', 'dent', 'dinde', 'domino', 'dragon', 'dune'],
      f: ['farine', 'fée', 'fil', 'fourmi', 'fleur', 'frite', 'fusée'],
      l: ['lapin', 'légume', 'livre', 'loup', 'lune'],
      m: ['maison', 'melon', 'miel', 'moto', 'mur'],
      p: ['pain', 'pelle', 'piano', 'poule', 'prune', 'pull', 'plume'],
      r: ['radis', 'renard', 'rideau', 'robe', 'rue'],
      s: ['sac', 'sel', 'singe', 'soleil', 'sucre', 'scie'],
      t: ['table', 'terre', 'tigre', 'tomate', 'train', 'tulipe'],
      g: ['gâteau', 'girafe', 'gomme', 'grenouille', 'guitare'],
      v: ['vache', 'vélo', 'ville', 'voiture'],
      a: ['abeille', 'arbre', 'avion', 'ami'],
      o: ['oiseau', 'orange', 'ours', 'olive'],
      n: ['nuage', 'neige', 'nid', 'nounours'],
      j: ['jardin', 'jeu', 'jouet', 'jupe'],
      é: ['école', 'étoile', 'éléphant'],
    },

    // [mot, contraire, catégorie (a adj., v verbe, x autre), famille de sens éventuelle]
    contraires: [
      ['grand', 'petit', 'a', 'taille'], ['long', 'court', 'a', 'taille'], ['lourd', 'léger', 'a', 'taille'],
      ['gros', 'mince', 'a', 'taille'], ['haut', 'bas', 'a', 'taille'], ['large', 'étroit', 'a', 'taille'],
      ['chaud', 'froid', 'a'], ['jeune', 'vieux', 'a'], ['rapide', 'lent', 'a'],
      ['propre', 'sale', 'a'], ['plein', 'vide', 'a'], ['gentil', 'méchant', 'a', 'qualite'],
      ['ouvert', 'fermé', 'a'], ['mouillé', 'sec', 'a'], ['facile', 'difficile', 'a'],
      ['fort', 'faible', 'a'], ['joyeux', 'triste', 'a'], ['clair', 'sombre', 'a'],
      ['dur', 'mou', 'a'], ['riche', 'pauvre', 'a'], ['beau', 'laid', 'a', 'qualite'],
      ['bon', 'mauvais', 'a', 'qualite'], ['premier', 'dernier', 'a'], ['sucré', 'salé', 'a'],
      ['bruyant', 'silencieux', 'a'],
      ['monter', 'descendre', 'v'], ['entrer', 'sortir', 'v'], ['ouvrir', 'fermer', 'v'],
      ['allumer', 'éteindre', 'v'], ['gagner', 'perdre', 'v'], ['rire', 'pleurer', 'v'],
      ['acheter', 'vendre', 'v'], ['donner', 'recevoir', 'v'], ['remplir', 'vider', 'v'],
      ['commencer', 'finir', 'v'], ['arriver', 'partir', 'v'], ['pousser', 'tirer', 'v'],
      ['aimer', 'détester', 'v'], ['se lever', 'se coucher', 'v'],
      ['jour', 'nuit', 'x', 'temps'], ['début', 'fin', 'x', 'temps'], ['devant', 'derrière', 'x', 'lieu'],
      ['dessus', 'dessous', 'x', 'lieu'], ['toujours', 'jamais', 'x', 'temps'], ['beaucoup', 'peu', 'x'],
      ['tôt', 'tard', 'x', 'temps'], ['loin', 'près', 'x', 'lieu'], ['dedans', 'dehors', 'x', 'lieu'],
      ['avant', 'après', 'x', 'temps'], ['matin', 'soir', 'x', 'temps'], ['ami', 'ennemi', 'x'],
      ['entrée', 'sortie', 'x'], ['question', 'réponse', 'x'], ['été', 'hiver', 'x', 'temps'],
      ['vite', 'lentement', 'x'],
    ],

    // [mot, mot de sens proche, catégorie (a adj., v verbe, n nom), famille de sens éventuelle]
    synonymes: [
      ['content', 'heureux', 'a', 'humeur'], ['joli', 'beau', 'a'], ['triste', 'malheureux', 'a', 'humeur'],
      ['gentil', 'aimable', 'a'], ['malin', 'rusé', 'a'], ['drôle', 'amusant', 'a', 'drole'],
      ['bizarre', 'étrange', 'a', 'drole'], ['calme', 'tranquille', 'a'], ['facile', 'simple', 'a', 'difficulte'],
      ['difficile', 'compliqué', 'a', 'difficulte'], ['mince', 'fin', 'a', 'taille'], ['vieux', 'âgé', 'a'],
      ['fâché', 'en colère', 'a', 'humeur'], ['énorme', 'gigantesque', 'a', 'taille'], ['minuscule', 'tout petit', 'a', 'taille'],
      ['commencer', 'débuter', 'v', 'debut'], ['finir', 'terminer', 'v', 'debut'], ['regarder', 'observer', 'v'],
      ['crier', 'hurler', 'v', 'parole'], ['casser', 'briser', 'v'], ['bâtir', 'construire', 'v'],
      ['jeter', 'lancer', 'v'], ['se dépêcher', 'se presser', 'v'], ['trouver', 'découvrir', 'v'],
      ['rire', 'rigoler', 'v'], ['parler', 'bavarder', 'v', 'parole'], ['effrayer', 'faire peur', 'v'],
      ['donner', 'offrir', 'v'],
      ['vélo', 'bicyclette', 'n', 'transport'], ['auto', 'voiture', 'n', 'transport'], ['peur', 'frayeur', 'n'],
      ['ami', 'copain', 'n'], ['habit', 'vêtement', 'n'], ['chemin', 'sentier', 'n'],
      ['bateau', 'navire', 'n', 'transport'], ['docteur', 'médecin', 'n', 'metier'], ['erreur', 'faute', 'n'],
      ['histoire', 'récit', 'n'], ['visage', 'figure', 'n'], ['enseignant', 'professeur', 'n', 'metier'],
      ['magasin', 'boutique', 'n'], ['vacarme', 'bruit', 'n'],
    ],

    // [3 mots de la même famille, intrus qui leur ressemble]
    familles: [
      [['dent', 'dentiste', 'dentifrice'], 'danse'],
      [['jardin', 'jardinier', 'jardinage'], 'jaguar'],
      [['fleur', 'fleuriste', 'fleurir'], 'flèche'],
      [['terre', 'terrain', 'enterrer'], 'terrible'],
      [['lait', 'laitier', 'laitage'], 'laid'],
      [['chant', 'chanter', 'chanteur'], 'chat'],
      [['lire', 'lecture', 'lecteur'], 'lit'],
      [['mer', 'marin', 'marée'], 'merci'],
      [['boulanger', 'boulangerie', 'boulangère'], 'bouteille'],
      [['poisson', 'poissonnier', 'poissonnerie'], 'poison'],
      [['froid', 'froideur', 'refroidir'], 'frite'],
      [['long', 'longueur', 'allonger'], 'loup'],
      [['blanc', 'blancheur', 'blanchir'], 'blé'],
      [['coiffer', 'coiffeur', 'coiffure'], 'coffre'],
      [['neige', 'neiger', 'enneigé'], 'nez'],
      [['laver', 'lavage', 'lavabo'], 'larme'],
      [['grand', 'grandir', 'grandeur'], 'grenier'],
      [['sel', 'salé', 'saler'], 'selle'],
      [['dormir', 'dortoir', 'endormi'], 'dorer'],
      [['jour', 'journée', 'journal'], 'jouet'],
      [['peur', 'peureux', 'apeuré'], 'pelle'],
      [['porte', 'portail', 'portière'], 'porc'],
      [['rouge', 'rougir', 'rougeur'], 'route'],
      [['chaud', 'chauffer', 'chaleur'], 'chausson'],
      [['manger', 'mangeoire', 'mangeur'], 'manche'],
      [['roi', 'royal', 'royaume'], 'roue'],
      [['école', 'écolier', 'écolière'], 'écureuil'],
      [['glace', 'glacier', 'glaçon'], 'glisser'],
    ],

    // Catégories sans mot commun entre elles. etiquette = mot générique (mot étiquette)
    categories: [
      { etiquette: 'des fruits',     un: 'un fruit',    mots: ['pomme', 'poire', 'banane', 'fraise', 'cerise', 'abricot', 'prune', 'ananas', 'kiwi', 'mangue'] },
      { etiquette: 'des légumes',    un: 'un légume',   mots: ['carotte', 'poireau', 'haricot', 'chou', 'salade', 'navet', 'radis', 'courgette', 'épinard', 'brocoli'] },
      { etiquette: 'des vêtements',  un: 'un vêtement', mots: ['pantalon', 'chemise', 'jupe', 'robe', 'pull', 'manteau', 'chaussette', 'short', 'veste', 'écharpe'] },
      { etiquette: 'des meubles',    un: 'un meuble',   mots: ['table', 'chaise', 'armoire', 'lit', 'canapé', 'buffet', 'commode', 'étagère', 'fauteuil'] },
      { etiquette: 'des instruments de musique', un: 'un instrument de musique', mots: ['guitare', 'piano', 'violon', 'flûte', 'tambour', 'trompette', 'harpe', 'xylophone'] },
      { etiquette: 'des couleurs',   un: 'une couleur', mots: ['rouge', 'bleu', 'vert', 'jaune', 'noir', 'blanc', 'gris', 'violet'] },
      { etiquette: 'des véhicules',  un: 'un véhicule', mots: ['voiture', 'bus', 'train', 'avion', 'vélo', 'bateau', 'camion', 'moto', 'tramway', 'métro'] },
      { etiquette: 'des métiers',    un: 'un métier',   mots: ['boulanger', 'médecin', 'pompier', 'facteur', 'coiffeur', 'policier', 'jardinier', 'vétérinaire', 'maçon', 'infirmier'] },
      { etiquette: 'des sports',     un: 'un sport',    mots: ['football', 'tennis', 'judo', 'natation', 'basket', 'rugby', 'ski', 'gymnastique', 'escalade'] },
      { etiquette: 'des oiseaux',    un: 'un oiseau',   mots: ['moineau', 'pigeon', 'merle', 'aigle', 'hibou', 'mésange', 'corbeau', 'perroquet', 'cygne'] },
      { etiquette: 'des insectes',   un: 'un insecte',  mots: ['fourmi', 'abeille', 'mouche', 'papillon', 'coccinelle', 'moustique', 'guêpe', 'sauterelle'] },
      { etiquette: 'des fleurs',     un: 'une fleur',   mots: ['tulipe', 'marguerite', 'coquelicot', 'tournesol', 'jonquille', 'muguet', 'pâquerette'] },
      { etiquette: 'des parties du corps', un: 'une partie du corps', mots: ['bras', 'jambe', 'tête', 'main', 'pied', 'genou', 'coude', 'épaule', 'nez', 'oreille'] },
      { etiquette: 'des pièces de la maison', un: 'une pièce de la maison', mots: ['cuisine', 'salon', 'chambre', 'salle de bains', 'grenier', 'cave', 'garage', 'couloir'] },
      { etiquette: 'des boissons',   un: 'une boisson', mots: ['eau', 'lait', 'sirop', 'limonade', 'thé', 'jus de pomme', 'chocolat chaud'] },
      { etiquette: 'des jours de la semaine', un: 'un jour de la semaine', mots: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'] },
    ],

    // [mot simple, préfixe, sens du mot obtenu]
    prefixes: [
      ['faire', 're', 'faire encore une fois'], ['lire', 're', 'lire encore une fois'],
      ['dire', 're', 'dire encore une fois'], ['commencer', 're', 'commencer encore une fois'],
      ['partir', 're', 'partir de nouveau'], ['monter', 're', 'monter de nouveau'],
      ['coller', 're', 'coller de nouveau'], ['plier', 're', 'plier de nouveau'],
      ['voir', 're', 'voir encore une fois'], ['copier', 're', 'copier encore une fois'],
      ['faire', 'dé', 'le contraire de faire'], ['coller', 'dé', 'le contraire de coller'],
      ['monter', 'dé', 'le contraire de monter (un jouet, un meuble)'], ['brancher', 'dé', 'le contraire de brancher'],
      ['boucher', 'dé', 'le contraire de boucher'], ['gonfler', 'dé', 'le contraire de gonfler'],
      ['plier', 'dé', 'le contraire de plier'], ['visser', 'dé', 'le contraire de visser'],
      ['boutonner', 'dé', 'le contraire de boutonner'], ['couvrir', 'dé', 'enlever ce qui couvre'],
      ['visible', 'in', 'qui n\'est pas visible'], ['connu', 'in', 'qui n\'est pas connu'],
      ['juste', 'in', 'qui n\'est pas juste'], ['utile', 'in', 'qui n\'est pas utile'],
      ['capable', 'in', 'qui n\'est pas capable'], ['complet', 'in', 'qui n\'est pas complet'],
      ['possible', 'im', 'qui n\'est pas possible'], ['patient', 'im', 'qui n\'est pas patient'],
      ['poli', 'im', 'qui n\'est pas poli'], ['pair', 'im', 'qui n\'est pas pair'],
      ['prudent', 'im', 'qui n\'est pas prudent'],
    ],

    // [mot, définition]
    definitions: [
      ['boulanger', 'Personne qui fabrique le pain.'],
      ['ciseaux', 'Outil qui sert à couper le papier.'],
      ['parapluie', 'Objet qui protège de la pluie.'],
      ['hibou', 'Oiseau de nuit aux grands yeux ronds.'],
      ['bibliothèque', 'Lieu où l\'on peut emprunter des livres.'],
      ['dictionnaire', 'Livre qui explique le sens des mots, rangés dans l\'ordre alphabétique.'],
      ['réfrigérateur', 'Appareil qui garde les aliments au frais.'],
      ['pharmacie', 'Magasin où l\'on achète des médicaments.'],
      ['facteur', 'Personne qui distribue le courrier.'],
      ['calendrier', 'Tableau des jours, des semaines et des mois de l\'année.'],
      ['volcan', 'Montagne qui peut cracher de la lave.'],
      ['île', 'Terre entourée d\'eau de tous les côtés.'],
      ['cartable', 'Sac pour porter ses affaires d\'école.'],
      ['gomme', 'Petit objet qui sert à effacer.'],
      ['thermomètre', 'Instrument qui mesure la température.'],
      ['vétérinaire', 'Médecin qui soigne les animaux.'],
      ['désert', 'Grande étendue très sèche, souvent couverte de sable.'],
      ['miel', 'Produit sucré fabriqué par les abeilles.'],
      ['ruche', 'Maison des abeilles.'],
      ['nid', 'Abri construit par les oiseaux pour pondre leurs œufs.'],
      ['écureuil', 'Petit animal roux à la grande queue touffue, qui mange des noisettes.'],
      ['horloge', 'Grand appareil qui indique l\'heure.'],
      ['forêt', 'Grand espace couvert d\'arbres.'],
      ['pont', 'Construction qui permet de passer au-dessus d\'une rivière.'],
      ['piscine', 'Grand bassin où l\'on nage.'],
      ['pompier', 'Personne qui éteint les incendies et porte secours.'],
      ['arrosoir', 'Récipient qui sert à arroser les plantes.'],
      ['tortue', 'Animal lent qui porte une carapace.'],
      ['architecte', 'Personne qui dessine les plans des maisons.'],
      ['loupe', 'Verre qui fait paraître les objets plus gros.'],
      ['brosse à dents', 'Petite brosse qui sert à se laver les dents.'],
      ['boussole', 'Objet dont l\'aiguille indique le nord.'],
    ],
  },
  ce2: {
    // Même 2 premières lettres → regarder la 3e (3e lettres toutes différentes dans un groupe)
    alpha3: {
      ca: ['cabane', 'cadeau', 'cahier', 'canard', 'carotte', 'castor', 'cave'],
      ch: ['chameau', 'chemin', 'chiffre', 'chocolat', 'chute'],
      po: ['poche', 'poisson', 'pomme', 'pont', 'porte', 'poupée'],
      ma: ['magasin', 'maison', 'malade', 'manteau', 'marteau', 'masque'],
      pa: ['page', 'pain', 'papillon', 'parc', 'pâte'],
      tr: ['train', 'trésor', 'tricot', 'trompette', 'truite'],
      bo: ['bocal', 'boîte', 'bonbon', 'bottes', 'bouche'],
      la: ['lac', 'lait', 'lampe', 'lapin', 'larme', 'lavabo'],
      fr: ['fraise', 'frère', 'frite', 'fromage', 'fruit'],
      gr: ['grand', 'grenier', 'grille', 'gros', 'grue'],
      ba: ['bague', 'baleine', 'banane', 'barque', 'bateau'],
      sa: ['sable', 'sac', 'salade', 'sapin', 'sauce'],
    },

    contraires: [
      ['honnête', 'malhonnête', 'a', 'morale'], ['obéissant', 'désobéissant', 'a', 'morale'],
      ['prudent', 'imprudent', 'a', 'morale'], ['généreux', 'avare', 'a', 'morale'],
      ['courageux', 'peureux', 'a', 'courage'], ['timide', 'audacieux', 'a', 'courage'],
      ['solide', 'fragile', 'a'], ['lisse', 'rugueux', 'a'], ['ancien', 'moderne', 'a'],
      ['rare', 'fréquent', 'a'], ['sauvage', 'domestique', 'a'], ['vrai', 'faux', 'a'],
      ['présent', 'absent', 'a'], ['heureux', 'malheureux', 'a', 'humeur'], ['calme', 'agité', 'a', 'humeur'],
      ['cru', 'cuit', 'a'], ['épais', 'mince', 'a'], ['intérieur', 'extérieur', 'a'], ['possible', 'impossible', 'a'],
      ['avancer', 'reculer', 'v'], ['attacher', 'détacher', 'v'], ['accepter', 'refuser', 'v'],
      ['construire', 'démolir', 'v'], ['augmenter', 'diminuer', 'v'], ['se souvenir', 'oublier', 'v'],
      ['réussir', 'échouer', 'v'], ['économiser', 'dépenser', 'v'], ['autoriser', 'interdire', 'v'],
      ['apparaître', 'disparaître', 'v'], ['emprunter', 'prêter', 'v'], ['habiller', 'déshabiller', 'v'],
      ['accélérer', 'ralentir', 'v'],
      ['victoire', 'défaite', 'n'], ['départ', 'arrivée', 'n'], ['courage', 'peur', 'n'],
      ['silence', 'bruit', 'n'], ['paix', 'guerre', 'n'], ['qualité', 'défaut', 'n'],
      ['force', 'faiblesse', 'n'], ['richesse', 'pauvreté', 'n'],
    ],

    synonymes: [
      ['beau', 'magnifique', 'a', 'beaute'], ['laid', 'affreux', 'a', 'beaute'], ['grand', 'immense', 'a', 'taille'],
      ['petit', 'minuscule', 'a', 'taille'], ['content', 'ravi', 'a', 'humeur'], ['joyeux', 'gai', 'a', 'humeur'],
      ['drôle', 'comique', 'a', 'humeur'], ['fatigué', 'épuisé', 'a'], ['courageux', 'brave', 'a'],
      ['intelligent', 'malin', 'a'], ['ennuyeux', 'lassant', 'a'], ['silencieux', 'muet', 'a'], ['effrayé', 'terrifié', 'a'],
      ['bavarder', 'papoter', 'v', 'parole'], ['demander', 'questionner', 'v', 'parole'], ['répondre', 'répliquer', 'v', 'parole'],
      ['dire', 'déclarer', 'v', 'parole'], ['regarder', 'contempler', 'v'], ['manger', 'dévorer', 'v'],
      ['aimer', 'adorer', 'v', 'sentiment'], ['détester', 'haïr', 'v', 'sentiment'], ['tomber', 'chuter', 'v'],
      ['partir', 's\'en aller', 'v'], ['habiter', 'résider', 'v'], ['réparer', 'arranger', 'v'], ['cacher', 'dissimuler', 'v'],
      ['peur', 'crainte', 'n'], ['endroit', 'lieu', 'n'], ['bâtiment', 'édifice', 'n'], ['image', 'illustration', 'n'],
      ['cadeau', 'présent', 'n'], ['récompense', 'prix', 'n'], ['voyage', 'excursion', 'n'], ['colère', 'fureur', 'n'],
      ['vacarme', 'tapage', 'n'], ['ami', 'camarade', 'n'],
    ],

    familles: [
      [['nuit', 'minuit', 'nocturne'], 'nuage'],
      [['main', 'manuel', 'manette'], 'manteau'],
      [['pied', 'piéton', 'piétiner'], 'pierre'],
      [['froid', 'refroidir', 'froidement'], 'frontière'],
      [['plume', 'plumage', 'plumer'], 'pluie'],
      [['bois', 'boisé', 'boiserie'], 'boisson'],
      [['sable', 'sablier', 'ensabler'], 'sabot'],
      [['chant', 'chanson', 'enchanté'], 'champ'],
      [['nage', 'nageur', 'nageoire'], 'neige'],
      [['roi', 'royal', 'royauté'], 'rayon'],
      [['poule', 'poulet', 'poulailler'], 'pouce'],
      [['ami', 'amitié', 'amical'], 'amande'],
      [['terre', 'terrien', 'souterrain'], 'thermos'],
      [['vent', 'venteux', 'éventail'], 'ventre'],
    ],

    // Sens d'un mot dans le contexte : [phrase, mot, bon sens, autres sens]
    contexte: [
      ['Maman achète une carte de France pour le voyage.', 'carte', 'dessin qui représente un pays ou une région', ['petit carton pour jouer', 'liste des plats d\'un restaurant']],
      ['Au restaurant, le serveur apporte la carte.', 'carte', 'liste des plats d\'un restaurant', ['dessin qui représente un pays', 'petit carton pour jouer']],
      ['Une feuille tombe de l\'arbre.', 'feuille', 'partie verte d\'une plante', ['morceau de papier', 'mince plaque de métal']],
      ['Écris ton nom sur une feuille.', 'feuille', 'morceau de papier', ['partie verte d\'une plante', 'mince plaque de métal']],
      ['Je regarde ma coiffure dans la glace.', 'glace', 'miroir', ['dessert glacé', 'eau gelée']],
      ['En été, je mange une glace à la vanille.', 'glace', 'dessert glacé', ['miroir', 'eau gelée']],
      ['Le facteur apporte une lettre.', 'lettre', 'message écrit envoyé à quelqu\'un', ['signe de l\'alphabet', 'petit paquet']],
      ['Le mot « chat » a quatre lettres.', 'lettres', 'signes de l\'alphabet', ['messages envoyés par la poste', 'petits paquets']],
      ['J\'ai perdu un bouton de ma chemise.', 'bouton', 'petit objet rond qui sert à fermer un vêtement', ['petite boule sur la peau', 'fleur pas encore ouverte']],
      ['Au printemps, le rosier est couvert de boutons.', 'boutons', 'fleurs pas encore ouvertes', ['petits objets pour fermer un vêtement', 'petites boules sur la peau']],
      ['La souris de l\'ordinateur ne marche plus.', 'souris', 'objet qui sert à déplacer la flèche sur l\'écran', ['petit animal gris', 'petite gomme']],
      ['Le chat attrape une souris.', 'souris', 'petit animal gris', ['objet qui sert à déplacer la flèche sur l\'écran', 'petite gomme']],
      ['J\'ai eu une bonne note en dictée.', 'note', 'chiffre ou lettre qui évalue un travail', ['son de musique', 'petit papier pour se souvenir']],
      ['Le piano joue une note très aiguë.', 'note', 'son de musique', ['chiffre qui évalue un travail', 'petit papier pour se souvenir']],
      ['La cuisine est la pièce que je préfère.', 'pièce', 'partie d\'une maison', ['morceau de monnaie', 'spectacle de théâtre']],
      ['J\'ai une pièce de deux euros.', 'pièce', 'morceau de monnaie', ['partie d\'une maison', 'spectacle de théâtre']],
      ['Trace un trait avec ta règle.', 'règle', 'instrument pour tracer des traits droits', ['ce qu\'il faut respecter dans un jeu', 'boîte de jeu']],
      ['Avant de jouer, lis bien la règle du jeu.', 'règle', 'ce qu\'il faut respecter dans un jeu', ['instrument pour tracer des traits droits', 'boîte de jeu']],
      ['Je révise la table de 3.', 'table', 'liste des résultats d\'une multiplication', ['meuble avec un plateau et des pieds', 'liste des chapitres d\'un livre']],
      ['Le crayon a une mine bien pointue.', 'mine', 'bâton de couleur au centre du crayon', ['air du visage', 'trou creusé pour trouver du charbon']],
      ['Tu as bonne mine après les vacances.', 'mine', 'air du visage', ['bâton de couleur au centre du crayon', 'trou creusé pour trouver du charbon']],
      ['L\'avion décolle pour un long vol.', 'vol', 'trajet d\'un avion', ['action de prendre ce qui n\'est pas à soi', 'groupe d\'oiseaux']],
      ['Le voleur a été arrêté après le vol.', 'vol', 'action de prendre ce qui n\'est pas à soi', ['trajet d\'un avion', 'groupe d\'oiseaux']],
      ['L\'avocat défend son client.', 'avocat', 'personne qui défend quelqu\'un au tribunal', ['fruit vert à gros noyau', 'juge']],
      ['Je mange un avocat en salade.', 'avocat', 'fruit vert à gros noyau', ['personne qui défend quelqu\'un au tribunal', 'légume rouge']],
    ],

    // Homonymes : [phrase avec ___, mot juste, autres homonymes, sens du mot juste]
    homonymes: [
      ['Je bois un ___ d\'eau.', 'verre', ['vert', 'ver', 'vers'], 'récipient pour boire'],
      ['Le feu passe au ___.', 'vert', ['verre', 'ver', 'vers'], 'une couleur'],
      ['Le pêcheur accroche un ___ à son hameçon.', 'ver', ['verre', 'vert', 'vers'], 'petit animal sans pattes'],
      ['Nous allons à la ___ cet été.', 'mer', ['mère', 'maire'], 'grande étendue d\'eau salée'],
      ['Ma ___ prépare le dîner.', 'mère', ['mer', 'maire'], 'la maman'],
      ['Le ___ de la ville fait un discours.', 'maire', ['mer', 'mère'], 'personne qui dirige la commune'],
      ['Le boulanger vend du ___.', 'pain', ['pin', 'peint'], 'aliment fait avec de la farine'],
      ['Un écureuil grimpe dans le ___.', 'pin', ['pain', 'peint'], 'un arbre'],
      ['La girafe a un long ___.', 'cou', ['coup', 'coût'], 'partie du corps'],
      ['Le footballeur donne un ___ de pied dans le ballon.', 'coup', ['cou', 'coût'], 'un choc'],
      ['Le cavalier pose la ___ sur le cheval.', 'selle', ['sel', 'celle'], 'siège du cavalier'],
      ['Ajoute une pincée de ___ dans la soupe.', 'sel', ['selle', 'celle'], 'poudre blanche qui sale'],
      ['Je ___ un oiseau dans l\'arbre.', 'vois', ['voix', 'voie'], 'verbe voir'],
      ['Le chanteur a une belle ___.', 'voix', ['vois', 'voie'], 'son que l\'on fait en parlant ou en chantant'],
      ['Le train roule sur la ___ ferrée.', 'voie', ['voix', 'vois'], 'chemin, route'],
      ['Le fermier laboure son ___.', 'champ', ['chant'], 'terrain cultivé'],
      ['On entend le ___ du coq.', 'chant', ['champ'], 'action de chanter'],
      ['Je remplis un ___ d\'eau.', 'seau', ['saut', 'sot'], 'récipient avec une anse'],
      ['Le kangourou fait un grand ___.', 'saut', ['seau', 'sot'], 'action de sauter'],
      ['J\'ai ___ : je vais manger.', 'faim', ['fin'], 'envie de manger'],
      ['C\'est la ___ de l\'histoire.', 'fin', ['faim'], 'le moment où cela se termine'],
      ['Ma ___ habite à Lyon.', 'tante', ['tente'], 'la sœur de papa ou de maman'],
      ['Nous dormons sous la ___ au camping.', 'tente', ['tante'], 'abri en toile'],
      ['Grand-père raconte un ___ de fées.', 'conte', ['compte', 'comte'], 'une histoire'],
      ['Je ___ jusqu\'à cent.', 'compte', ['conte', 'comte'], 'verbe compter'],
      ['Ce livre coûte ___ euros.', 'cent', ['sang', 'sans'], 'le nombre 100'],
      ['Je bois mon chocolat ___ sucre.', 'sans', ['sang', 'cent'], 'le contraire de « avec »'],
      ['Il a perdu du ___ en se coupant.', 'sang', ['sans', 'cent'], 'liquide rouge du corps'],
      ['Le ___ de confiture est vide.', 'pot', ['peau'], 'récipient'],
      ['La ___ de la pêche est douce.', 'peau', ['pot'], 'ce qui recouvre le fruit'],
    ],

    // Sens propre / sens figuré : [phrase, 'propre' | 'figuré', explication]
    sensFigure: [
      ['Le lion dévore sa proie.', 'propre', 'Le lion mange vraiment sa proie.'],
      ['Léo dévore son livre.', 'figuré', 'Dévorer un livre, c\'est le lire avec passion.'],
      ['Le feu brûle le bois.', 'propre', 'Le feu brûle vraiment le bois.'],
      ['Je brûle d\'impatience.', 'figuré', 'Brûler d\'impatience, c\'est être très impatient.'],
      ['Le boulanger coupe le pain.', 'propre', 'Le pain est vraiment coupé.'],
      ['Ne me coupe pas la parole !', 'figuré', 'Couper la parole, c\'est interrompre quelqu\'un qui parle.'],
      ['Le chat a une langue rose.', 'propre', 'Il s\'agit vraiment de la langue du chat.'],
      ['Zoé a la langue bien pendue.', 'figuré', 'Avoir la langue bien pendue, c\'est beaucoup parler.'],
      ['La pluie tombe sur le toit.', 'propre', 'La pluie tombe vraiment.'],
      ['Il pleut des cordes.', 'figuré', 'Pleuvoir des cordes, c\'est pleuvoir très fort.'],
      ['Mon père porte un carton lourd.', 'propre', 'Le carton pèse vraiment lourd.'],
      ['J\'ai le cœur lourd depuis le départ de mon ami.', 'figuré', 'Avoir le cœur lourd, c\'est être triste.'],
      ['Le glaçon est froid.', 'propre', 'Le glaçon est vraiment froid.'],
      ['Ce film fait froid dans le dos.', 'figuré', 'Faire froid dans le dos, c\'est faire peur.'],
      ['Ma bague est en or.', 'propre', 'La bague est vraiment faite d\'or.'],
      ['Tu as un cœur d\'or.', 'figuré', 'Avoir un cœur d\'or, c\'est être très gentil.'],
      ['Le vase est tombé et s\'est cassé.', 'propre', 'Le vase est vraiment cassé.'],
      ['Je me casse la tête sur ce problème.', 'figuré', 'Se casser la tête, c\'est réfléchir beaucoup.'],
      ['Le chat perd ses poils.', 'propre', 'Il s\'agit vraiment des poils du chat.'],
      ['Il a un poil dans la main.', 'figuré', 'Avoir un poil dans la main, c\'est être paresseux.'],
      ['L\'avion vole au-dessus des nuages.', 'propre', 'L\'avion est vraiment au-dessus des nuages.'],
      ['Tom a la tête dans les nuages.', 'figuré', 'Avoir la tête dans les nuages, c\'est être distrait.'],
      ['Cette histoire m\'a glacé le sang.', 'figuré', 'Glacer le sang, c\'est faire très peur.'],
      ['L\'eau du lac est glacée.', 'propre', 'L\'eau est vraiment très froide.'],
    ],

    // Suffixes : [radical, suffixe, sens, mot obtenu]
    suffixes: [
      ['chant', 'eur', 'personne qui chante', 'chanteur'], ['nag', 'eur', 'personne qui nage', 'nageur'],
      ['dans', 'eur', 'personne qui danse', 'danseur'], ['jou', 'eur', 'personne qui joue', 'joueur'],
      ['vol', 'eur', 'personne qui vole', 'voleur'], ['coiff', 'eur', 'personne qui coiffe', 'coiffeur'],
      ['fill', 'ette', 'une petite fille', 'fillette'], ['cloch', 'ette', 'une petite cloche', 'clochette'],
      ['jup', 'ette', 'une petite jupe', 'jupette'], ['planch', 'ette', 'une petite planche', 'planchette'],
      ['chaîn', 'ette', 'une petite chaîne', 'chaînette'],
      ['lente', 'ment', 'd\'une manière lente', 'lentement'], ['douce', 'ment', 'd\'une manière douce', 'doucement'],
      ['rapide', 'ment', 'd\'une manière rapide', 'rapidement'], ['joyeuse', 'ment', 'd\'une manière joyeuse', 'joyeusement'],
      ['calme', 'ment', 'd\'une manière calme', 'calmement'], ['facile', 'ment', 'd\'une manière facile', 'facilement'],
      ['lav', 'age', 'action de laver', 'lavage'], ['nettoy', 'age', 'action de nettoyer', 'nettoyage'],
      ['jardin', 'age', 'action de jardiner', 'jardinage'], ['arros', 'age', 'action d\'arroser', 'arrosage'],
      ['gonfl', 'age', 'action de gonfler', 'gonflage'],
      ['pomm', 'ier', 'arbre qui donne des pommes', 'pommier'], ['poir', 'ier', 'arbre qui donne des poires', 'poirier'],
      ['ceris', 'ier', 'arbre qui donne des cerises', 'cerisier'], ['jardin', 'ier', 'personne qui s\'occupe d\'un jardin', 'jardinier'],
      ['lait', 'ier', 'personne qui vend du lait', 'laitier'],
    ],
  },
}
// Le CE2 reprend certaines banques du CE1
DONNEES.ce2.alpha = DONNEES.ce1.alpha
DONNEES.ce2.definitions = DONNEES.ce1.definitions
DONNEES.ce2.prefixes = DONNEES.ce1.prefixes
DONNEES.ce2.familles = [...DONNEES.ce1.familles, ...DONNEES.ce2.familles]
const NIVEAUX_DISPO = Object.keys(DONNEES)

const collator = new Intl.Collator('fr', { sensitivity: 'base' })
function trierAlpha(mots) { return [...mots].sort(collator.compare) }

function b(s) { return `<strong>${s}</strong>` }
function aleaDans(t) { return t[aleatoire(0, t.length - 1)] }


// Questions d'ordre alphabétique générées à l'avance (dédoublonnées)
function genererAlpha(d) {
  const lettres = Object.keys(d.alpha)
  const out = new Map()
  for (let k = 0; k < 400 && out.size < 80; k++) {
    let mots, memeLettre
    if (d.alpha3 && k % 2 === 0) {
      // mêmes 2 premières lettres → il faut regarder la 3e lettre
      const l = aleaDans(Object.keys(d.alpha3))
      mots = melanger(d.alpha3[l]).slice(0, 4)
      memeLettre = 3
    } else if (d.alpha3 || k % 2 === 0) {
      // même 1re lettre → il faut regarder la 2e lettre
      const l = aleaDans(lettres.filter(x => d.alpha[x].length >= 4))
      mots = melanger(d.alpha[l]).slice(0, 4)
      memeLettre = 2
    } else {
      mots = melanger(lettres).slice(0, 5).map(l => aleaDans(d.alpha[l]))
      memeLettre = 1
    }
    const cle = trierAlpha(mots).join(',')
    if (!out.has(cle)) out.set(cle, { mots, memeLettre })
  }
  return [...out.values()]
}

function genererLettres() {
  const out = []
  for (let i = 1; i < ALPHABET.length - 1; i++) {
    out.push({ l: ALPHABET[i], sens: 'avant' })
    out.push({ l: ALPHABET[i], sens: 'apres' })
  }
  return out
}

// Distracteurs : autres mots de même catégorie, hors famille de sens identique
function distracteurs(paires, paire, nb) {
  const [m1, m2, cat, fam] = paire
  const candidats = new Set()
  paires.forEach(p => {
    if (p === paire || p[2] !== cat) return
    if (fam && p[3] === fam) return
    if (p.includes(m1) || p.includes(m2)) return
    candidats.add(p[0]); candidats.add(p[1])
  })
  candidats.delete(m1); candidats.delete(m2)
  return melanger([...candidats]).slice(0, nb)
}

// Mots-repères : une « page » du dictionnaire = deux mots voisins dans la liste triée
function genererDictionnaire(d) {
  const tous = [...Object.values(d.alpha || {}).flat(), ...Object.values(d.alpha3 || {}).flat()]
  const liste = trierAlpha(tous).filter((m, i, t) => i === 0 || collator.compare(m, t[i - 1]) !== 0)
  const out = []
  for (let i = 1; i < liste.length - 1; i++) out.push({ i, liste })
  return out
}

function construireReservoirs(niveau) {
  const d = DONNEES[niveau] || DONNEES.ce1
  const cats = d.categories || []
  const paires = t => (t || []).flatMap(p => [{ p, inv: false }, { p, inv: true }])
  return {
    alpha:       genererAlpha(d),
    lettre:      genererLettres(),
    dictionnaire: genererDictionnaire(d),
    contraires:  paires(d.contraires),
    synonymes:   paires(d.synonymes),
    definitions: (d.definitions || []).map(e => ({ e, tous: d.definitions })),
    contexte:    d.contexte || [],
    homonymes:   d.homonymes || [],
    sensFigure:  d.sensFigure || [],
    familles:    d.familles || [],
    categorie:   cats.map(c => ({ c, cats })),
    intrus:      cats.flatMap(c => [{ c, cats }, { c, cats }]),
    prefixes:    d.prefixes || [],
    suffixes:    d.suffixes || [],
    _d: d,
  }
}

function construireQuestion(type, e, d) {
  const q = { type, consigne: () => t('c_' + type) }
  switch (type) {
    case 'alpha': {
      const attendu = trierAlpha(e.mots)
      return { ...q, mode: 'ordre', etiquettes: e.mots, attendu: attendu.join(' → '),
        explication: () => t('exAlpha' + (e.memeLettre === 3 ? 3 : e.memeLettre === 2 ? 2 : 1)),
        solution: attendu.join(' → ') }
    }
    case 'lettre': {
      const i = ALPHABET.indexOf(e.l)
      const bonne = e.sens === 'avant' ? ALPHABET[i - 1] : ALPHABET[i + 1]
      const autre = e.sens === 'avant' ? ALPHABET[i + 1] : ALPHABET[i - 1]
      const pool = [ALPHABET[i - 2], ALPHABET[i + 2]].filter(Boolean)
      const choix = melanger([bonne, autre, ...pool])
      const p = { l: e.l, a: ALPHABET[i - 1], c: ALPHABET[i + 1], r: b(bonne) }
      const avant = e.sens === 'avant'
      return { ...q, mode: 'choix', html: () => t(avant ? 'lettreAvant' : 'lettreApres', { l: b(e.l) }), choix, bonne,
        explication: () => t('exLettre', p),
        solution: () => t(avant ? 'solAvant' : 'solApres', p) }
    }
    case 'contraires': case 'synonymes': {
      const paires = type === 'contraires' ? d.contraires : d.synonymes
      const [m1, m2] = e.p
      const mot = e.inv ? m2 : m1
      const bonne = e.inv ? m1 : m2
      const choix = melanger([bonne, ...distracteurs(paires, e.p, 3)])
      return { ...q, mode: 'choix', html: mot, lecture: mot, choix, bonne,
        explication: () => t(type === 'contraires' ? 'exContraire' : 'exSynonyme', { r: bonne, m: mot }),
        solution: `${mot} → ${b(bonne)}` }
    }
    case 'definitions': {
      const [mot, def] = e.e
      const autres = melanger(e.tous.filter(x => x[0] !== mot)).slice(0, 3).map(x => x[0])
      return { ...q, mode: 'choix', html: `<em>${def}</em>`, lecture: def,
        choix: melanger([mot, ...autres]), bonne: mot,
        explication: `${mot} : ${def}`,
        solution: `${def} → ${b(mot)}` }
    }
    case 'familles': {
      const [fam, intrus] = e
      return { ...q, mode: 'choix', choix: melanger([...fam, intrus]), bonne: intrus,
        explication: () => t('exFamille', { liste: fam.join(', '), f: fam[0], i: intrus }),
        solution: () => t('solIntrus', { liste: fam.join(', '), i: b(intrus) }) }
    }
    case 'categorie': {
      const mots = melanger(e.c.mots).slice(0, 4)
      const autres = melanger(e.cats.filter(c => c !== e.c)).slice(0, 3).map(c => c.etiquette)
      return { ...q, mode: 'choix', html: mots.join(', '), lecture: mots.join(', '),
        choix: melanger([e.c.etiquette, ...autres]), bonne: e.c.etiquette,
        explication: () => t('exCategorie', { e: e.c.etiquette }),
        solution: `${mots.join(', ')} → ${b(e.c.etiquette)}` }
    }
    case 'intrus': {
      const mots = melanger(e.c.mots).slice(0, 3)
      const autre = aleaDans(e.cats.filter(c => c !== e.c))
      const intrus = aleaDans(autre.mots)
      return { ...q, mode: 'choix', choix: melanger([...mots, intrus]), bonne: intrus,
        explication: () => t('exIntrus', { liste: mots.join(', '), e: e.c.etiquette, i: intrus, un: autre.un }),
        solution: () => t('solIntrusCat', { liste: mots.join(', '), e: e.c.etiquette, i: b(intrus) }) }
    }
    case 'prefixes': {
      const [base, pre, sens] = e
      const mot = pre + base
      const noteIm = () => (pre === 'im' ? t('noteIm') : '')
      return { ...q, mode: 'choix',
        html: `<span class="trou">___</span>${base}<div class="sens">= ${sens}</div>`,
        choix: ['re', 'dé', 'in', 'im'], bonne: pre,
        explication: () => `${pre} + ${base} = ${mot} : ${sens}.${noteIm()}`,
        solution: `${b(mot)} = ${sens}` }
    }
    case 'suffixes': {
      const [base, suf, sens, mot] = e
      return { ...q, mode: 'choix',
        html: `${base}<span class="trou">___</span><div class="sens">= ${sens}</div>`,
        choix: ['-eur', '-ette', '-ment', '-age', '-ier'], bonne: '-' + suf,
        explication: `${base} + ${suf} = ${mot} : ${sens}.`,
        solution: `${b(mot)} = ${sens}` }
    }
    case 'dictionnaire': {
      const { i, liste } = e
      const page = j => `${liste[j - 1]} … ${liste[j + 1]}`
      const autres = melanger(liste.map((_, j) => j).filter(j => j > 0 && j < liste.length - 1 && Math.abs(j - i) >= 3)).slice(0, 2)
      const bonne = page(i)
      return { ...q, mode: 'choix', colonne: true, html: liste[i], lecture: liste[i],
        choix: melanger([bonne, ...autres.map(page)]), bonne,
        explication: () => t('exDico', { a: liste[i - 1], m: b(liste[i]), c: liste[i + 1] }),
        solution: () => t('solDico', { m: liste[i], a: b(liste[i - 1]), c: b(liste[i + 1]) }) }
    }
    case 'contexte': {
      const [phrase, mot, sens, autres] = e
      const html = phrase.replace(new RegExp(`(^|[^\\p{L}])(${mot})(?![\\p{L}])`, 'u'), `$1${b(mot)}`)
      return { ...q, mode: 'choix', colonne: true, html, lecture: phrase,
        choix: melanger([sens, ...autres]), bonne: sens,
        explication: () => t('exContexte', { m: mot, s: sens }),
        solution: `${html} → ${sens}` }
    }
    case 'homonymes': {
      const [phrase, mot, autres, sens] = e
      return { ...q, mode: 'choix', html: phrase.replace('___', '<span class="trou">___</span>'),
        choix: melanger([mot, ...autres]), bonne: mot,
        explication: `« ${mot} » : ${sens}.`,
        solution: phrase.replace('___', b(mot)) }
    }
    case 'sensFigure': {
      const [phrase, sens, expl] = e
      const bonne = sens === 'propre' ? 'sens propre' : 'sens figuré'
      return { ...q, consigne: () => t('c_sensFigurePhrase'), mode: 'choix',
        html: phrase, lecture: phrase, choix: ['sens propre', 'sens figuré'], bonne,
        explication: expl, solution: () => `${phrase} → ${b(libelleChoix(q, bonne))}. ${expl}` }
    }
  }
  return null
}

function genererQuestions(niveau, types, nb) {
  const res = construireReservoirs(niveau)
  const dispo = typesDuNiveau(niveau)
  let ok = types.filter(t => dispo.includes(t) && res[t] && res[t].length)
  if (!ok.length) ok = [dispo[0]]
  const pools = {}
  const ordreTypes = []
  while (ordreTypes.length < nb) ordreTypes.push(...melanger(ok))
  ordreTypes.length = nb
  const vus = new Set()
  return melanger(ordreTypes).map(type => {
    let q = null
    for (let k = 0; k < 20; k++) {
      if (!pools[type] || pools[type].length === 0) pools[type] = melanger(res[type])
      q = construireQuestion(type, pools[type].pop(), res._d)
      // évite deux fois le même mot à trouver (ex. contraire dans les deux sens)
      if (!vus.has(type + q.bonne + (q.attendu || ''))) break
    }
    vus.add(type + q.bonne + (q.attendu || ''))
    return q
  })
}

// ── Fiche imprimable

const LIGNE = '<span class="ligne"></span>'

function questionFiche(q) {
  const liste = c => `<span class="choix">${c.map(x => `<span class="opt">${x}</span>`).join('')}</span>`
  switch (q.type) {
    case 'alpha':
      return `<div>${q.etiquettes.join(' – ')}</div><div class="lignebloc">${LIGNE}</div>`
    case 'lettre':
      return `<div>${v(q.html).replace(/ \?$/, '')} : <span class="ligne courte"></span></div>`
    case 'contraires': case 'synonymes':
      return `<div>${b(q.html)} → ${liste(q.choix)}</div>`
    case 'definitions':
      return `<div>${q.html}</div><div>${liste(q.choix)}</div>`
    case 'familles': case 'intrus':
      return `<div>${liste(q.choix)}</div>`
    case 'categorie':
      return `<div>${q.html} → ${LIGNE}</div>`
    case 'prefixes':
      return `<div>…${q.html.replace('<span class="trou">___</span>', '').replace(/<div class="sens">(.*)<\/div>/, ' <em>($1)</em>')} → ${LIGNE}</div>`
    case 'suffixes':
      return `<div>${q.html.replace('<span class="trou">___</span>', '…').replace(/<div class="sens">(.*)<\/div>/, ' <em>($1)</em>')} → ${LIGNE}</div>`
    case 'dictionnaire':
      return `<div>${b(q.html)} → ${liste(q.choix)}</div>`
    case 'contexte':
      return `<div>${q.html}</div><div>${liste(q.choix)}</div>`
    case 'homonymes':
      return `<div>${q.html.replace('<span class="trou">___</span>', '<span class="ligne courte"></span>')} <em>(${q.choix.join(', ')})</em></div>`
    case 'sensFigure':
      return `<div>${q.html} &nbsp; <span class="case"></span> ${t('lettreP')} &nbsp; <span class="case"></span> ${t('lettreF')}</div>`
  }
  return ''
}

function htmlFiche(niveau, types, nb) {
  const qs = genererQuestions(niveau, types, nb)
  const ordre = [...new Set(qs.map(q => q.type))].sort((a, b) => IDS_TYPES.indexOf(a) - IDS_TYPES.indexOf(b))
  const parType = ordre.map(t => ({ t, qs: qs.filter(q => q.type === t) }))
  let num = 0
  const corps = parType.map(g => `
    <h2>${t('f_' + g.t)}</h2>
    ${g.qs.map(q => { num++; return `<div class="q"><span class="num">${num}.</span><div class="contenu">${questionFiche(q)}</div></div>` }).join('')}
  `).join('')
  num = 0
  const corrige = parType.map(g => g.qs.map(q => { num++; return `<div class="corr"><span class="num">${num}.</span> ${v(q.solution)}</div>` }).join('')).join('')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niveau.toUpperCase()}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: 1rem; margin: 1.4rem 0 .4rem; background: #f0f3f7; padding: .3rem .6rem; border-radius: 6px; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1rem; }
      .q { display: flex; gap: .6rem; margin: .7rem 0; font-size: 1.15rem; line-height: 2; page-break-inside: avoid; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .contenu { flex: 1; }
      .ligne { display: inline-block; min-width: 200px; border-bottom: 1.5px solid #888; height: 1.2em; vertical-align: bottom; }
      .ligne.courte { min-width: 80px; }
      .case { display: inline-block; width: 1em; height: 1em; border: 1.5px solid #555; vertical-align: middle; margin: 0 .2rem; }
      .lignebloc .ligne { display: block; width: 100%; margin-top: .3rem; }
      .choix { display: inline-flex; flex-wrap: wrap; gap: 1.2rem; }
      .opt { padding: 0 .3rem; }
      em { color: #555; }
      .corrige { page-break-before: always; font-size: .95rem; }
      .corr { margin: .3rem 0; }
    </style></head><body>
    <h1>${t('titre')} — ${niveau.toUpperCase()}</h1>
    <p class="entete">${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    ${corps}
    <div class="corrige"><h1>${t('corrige')}</h1>${corrige}</div>
    <script>window.onafterprint = function() { window.close(); }; window.print();<\/script>
  </body></html>`
}

// ════════════════════════════════════════════════════════════════════
// ── LOGIQUE PURE (fin)
// ════════════════════════════════════════════════════════════════════

const DEFAUT = { niveau: 'ce1', types: ['contraires'], nb: 10 }
const brut = charger('vocabulaire_config', DEFAUT) || DEFAUT
const niveauCharge = NIVEAUX_DISPO.includes(brut.niveau) ? brut.niveau : 'ce1'
const typesCharges = (Array.isArray(brut.types) ? brut.types : []).filter(t => typesDuNiveau(niveauCharge).includes(t))
const config = ref({
  niveau: niveauCharge,
  types: typesCharges.length ? typesCharges : ['contraires'],
  nb: [5, 10, 15].includes(brut.nb) ? brut.nb : 10,
})
watch(config, v => sauvegarder('vocabulaire_config', v), { deep: true })

// Types proposés pour le niveau choisi (groupes vides masqués)
const typesVisibles = computed(() => TYPES
  .map(g => ({ ...g, items: g.items.filter(t => t.niv.includes(config.value.niveau)) }))
  .filter(g => g.items.length))

watch(() => config.value.niveau, niv => {
  const dispo = typesDuNiveau(niv)
  const garde = config.value.types.filter(t => dispo.includes(t))
  config.value.types = garde.length ? garde : ['contraires']
})

function toggleType(id) {
  const t = config.value.types
  if (t.includes(id)) {
    if (t.length === 1) return
    config.value.types = t.filter(x => x !== id)
  } else {
    config.value.types = [...t, id]
  }
}

// ── État
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const repondu = ref(false)
const feedback = ref(null) // { ok, bravo } — texte calculé pour suivre la langue
const feedbackHtml = computed(() => {
  const f = feedback.value, q = question.value
  if (!f || !q) return ''
  const ex = v(q.explication)
  const expl = ex ? `<div class="fb-expl">${ex}</div>` : ''
  if (f.ok) return t('bravoListe')[f.bravo] + expl
  return (q.mode === 'ordre' ? t('fbOrdre', { r: q.attendu }) : t('fbChoix', { r: libelleChoix(q, q.bonne) })) + expl
})
const feedbackCls = ref('')
const zoneCls = ref('')
const reponseDonnee = ref('')
const placees = ref([])

const question = computed(() => questions.value[idx.value])

function reinitQuestion() {
  repondu.value = false; feedback.value = null; feedbackCls.value = ''
  zoneCls.value = ''; reponseDonnee.value = ''; placees.value = []
}

function demarrer() {
  questions.value = genererQuestions(config.value.niveau, config.value.types, config.value.nb)
    .map(q => ({ ...q, _resultat: undefined, _donne: '' }))
  idx.value = 0
  bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'
  reinitQuestion()
}

function imprimerFiche() {
  const html = htmlFiche(config.value.niveau, config.value.types, config.value.nb)
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(html)
  w.document.close()
}

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function validerChoix(c) {
  if (repondu.value) return
  reponseDonnee.value = c
  enregistrer(c === question.value.bonne, c)
}

function choixClass(c) {
  if (!repondu.value) return ''
  if (c === question.value.bonne) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function placerEtiquette(k) {
  if (repondu.value || placees.value.includes(k)) return
  placees.value = [...placees.value, k]
}
function retirerEtiquette(pos) {
  if (repondu.value) return
  placees.value = placees.value.filter((_, j) => j !== pos)
}
function validerOrdre() {
  const q = question.value
  if (repondu.value || placees.value.length < q.etiquettes.length) return
  const rep = placees.value.map(k => q.etiquettes[k]).join(' → ')
  enregistrer(rep === q.attendu, rep)
}

function enregistrer(ok, donne) {
  const q = question.value
  q._resultat = ok
  q._donne = donne
  repondu.value = true
  if (ok) {
    bonnes.value++
    feedback.value = { ok: true, bravo: aleatoire(0, t('bravoListe').length - 1) }
    feedbackCls.value = 'ok'
    zoneCls.value = 'ok'
  } else {
    mauvaises.value++
    feedback.value = { ok: false }
    feedbackCls.value = 'erreur'
    zoneCls.value = 'erreur'
  }
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) {
    phase.value = 'resultats'
    return
  }
  reinitQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80)   { confettis(25); return t('res80') }
  if (pct >= 60)   return t('res60')
  return t('res0')
})
</script>

<style scoped>
.container { max-width: 720px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.theme-grid { display: flex; flex-wrap: wrap; gap: .5rem; }
.theme-btn {
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: .45rem .9rem; cursor: pointer; font-size: .92rem; font-weight: 600;
  font-family: inherit; transition: all .15s; display: flex; align-items: center; gap: .4rem;
}
.theme-btn:hover  { border-color: var(--bleu); }
.theme-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.theme-btn.active { border-color: var(--bleu); background: #eef5ff; }
.theme-icon { font-size: 1.2rem; }
.astuce { font-size: .85rem; color: #777; margin: -.5rem 0 1rem; }

.consigne {
  font-weight: 700; color: #555; text-align: center; margin-bottom: 1rem;
  display: flex; align-items: center; justify-content: center; gap: .5rem; flex-wrap: wrap;
}
.btn-tts {
  background: #eef5ff; border: 2px solid var(--bleu); border-radius: 50%;
  width: 2.2rem; height: 2.2rem; cursor: pointer; font-size: 1rem;
}
.btn-tts.actif { background: var(--bleu); }

.phrase-display {
  font-size: 1.5rem; font-weight: 700; text-align: center;
  margin-bottom: 1.5rem; line-height: 1.5; color: #222;
}
.phrase-display :deep(strong) { color: var(--bleu); }
.phrase-display :deep(em) { font-style: normal; font-weight: 600; font-size: 1.15rem; }
.phrase-display :deep(.sens) { font-size: 1rem; color: #666; font-weight: 600; margin-top: .3rem; }
:deep(.trou) { color: #bbb; font-weight: 400; }

.choix-grid { display: flex; flex-wrap: wrap; gap: .75rem; justify-content: center; margin-bottom: 1rem; }
.choix-grid.colonne { flex-direction: column; align-items: stretch; max-width: 520px; margin-left: auto; margin-right: auto; }
.choix-btn {
  min-width: 80px; padding: .6rem 1.4rem;
  border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: 1.1rem; font-weight: 700; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s; color: var(--texte);
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne    { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise { border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

.ordre-zone {
  min-height: 3.2rem; border: 2px dashed var(--gris-brd); border-radius: 10px;
  padding: .5rem; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin-bottom: 1rem;
}
.ordre-zone.ok     { border-color: #22c55e; background: #f0fdf4; }
.ordre-zone.erreur { border-color: var(--rouge); background: #fff5f5; }
.ordre-vide { color: #aaa; font-size: .95rem; }
.ordre-sep { color: #aaa; font-weight: 700; }
.etiquettes-reserve { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
.etiquette {
  font-size: 1.2rem; font-family: inherit; font-weight: 600;
  padding: .35rem .8rem; border-radius: 8px; border: 2px solid #f39c12;
  background: #fff8ec; cursor: pointer; color: var(--texte);
}
.etiquette.placee { border-color: var(--bleu); background: #eef5ff; }
.etiquette.cachee { visibility: hidden; }
.etiquette:disabled { cursor: default; }

.feedback { border-radius: 8px; margin-top: .75rem; font-size: 1.05rem; }
.feedback.ok     { background: #f0fdf4; }
.feedback.erreur { background: #fff5f5; }
.feedback :deep(.fb-expl) { font-weight: 600; font-size: .92rem; color: #555; margin-top: .3rem; }

.corr-consigne { font-size: .82rem; color: #666; }
.corr-donne { font-size: .82rem; color: var(--rouge); margin-top: .2rem; }
</style>
