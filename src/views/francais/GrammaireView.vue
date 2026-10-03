<template>
  <div class="container">
    <h1>🧱 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">

      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in NIVEAUX_DISPO" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div v-for="g in typesVisibles" :key="g.groupe" class="config-section">
        <div class="config-section-title">{{ tr({ fr: g.groupe, br: g.br }) }}</div>
        <div class="theme-grid">
          <button v-for="ty in g.items" :key="ty.id"
            class="theme-btn" :class="{ active: config.types.includes(ty.id) }"
            @click="toggleType(ty.id)">
            <span class="theme-icon">{{ ty.icon }}</span>
            <span class="theme-label">{{ tr({ fr: ty.label, br: ty.br }) }}</span>
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

      <div v-if="mode === 'imprimer'" class="config-section">
        <div class="config-section-title">{{ t('corrigePage2') }}</div>
        <div class="btn-group">
          <button v-for="o in [true, false]" :key="String(o)"
            class="level-btn" :class="{ active: config.corrige === o }"
            @click="config.corrige = o">{{ o ? t('oui') : t('non') }}</button>
        </div>
      </div>
    </ConfigExercice>

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
          {{ val(question.consigne) }}
          <button v-if="question.lecture" class="btn-tts" :class="{ actif: enLecture }"
            :title="t('ecouterPhrase')" @click="lire(question.lecture)">🔊</button>
        </div>

        <!-- Phrase à afficher (choix / saisie) -->
        <div v-if="question.html" class="phrase-display" v-html="question.html"></div>

        <!-- Mode CHOIX -->
        <div v-if="question.mode === 'choix'" class="choix-grid" :class="{ colonne: question.colonne }">
          <button v-for="c in question.choix" :key="c"
            class="choix-btn" :class="choixClass(c)"
            :disabled="repondu" @click="validerChoix(c)">{{ tc(c) }}</button>
        </div>

        <!-- Mode CLIC sur les mots -->
        <template v-else-if="question.mode === 'clic'">
          <div class="mots-ligne">
            <template v-for="(tok, i) in question.tokens" :key="i">
              <span v-if="tok.n === 'ponct'" class="mot-ponct" :class="{ colle: tok.m === '.' || tok.m === ',' }">{{ tok.m }}</span>
              <button v-else class="mot-btn" :class="[motClass(i), { elide: tok.m.endsWith('\'') }]"
                :disabled="repondu" @click="toggleMot(i)">{{ tok.m }}</button>
            </template>
          </div>
          <div v-if="!repondu" style="text-align:center;margin-top:1rem;">
            <button class="btn btn-primary" :disabled="selection.length === 0" @click="validerClic">{{ t('valider') }}</button>
          </div>
        </template>

        <!-- Mode ORDRE (étiquettes) -->
        <template v-else-if="question.mode === 'ordre'">
          <div class="ordre-zone" :class="inputCls">
            <button v-for="(e, k) in placees" :key="'p' + k" class="etiquette placee"
              :disabled="repondu" @click="retirerEtiquette(k)">{{ question.etiquettes[e] }}</button>
            <span class="ordre-point">{{ question.fin }}</span>
            <span v-if="placees.length === 0" class="ordre-vide">{{ t('cliqueEtiquettes') }}</span>
          </div>
          <div class="etiquettes-reserve">
            <button v-for="(e, k) in question.etiquettes" :key="'r' + k" class="etiquette"
              :class="{ cachee: placees.includes(k) }"
              :disabled="repondu || placees.includes(k)" @click="placerEtiquette(k)">{{ e }}</button>
          </div>
          <div v-if="!repondu" style="text-align:center;margin-top:1rem;">
            <button class="btn btn-ghost" style="margin-right:.5rem;" :disabled="placees.length === 0" @click="placees = []">{{ t('effacerOrdre') }}</button>
            <button class="btn btn-primary" :disabled="placees.length < question.etiquettes.length" @click="validerOrdre">{{ t('valider') }}</button>
          </div>
        </template>

        <!-- Mode SAISIE -->
        <div v-else-if="question.mode === 'saisie'" class="saisie-row">
          <input ref="inputEl" class="saisie-input" :class="inputCls"
            v-model="saisie" :disabled="repondu"
            autocomplete="off" spellcheck="false" autocapitalize="off"
            :placeholder="t('ecrisReponse')"
            @keydown.enter="validerSaisie" />
          <button v-if="!repondu" class="btn btn-primary" @click="validerSaisie">{{ t('validerCourt') }}</button>
        </div>

        <div class="feedback" :class="feedbackCls" v-if="repondu" v-html="feedbackHtml"></div>

        <div v-if="repondu" style="text-align:center;">
          <button class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
            {{ idx + 1 < questions.length ? t('suivantFleche') : t('voirResultats') }}
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
        <thead><tr><th>{{ t('colQuestion') }}</th><th>{{ t('correction') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(q, i) in questions" :key="i" :class="q._resultat ? 'ok' : 'erreur'">
            <td>
              <div class="corr-consigne">{{ val(q.consigne) }}</div>
              <div v-if="!q._resultat && q._donne" class="corr-donne">{{ t('taReponse') }} : {{ tc(q._donne) }}</div>
            </td>
            <td v-html="val(q.solution)"></td>
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
import { ref, computed, nextTick, watch } from 'vue'
import { aleatoire, melanger, confettis, normaliser, sauvegarder, charger } from '../../utils'
import { useTTS } from '../../composables/useTTS'
import { useI18n } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { enLecture, lire } = useTTS()

// Interface traduite (fr / br). Le contenu étudié (phrases, mots, réponses) reste en français.
// Breton : à faire relire par un brittophone ; termes grammaticaux incertains marqués « br: à relire ».
const { t, tr, langue } = useI18n({
  fr: {
    titre: 'Grammaire',
    astuce: 'Tu peux choisir plusieurs exercices : ils seront mélangés.',
    ecouterPhrase: 'Écouter la phrase',
    cliqueEtiquettes: 'Clique sur les étiquettes dans l\'ordre…',
    effacerOrdre: '↺ Effacer',
    ecrisReponse: 'Écris ta réponse…',
    validerCourt: 'Valider',
    suivantFleche: 'Suivant →',
    correction: 'Correction',
    colQuestion: 'Question',
    changer: '⚙️ Changer',
    bravo: ['Bravo ! 🎉', 'Parfait ! ⭐', 'Exact ! 👏', 'Bien joué ! 🌟'],
    bonnePhrase: 'La bonne phrase est : « {r} »',
    bonneReponseEst: 'La bonne réponse est « {r} »',
    pasToutAFait: 'Pas tout à fait…',
    res100: 'Parfait, sans faute ! 🏆',
    res80: 'Très bien ! 🌟',
    res60: 'Bien ! Revois les erreurs 💪',
    res0: 'Courage ! Relis la correction et recommence 📚',
    corrigePage2: 'Corrigé en page 2',
  },
  br: {
    titre: 'Yezhadur',
    corrigePage2: 'Reizhadenn war ar bajenn 2', // br: à relire
    astuce: 'Gallout a rez dibab meur a boelladenn : mesket e vint.',
    ecouterPhrase: 'Selaou ar frazenn',
    cliqueEtiquettes: 'Klik war an tikedennoù en urzh…', // br: à relire (étiquette = tikedenn)
    effacerOrdre: '↺ Diverkañ',
    ecrisReponse: 'Skriv da respont…',
    validerCourt: 'Gwiriañ',
    suivantFleche: 'Da-heul →',
    correction: 'Reizhadenn',
    colQuestion: 'Goulenn',
    changer: '⚙️ Cheñch',
    bonnePhrase: 'Ar frazenn vat eo : « {r} »',
    bonneReponseEst: 'Ar respont mat eo « {r} »',
    pasToutAFait: 'N\'eo ket mat penn-da-benn…',
    res100: 'Dispar, hep fazi ebet ! 🏆',
    res80: 'Mat-tre ! 🌟',
    res60: 'Mat ! Adwel ar fazioù 💪',
    res0: 'Kalon vat ! Adlenn ar reizhadenn hag adkrog 📚',
  },
})
const br = () => langue.value === 'br'
// Texte calculé à l'affichage (suit la langue) ou texte fixe
const val = x => (typeof x === 'function' ? x() : x)

// Libellés bretons des choix « métalangage » (les choix en français étudié restent tels quels)
const CHOIX_BR = {
  'Oui, c\'est une phrase': 'Ya, ur frazenn eo',
  'Non, ce n\'est pas une phrase': 'Nann, n\'eo ket ur frazenn',
  'phrase simple': 'frazenn eeun', // br: à relire
  'phrase complexe': 'frazenn gemplezh', // br: à relire
  'affirmative': 'kadarnaus', // br: à relire
  'négative': 'nac\'hus', // br: à relire
  'complément du verbe': 'klokaenn ar verb', // br: à relire (complément = klokaenn)
  'complément de phrase': 'klokaenn ar frazenn', // br: à relire
  'Où ?': 'Pelec\'h ?',
  'Quand ?': 'Pegoulz ?',
  'singulier': 'unander',
  'pluriel': 'liester',
  'masculin': 'gourel',
  'féminin': 'benel',
  'nom': 'anv',
  'verbe': 'verb',
  'déterminant': 'ger-mont', // br: à relire (déterminant)
  'adjectif': 'anv-gwan',
  'pronom': 'raganv',
  '. (point)': '. (poent)',
  '? (point d\'interrogation)': '? (pik goulenn)', // br: à relire
  '! (point d\'exclamation)': '! (pik estlammañ)', // br: à relire
}
const tc = c => (br() && CHOIX_BR[c]) || c

// ════════════════════════════════════════════════════════════════════
// ── LOGIQUE PURE (début) — données + génération, testable hors Vue
// ════════════════════════════════════════════════════════════════════

// Chaque type indique les niveaux où il est proposé
const TYPES = [
  { groupe: 'La phrase', br: 'Ar frazenn', items: [
    { id: 'ordre',       icon: '🧩', label: 'Mots dans l\'ordre',        br: 'Gerioù en urzh', niv: ['ce1'] },
    { id: 'phrase',      icon: '🤔', label: 'Phrase ou pas ?',           br: 'Ur frazenn pe get ?', niv: ['ce1'] },
    { id: 'majuscule',   icon: '🔠', label: 'Majuscule et point',        br: 'Pennlizherenn ha poent', niv: ['ce1'] },
    { id: 'ponctuation', icon: '❓', label: 'Types de phrases . ? !',    br: 'Seurtoù frazennoù . ? !', niv: ['ce1'] },
    { id: 'complexe',    icon: '🔗', label: 'Phrase simple / complexe',  br: 'Frazenn eeun / kemplezh', niv: ['ce2'] },
    { id: 'negation',    icon: '🚫', label: 'Mettre à la forme négative', br: 'Lakaat er stumm nac\'hus', niv: ['ce1', 'ce2'] },
    { id: 'negReconnaitre', icon: '🔍', label: 'Affirmative ou négative ?', br: 'Kadarnaus pe nac\'hus ?', niv: ['ce1', 'ce2'] },
  ]},
  { groupe: 'Nature des mots', br: 'Rummad ar gerioù', items: [ // br: à relire (nature = rummad)
    { id: 'verbe',   icon: '🏃', label: 'Trouver le verbe',         br: 'Kavout ar verb', niv: ['ce1', 'ce2'] },
    { id: 'nom',     icon: '🏠', label: 'Trouver les noms',         br: 'Kavout an anvioù', niv: ['ce1', 'ce2'] },
    { id: 'det',     icon: '👉', label: 'Trouver les déterminants', br: 'Kavout ar gerioù-mont', niv: ['ce1', 'ce2'] },
    { id: 'adj',     icon: '🎨', label: 'Trouver les adjectifs',    br: 'Kavout an anvioù-gwan', niv: ['ce1', 'ce2'] },
    { id: 'nature',  icon: '🏷️', label: 'Nature d\'un mot',         br: 'Rummad ur ger', niv: ['ce1', 'ce2'] },
    { id: 'gnNoyau', icon: '🎯', label: 'Nom principal du GN',      br: 'Anv pennañ ar strollad anv', niv: ['ce2'] },
  ]},
  { groupe: 'Les fonctions', br: 'An arc\'hwelioù', items: [ // br: à relire
    { id: 'sujet',       icon: '👤', label: 'Trouver le sujet',             br: 'Kavout ar sujed', niv: ['ce1', 'ce2'] },
    { id: 'pronom',      icon: '🔁', label: 'Il, elle, ils, elles',         br: 'Il, elle, ils, elles', niv: ['ce1', 'ce2'] },
    { id: 'cplt',        icon: '📍', label: 'Trouver le complément de phrase', br: 'Kavout klokaenn ar frazenn', niv: ['ce2'] },
    { id: 'cpltQ',       icon: '⏰', label: 'Où ? Quand ?',                 br: 'Pelec\'h ? Pegoulz ?', niv: ['ce2'] },
    { id: 'cpltNature',  icon: '⚖️', label: 'Complément du verbe ou de phrase ?', br: 'Klokaenn ar verb pe ar frazenn ?', niv: ['ce2'] },
  ]},
  { groupe: 'Genre et nombre', br: 'Reizh ha niver', items: [
    { id: 'genre',    icon: '♀️', label: 'Masculin / féminin',   br: 'Gourel / benel', niv: ['ce1'] },
    { id: 'nombre',   icon: '🔢', label: 'Singulier / pluriel',  br: 'Unander / liester', niv: ['ce1'] },
    { id: 'pluriel',  icon: '➕', label: 'Mettre au pluriel',    br: 'Lakaat el liester', niv: ['ce1', 'ce2'] },
    { id: 'accordGN', icon: '🤝', label: 'Accorder l\'adjectif', br: 'Kenglotañ an anv-gwan', niv: ['ce1', 'ce2'] },
  ]},
  { groupe: 'Accord sujet-verbe', br: 'Kenglotadur sujed-verb', items: [ // br: à relire (accord = kenglotadur)
    { id: 'accordSV', icon: '🔗', label: 'Il chante / ils chantent', br: 'Il chante / ils chantent', niv: ['ce1', 'ce2'] },
  ]},
]
const IDS_TYPES = TYPES.flatMap(g => g.items.map(t => t.id))
function typesDuNiveau(niveau) {
  return TYPES.flatMap(g => g.items).filter(t => t.niv.includes(niveau)).map(t => t.id)
}

const NATURES = { d: 'det', n: 'nom', N: 'nom', v: 'verbe', a: 'adj', p: 'pronom', x: 'autre' }
const NOM_NATURE = { det: 'déterminant', nom: 'nom', verbe: 'verbe', adj: 'adjectif', pronom: 'pronom' }
const LIB_GN = { ms: 'masculin singulier', fs: 'féminin singulier', mp: 'masculin pluriel', fp: 'féminin pluriel' }
const LIB_GN_BR = { ms: 'gourel unander', fs: 'benel unander', mp: 'gourel liester', fp: 'benel liester' }

// Phrases annotées. Syntaxe : mot:code (d=déterminant, n=nom, N=nom propre, v=verbe conjugué,
// a=adjectif, p=pronom, x=autre mot).
//   [ ... ]gn  = groupe sujet + genre/nombre (ms fs mp fp, - = pronom je/tu/nous/vous)
//   { ... }o / { ... }q = complément de phrase (o = où ?, q = quand ?)
//   < ... >    = complément du verbe
// Les sujets au pluriel sont des noms au genre sans ambiguïté (pas « les enfants », « les élèves »).
const DONNEES = {
  ce1: {
    phrases: [
      '[Le:d petit:a chat:n]ms dort:v sur:x le:d canapé:n .',
      '[Ma:d sœur:n]fs mange:v une:d pomme:n rouge:a .',
      '[Les:d garçons:n]mp jouent:v dans:x la:d cour:n .',
      '[Léo:N]ms lit:v un:d livre:n .',
      '[Le:d chien:n]ms court:v dans:x le:d jardin:n .',
      '[La:d maîtresse:n]fs écrit:v la:d date:n .',
      '[Mon:d papa:n]ms prépare:v une:d bonne:a soupe:n .',
      '[Les:d oiseaux:n]mp chantent:v dans:x l\':d arbre:n .',
      '[Lina:N]fs porte:v une:d robe:n bleue:a .',
      '[Le:d boulanger:n]ms vend:v des:d croissants:n chauds:a .',
      '[Mes:d cousins:n]mp regardent:v un:d film:n .',
      '[La:d petite:a fille:n]fs ramasse:v des:d coquillages:n .',
      '[Le:d gros:a camion:n]ms roule:v vite:x .',
      '[Tom:N et:x Zoé:N]mp construisent:v une:d cabane:n .',
      '[Nina:N]fs tricote:v une:d écharpe:n verte:a .',
      '[Les:d vaches:n]fp broutent:v dans:x le:d champ:n .',
      '[Le:d soleil:n]ms brille:v dans:x le:d ciel:n bleu:a .',
      '[Mon:d frère:n]ms range:v sa:d chambre:n .',
      '[Les:d filles:n]fp sautent:v à:x la:d corde:n .',
      '[Une:d souris:n grise:a]fs grignote:v le:d fromage:n .',
      '[Hugo:N]ms lave:v sa:d voiture:n .',
      '[Le:d bébé:n]ms pleure:v .',
      '[Les:d poules:n]fp pondent:v des:d œufs:n .',
      '[Elle:p]fs dessine:v une:d jolie:a maison:n .',
      '[Il:p]ms ferme:v la:d porte:n .',
      '[Nous:p]- allons:v à:x la:d piscine:n .',
      '[Tu:p]- as:v un:d beau:a vélo:n .',
      '[Les:d écoliers:n]mp écoutent:v la:d maîtresse:n .',
      '[Le:d lapin:n blanc:a]ms mange:v une:d carotte:n .',
      '[Emma:N]fs achète:v des:d pommes:n vertes:a .',
      '[La:d grande:a girafe:n]fs mange:v des:d feuilles:n .',
      '[Les:d petits:a poissons:n]mp nagent:v dans:x l\':d eau:n .',
      '[Le:d facteur:n]ms apporte:v une:d lettre:n .',
      '[Ma:d copine:n]fs a:v un:d chat:n noir:a .',
      '[Les:d pompiers:n]mp éteignent:v le:d feu:n .',
      '[Le:d vent:n]ms souffle:v fort:x .',
      '[Ces:d fleurs:n]fp sentent:v bon:x .',
      '[Mon:d petit:a frère:n]ms joue:v avec:x ses:d voitures:n .',
      '[La:d neige:n]fs tombe:v sur:x la:d ville:n .',
      '[Les:d chats:n]mp boivent:v leur:d lait:n .',
      '[Sami:N]ms mange:v une:d glace:n à:x la:d fraise:n .',
      '[Le:d cheval:n]ms galope:v dans:x la:d prairie:n .',
      '[Mes:d parents:n]mp regardent:v la:d télévision:n .',
      '[Elles:p]fp chantent:v une:d chanson:n .',
      '[Ils:p]mp jouent:v avec:x un:d ballon:n rouge:a .',
      '[La:d cloche:n]fs sonne:v .',
      '[Le:d maître:n]ms ouvre:v la:d fenêtre:n .',
      '[Une:d grosse:a araignée:n]fs tisse:v sa:d toile:n .',
      '[Je:p]- range:v mes:d crayons:n .',
      '[Le:d ciel:n]ms est:v gris:a .',
      '[La:d soupe:n]fs est:v chaude:a .',
      '[Mes:d chaussures:n]fp sont:v neuves:a .',
      '[Le:d loup:n]ms mange:v le:d petit:a cochon:n .',
      '[Ma:d tante:n]fs plante:v des:d tulipes:n .',
      '[Les:d garçons:n]mp lancent:v le:d ballon:n .',
      'Dans:x le:d jardin:n , [les:d chiots:n]mp jouent:v .',
      'Ce:d matin:n , [Léa:N]fs part:v à:x l\':d école:n .',
      'Le:d soir:n , [mon:d chat:n]ms dort:v sur:x mon:d lit:n .',
    ],

    // Phrase ou pas phrase ? r = raison quand ce n'est pas une phrase
    phraseOuPas: [
      { t: 'Le chat boit son lait.', ok: true },
      { t: 'Les enfants vont à l\'école.', ok: true },
      { t: 'Ma grand-mère fait un gâteau.', ok: true },
      { t: 'Le ballon est rouge.', ok: true },
      { t: 'Il pleut.', ok: true },
      { t: 'Je mange une banane.', ok: true },
      { t: 'Le chien aboie très fort.', ok: true },
      { t: 'Nous jouons dans le jardin.', ok: true },
      { t: 'La lune brille la nuit.', ok: true },
      { t: 'Mon frère lit une histoire.', ok: true },
      { t: 'Les poissons nagent dans l\'eau.', ok: true },
      { t: 'Tu dessines un bonhomme.', ok: true },
      { t: 'Le bus s\'arrête devant l\'école.', ok: true },
      { t: 'Zoé met son manteau.', ok: true },
      { t: 'Les fleurs poussent au printemps.', ok: true },
      { t: 'Le chat sur la table.', ok: false, r: 'verbe' },
      { t: 'Mange pomme une Léo.', ok: false, r: 'ordre' },
      { t: 'La petite fille avec son vélo.', ok: false, r: 'verbe' },
      { t: 'Jardin le dans jouent enfants les.', ok: false, r: 'ordre' },
      { t: 'Mon chien très gentil.', ok: false, r: 'verbe' },
      { t: 'Le soleil dans le ciel bleu.', ok: false, r: 'verbe' },
      { t: 'Une glace à la fraise.', ok: false, r: 'verbe' },
      { t: 'Livre un lit maîtresse la.', ok: false, r: 'ordre' },
      { t: 'Les oiseaux dans l\'arbre.', ok: false, r: 'verbe' },
      { t: 'Le gros chat noir de ma voisine.', ok: false, r: 'verbe' },
      { t: 'Demain au parc avec Tom.', ok: false, r: 'verbe' },
      { t: 'École l\'à vont nous.', ok: false, r: 'ordre' },
      { t: 'Dans la cour de récréation.', ok: false, r: 'verbe' },
      { t: 'Mon cartable rouge et bleu.', ok: false, r: 'verbe' },
      { t: 'Chante oiseau l\'.', ok: false, r: 'ordre' },
    ],

    // Types de phrases : texte sans le signe final. Toutes ont un verbe conjugué
    // (cohérent avec « Phrase ou pas ? »), et les déclaratives sont neutres.
    typesPhrases: [
      { t: 'Le chat dort sur le tapis', s: '.' },
      { t: 'Ma trousse est dans mon cartable', s: '.' },
      { t: 'Le boulanger ouvre à sept heures', s: '.' },
      { t: 'Ma maison a un grand jardin', s: '.' },
      { t: 'Le train arrive à huit heures', s: '.' },
      { t: 'Ma gomme est dans ma trousse', s: '.' },
      { t: 'Les feuilles tombent en automne', s: '.' },
      { t: 'Léo aime les bonbons', s: '.' },
      { t: 'La boulangerie est fermée le lundi', s: '.' },
      { t: 'Mon frère a sept ans', s: '.' },
      { t: 'Les enfants dessinent', s: '.' },
      { t: 'Papa lit le journal', s: '.' },
      { t: 'Où est mon cartable', s: '?' },
      { t: 'Comment t\'appelles-tu', s: '?' },
      { t: 'Veux-tu jouer avec moi', s: '?' },
      { t: 'Quelle heure est-il', s: '?' },
      { t: 'Est-ce que tu as faim', s: '?' },
      { t: 'Pourquoi le ciel est-il bleu', s: '?' },
      { t: 'Qui a mangé le gâteau', s: '?' },
      { t: 'Quand partons-nous', s: '?' },
      { t: 'As-tu fini tes devoirs', s: '?' },
      { t: 'Combien de bonbons as-tu', s: '?' },
      { t: 'Est-ce que le chat dort', s: '?' },
      { t: 'Peux-tu m\'aider', s: '?' },
      { t: 'Comme le ciel est beau', s: '!' },
      { t: 'Comme il fait chaud', s: '!' },
      { t: 'Que tu es grand', s: '!' },
      { t: 'Bravo, tu as gagné', s: '!' },
      { t: 'Oh, regarde le joli papillon', s: '!' },
      { t: 'Que ce gâteau est bon', s: '!' },
      { t: 'Attention, une voiture arrive', s: '!' },
      { t: 'Comme cette fleur sent bon', s: '!' },
      { t: 'Comme tu as grandi', s: '!' },
      { t: 'Aïe, je me suis cogné', s: '!' },
      { t: 'Hourra, nous sommes en vacances', s: '!' },
      { t: 'Comme ce chat est mignon', s: '!' },
    ],

    // Forme négative avec ne… pas : [avant le verbe, verbe, après le verbe]
    // (compléments avec le/la/les uniquement : pas de « un/des → de » au CE1)
    negations: [
      ['Le chat', 'dort', 'sur le lit'], ['Léo', 'aime', 'les épinards'], ['Nous', 'allons', 'à la piscine'],
      ['Il', 'pleut', 'aujourd\'hui'], ['Ma sœur', 'regarde', 'la télévision'], ['Les garçons', 'écoutent', 'la maîtresse'],
      ['Tu', 'as', 'faim'], ['Le bébé', 'pleure', ''], ['Elle', 'est', 'contente'],
      ['Papa', 'travaille', 'le samedi'], ['Le magasin', 'ouvre', 'le dimanche'], ['Les oiseaux', 'chantent', 'le soir'],
      ['Lina', 'habite', 'à Paris'], ['Il', 'fait', 'froid'], ['Mon frère', 'aime', 'les carottes'],
      ['Je', 'vois', 'la mer'], ['Le train', 'arrive', 'à l\'heure'], ['Nous', 'jouons', 'dehors'],
      ['Le chien', 'obéit', 'à son maître'], ['Vous', 'êtes', 'en retard'], ['La porte', 'est', 'fermée'],
      ['Zoé', 'range', 'sa chambre'], ['Le soleil', 'brille', ''], ['Ils', 'ont', 'peur du loup'],
      ['Le lait', 'est', 'chaud'], ['Sami', 'écoute', 'la radio'], ['Tu', 'connais', 'la réponse'],
      ['Je', 'trouve', 'mon crayon'], ['Le bus', 'passe', 'par ici'], ['Mes cousines', 'aiment', 'le sport'],
    ],

    // Genre des noms : m = masculin (un), f = féminin (une)
    genre: [
      ['chat','m'], ['vélo','m'], ['arbre','m'], ['livre','m'], ['cartable','m'], ['crayon','m'],
      ['soleil','m'], ['gâteau','m'], ['ballon','m'], ['jardin','m'], ['avion','m'], ['nuage','m'],
      ['bateau','m'], ['oiseau','m'], ['pied','m'], ['cahier','m'], ['stylo','m'], ['escargot','m'],
      ['ours','m'], ['éléphant','m'], ['parapluie','m'], ['dentifrice','m'],
      ['table','f'], ['maison','f'], ['fleur','f'], ['voiture','f'], ['lune','f'], ['pomme','f'],
      ['école','f'], ['fenêtre','f'], ['souris','f'], ['tortue','f'], ['chaise','f'], ['gomme','f'],
      ['porte','f'], ['étoile','f'], ['robe','f'], ['montagne','f'], ['horloge','f'], ['araignée','f'],
      ['fourmi','f'], ['main','f'],
    ],

    // Groupes nominaux : [singulier, pluriel, règle particulière éventuelle]
    // CE1 : pluriels en -s, et en -x pour les noms en -eau / -eu seulement.
    pluriels: [
      ['le chat noir', 'les chats noirs'],
      ['un jeu', 'des jeux', 'eu'],
      ['un gâteau', 'des gâteaux', 'eau'],
      ['le bateau bleu', 'les bateaux bleus', 'eau'],
      ['une fleur rouge', 'des fleurs rouges'],
      ['la petite fille', 'les petites filles'],
      ['un oiseau', 'des oiseaux', 'eau'],
      ['une souris grise', 'des souris grises', 's'],
      ['le gros chien', 'les gros chiens', 's'],
      ['le grand arbre', 'les grands arbres'],
      ['la belle maison', 'les belles maisons'],
      ['un feu', 'des feux', 'eu'],
      ['un cheveu', 'des cheveux', 'eu'],
      ['un neveu', 'des neveux', 'eu'],
      ['un trou', 'des trous'],
      ['le lapin blanc', 'les lapins blancs'],
      ['la voiture verte', 'les voitures vertes'],
      ['un crayon', 'des crayons'],
      ['une étoile', 'des étoiles'],
      ['mon ami', 'mes amis'],
      ['ma copine', 'mes copines'],
      ['ton livre', 'tes livres'],
      ['le petit poisson', 'les petits poissons'],
      ['le beau cadeau', 'les beaux cadeaux', 'eau'],
      ['un tableau', 'des tableaux', 'eau'],
      ['un manteau', 'des manteaux', 'eau'],
      ['un château', 'des châteaux', 'eau'],
      ['le chapeau noir', 'les chapeaux noirs', 'eau'],
      ['un rideau', 'des rideaux', 'eau'],
      ['la grosse pomme', 'les grosses pommes'],
      ['ce garçon', 'ces garçons'],
      ['cette fille', 'ces filles'],
      ['un vélo', 'des vélos'],
      ['la maison', 'les maisons'],
      ['le grand chien', 'les grands chiens'],
      ['une pomme verte', 'des pommes vertes'],
    ],

    // Accord dans le GN : [groupe avec ___, nom, adjectif, genre/nombre]
    accordsGN: [
      ['des fleurs ___', 'fleurs', 'rouge', 'fp'],
      ['une ___ fille', 'fille', 'petit', 'fs'],
      ['les ___ garçons', 'garçons', 'grand', 'mp'],
      ['une robe ___', 'robe', 'vert', 'fs'],
      ['des chats ___', 'chats', 'noir', 'mp'],
      ['la neige ___', 'neige', 'blanc', 'fs'],
      ['des souris ___', 'souris', 'gris', 'fp'],
      ['un ___ ballon', 'ballon', 'gros', 'ms'],
      ['les ___ maisons', 'maisons', 'joli', 'fp'],
      ['des yeux ___', 'yeux', 'bleu', 'mp'],
      ['une tarte ___', 'tarte', 'chaud', 'fs'],
      ['des enfants ___', 'enfants', 'content', 'mp'],
      ['une table ___', 'table', 'rond', 'fs'],
      ['les ___ voitures', 'voitures', 'petit', 'fp'],
      ['des cheveux ___', 'cheveux', 'long', 'mp'],
      ['une ___ histoire', 'histoire', 'long', 'fs'],
      ['les poules ___', 'poules', 'blanc', 'fp'],
      ['un ciel ___', 'ciel', 'gris', 'ms'],
      ['des pantalons ___', 'pantalons', 'vert', 'mp'],
      ['la ___ tour', 'tour', 'grand', 'fs'],
      ['des tomates ___', 'tomates', 'rouge', 'fp'],
      ['deux chiens ___', 'chiens', 'noir', 'mp'],
      ['mes chaussures ___', 'chaussures', 'neuf', 'fp'],
      ['un loup ___', 'loup', 'méchant', 'ms'],
      ['des sorcières ___', 'sorcières', 'méchant', 'fp'],
      ['ma ___ sœur', 'sœur', 'petit', 'fs'],
      ['les ___ montagnes', 'montagnes', 'haut', 'fp'],
      ['des bonbons ___', 'bonbons', 'rose', 'mp'],
      ['les ___ châteaux', 'châteaux', 'beau', 'mp'],
      ['une ___ princesse', 'princesse', 'beau', 'fs'],
      ['des balles ___', 'balles', 'jaune', 'fp'],
      ['un chapeau ___', 'chapeau', 'noir', 'ms'],
      ['des lunettes ___', 'lunettes', 'rond', 'fp'],
      ['les chiens ___', 'chiens', 'gentil', 'mp'],
      ['une maîtresse ___', 'maîtresse', 'gentil', 'fs'],
      ['des pommes ___', 'pommes', 'vert', 'fp'],
    ],

    // Accord sujet-verbe au présent : [phrase, sujet, infinitif, forme sing., forme plur., 's'|'p']
    accordsSV: [
      ['Les enfants ___ dans la cour.', 'Les enfants', 'jouer', 'joue', 'jouent', 'p'],
      ['Le chat ___ sur le lit.', 'Le chat', 'dormir', 'dort', 'dorment', 's'],
      ['Mes parents ___ au cinéma.', 'Mes parents', 'aller', 'va', 'vont', 'p'],
      ['Ma sœur ___ une jolie robe.', 'Ma sœur', 'avoir', 'a', 'ont', 's'],
      ['Les oiseaux ___ dans les arbres.', 'Les oiseaux', 'chanter', 'chante', 'chantent', 'p'],
      ['Léo ___ ses devoirs.', 'Léo', 'faire', 'fait', 'font', 's'],
      ['Les filles ___ très contentes.', 'Les filles', 'être', 'est', 'sont', 'p'],
      ['Les élèves ___ la maîtresse.', 'Les élèves', 'écouter', 'écoute', 'écoutent', 'p'],
      ['Papa ___ le repas.', 'Papa', 'préparer', 'prépare', 'préparent', 's'],
      ['Les chiens ___ très fort.', 'Les chiens', 'aboyer', 'aboie', 'aboient', 'p'],
      ['Le bébé ___ dans son lit.', 'Le bébé', 'pleurer', 'pleure', 'pleurent', 's'],
      ['Tom et Lina ___ une cabane.', 'Tom et Lina', 'construire', 'construit', 'construisent', 'p'],
      ['La pluie ___ sur le toit.', 'La pluie', 'tomber', 'tombe', 'tombent', 's'],
      ['Les vaches ___ de l\'herbe.', 'Les vaches', 'manger', 'mange', 'mangent', 'p'],
      ['Mamie ___ un gâteau.', 'Mamie', 'faire', 'fait', 'font', 's'],
      ['Les garçons ___ au football.', 'Les garçons', 'jouer', 'joue', 'jouent', 'p'],
      ['Le train ___ en gare.', 'Le train', 'arriver', 'arrive', 'arrivent', 's'],
      ['Mes amis ___ à la piscine.', 'Mes amis', 'aller', 'va', 'vont', 'p'],
      ['Le maître ___ une histoire.', 'Le maître', 'lire', 'lit', 'lisent', 's'],
      ['Les poissons ___ dans l\'eau.', 'Les poissons', 'nager', 'nage', 'nagent', 'p'],
      ['Mon chat ___ noir et blanc.', 'Mon chat', 'être', 'est', 'sont', 's'],
      ['Les roses ___ bon.', 'Les roses', 'sentir', 'sent', 'sentent', 'p'],
      ['Elle ___ une glace.', 'Elle', 'manger', 'mange', 'mangent', 's'],
      ['Ils ___ à l\'école.', 'Ils', 'aller', 'va', 'vont', 'p'],
      ['Elles ___ une chanson.', 'Elles', 'chanter', 'chante', 'chantent', 'p'],
      ['Il ___ peur du noir.', 'Il', 'avoir', 'a', 'ont', 's'],
      ['Les enfants ___ faim.', 'Les enfants', 'avoir', 'a', 'ont', 'p'],
      ['Le chien ___ après le ballon.', 'Le chien', 'courir', 'court', 'courent', 's'],
      ['Mes cousins ___ en vacances.', 'Mes cousins', 'partir', 'part', 'partent', 'p'],
      ['La maîtresse ___ au tableau.', 'La maîtresse', 'écrire', 'écrit', 'écrivent', 's'],
      ['Les lapins ___ des carottes.', 'Les lapins', 'manger', 'mange', 'mangent', 'p'],
      ['Zoé ___ sa chambre.', 'Zoé', 'ranger', 'range', 'rangent', 's'],
      ['Les étoiles ___ dans le ciel.', 'Les étoiles', 'briller', 'brille', 'brillent', 'p'],
      ['Le soleil ___ chaud.', 'Le soleil', 'être', 'est', 'sont', 's'],
      ['Les pompiers ___ vite.', 'Les pompiers', 'arriver', 'arrive', 'arrivent', 'p'],
      ['Papa et maman ___ au travail.', 'Papa et maman', 'partir', 'part', 'partent', 'p'],
      ['Mon frère ___ du vélo.', 'Mon frère', 'faire', 'fait', 'font', 's'],
      ['Les bébés ___ beaucoup.', 'Les bébés', 'dormir', 'dort', 'dorment', 'p'],
    ],
  },

  ce2: {
    // Phrases simples (1 verbe conjugué, sujet et compléments annotés)
    // et phrases complexes (plusieurs verbes conjugués, sans annotation de fonction).
    phrases: [
      '{Ce:d matin:n}q , [le:d facteur:n]ms apporte:v <un:d colis:n> .',
      '[Les:d écoliers:n]mp jouent:v {dans:x la:d cour:n}o .',
      '{Dans:x la:d forêt:n}o vivent:v [des:d loups:n]mp .',
      '[Mon:d grand:a frère:n]ms répare:v <son:d vélo:n> {dans:x le:d garage:n}o .',
      '{Demain:x}q , [nous:p]- visiterons:v <le:d musée:n> .',
      '[La:d maîtresse:n]fs corrige:v <nos:d cahiers:n> {le:d soir:n}q .',
      '{Sur:x la:d branche:n}o chante:v [un:d merle:n]ms .',
      '[Les:d hirondelles:n]fp partent:v {en:x automne:n}q .',
      '[Le:d vieux:a pêcheur:n]ms attrape:v <un:d énorme:a poisson:n> .',
      '{Chaque:d samedi:n}q , [Lucas:N]ms prépare:v <des:d crêpes:n> .',
      '[Elle:p]fs range:v <ses:d jouets:n> {avant:x le:d dîner:n}q .',
      '[Les:d marins:n]mp hissent:v <les:d voiles:n> .',
      '{À:x midi:n}q , [les:d garçons:n]mp mangent:v <une:d pizza:n> .',
      '[Le:d chat:n]ms guette:v <la:d souris:n> {derrière:x le:d buffet:n}o .',
      '[Ma:d tante:n]fs écrit:v <une:d longue:a lettre:n> .',
      '{En:x été:n}q , [les:d abeilles:n]fp butinent:v <les:d fleurs:n> .',
      '[Le:d boulanger:n]ms pétrit:v <la:d pâte:n> {la:d nuit:n}q .',
      '{Dans:x le:d ciel:n}o brillent:v [les:d étoiles:n]fp .',
      '[Nous:p]- regardons:v <un:d film:n> {ce:d soir:n}q .',
      '[Les:d pompiers:n]mp éteignent:v <l\':d incendie:n> .',
      '[Inès:N]fs dessine:v <un:d château:n> {sur:x son:d cahier:n}o .',
      '[Mes:d cousines:n]fp arriveront:v {demain:x}q .',
      '[Le:d petit:a lapin:n gris:a]ms grignote:v <une:d carotte:n> .',
      '{Autrefois:x}q , [les:d chevaux:n]mp tiraient:v <les:d charrues:n> .',
      '[Ils:p]mp construisent:v <une:d cabane:n> {près:x de:x la:d rivière:n}o .',
      '[Le:d dragon:n]ms crache:v <des:d flammes:n> .',
      '{Le:d dimanche:n}q , [ma:d grand-mère:n]fs tricote:v <un:d pull:n> .',
      '[Le:d vent:n]ms emporte:v <les:d feuilles:n mortes:a> .',
      '[Le:d fermier:n]ms soigne:v <ses:d vaches:n> {chaque:d matin:n}q .',
      '{Sous:x le:d pont:n}o coule:v [une:d rivière:n]fs .',
      '[Les:d fourmis:n]fp transportent:v <des:d graines:n> .',
      '{Pendant:x la:d récréation:n}q , [Noah:N]ms lit:v <un:d album:n> .',
      'Le:d chat:n dort:v et:x le:d chien:n joue:v .',
      'Quand:x il:p pleut:v , nous:p restons:v à:x la:d maison:n .',
      'Je:p pense:v que:x tu:p as:v raison:n .',
      'Le:d soleil:n brille:v mais:x le:d vent:n souffle:v .',
      'Lina:N chante:v pendant:x que:x son:d frère:n danse:v .',
      'Les:d enfants:n rient:v car:x le:d clown:n tombe:v .',
      'Mon:d père:n lit:v le:d journal:n et:x ma:d mère:n boit:v son:d café:n .',
      'Quand:x la:d cloche:n sonne:v , les:d élèves:n sortent:v .',
      'Je:p range:v ma:d chambre:n puis:x je:p joue:v .',
      'Si:x tu:p veux:v , nous:p irons:v à:x la:d plage:n .',
      'La:d neige:n tombe:v et:x les:d enfants:n font:v un:d bonhomme:n .',
      'Le:d bébé:n pleure:v parce:x qu\':x il:p a:v faim:n .',
      'Nous:p partirons:v quand:x tu:p seras:v prêt:a .',
      'Le:d maître:n explique:v et:x les:d élèves:n écoutent:v .',
    ],

    // Noms principaux (noyaux) de groupes nominaux
    groupesNominaux: [
      'les:d petites:a billes:n rouges:a', 'un:d gros:a chien:n noir:a', 'la:d jolie:a robe:n bleue:a',
      'mon:d vieux:a vélo:n rouillé:a', 'ces:d belles:a fleurs:n parfumées:a', 'une:d grande:a maison:n blanche:a',
      'le:d petit:a chat:n gris:a', 'les:d longs:a cheveux:n bruns:a', 'sa:d nouvelle:a trousse:n',
      'notre:d chien:n fidèle:a', 'un:d énorme:a gâteau:n', 'les:d gentils:a voisins:n',
      'cette:d vieille:a horloge:n', 'des:d chaussures:n neuves:a', 'un:d joli:a petit:a oiseau:n',
      'leurs:d chevaux:n sauvages:a', 'deux:d chats:n noirs:a', 'la:d mer:n calme:a',
      'un:d long:a serpent:n vert:a', 'mes:d meilleurs:a amis:n', 'une:d histoire:n drôle:a',
      'ce:d grand:a arbre:n', 'tes:d bottes:n jaunes:a', 'la:d petite:a souris:n grise:a',
      'un:d méchant:a loup:n affamé:a',
    ],

    // Forme négative : [phrase affirmative, avant le verbe, verbe, après le verbe (forme négative), mot de négation]
    negations: [
      ['Le train arrive.', 'Le train', 'arrive', '', 'pas'],
      ['Léo aime les épinards.', 'Léo', 'aime', 'les épinards', 'pas'],
      ['Ma sœur regarde la télévision.', 'Ma sœur', 'regarde', 'la télévision', 'pas'],
      ['Léo joue encore au ballon.', 'Léo', 'joue', 'au ballon', 'plus'],
      ['Ma sœur mange toujours ses légumes.', 'Ma sœur', 'mange', 'ses légumes', 'jamais'],
      ['Je vois quelque chose.', 'Je', 'vois', '', 'rien'],
      ['Il pleut encore.', 'Il', 'pleut', '', 'plus'],
      ['Tom arrive toujours en retard.', 'Tom', 'arrive', 'en retard', 'jamais'],
      ['Elle entend quelque chose.', 'Elle', 'entend', '', 'rien'],
      ['Nous habitons encore à Lyon.', 'Nous', 'habitons', 'à Lyon', 'plus'],
      ['Le chat a encore faim.', 'Le chat', 'a', 'faim', 'plus'],
      ['Tu oublies toujours ton écharpe.', 'Tu', 'oublies', 'ton écharpe', 'jamais'],
      ['Mon père dit quelque chose.', 'Mon père', 'dit', '', 'rien'],
      ['Les enfants crient toujours.', 'Les enfants', 'crient', '', 'jamais'],
      ['Je comprends tout.', 'Je', 'comprends', '', 'rien'],
      ['Le magasin est encore ouvert.', 'Le magasin', 'est', 'ouvert', 'plus'],
      ['Mon frère ment toujours.', 'Mon frère', 'ment', '', 'jamais'],
      ['Lina achète quelque chose.', 'Lina', 'achète', '', 'rien'],
      ['Il fait encore nuit.', 'Il', 'fait', 'nuit', 'plus'],
      ['Nous allons toujours à la plage.', 'Nous', 'allons', 'à la plage', 'jamais'],
      ['Elle aime encore les poupées.', 'Elle', 'aime', 'les poupées', 'plus'],
      ['Le bébé mange tout.', 'Le bébé', 'mange', '', 'rien'],
      ['Vous êtes toujours sages.', 'Vous', 'êtes', 'sages', 'jamais'],
      ['Le chien obéit encore.', 'Le chien', 'obéit', '', 'plus'],
      ['Je regarde toujours ce dessin animé.', 'Je', 'regarde', 'ce dessin animé', 'jamais'],
      ['Tu sais tout.', 'Tu', 'sais', '', 'rien'],
      ['Zoé porte encore ses lunettes.', 'Zoé', 'porte', 'ses lunettes', 'plus'],
      ['Le facteur passe toujours à midi.', 'Le facteur', 'passe', 'à midi', 'jamais'],
    ],

    // CE2 : pluriels en -al/-aux et en -ou/-oux (+ révisions)
    pluriels: [
      ['un cheval', 'des chevaux', 'al'],
      ['le journal', 'les journaux', 'al'],
      ['un animal sauvage', 'des animaux sauvages', 'al'],
      ['le cheval blanc', 'les chevaux blancs', 'al'],
      ['un hôpital', 'des hôpitaux', 'al'],
      ['un bocal', 'des bocaux', 'al'],
      ['le canal', 'les canaux', 'al'],
      ['un signal', 'des signaux', 'al'],
      ['un genou', 'des genoux', 'ou'],
      ['un caillou', 'des cailloux', 'ou'],
      ['un hibou', 'des hiboux', 'ou'],
      ['un bijou', 'des bijoux', 'ou'],
      ['un chou', 'des choux', 'ou'],
      ['un pou', 'des poux', 'ou'],
      ['un joujou', 'des joujoux', 'ou'],
      ['le gros caillou', 'les gros cailloux', 'ou'],
      ['un clou', 'des clous', 'ou2'],
      ['un trou', 'des trous', 'ou2'],
      ['un kangourou', 'des kangourous', 'ou2'],
      ['le cou', 'les cous', 'ou2'],
      ['une noix', 'des noix', 'x'],
      ['le nez rouge', 'les nez rouges', 'z'],
      ['une souris grise', 'des souris grises', 's'],
      ['le vieux château', 'les vieux châteaux', 'eau'],
      ['le nouveau jeu', 'les nouveaux jeux', 'eu'],
      ['un cheveu blond', 'des cheveux blonds', 'eu'],
      ['un oiseau bleu', 'des oiseaux bleus', 'eau'],
    ],

    accordsGN: [
      ['des animaux ___', 'animaux', 'sauvage', 'mp'],
      ['des chevaux ___', 'chevaux', 'blanc', 'mp'],
      ['des hiboux ___', 'hiboux', 'gris', 'mp'],
      ['une ___ voiture', 'voiture', 'nouveau', 'fs'],
      ['les ___ maisons', 'maisons', 'vieux', 'fp'],
      ['des chattes ___', 'chattes', 'doux', 'fp'],
      ['une fille ___', 'fille', 'heureux', 'fs'],
      ['des journaux ___', 'journaux', 'amusant', 'mp'],
      ['des genoux ___', 'genoux', 'écorché', 'mp'],
      ['une chanson ___', 'chanson', 'joyeux', 'fs'],
      ['les ___ histoires', 'histoires', 'long', 'fp'],
      ['des bijoux ___', 'bijoux', 'précieux', 'mp'],
      ['une soupe ___', 'soupe', 'épais', 'fs'],
      ['les ___ amis', 'amis', 'vieux', 'mp'],
      ['des cailloux ___', 'cailloux', 'pointu', 'mp'],
      ['une ___ idée', 'idée', 'bon', 'fs'],
      ['des réponses ___', 'réponses', 'faux', 'fp'],
      ['les ___ bateaux', 'bateaux', 'beau', 'mp'],
      ['une robe ___', 'robe', 'long', 'fs'],
      ['des chemises ___', 'chemises', 'blanc', 'fp'],
      ['un loup ___', 'loup', 'affamé', 'ms'],
      ['des tigres ___', 'tigres', 'dangereux', 'mp'],
      ['une mer ___', 'mer', 'calme', 'fs'],
      ['des pommes ___', 'pommes', 'sucré', 'fp'],
      ['des princesses ___', 'princesses', 'gracieux', 'fp'],
      ['un ___ livre', 'livre', 'nouveau', 'ms'],
      ['des eaux ___', 'eaux', 'profond', 'fp'],
      ['une ___ montagne', 'montagne', 'haut', 'fs'],
      ['des fleurs ___', 'fleurs', 'parfumé', 'fp'],
      ['les hôpitaux ___', 'hôpitaux', 'moderne', 'mp'],
      ['des chiens ___', 'chiens', 'peureux', 'mp'],
    ],

    // Sujet éloigné du verbe, sujet inversé, pronom complément devant le verbe
    accordsSV: [
      ['Les enfants de ma classe ___ au football.', 'Les enfants', 'jouer', 'joue', 'jouent', 'p'],
      ['Le chien des voisins ___ toute la nuit.', 'Le chien', 'aboyer', 'aboie', 'aboient', 's'],
      ['Les fleurs du jardin ___ bon.', 'Les fleurs', 'sentir', 'sent', 'sentent', 'p'],
      ['La maison de mes grands-parents ___ grande.', 'La maison', 'être', 'est', 'sont', 's'],
      ['Les feuilles de cet arbre ___ en automne.', 'Les feuilles', 'tomber', 'tombe', 'tombent', 'p'],
      ['Le bruit des vagues ___ le bébé.', 'Le bruit', 'endormir', 'endort', 'endorment', 's'],
      ['Dans la mare ___ des grenouilles.', 'des grenouilles', 'vivre', 'vit', 'vivent', 'p'],
      ['Sur le toit ___ un chat noir.', 'un chat noir', 'dormir', 'dort', 'dorment', 's'],
      ['Les élèves de CE2 ___ une sortie.', 'Les élèves', 'préparer', 'prépare', 'préparent', 'p'],
      ['Le facteur, avec son vélo, ___ le courrier.', 'Le facteur', 'distribuer', 'distribue', 'distribuent', 's'],
      ['Mon frère les ___ souvent.', 'Mon frère', 'voir', 'voit', 'voient', 's'],
      ['Ma mère leur ___ une histoire.', 'Ma mère', 'lire', 'lit', 'lisent', 's'],
      ['Les oiseaux, dans le ciel, ___ vers le sud.', 'Les oiseaux', 'voler', 'vole', 'volent', 'p'],
      ['Le gâteau aux pommes ___ délicieux.', 'Le gâteau', 'être', 'est', 'sont', 's'],
      ['Les jouets de Léo ___ dans le coffre.', 'Les jouets', 'être', 'est', 'sont', 'p'],
      ['Au loin ___ les cloches du village.', 'les cloches', 'sonner', 'sonne', 'sonnent', 'p'],
      ['La boîte de crayons ___ sur la table.', 'La boîte', 'être', 'est', 'sont', 's'],
      ['Le panier de fraises ___ lourd.', 'Le panier', 'être', 'est', 'sont', 's'],
      ['Les amis de mon frère ___ du vélo.', 'Les amis', 'faire', 'fait', 'font', 'p'],
      ['Mes parents nous ___ au cinéma.', 'Mes parents', 'emmener', 'emmène', 'emmènent', 'p'],
      ['Où ___ les enfants ?', 'les enfants', 'aller', 'va', 'vont', 'p'],
      ['Que ___ ton père ?', 'ton père', 'dire', 'dit', 'disent', 's'],
      ['Tous les matins, la voisine ___ son chien.', 'la voisine', 'promener', 'promène', 'promènent', 's'],
      ['Les bonbons de la boîte ___ très sucrés.', 'Les bonbons', 'être', 'est', 'sont', 'p'],
      ['Le troupeau de moutons ___ dans le pré.', 'Le troupeau', 'brouter', 'broute', 'broutent', 's'],
      ['Les pieds de la table ___ en bois.', 'Les pieds', 'être', 'est', 'sont', 'p'],
      ['Le chant des oiseaux ___ Inès.', 'Le chant', 'réveiller', 'réveille', 'réveillent', 's'],
      ['Ce soir, les étoiles ___ très fort.', 'les étoiles', 'briller', 'brille', 'brillent', 'p'],
    ],
  },
}
const NIVEAUX_DISPO = Object.keys(DONNEES)

// Adjectifs : [masc. sing., fém. sing., masc. plur., fém. plur.]
const ADJECTIFS = {
  petit: ['petit','petite','petits','petites'], grand: ['grand','grande','grands','grandes'],
  rouge: ['rouge','rouge','rouges','rouges'],   vert: ['vert','verte','verts','vertes'],
  noir: ['noir','noire','noirs','noires'],       blanc: ['blanc','blanche','blancs','blanches'],
  gros: ['gros','grosse','gros','grosses'],      gris: ['gris','grise','gris','grises'],
  bleu: ['bleu','bleue','bleus','bleues'],       chaud: ['chaud','chaude','chauds','chaudes'],
  content: ['content','contente','contents','contentes'], rond: ['rond','ronde','ronds','rondes'],
  long: ['long','longue','longs','longues'],     neuf: ['neuf','neuve','neufs','neuves'],
  méchant: ['méchant','méchante','méchants','méchantes'], haut: ['haut','haute','hauts','hautes'],
  rose: ['rose','rose','roses','roses'],         beau: ['beau','belle','beaux','belles'],
  jaune: ['jaune','jaune','jaunes','jaunes'],    gentil: ['gentil','gentille','gentils','gentilles'],
  joli: ['joli','jolie','jolis','jolies'],
  sauvage: ['sauvage','sauvage','sauvages','sauvages'], nouveau: ['nouveau','nouvelle','nouveaux','nouvelles'],
  vieux: ['vieux','vieille','vieux','vieilles'], doux: ['doux','douce','doux','douces'],
  heureux: ['heureux','heureuse','heureux','heureuses'], amusant: ['amusant','amusante','amusants','amusantes'],
  écorché: ['écorché','écorchée','écorchés','écorchées'], joyeux: ['joyeux','joyeuse','joyeux','joyeuses'],
  précieux: ['précieux','précieuse','précieux','précieuses'], épais: ['épais','épaisse','épais','épaisses'],
  pointu: ['pointu','pointue','pointus','pointues'], bon: ['bon','bonne','bons','bonnes'],
  faux: ['faux','fausse','faux','fausses'], affamé: ['affamé','affamée','affamés','affamées'],
  dangereux: ['dangereux','dangereuse','dangereux','dangereuses'], calme: ['calme','calme','calmes','calmes'],
  sucré: ['sucré','sucrée','sucrés','sucrées'], gracieux: ['gracieux','gracieuse','gracieux','gracieuses'],
  profond: ['profond','profonde','profonds','profondes'], parfumé: ['parfumé','parfumée','parfumés','parfumées'],
  moderne: ['moderne','moderne','modernes','modernes'], peureux: ['peureux','peureuse','peureux','peureuses'],
}

// ── Analyse d'une phrase annotée → liste de tokens
function analyserPhrase(src) {
  const tokens = []
  let gn = null, cp = null
  let dansSujet = false, dansCV = false, groupeCP = null
  for (let brut of src.trim().split(/\s+/)) {
    while (brut.length > 1 && '[{<'.includes(brut[0])) {
      if (brut[0] === '[') dansSujet = true
      if (brut[0] === '{') groupeCP = []
      if (brut[0] === '<') dansCV = true
      brut = brut.slice(1)
    }
    const fins = []
    for (let m; (m = brut.match(/(\](ms|fs|mp|fp|-)|\}([oq])|>)$/)) && brut.length > m[0].length;) {
      fins.unshift(m)
      brut = brut.slice(0, -m[0].length)
    }
    let tok
    if (/^[.?!,]$/.test(brut)) {
      tok = { m: brut, n: 'ponct' }
    } else {
      const k = brut.lastIndexOf(':')
      const code = brut.slice(k + 1)
      tok = { m: brut.slice(0, k), n: NATURES[code] }
      if (code === 'N') tok.propre = true
      if (dansSujet) tok.sujet = true
      if (dansCV) tok.cv = true
      if (groupeCP) { tok.cp = true; groupeCP.push(tok) }
    }
    tokens.push(tok)
    for (const m of fins) {
      if (m[0].startsWith(']')) { gn = m[2] === '-' ? null : m[2]; dansSujet = false }
      else if (m[0].startsWith('}')) { cp = m[3]; groupeCP = null }
      else dansCV = false
    }
  }
  return { src, tokens, gn, cp }
}

// ── Reconstitution du texte (typographie française)
function texteTokens(tokens, avecMarques = null) {
  let s = ''
  tokens.forEach((t, i) => {
    const mot = avecMarques ? avecMarques(t, i) : t.m
    if (i > 0) {
      const prec = tokens[i - 1]
      if (t.m === '.' || t.m === ',') s += ''
      else if (t.m === '?' || t.m === '!') s += ' '
      else if (prec.m.endsWith('\'')) s += ''
      else s += ' '
    }
    s += mot
  })
  return s
}

function majuscule(s) { return s.charAt(0).toUpperCase() + s.slice(1) }
function minuscule(s) { return s.charAt(0).toLowerCase() + s.slice(1) }

function indicesOu(tokens, pred) {
  return tokens.map((t, i) => pred(t) ? i : -1).filter(i => i >= 0)
}

const PRONOM_TONIQUE = { Je: 'moi', Tu: 'toi', Il: 'lui', Elle: 'elle', Nous: 'nous', Vous: 'vous', Ils: 'eux', Elles: 'elles' }

const nbVerbes = p => p.tokens.filter(t => t.n === 'verbe').length
const aSujet = p => p.tokens.some(t => t.sujet)
const sujetInverse = p => aSujet(p) && p.tokens.findIndex(t => t.sujet) > p.tokens.findIndex(t => t.n === 'verbe')

// Texte d'un groupe de mots (minuscule initiale sauf nom propre)
function texteGroupe(p, pred) {
  const g = p.tokens.filter(pred)
  return texteTokens(g.map((t, i) => (i === 0 && !t.propre && t.n !== 'pronom') ? { ...t, m: minuscule(t.m) } : t))
}

function texteSujet(p) { return texteGroupe(p, t => t.sujet) }

// « C'est le petit chat qui dort sur le canapé. » / « Ce sont des loups qui vivent dans la forêt. »
function phraseCestQui(p) {
  const st = p.tokens.filter(t => t.sujet)
  const iv = p.tokens.findIndex(t => t.n === 'verbe')
  let reste = p.tokens.slice(iv).filter(t => t.n !== 'ponct' && !t.sujet)
  if (sujetInverse(p)) {
    const avant = p.tokens.slice(0, iv).filter(t => t.n !== 'ponct')
    reste = [...reste, ...avant.map((t, i) => (i === 0 && !t.propre) ? { ...t, m: minuscule(t.m) } : t)]
  }
  const verbe = texteTokens(reste)
  let sujet, pluriel
  if (st.length === 1 && st[0].n === 'pronom') {
    const pr = majuscule(st[0].m)
    sujet = PRONOM_TONIQUE[pr]
    pluriel = pr === 'Ils' || pr === 'Elles'
  } else {
    sujet = texteSujet(p)
    pluriel = p.gn === 'mp' || p.gn === 'fp'
  }
  return `${pluriel ? 'Ce sont' : 'C\'est'} ${sujet} qui ${verbe}.`
}

function pronomDe(gn) {
  return { ms: 'il', fs: 'elle', mp: 'ils', fp: 'elles' }[gn]
}

function phraseAvecPronom(p) {
  const pr = pronomDe(p.gn)
  const out = []
  let place = false
  p.tokens.forEach((t, i) => {
    if (t.sujet) {
      if (!place) { out.push({ m: i === 0 ? majuscule(pr) : pr, n: 'pronom' }); place = true }
    } else out.push(t)
  })
  return texteTokens(out)
}

function u(s) { return `<u>${s}</u>` }
function b(s) { return `<strong>${s}</strong>` }

function surligner(p, indices, balise = b) {
  const set = new Set(indices)
  return texteTokens(p.tokens, (t, i) => set.has(i) ? balise(t.m) : t.m)
}

// Souligne un groupe de mots contigu (sujet, complément…)
function surlignerGroupe(p, pred, balise = u) {
  const idx = indicesOu(p.tokens, pred)
  const debut = texteTokens(p.tokens.slice(0, idx[0]))
  const groupe = texteTokens(p.tokens.slice(idx[0], idx[idx.length - 1] + 1))
  const reste = texteTokens(p.tokens.slice(idx[idx.length - 1] + 1))
  let s = debut ? debut + (debut.endsWith('\'') ? '' : ' ') : ''
  s += balise(groupe)
  if (reste) s += (/^[.,]/.test(reste) ? '' : /^[?!]/.test(reste) ? ' ' : ' ') + reste
  return s
}
function surlignerSujet(p, balise = u) { return surlignerGroupe(p, t => t.sujet, balise) }

// Une phrase est utilisable pour "remettre dans l'ordre" si elle est courte, sans virgule
// et sans adjectif déplaçable vers un autre nom (pour éviter plusieurs réponses justes).
function ordrePossible(p) {
  const mots = p.tokens.filter(t => t.n !== 'ponct')
  if (p.tokens.some(t => t.m === ',')) return false
  if (mots.length < 3 || mots.length > 7) return false
  // « et » (Tom et Zoé ↔ Zoé et Tom) ou adverbe pouvant devenir adjectif (le vent fort souffle)
  if (mots.some(t => ['et', 'fort', 'bon'].includes(t.m))) return false
  const nbAdj = mots.filter(t => t.n === 'adj').length
  const nbNoms = mots.filter(t => t.n === 'nom').length
  if (nbAdj > 0 && nbNoms > 1) return false
  // deux noms après le verbe pourraient être échangés (une glace à la fraise / une fraise à la glace)
  const iVerbe = mots.findIndex(t => t.n === 'verbe')
  if (mots.slice(iVerbe + 1).filter(t => t.n === 'nom').length > 1) return false
  return true
}

function etiquettesDe(p) {
  // Fusionne les élisions (l' + arbre → l'arbre) en une seule étiquette
  const etiq = []
  const mots = p.tokens.filter(t => t.n !== 'ponct')
  for (let i = 0; i < mots.length; i++) {
    if (mots[i].m.endsWith('\'') && i + 1 < mots.length) { etiq.push(mots[i].m + mots[i + 1].m); i++ }
    else etiq.push(mots[i].m)
  }
  return etiq
}

// ── Forme négative
function joindre(...parts) { return parts.filter(Boolean).join(' ') }
function commenceParVoyelle(mot) { return /^[aâàeéèêiîoôuûyh]/i.test(mot) }

// e : [avant, verbe, après] (CE1, ne… pas) ou [affirmative, avant, verbe, après, mot] (CE2)
function negationDe(e) {
  const [aff, avant, verbe, apres, mot] = e.length === 3
    ? [joindre(e[0], e[1], e[2]) + '.', e[0], e[1], e[2], 'pas'] : e
  const elide = commenceParVoyelle(verbe)
  const ne = elide ? `n'${verbe}` : `ne ${verbe}`
  const neg = joindre(avant, ne, mot, apres) + '.'
  const faux = [
    joindre(avant, verbe, mot, apres) + '.',                              // oubli de « ne »
    elide ? joindre(avant, 'ne', verbe, mot, apres) + '.'                 // « ne » non élidé
          : joindre(avant, 'ne', mot, verbe, apres) + '.',                // mots mal placés
  ]
  return { aff, neg, mot, elide, faux }
}

const CONSIGNES = {
  fr: {
    ordre:       'Remets les mots dans l\'ordre pour faire une phrase.',
    phrase:      'Est-ce une phrase ?',
    majuscule:   'Quelle phrase est bien écrite ?',
    ponctuation: 'Quel signe faut-il mettre à la fin de la phrase ?',
    complexe:    'Cette phrase est-elle simple ou complexe ?',
    negation:    'Quelle est la phrase à la forme négative ?',
    negReconnaitre: 'Cette phrase est-elle affirmative ou négative ?',
    verbe:       'Clique sur le verbe.',
    nom:         'Clique sur tous les noms.',
    det:         'Clique sur tous les déterminants.',
    adj:         'Clique sur tous les adjectifs.',
    nature:      'Quelle est la nature du mot en gras ?',
    gnNoyau:     'Clique sur le nom principal du groupe nominal.',
    sujet:       'Clique sur tous les mots du groupe sujet.',
    pronom:      'Par quel pronom peut-on remplacer le sujet souligné ?',
    cplt:        'Clique sur tous les mots du complément de phrase.',
    cpltQ:       'Le complément de phrase souligné répond à quelle question ?',
    cpltNature:  'Le groupe souligné est-il un complément du verbe ou un complément de phrase ?',
    genre:       'Un ou une ?',
    nombre:      'Singulier ou pluriel ?',
    pluriel:     'Écris ce groupe de mots au pluriel.',
    accordGN:    'Choisis le bon accord de l\'adjectif.',
    accordSV:    'Choisis la bonne forme du verbe (au présent).',
  },
  // br: à relire (ensemble des consignes)
  br: {
    ordre:       'Lak ar gerioù en urzh evit ober ur frazenn.',
    phrase:      'Ur frazenn eo ?',
    majuscule:   'Peseurt frazenn a zo skrivet mat ?',
    ponctuation: 'Peseurt arouez a vez lakaet e dibenn ar frazenn ?',
    complexe:    'Frazenn eeun pe frazenn gemplezh eo ?',
    negation:    'Peseurt frazenn a zo er stumm nac\'hus ?',
    negReconnaitre: 'Kadarnaus pe nac\'hus eo ar frazenn-mañ ?',
    verbe:       'Klik war ar verb.',
    nom:         'Klik war an holl anvioù.',
    det:         'Klik war an holl c\'herioù-mont.',
    adj:         'Klik war an holl anvioù-gwan.',
    nature:      'Petra eo rummad ar ger e tev ?',
    gnNoyau:     'Klik war anv pennañ ar strollad anv.',
    sujet:       'Klik war holl c\'herioù ar strollad sujed.',
    pronom:      'Gant peseurt raganv e c\'haller erlec\'hiañ ar sujed islinennet ?',
    cplt:        'Klik war holl c\'herioù klokaenn ar frazenn.',
    cpltQ:       'Ouzh peseurt goulenn e respont klokaenn ar frazenn islinennet ?',
    cpltNature:  'Klokaenn ar verb pe klokaenn ar frazenn eo ar strollad islinennet ?',
    genre:       '« un » pe « une » ?',
    nombre:      'Unander pe liester ?',
    pluriel:     'Skriv ar strollad gerioù-mañ el liester.',
    accordGN:    'Dibab kenglotadur mat an anv-gwan.',
    accordSV:    'Dibab stumm mat ar verb (en amzer-vremañ).',
  },
}
// Consignes propres à un niveau
const CONSIGNES_NIVEAU = {
  ce2: {
    fr: {
      verbe: 'Clique sur tous les verbes conjugués.',
      negReconnaitre: 'Cette phrase est-elle affirmative ? Sinon, quelle négation contient-elle ?',
    },
    br: {
      verbe: 'Klik war an holl verboù displeget.',
      negReconnaitre: 'Kadarnaus eo ar frazenn-mañ ? Anez, peseurt nac\'hadur a zo enni ?', // br: à relire
    },
  },
}
const consigneDe = (type, niveau) => () => {
  const l = langue.value
  return CONSIGNES_NIVEAU[niveau]?.[l]?.[type] || CONSIGNES[l]?.[type] || CONSIGNES.fr[type]
}

const REGLES_PLURIEL = {
  fr: {
    al:  'Les noms en -al font leur pluriel en -aux.',
    eu:  'Les noms en -eu prennent un x au pluriel.',
    eau: 'Les noms en -eau prennent un x au pluriel.',
    ou:  'Sept noms en -ou prennent un x au pluriel : bijou, caillou, chou, genou, hibou, joujou, pou.',
    ou2: 'Les noms en -ou prennent un s au pluriel, sauf bijou, caillou, chou, genou, hibou, joujou, pou.',
    s:   'Un mot qui finit déjà par -s ne change pas au pluriel.',
    x:   'Un mot qui finit déjà par -x ne change pas au pluriel.',
    z:   'Un mot qui finit déjà par -z ne change pas au pluriel.',
    defaut: 'Au pluriel, le déterminant change (le, la → les ; un, une → des…) et on ajoute un -s à la fin des noms et des adjectifs.',
  },
  br: {
    al:  'An anvioù a echu gant -al a ra o liester gant -aux.',
    eu:  'An anvioù a echu gant -eu a gemer un x el liester.',
    eau: 'An anvioù a echu gant -eau a gemer un x el liester.',
    ou:  'Seizh anv a echu gant -ou a gemer un x el liester : bijou, caillou, chou, genou, hibou, joujou, pou.',
    ou2: 'An anvioù a echu gant -ou a gemer un s el liester, nemet bijou, caillou, chou, genou, hibou, joujou, pou.',
    s:   'Ur ger a echu dija gant -s ne cheñch ket el liester.',
    x:   'Ur ger a echu dija gant -x ne cheñch ket el liester.',
    z:   'Ur ger a echu dija gant -z ne cheñch ket el liester.',
    defaut: 'El liester e cheñch ar ger-mont (le, la → les ; un, une → des…) hag e vez ouzhpennet un -s e dibenn an anvioù hag an anvioù-gwan.',
  },
}
const regleDe = cle => () => (REGLES_PLURIEL[langue.value] || REGLES_PLURIEL.fr)[cle]

// Construit les « réservoirs » d'éléments pour chaque type d'exercice
function construireReservoirs(niveau) {
  const d = DONNEES[niveau] || DONNEES.ce1
  const phrases = d.phrases.map(analyserPhrase)
  const gns = (d.groupesNominaux || []).map(analyserPhrase)
  // les groupes nominaux servent aussi à repérer noms, déterminants et adjectifs
  const avec = n => [...phrases, ...gns].filter(p => p.tokens.some(t => t.n === n))
  const nature = []
  phrases.forEach(p => p.tokens.forEach((t, i) => { if (NOM_NATURE[t.n]) nature.push({ p, i }) }))
  const nombre = []
  ;(d.pluriels || []).forEach(([s, pl]) => { nombre.push({ gn: s, n: 's' }); nombre.push({ gn: pl, n: 'p' }) })
  const cpltNature = []
  phrases.forEach(p => {
    if (p.cp) cpltNature.push({ p, g: 'cp' })
    if (p.tokens.some(t => t.cv)) cpltNature.push({ p, g: 'cv' })
  })
  const negations = (d.negations || []).map(negationDe)
  return {
    ordre:       phrases.filter(ordrePossible),
    phrase:      d.phraseOuPas || [],
    majuscule:   phrases.filter(p => p.tokens[p.tokens.length - 1].m === '.' && aSujet(p)),
    ponctuation: d.typesPhrases || [],
    complexe:    phrases,
    negation:    negations,
    negReconnaitre: negations.flatMap(n => [{ n, neg: true }, { n, neg: false }]),
    verbe:       phrases,
    nom:         avec('nom'),
    det:         avec('det'),
    adj:         avec('adj'),
    nature,
    gnNoyau:     gns,
    sujet:       phrases.filter(aSujet),
    pronom:      phrases.filter(p => p.gn && !sujetInverse(p) && !p.tokens.some(t => t.sujet && t.n === 'pronom')),
    cplt:        phrases.filter(p => p.cp),
    cpltQ:       phrases.filter(p => p.cp),
    cpltNature,
    genre:       d.genre || [],
    nombre,
    pluriel:     d.pluriels || [],
    accordGN:    (d.accordsGN || []).map(a => ({ a, formes: ADJECTIFS[a[2]] })),
    accordSV:    d.accordsSV || [],
  }
}

const LIB_SIGNES = { '.': '. (point)', '?': '? (point d\'interrogation)', '!': '! (point d\'exclamation)' }
const TYPE_SIGNE = {
  fr: { '.': 'phrase déclarative', '?': 'phrase interrogative', '!': 'phrase exclamative' },
  // br: à relire (types de phrases)
  br: { '.': 'frazenn disklêriañ', '?': 'frazenn goulenn', '!': 'frazenn estlamm' },
}
const LIB_CPLT = { o: 'Où ?', q: 'Quand ?' }
const libGN = g => tr({ fr: LIB_GN, br: LIB_GN_BR })[g]
const nombreDe = n => tr({ fr: n === 's' ? 'au singulier' : 'au pluriel', br: n === 's' ? 'en unander' : 'el liester' })
const ne_ = elide => (elide ? 'n\'' : 'ne')

function construireQuestion(type, e, niveau = 'ce1') {
  const q = { type, consigne: consigneDe(type, niveau) }
  switch (type) {
    case 'ordre': {
      const etiq = etiquettesDe(e)
      let melange = melanger(etiq)
      for (let k = 0; k < 10 && melange.join(' ') === etiq.join(' '); k++) melange = melanger(etiq)
      const fin = e.tokens[e.tokens.length - 1].m
      return { ...q, mode: 'ordre', etiquettes: melange, fin,
        attendu: etiq.join(' '), solution: texteTokens(e.tokens) }
    }
    case 'phrase': {
      const bonne = e.ok ? 'Oui, c\'est une phrase' : 'Non, ce n\'est pas une phrase'
      const expl = () => e.ok
        ? tr({ fr: 'Les mots sont dans l\'ordre et la phrase a du sens.', br: 'Ar gerioù a zo en urzh hag ur ster en deus ar frazenn.' })
        : e.r === 'verbe'
          ? tr({ fr: 'Il manque un verbe : on ne sait pas ce qui se passe.', br: 'Mankout a ra ur verb : ne ouzer ket petra a c\'hoarvez.' })
          : tr({ fr: 'Les mots ne sont pas dans le bon ordre : on ne comprend pas.', br: 'N\'emañ ket ar gerioù en urzh mat : ne gomprener ket.' })
      return { ...q, mode: 'choix', html: e.t, lecture: e.ok ? e.t : null,
        choix: ['Oui, c\'est une phrase', 'Non, ce n\'est pas une phrase'], bonne, explication: expl,
        solution: () => `« ${e.t} » → ${tc(bonne).toLowerCase()}. ${expl()}` }
    }
    case 'majuscule': {
      const juste = texteTokens(e.tokens)
      const sansMaj = minuscule(juste)
      const sansPoint = juste.slice(0, -1)
      return { ...q, mode: 'choix', colonne: true, lecture: juste,
        choix: melanger([juste, sansMaj, sansPoint]), bonne: juste,
        explication: () => tr({ fr: 'Une phrase commence par une majuscule et se termine par un point.',
          br: 'Ur frazenn a grog gant ur bennlizherenn hag a echu gant ur poent.' }), // br: à relire (majuscule = pennlizherenn)
        solution: juste }
    }
    case 'ponctuation': {
      const typ = () => tr(TYPE_SIGNE)[e.s]
      return { ...q, mode: 'choix', html: `${e.t} <span class="trou">…</span>`,
        choix: ['.', '?', '!'].map(s => LIB_SIGNES[s]), bonne: LIB_SIGNES[e.s],
        explication: () => tr({ fr: `C'est une ${typ()}.`, br: `Ur ${typ()} eo.` }),
        solution: () => `${e.t}${e.s === '.' ? '' : ' '}${b(e.s)} (${typ()})` }
    }
    case 'complexe': {
      const iv = indicesOu(e.tokens, t => t.n === 'verbe')
      const bonne = iv.length > 1 ? 'phrase complexe' : 'phrase simple'
      const verbes = iv.map(i => `« ${e.tokens[i].m} »`).join(', ')
      return { ...q, mode: 'choix', html: texteTokens(e.tokens), lecture: texteTokens(e.tokens),
        choix: ['phrase simple', 'phrase complexe'], bonne,
        explication: () => iv.length > 1
          ? tr({ fr: `Il y a ${iv.length} verbes conjugués (${verbes}) : c'est une phrase complexe.`,
            br: `${iv.length} verb displeget a zo (${verbes}) : ur frazenn gemplezh eo.` })
          : tr({ fr: `Il n'y a qu'un verbe conjugué (${verbes}) : c'est une phrase simple.`,
            br: `N'eus nemet ur verb displeget (${verbes}) : ur frazenn eeun eo.` }),
        solution: () => `${surligner(e, iv, u)} → ${tc(bonne)}` }
    }
    case 'negation': {
      return { ...q, mode: 'choix', colonne: true,
        html: e.aff + (e.mot !== 'pas' ? `<div class="sens">${tr({ fr: 'avec', br: 'gant' })} « ne … ${e.mot} »</div>` : ''),
        lecture: e.aff, choix: melanger([e.neg, ...e.faux]), bonne: e.neg,
        explication: () => tr({
          fr: `On encadre le verbe avec « ${ne_(e.elide)} … ${e.mot} »${e.elide ? ' (n\' devant une voyelle)' : ''}.`,
          br: `Lakaat a reer « ${ne_(e.elide)} … ${e.mot} » en-dro d'ar verb${e.elide ? ' (n\' dirak ur vogalenn)' : ''}.` }),
        solution: `${e.aff} → ${b(e.neg)}` }
    }
    case 'negReconnaitre': {
      const n = e.n
      const phrase = e.neg ? n.neg : n.aff
      const ce1 = niveau === 'ce1'
      const choix = ce1 ? ['affirmative', 'négative']
        : ['affirmative', 'ne … pas', 'ne … plus', 'ne … jamais', 'ne … rien']
      const bonne = !e.neg ? 'affirmative' : ce1 ? 'négative' : `ne … ${n.mot}`
      return { ...q, mode: 'choix', html: phrase, lecture: phrase, choix, bonne,
        explication: () => e.neg
          ? tr({ fr: `Le verbe est encadré par « ${ne_(n.elide)} … ${n.mot} » : la phrase est négative.`,
            br: `Emañ ar verb etre « ${ne_(n.elide)} … ${n.mot} » : nac'hus eo ar frazenn.` })
          : tr({ fr: `Il n'y a pas de « ne … » autour du verbe : la phrase est affirmative.`,
            br: `N'eus ket a « ne … » en-dro d'ar verb : kadarnaus eo ar frazenn.` }),
        solution: () => `${phrase} → ${tc(bonne)}` }
    }
    case 'verbe': case 'nom': case 'det': case 'adj': case 'sujet': case 'cplt': case 'gnNoyau': {
      const pred = type === 'sujet' ? (t => t.sujet)
        : type === 'cplt' ? (t => t.cp)
        : type === 'gnNoyau' ? (t => t.n === 'nom')
        : (t => t.n === type)
      const cibles = indicesOu(e.tokens, pred)
      let explication
      if (type === 'sujet') {
        explication = () => {
          let x = tr({ fr: `Le sujet est « ${texteSujet(e)} ». ${phraseCestQui(e)}`,
            br: `Ar sujed eo « ${texteSujet(e)} ». « ${phraseCestQui(e)} »` })
          if (sujetInverse(e)) x += tr({ fr: ' Ici, le sujet est placé après le verbe.', br: ' Amañ emañ ar sujed goude ar verb.' })
          return x
        }
      } else if (type === 'cplt') {
        explication = () => tr({
          fr: `« ${texteGroupe(e, pred)} » est un complément de phrase : il indique ${e.cp === 'o' ? 'où' : 'quand'}. On peut le déplacer ou le supprimer.`,
          br: `« ${texteGroupe(e, pred)} » a zo ur glokaenn frazenn : diskouez a ra ${e.cp === 'o' ? 'pelec\'h' : 'pegoulz'}. Gallout a reer he dilec'hiañ pe he lemel.` })
      } else if (type === 'gnNoyau') {
        explication = () => tr({
          fr: `Le nom principal est « ${e.tokens[cibles[0]].m} » : les autres mots s'accordent avec lui.`,
          br: `An anv pennañ eo « ${e.tokens[cibles[0]].m} » : ar gerioù all a genglot gantañ.` })
      } else if (type === 'verbe') {
        const vs = cibles.map(i => `« ${e.tokens[i].m} »`).join(', ')
        explication = () => cibles.length > 1
          ? tr({ fr: `Les verbes conjugués sont ${vs}.`, br: `Ar verboù displeget eo ${vs}.` })
          : tr({ fr: `Le verbe est ${vs}.`, br: `Ar verb eo ${vs}.` })
      } else {
        const mots = cibles.map(i => `« ${e.tokens[i].m} »`).join(', ')
        const pl = cibles.length > 1
        explication = () => {
          const lib = tr({
            fr: { nom: 'Nom', det: 'Déterminant', adj: 'Adjectif' }[type] + (pl ? 's' : ''),
            br: { nom: pl ? 'Anvioù' : 'Anv', det: pl ? 'Gerioù-mont' : 'Ger-mont', adj: pl ? 'Anvioù-gwan' : 'Anv-gwan' }[type],
          })
          return `${lib} : ${mots}.`
        }
      }
      const solution = (type === 'sujet' || type === 'cplt') ? surlignerGroupe(e, pred)
        : surligner(e, cibles, type === 'verbe' ? u : b)
      return { ...q, mode: 'clic', tokens: e.tokens, cibles, lecture: texteTokens(e.tokens), explication, solution }
    }
    case 'cpltQ': {
      const bonne = LIB_CPLT[e.cp]
      const groupe = texteGroupe(e, t => t.cp)
      return { ...q, mode: 'choix', html: surlignerGroupe(e, t => t.cp), lecture: texteTokens(e.tokens),
        choix: ['Où ?', 'Quand ?'], bonne,
        explication: () => tr({
          fr: `« ${groupe} » indique ${e.cp === 'o' ? 'le lieu (où ?)' : 'le moment (quand ?)'}.`,
          br: `« ${groupe} » a ziskouez ${e.cp === 'o' ? 'al lec\'h (pelec\'h ?)' : 'ar mare (pegoulz ?)'}.` }),
        solution: () => `${surlignerGroupe(e, t => t.cp)} → ${tc(bonne)}` }
    }
    case 'cpltNature': {
      const pred = e.g === 'cp' ? (t => t.cp) : (t => t.cv)
      const groupe = texteGroupe(e.p, pred)
      const verbe = e.p.tokens.find(t => t.n === 'verbe').m
      const bonne = e.g === 'cp' ? 'complément de phrase' : 'complément du verbe'
      return { ...q, mode: 'choix', html: surlignerGroupe(e.p, pred), lecture: texteTokens(e.p.tokens),
        choix: ['complément du verbe', 'complément de phrase'], bonne,
        explication: () => e.g === 'cp'
          ? tr({ fr: `On peut déplacer ou supprimer « ${groupe} » : c'est un complément de phrase.`,
            br: `Gallout a reer dilec'hiañ pe lemel « ${groupe} » : ur glokaenn frazenn eo.` })
          : tr({ fr: `« ${groupe} » complète le verbe « ${verbe} » : on ne peut pas le déplacer en début de phrase. C'est un complément du verbe.`,
            br: `« ${groupe} » a glok ar verb « ${verbe} » : ne c'haller ket he dilec'hiañ e penn kentañ ar frazenn. Ur glokaenn verb eo.` }),
        solution: () => `${surlignerGroupe(e.p, pred)} → ${tc(bonne)}` }
    }
    case 'nature': {
      const t = e.p.tokens[e.i]
      const bonne = NOM_NATURE[t.n]
      const precision = () => t.propre ? tr({ fr: ' (nom propre)', br: ' (anv divoutin)' }) // br: à relire (nom propre)
        : t.n === 'verbe' && niveau !== 'ce1' ? tr({ fr: ' conjugué', br: ' displeget' }) : ''
      return { ...q, mode: 'choix', html: surligner(e.p, [e.i]), lecture: texteTokens(e.p.tokens),
        choix: ['nom', 'verbe', 'déterminant', 'adjectif', 'pronom'], bonne,
        explication: () => tr({ fr: `« ${t.m} » est un ${bonne}${precision()}.`,
          br: `Rummad ar ger « ${t.m} » : ${tc(bonne)}${precision()}.` }),
        solution: () => `${surligner(e.p, [e.i])} → ${tc(bonne)}` }
    }
    case 'pronom': {
      const bonne = pronomDe(e.gn)
      const nouvelle = phraseAvecPronom(e)
      return { ...q, mode: 'choix', html: surlignerSujet(e), lecture: texteTokens(e.tokens),
        choix: ['il', 'elle', 'ils', 'elles'], bonne,
        explication: () => tr({ fr: `« ${texteSujet(e)} » est ${libGN(e.gn)} → ${nouvelle}`,
          br: `« ${texteSujet(e)} » a zo ${libGN(e.gn)} → « ${nouvelle} »` }),
        solution: nouvelle }
    }
    case 'genre': {
      const [nom, g] = e
      const bonne = g === 'm' ? 'un' : 'une'
      const lib = () => tc(g === 'm' ? 'masculin' : 'féminin')
      return { ...q, mode: 'choix', html: `<span class="trou">___</span> ${nom}`, lecture: null,
        choix: ['un', 'une'], bonne,
        explication: () => tr({ fr: `On dit « ${bonne} ${nom} » : ${nom} est ${lib()}.`,
          br: `Lavaret a reer « ${bonne} ${nom} » : « ${nom} » a zo ${lib()}.` }),
        solution: () => `${b(bonne)} ${nom} (${lib()})` }
    }
    case 'nombre': {
      const bonne = e.n === 's' ? 'singulier' : 'pluriel'
      const det = e.gn.split(' ')[0]
      return { ...q, mode: 'choix', html: e.gn, lecture: e.gn,
        choix: ['singulier', 'pluriel'], bonne,
        explication: () => tr({ fr: `« ${det} » montre que c'est ${nombreDe(e.n)}.`,
          br: `« ${det} » a ziskouez emañ ${nombreDe(e.n)}.` }),
        solution: () => `${e.gn} → ${tc(bonne)}` }
    }
    case 'pluriel': {
      const [s, pl, regle] = e
      return { ...q, mode: 'saisie', html: `${s} → <span class="trou">…</span>`, lecture: null,
        attendu: pl,
        explication: regleDe(regle || 'defaut'),
        solution: `${s} → ${b(pl)}` }
    }
    case 'accordGN': {
      const [gn, nom, adj, g] = e.a
      const bonne = e.formes[['ms', 'fs', 'mp', 'fp'].indexOf(g)]
      const choix = [...new Set(e.formes)]
      return { ...q, mode: 'choix', html: `${gn.replace('___', '<span class="trou">___</span>')} <em>(${adj})</em>`,
        lecture: null, choix, bonne,
        explication: () => tr({ fr: `« ${nom} » est ${libGN(g)} → ${bonne}.`,
          br: `« ${nom} » a zo ${libGN(g)} → ${bonne}.` }),
        solution: gn.replace('___', b(bonne)) }
    }
    case 'accordSV': {
      const [phrase, suj, inf, fs, fp, n] = e
      const bonne = n === 's' ? fs : fp
      return { ...q, mode: 'choix', html: `${phrase.replace('___', '<span class="trou">___</span>')} <em>(${inf})</em>`,
        lecture: null, choix: [fs, fp], bonne,
        explication: () => tr({ fr: `Le verbe s'accorde avec son sujet « ${suj} », qui est ${nombreDe(n)} → ${bonne}.`,
          br: `Ar verb a genglot gant e sujed « ${suj} », a zo ${nombreDe(n)} → ${bonne}.` }),
        solution: phrase.replace('___', b(bonne)) }
    }
  }
  return null
}

// Génère nb questions réparties entre les types choisis (disponibles au niveau), sans répétition
function genererQuestions(niveau, types, nb) {
  const res = construireReservoirs(niveau)
  const dispo = typesDuNiveau(niveau)
  let ok = types.filter(t => dispo.includes(t) && res[t] && res[t].length)
  if (!ok.length) ok = [dispo[0]]
  const pools = {}
  const ordreTypes = []
  while (ordreTypes.length < nb) ordreTypes.push(...melanger(ok))
  ordreTypes.length = nb
  return melanger(ordreTypes).map(type => {
    if (!pools[type] || pools[type].length === 0) pools[type] = melanger(res[type])
    return construireQuestion(type, pools[type].pop(), niveau)
  })
}

// ── Fiche imprimable : rendu d'une question en HTML papier
const CONSIGNES_FICHE = {
  fr: {
    ordre:       'Remets les mots dans l\'ordre et écris la phrase.',
    phrase:      'Coche la bonne case : est-ce une phrase ?',
    majuscule:   'Recopie la phrase avec une majuscule et un point.',
    ponctuation: 'Ajoute le bon signe à la fin : . ? ou !',
    complexe:    'Souligne les verbes conjugués, puis coche : phrase simple ou complexe ?',
    negation:    'Écris la phrase à la forme négative.',
    negReconnaitre: 'Coche : la phrase est-elle affirmative ou négative ?',
    verbe:       'Souligne le verbe.',
    nom:         'Entoure tous les noms.',
    det:         'Entoure tous les déterminants.',
    adj:         'Entoure tous les adjectifs.',
    nature:      'Écris la nature du mot en gras : nom, verbe, déterminant, adjectif ou pronom.',
    gnNoyau:     'Souligne le nom principal du groupe nominal.',
    sujet:       'Entoure le groupe sujet.',
    pronom:      'Récris la phrase en remplaçant le sujet souligné par il, elle, ils ou elles.',
    cplt:        'Entoure le complément de phrase.',
    cpltQ:       'Le complément souligné indique-t-il où ou quand ? Coche.',
    cpltNature:  'Le groupe souligné est-il un complément du verbe (V) ou un complément de phrase (P) ?',
    genre:       'Écris un ou une.',
    nombre:      'Coche : singulier ou pluriel ?',
    pluriel:     'Écris au pluriel.',
    accordGN:    'Accorde l\'adjectif entre parenthèses.',
    accordSV:    'Écris le verbe au présent.',
  },
  // br: à relire (cocher = lakaat ur groaz, entourer = lakaat ur c'helc'h en-dro, souligner = islinennañ)
  br: {
    ordre:       'Lak ar gerioù en urzh ha skriv ar frazenn.',
    phrase:      'Lak ur groaz er voest vat : ur frazenn eo ?',
    majuscule:   'Adskriv ar frazenn gant ur bennlizherenn hag ur poent.',
    ponctuation: 'Ouzhpenn an arouez vat en dibenn : . ? pe !',
    complexe:    'Islinenn ar verboù displeget, ha lak ur groaz : frazenn eeun pe gemplezh ?',
    negation:    'Skriv ar frazenn er stumm nac\'hus.',
    negReconnaitre: 'Lak ur groaz : kadarnaus pe nac\'hus eo ar frazenn ?',
    verbe:       'Islinenn ar verb.',
    nom:         'Lak ur c\'helc\'h en-dro d\'an holl anvioù.',
    det:         'Lak ur c\'helc\'h en-dro d\'an holl c\'herioù-mont.',
    adj:         'Lak ur c\'helc\'h en-dro d\'an holl anvioù-gwan.',
    nature:      'Skriv rummad ar ger e tev : anv, verb, ger-mont, anv-gwan pe raganv.',
    gnNoyau:     'Islinenn anv pennañ ar strollad anv.',
    sujet:       'Lak ur c\'helc\'h en-dro d\'ar strollad sujed.',
    pronom:      'Adskriv ar frazenn en ur lakaat il, elle, ils pe elles e plas ar sujed islinennet.',
    cplt:        'Lak ur c\'helc\'h en-dro da glokaenn ar frazenn.',
    cpltQ:       'Diskouez a ra ar glokaenn islinennet pelec\'h pe pegoulz ? Lak ur groaz.',
    cpltNature:  'Klokaenn ar verb (V) pe klokaenn ar frazenn (F) eo ar strollad islinennet ?',
    genre:       'Skriv un pe une.',
    nombre:      'Lak ur groaz : unander pe liester ?',
    pluriel:     'Skriv el liester.',
    accordGN:    'Kenglot an anv-gwan etre krommelloù.',
    accordSV:    'Skriv ar verb en amzer-vremañ.',
  },
}
const CONSIGNES_FICHE_NIVEAU = {
  ce2: {
    fr: {
      verbe: 'Souligne tous les verbes conjugués.',
      negReconnaitre: 'Écris A si la phrase est affirmative, sinon écris la négation (ne … pas, plus, jamais, rien).',
    },
    br: {
      verbe: 'Islinenn an holl verboù displeget.',
      negReconnaitre: 'Skriv K ma\'z eo kadarnaus ar frazenn, anez skriv an nac\'hadur (ne … pas, plus, jamais, rien).',
    },
  },
}
const consigneFiche = (type, niveau) => {
  const l = langue.value
  return CONSIGNES_FICHE_NIVEAU[niveau]?.[l]?.[type] || CONSIGNES_FICHE[l]?.[type] || CONSIGNES_FICHE.fr[type]
}

const LIGNE = '<span class="ligne"></span>'
const CASE = '<span class="case"></span>'

function questionFiche(q) {
  const tokTxt = q.tokens ? texteTokens(q.tokens) : ''
  switch (q.type) {
    case 'ordre':
      return `<div class="etiqs">${q.etiquettes.map(e => `<span class="etiq">${e}</span>`).join('')} <span class="etiq">${q.fin}</span></div><div class="lignebloc">${LIGNE}</div>`
    case 'phrase':
      return `<div>${q.html}</div><div class="cases">${CASE} ${tr({ fr: 'c\'est une phrase', br: 'ur frazenn eo' })} &nbsp;&nbsp; ${CASE} ${tr({ fr: 'ce n\'est pas une phrase', br: 'n\'eo ket ur frazenn' })}</div>`
    case 'majuscule': {
      const brut = minuscule(q.bonne).slice(0, -1)
      return `<div>${brut}</div><div class="lignebloc">${LIGNE}</div>`
    }
    case 'ponctuation':
      return `<div>${q.html.replace('<span class="trou">…</span>', CASE)}</div>`
    case 'complexe':
      return `<div class="grand">${q.html}</div><div class="cases">${CASE} ${tc('phrase simple')} &nbsp;&nbsp; ${CASE} ${tc('phrase complexe')}</div>`
    case 'negation':
      return `<div>${q.html.replace(/<div class="sens">(.*)<\/div>/, ' <em>($1)</em>')}</div><div class="lignebloc">${LIGNE}</div>`
    case 'negReconnaitre':
      return q.choix.length === 2
        ? `<div>${q.html}</div><div class="cases">${CASE} ${tc('affirmative')} &nbsp;&nbsp; ${CASE} ${tc('négative')}</div>`
        : `<div>${q.html} &nbsp;→ <span class="ligne moyenne"></span></div>`
    case 'verbe': case 'nom': case 'det': case 'adj': case 'sujet': case 'cplt': case 'gnNoyau':
      return `<div class="grand">${tokTxt}</div>`
    case 'nature':
      return `<div>${q.html} &nbsp;→ ${LIGNE}</div>`
    case 'pronom':
      return `<div>${q.html}</div><div class="lignebloc">${LIGNE}</div>`
    case 'cpltQ':
      return `<div>${q.html} &nbsp;&nbsp; ${CASE} ${tc('Où ?').toLowerCase()} &nbsp; ${CASE} ${tc('Quand ?').toLowerCase()}</div>`
    case 'cpltNature':
      return `<div>${q.html} &nbsp;&nbsp; ${CASE} V &nbsp; ${CASE} ${tr({ fr: 'P', br: 'F' })}</div>`
    case 'genre':
      return `<div>${q.html.replace('<span class="trou">___</span>', '<span class="ligne courte"></span>')}</div>`
    case 'nombre':
      return `<div>${q.html} &nbsp;&nbsp; ${CASE} ${tc('singulier')} &nbsp; ${CASE} ${tc('pluriel')}</div>`
    case 'pluriel':
      return `<div>${q.html.replace('<span class="trou">…</span>', LIGNE)}</div>`
    case 'accordGN': case 'accordSV':
      return `<div>${q.html.replace('<span class="trou">___</span>', '<span class="ligne moyenne"></span>')}</div>`
  }
  return ''
}

function htmlFiche(niveau, types, nb, avecCorrige = true) {
  const qs = genererQuestions(niveau, types, nb)
  const ordre = [...new Set(qs.map(q => q.type))].sort((a, b) => IDS_TYPES.indexOf(a) - IDS_TYPES.indexOf(b))
  const parType = ordre.map(ty => ({ t: ty, qs: qs.filter(q => q.type === ty) }))
  let num = 0
  const corps = parType.map(g => `
    <h2>${consigneFiche(g.t, niveau)}</h2>
    ${g.qs.map(q => { num++; return `<div class="q"><span class="num">${num}.</span><div class="contenu">${questionFiche(q)}</div></div>` }).join('')}
  `).join('')
  num = 0
  const corrige = parType.map(g => g.qs.map(q => { num++; return `<div class="corr"><span class="num">${num}.</span> ${val(q.solution)}</div>` }).join('')).join('')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niveau.toUpperCase()}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: 1rem; margin: 1.4rem 0 .4rem; background: #f0f3f7; padding: .3rem .6rem; border-radius: 6px; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1rem; }
      .q { display: flex; gap: .6rem; margin: .7rem 0; font-size: 1.15rem; line-height: 2.1; page-break-inside: avoid; }
      .num { min-width: 1.6rem; font-weight: 700; color: #777; }
      .contenu { flex: 1; }
      .grand { font-size: 1.3rem; letter-spacing: .02em; word-spacing: .35em; }
      .ligne { display: inline-block; min-width: 220px; border-bottom: 1.5px solid #888; height: 1.2em; vertical-align: bottom; }
      .ligne.courte { min-width: 60px; } .ligne.moyenne { min-width: 120px; }
      .lignebloc .ligne { display: block; width: 100%; margin-top: .3rem; }
      .case { display: inline-block; width: 1em; height: 1em; border: 1.5px solid #555; vertical-align: middle; margin: 0 .2rem; }
      .cases { font-size: 1rem; }
      .etiqs { display: flex; flex-wrap: wrap; gap: .4rem; }
      .etiq { border: 1.5px solid #555; border-radius: 6px; padding: 0 .5rem; line-height: 1.8; }
      .corrige { page-break-before: always; font-size: .95rem; }
      .corr { margin: .3rem 0; }
      u { text-decoration-thickness: 2px; }
      em { color: #555; }
    </style></head><body>
    <h1>${t('titre')} — ${niveau.toUpperCase()}</h1>
    <p class="entete">${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    ${corps}
    ${avecCorrige ? `<div class="corrige"><h1>${t('corrige')}</h1>${corrige}</div>` : ''}
  </body></html>`
}

// ════════════════════════════════════════════════════════════════════
// ── LOGIQUE PURE (fin)
// ════════════════════════════════════════════════════════════════════

// ── Config persistée (on nettoie une éventuelle ancienne sauvegarde)
const DEFAUT = { niveau: 'ce1', types: ['verbe'], nb: 10 }
const brut = charger('grammaire_config', DEFAUT) || DEFAUT
const niveauCharge = NIVEAUX_DISPO.includes(brut.niveau) ? brut.niveau : 'ce1'
const typesCharges = (Array.isArray(brut.types) ? brut.types : []).filter(t => typesDuNiveau(niveauCharge).includes(t))
const config = ref({
  niveau: niveauCharge,
  types: typesCharges.length ? typesCharges : ['verbe'],
  nb: [5, 10, 15].includes(brut.nb) ? brut.nb : 10,
  corrige: brut.corrige !== false,
})
watch(config, v => sauvegarder('grammaire_config', v), { deep: true })

// Types proposés pour le niveau choisi (groupes vides masqués)
const typesVisibles = computed(() => TYPES
  .map(g => ({ ...g, items: g.items.filter(t => t.niv.includes(config.value.niveau)) }))
  .filter(g => g.items.length))

watch(() => config.value.niveau, niv => {
  const dispo = typesDuNiveau(niv)
  const garde = config.value.types.filter(t => dispo.includes(t))
  config.value.types = garde.length ? garde : ['verbe']
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
const bravoIdx = ref(0)
const feedbackCls = ref('')
const saisie = ref('')
const inputCls = ref('')
const reponseDonnee = ref('')
const selection = ref([])
const placees = ref([])
const inputEl = ref(null)

const question = computed(() => questions.value[idx.value])

function reinitQuestion() {
  repondu.value = false; feedbackCls.value = ''
  saisie.value = ''; inputCls.value = ''; reponseDonnee.value = ''
  selection.value = []; placees.value = []
  nextTick(() => inputEl.value?.focus())
}

function demarrer() {
  questions.value = genererQuestions(config.value.niveau, config.value.types, config.value.nb)
    .map(q => ({ ...q, _resultat: undefined, _donne: '' }))
  idx.value = 0
  bonnes.value = 0; mauvaises.value = 0
  phase.value = 'jeu'
  reinitQuestion()
}

const { mode, graine, regenerer } = useModeExercice()
// recalculée quand les réglages changent ou qu'on demande une nouvelle fiche
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche(config.value.niveau, config.value.types, config.value.nb, config.value.corrige)
})

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

// ── Réponses
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

function toggleMot(i) {
  if (repondu.value) return
  const s = selection.value
  selection.value = s.includes(i) ? s.filter(x => x !== i) : [...s, i]
}

function motClass(i) {
  const sel = selection.value.includes(i)
  if (!repondu.value) return sel ? 'choisi' : ''
  const cible = question.value.cibles.includes(i)
  if (cible && sel) return 'bonne'
  if (cible) return 'manquee'
  if (sel) return 'mauvaise'
  return ''
}

function validerClic() {
  if (repondu.value || selection.value.length === 0) return
  const q = question.value
  const sel = [...selection.value].sort((a, b) => a - b)
  const ok = sel.length === q.cibles.length && sel.every((v, k) => v === q.cibles[k])
  enregistrer(ok, sel.map(i => q.tokens[i].m).join(', '))
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
  const phrase = placees.value.map(k => q.etiquettes[k]).join(' ')
  enregistrer(phrase === q.attendu, phrase + q.fin)
}

function validerSaisie() {
  if (repondu.value || !saisie.value.trim()) return
  enregistrer(normaliser(saisie.value) === normaliser(question.value.attendu), saisie.value.trim())
}

function enregistrer(ok, donne) {
  const q = question.value
  q._resultat = ok
  q._donne = donne
  repondu.value = true
  bravoIdx.value = aleatoire(0, 3)
  if (ok) {
    bonnes.value++
    feedbackCls.value = 'ok'
    inputCls.value = 'ok'
  } else {
    mauvaises.value++
    feedbackCls.value = 'erreur'
    inputCls.value = 'erreur'
  }
}

// Message de retour calculé à l'affichage (suit la langue)
const feedbackHtml = computed(() => {
  const q = question.value
  if (!repondu.value || !q) return ''
  const expl = q.explication ? `<div class="fb-expl">${val(q.explication)}</div>` : ''
  if (q._resultat) {
    const bravo = t('bravo')
    return bravo[bravoIdx.value % bravo.length] + expl
  }
  let txt = '❌ '
  if (q.mode === 'ordre') txt += t('bonnePhrase', { r: val(q.solution) })
  else if (q.mode === 'saisie') txt += t('bonneReponseEst', { r: q.attendu })
  else if (q.mode === 'choix') txt += t('bonneReponseEst', { r: tc(q.bonne) })
  else txt += t('pasToutAFait')
  return txt + expl
})

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
  if (pct === 100) { confettis(50); return t('res100') }
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
  font-size: 1.4rem; font-weight: 600; text-align: center;
  margin-bottom: 1.5rem; line-height: 1.6; color: #222;
}
.phrase-display :deep(u) { text-decoration-thickness: 3px; text-decoration-color: var(--bleu); text-underline-offset: 4px; }
.phrase-display :deep(strong) { color: var(--bleu); }
.phrase-display :deep(em) { color: #888; font-weight: 400; font-size: .9em; }
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

/* Mots cliquables */
.mots-ligne { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: .45rem .3rem; font-size: 1.35rem; }
.mot-btn {
  font-size: inherit; font-family: inherit; font-weight: 600;
  padding: .2rem .5rem; border-radius: 8px; border: 2px dashed #cfd8e3;
  background: white; cursor: pointer; color: var(--texte); transition: all .12s;
}
.mot-btn.elide { margin-right: -.3rem; }
.mot-btn:hover:not(:disabled) { border-color: var(--bleu); }
.mot-btn.choisi  { border-style: solid; border-color: var(--bleu); background: #eef5ff; }
.mot-btn.bonne   { border-style: solid; border-color: #22c55e; background: #dcfce7; color: #15803d; }
.mot-btn.manquee { border-style: solid; border-color: #22c55e; color: #15803d; }
.mot-btn.mauvaise{ border-style: solid; border-color: var(--rouge); background: #fff5f5; color: var(--rouge); text-decoration: line-through; }
.mot-btn:disabled { cursor: default; }
.mot-ponct { font-weight: 700; }
.mot-ponct.colle { margin-left: -.25rem; }

/* Étiquettes */
.ordre-zone {
  min-height: 3.2rem; border: 2px dashed var(--gris-brd); border-radius: 10px;
  padding: .5rem; display: flex; flex-wrap: wrap; gap: .4rem; align-items: center; margin-bottom: 1rem;
}
.ordre-zone.ok     { border-color: #22c55e; background: #f0fdf4; }
.ordre-zone.erreur { border-color: var(--rouge); background: #fff5f5; }
.ordre-vide { color: #aaa; font-size: .95rem; }
.ordre-point { font-size: 1.3rem; font-weight: 700; }
.etiquettes-reserve { display: flex; flex-wrap: wrap; gap: .5rem; justify-content: center; }
.etiquette {
  font-size: 1.2rem; font-family: inherit; font-weight: 600;
  padding: .35rem .8rem; border-radius: 8px; border: 2px solid #f39c12;
  background: #fff8ec; cursor: pointer; color: var(--texte);
}
.etiquette.placee { border-color: var(--bleu); background: #eef5ff; }
.etiquette.cachee { visibility: hidden; }
.etiquette:disabled { cursor: default; }

.saisie-row { display: flex; gap: .5rem; justify-content: center; margin-bottom: 1rem; flex-wrap: wrap; }
.saisie-input {
  border: 2px solid #ccc; border-radius: 8px;
  padding: .5rem .9rem; font-size: 1.15rem; font-family: inherit; width: 16rem; max-width: 100%;
}
.saisie-input:focus { outline: none; border-color: var(--bleu); }
.saisie-input.ok    { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.saisie-input.erreur{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }

.feedback { border-radius: 8px; margin-top: .75rem; font-size: 1.05rem; }
.feedback.ok     { background: #f0fdf4; }
.feedback.erreur { background: #fff5f5; }
.feedback :deep(.fb-expl) { font-weight: 600; font-size: .92rem; color: #555; margin-top: .3rem; }

.correction-table td :deep(u) { text-decoration-thickness: 2px; }
.corr-consigne { font-size: .82rem; color: #666; }
.corr-donne { font-size: .82rem; color: var(--rouge); margin-top: .2rem; }
</style>
