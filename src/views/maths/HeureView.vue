<template>
  <div class="container">
    <h1 class="section-heading">🕐 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">
      <div class="config-section">
        <div class="config-section-title">{{ t('niveau') }}</div>
        <div class="btn-group">
          <button v-for="niv in Object.keys(NIVEAUX)" :key="niv"
            class="level-btn" :class="{ active: config.niveau === niv }"
            @click="config.niveau = niv">{{ niv.toUpperCase() }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('exercices') }}</div>
        <div class="btn-group">
          <button v-for="ex in niveau.exercices" :key="ex"
            class="level-btn" :class="{ active: config.exercices.includes(ex) }"
            @click="basculer('exercices', ex)">{{ tr(EXERCICES[ex]) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('precision') }}</div>
        <div class="btn-group">
          <button v-for="p in niveau.precisions" :key="p"
            class="level-btn" :class="{ active: config.precisions.includes(p) }"
            @click="basculer('precisions', p)">{{ tr(PRECISIONS[p]) }}</button>
        </div>
        <div class="aide-config">{{ t('aideCe1') }}</div>
      </div>

      <div class="config-section" v-if="mode === 'jouer' && config.exercices.includes('lire')">
        <div class="config-section-title">{{ t('reponseLire') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.saisie === 'choix' }" @click="config.saisie = 'choix'">{{ t('propositions4') }}</button>
          <button class="level-btn" :class="{ active: config.saisie === 'clavier' }" @click="config.saisie = 'clavier'">{{ t('jEcris') }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('aide') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.aideMinutes }" @click="config.aideMinutes = !config.aideMinutes">
            {{ config.aideMinutes ? '✓ ' : '' }}{{ t('afficherMinutes') }}
          </button>
        </div>
      </div>

      <div v-if="mode === 'jouer'" class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <template v-if="mode === 'imprimer'">
        <div class="config-section">
          <div class="config-section-title">{{ t('nbHorloges') }}</div>
          <div class="btn-group">
            <button v-for="n in [4, 8, 12]" :key="n"
              class="level-btn" :class="{ active: config.nbHorloges === n }"
              @click="config.nbHorloges = n">{{ n }}</button>
          </div>
        </div>
        <div class="config-section">
          <div class="config-section-title">{{ t('corrigeTitre') }}</div>
          <div class="btn-group">
            <button class="level-btn" :class="{ active: config.corrige }" @click="config.corrige = !config.corrige">
              {{ config.corrige ? '✓ ' : '' }}{{ t('corrigePage2') }}
            </button>
          </div>
        </div>
      </template>
    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('question', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <span v-for="(_, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok, erreur: historique[i] && !historique[i].ok }"></span>
        </div>

        <!-- (a) Lire l'heure -->
        <template v-if="q.type === 'lire'">
          <div class="consigne">{{ t('quelleHeure') }}</div>
          <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
          <div class="legende-aiguilles"><span class="leg-h">{{ t('legH') }}</span> · <span class="leg-m">{{ t('legM') }}</span></div>

          <div v-if="q.mode === 'choix'" class="choix-grille">
            <button v-for="(o, i) in q.options" :key="i" class="choix-btn"
              :class="classeChoix(i)" :disabled="repondu" @click="validerChoix(i)">{{ o.label }}</button>
          </div>
          <div v-else class="saisie-heure">
            <input ref="inputEl" class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" max="23" placeholder="?" v-model="repH" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">h</span>
            <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" max="59" placeholder="00" v-model="repM" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">min</span>
          </div>
        </template>

        <!-- (b) Placer les aiguilles -->
        <template v-else-if="q.type === 'placer'">
          <div class="consigne">
            {{ t('placeAiguilles') }}
            <strong v-if="q.consigneOrale">« {{ q.oral }} »</strong>
            <strong v-else>{{ q.ecrit }}</strong>
            <button v-if="langue !== 'br'" class="btn-ecouter" :title="t('ecouter')" @click="lire(q.oral)">🔊</button>
          </div>
          <div ref="cadranEl" class="horloge deplacable"
            @pointerdown="debutGlisser" @pointermove="glisser" @pointerup="finGlisser" @pointercancel="finGlisser"
            v-html="horlogeSvg(aiguilles.h, aiguilles.m, repondu && !dernierOk ? { h: q.h, m: q.m } : null)"></div>
          <div class="legende-aiguilles">{{ t('glisser') }}</div>
          <div class="reglages">
            <div class="reglage">
              <span class="leg-h">{{ t('petiteAiguille') }}</span>
              <div class="btn-group">
                <button class="btn btn-ghost btn-rond" :disabled="repondu" @click="ajouterHeures(-1)">−</button>
                <button class="btn btn-ghost btn-rond" :disabled="repondu" @click="ajouterHeures(1)">+</button>
              </div>
            </div>
            <div class="reglage">
              <span class="leg-m">{{ t('grandeAiguille') }}</span>
              <div class="btn-group">
                <button class="btn btn-ghost btn-rond" :disabled="repondu" @click="ajouterMinutes(-5)">−5</button>
                <button v-if="pasMinutes === 1" class="btn btn-ghost btn-rond" :disabled="repondu" @click="ajouterMinutes(-1)">−1</button>
                <button v-if="pasMinutes === 1" class="btn btn-ghost btn-rond" :disabled="repondu" @click="ajouterMinutes(1)">+1</button>
                <button class="btn btn-ghost btn-rond" :disabled="repondu" @click="ajouterMinutes(5)">+5</button>
              </div>
            </div>
          </div>
        </template>

        <!-- (c) Matin / après-midi -->
        <template v-else-if="q.type === 'journee' && q.sous === 'lire24'">
          <div class="consigne">{{ q.phrase }}<br>{{ t('quelleHeure') }} <small>{{ t('ecrisNumerique') }}</small></div>
          <div class="horloge" v-html="horlogeSvg(q.h, q.m)"></div>
          <div class="saisie-heure">
            <input ref="inputEl" class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" max="23" placeholder="?" v-model="repH" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">h</span>
            <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" max="59" placeholder="00" v-model="repM" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">min</span>
          </div>
        </template>

        <template v-else-if="q.type === 'journee' && q.sous === 'choisir'">
          <div class="consigne">{{ t('ilEst1') }}<strong>{{ q.ecrit24 }}</strong>{{ t('ilEst2') }} {{ t('quelleHorloge') }}</div>
          <div class="choix-horloges">
            <button v-for="(o, i) in q.options" :key="i" class="choix-horloge"
              :class="classeChoix(i)" :disabled="repondu" @click="validerChoix(i)">
              <span v-html="svgHorloge(o.h, o.m, { aideMinutes: false })"></span>
            </button>
          </div>
        </template>

        <!-- (d) Durées -->
        <template v-else-if="q.type === 'duree'">
          <div class="consigne" v-if="q.sous === 'apres'">
            {{ t('ilEst1') }}<strong>{{ q.ecritDebut }}</strong>{{ t('ilEst2') }}<br>
            {{ t('dans1') }}<strong>{{ q.ecritDuree }}</strong>{{ t('dans2') }}
          </div>
          <div class="consigne" v-else>
            {{ q.activite }} {{ t('commenceA') }} <strong>{{ q.ecritDebut }}</strong> {{ t('termineA') }} <strong>{{ q.ecritFin }}</strong>.<br>
            {{ t('combienDure', { pronom: q.pronom }) }}
          </div>
          <div class="horloges-duree">
            <figure>
              <div class="horloge petite" v-html="horlogeSvg(q.h, q.m)"></div>
              <figcaption>{{ q.sous === 'apres' ? t('maintenant') : t('debut') }}</figcaption>
            </figure>
            <figure v-if="q.sous === 'combien' || (repondu && !dernierOk)">
              <div class="horloge petite" v-html="horlogeSvg(q.h2, q.m2)"></div>
              <figcaption>{{ q.sous === 'apres' ? t('plusTard') : t('fin') }}</figcaption>
            </figure>
          </div>
          <div class="saisie-heure">
            <input ref="inputEl" class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" placeholder="?" v-model="repH" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">h</span>
            <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" placeholder="00" v-model="repM" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">min</span>
          </div>
        </template>

        <!-- (e) Conversions h / min / s (CE2) -->
        <template v-else-if="q.type === 'conversion'">
          <div class="consigne">{{ t('complete') }}&nbsp;: <strong>{{ q.texte.replace(/ = .*/, ' =') }}</strong></div>
          <div class="aide-config" style="text-align:center;margin-bottom:.75rem;">{{ t('rappel') }} : 1 h = 60 min · 1 min = 60 s</div>
          <div class="saisie-heure">
            <template v-for="(u, i) in q.unites" :key="u">
              <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
                min="0" placeholder="?" v-model="champs[i]" :disabled="repondu" @keydown.enter="valider">
              <span class="unite">{{ u }}</span>
            </template>
          </div>
        </template>

        <!-- (f) Emploi du temps (CE2) -->
        <template v-else-if="q.type === 'emploi'">
          <div class="consigne">{{ t('lisEmploi') }}</div>
          <table class="correction-table emploi">
            <thead><tr><th>{{ t('debut') }}</th><th>{{ t('fin') }}</th><th>{{ t('activite') }}</th></tr></thead>
            <tbody>
              <tr v-for="l in q.emploi" :key="l.debut" :class="{ recre: l.recre }">
                <td>{{ hm(l.debut) }}</td><td>{{ hm(l.fin) }}</td><td>{{ l.nom }}</td>
              </tr>
            </tbody>
          </table>
          <div class="consigne">{{ q.question }}</div>
          <div v-if="q.options" class="choix-grille">
            <button v-for="(o, i) in q.options" :key="i" class="choix-btn"
              :class="classeChoix(i)" :disabled="repondu" @click="validerChoix(i)">{{ o.label }}</button>
          </div>
          <div v-else class="saisie-heure">
            <input ref="inputEl" class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" placeholder="?" v-model="repH" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">h</span>
            <input class="exercise-input champ" :class="inputClass" type="number" inputmode="numeric"
              min="0" placeholder="00" v-model="repM" :disabled="repondu" @keydown.enter="valider">
            <span class="unite">min</span>
          </div>
        </template>

        <div class="feedback" :class="feedbackClass">
          {{ feedback }}
          <div v-if="feedbackOral" class="oral">
            « {{ feedbackOral }} »
            <button v-if="langue !== 'br'" class="btn-ecouter" :title="t('ecouter')" @click="lire(feedbackOral)">🔊</button>
          </div>
        </div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!repondu">
            <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
            <button v-if="!estChoix" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
          </template>
          <button v-else-if="!dernierOk" class="btn btn-primary" @click="suivant">{{ t('suivant') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>{{ t('colQuestion') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('bonneReponse') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>
              <span v-if="h.horloge" class="mini-horloge" v-html="svgHorloge(h.horloge.h, h.horloge.m, { aideMinutes: false })"></span>
              {{ h.texte }}
            </td>
            <td>{{ h.donne }}</td>
            <td class="mot-attendu">{{ h.attendu }}</td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onUnmounted, watch } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useTTS } from '../../composables/useTTS'
import { useI18n } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, tr, langue } = useI18n({
  fr: {
    titre: "Lire l'heure",
    precision: 'Précision',
    aideCe1: "Au CE1 : heures pile, demi-heures et quarts d'heure. Les 5 minutes sont un bonus.",
    reponseLire: "Réponse (lire l'heure)",
    propositions4: '4 propositions',
    jEcris: "J'écris l'heure",
    aide: 'Aide',
    afficherMinutes: 'Afficher les minutes autour du cadran',
    nbHorloges: 'Horloges par exercice',
    corrigeTitre: 'Corrigé',
    corrigePage2: 'Ajouter le corrigé en page 2',
    quelleHeure: 'Quelle heure est-il ?',
    legH: 'petite aiguille = heures',
    legM: 'grande aiguille = minutes',
    placeAiguilles: 'Place les aiguilles pour afficher',
    glisser: 'Fais glisser les aiguilles avec le doigt, ou utilise les boutons.',
    petiteAiguille: 'Petite aiguille (heures)',
    grandeAiguille: 'Grande aiguille (minutes)',
    ecrisNumerique: '(écris-la comme sur une horloge numérique)',
    ilEst1: 'Il est ',
    ilEst2: '.',
    quelleHorloge: 'Quelle horloge indique cette heure ?',
    dans1: 'Dans ',
    dans2: ', quelle heure sera-t-il ?',
    commenceA: 'commence à',
    termineA: 'et se termine à',
    combienDure: 'Combien de temps dure-t-{pronom} ?',
    maintenant: 'Maintenant',
    plusTard: 'Plus tard',
    debut: 'Début',
    fin: 'Fin',
    activite: 'Activité',
    complete: 'Complète',
    rappel: 'Rappel',
    lisEmploi: "Lis l'emploi du temps.",
    colQuestion: 'Question',
  },
  br: {
    titre: 'Lenn an eur',
    precision: 'Resisded', // br: à relire
    aideCe1: "Er CE1 : an eurioù rik, an hanter-eurioù hag ar c'hardoù-eur. Ar 5 munut a zo ur bonus.", // br: à relire
    reponseLire: 'Respont (lenn an eur)',
    propositions4: '4 kinnig',
    jEcris: 'Skrivañ a ran an eur',
    aide: 'Skoazell',
    afficherMinutes: "Diskouez ar munutoù en-dro d'an horolaj",
    nbHorloges: 'Horolajoù dre boelladenn', // br: à relire
    corrigeTitre: 'Reizhadenn',
    corrigePage2: 'Ouzhpennañ ar reizhadenn war ar bajenn 2', // br: à relire
    quelleHeure: 'Pe eur eo ?',
    legH: 'nadoz vihan = eurioù',
    legM: 'nadoz vras = munutoù',
    placeAiguilles: 'Lak an nadozioù evit diskouez',
    glisser: 'Rikla an nadozioù gant da viz, pe implij ar boutonoù.', // br: à relire
    petiteAiguille: 'Nadoz vihan (eurioù)',
    grandeAiguille: 'Nadoz vras (munutoù)',
    ecrisNumerique: '(skriv anezhi evel war un horolaj niverel)',
    ilEst1: '',
    ilEst2: ' eo.',
    quelleHorloge: 'Peseurt horolaj a ziskouez an eur-se ?',
    dans1: 'A-benn ',
    dans2: ', pe eur e vo ?',
    commenceA: 'a grog da',
    termineA: 'hag a echu da',
    combienDure: 'Pegeit e pad ?',
    maintenant: 'Bremañ',
    plusTard: "Diwezhatoc'h",
    debut: 'Deroù',
    fin: 'Fin',
    activite: 'Obererezh',
    complete: 'Leunia',
    rappel: "Dalc'h soñj",
    lisEmploi: "Lenn an implij-amzer.",
    colQuestion: 'Goulenn',
  },
})
const enBr = () => langue.value === 'br'

// #region logique (fonctions pures, testées hors Vue)

const EXERCICES = {
  lire: { fr: "Lire l'heure", br: 'Lenn an eur' },
  placer: { fr: 'Placer les aiguilles', br: 'Lakaat an nadozioù' },
  journee: { fr: 'Matin / après-midi', br: 'Mintin / goude merenn' },
  duree: { fr: 'Durées', br: 'Padelezhioù' }, // br: à relire
  conversion: { fr: 'h, min, s', br: 'h, min, s' },
  emploi: { fr: 'Emploi du temps', br: 'Implij-amzer' },
}

const PRECISIONS = {
  heure: { fr: 'Heures pile', br: 'Eurioù rik' }, // br: à relire
  demi: { fr: 'Demi-heures', br: 'Hanter-eurioù' },
  quart: { fr: "Quarts d'heure", br: "Kardoù-eur" },
  cinq: { fr: '5 minutes', br: '5 munut' },
  minute: { fr: 'À la minute près', br: 'Betek ar munut' }, // br: à relire
}

const MINUTES_PAR_PRECISION = {
  heure: [0],
  demi: [30],
  quart: [15, 45],
  cinq: [5, 10, 20, 25, 35, 40, 50, 55],
  minute: Array.from({ length: 60 }, (_, i) => i).filter(i => i % 5 !== 0),
}

// Activités (avec le genre, pour « il dure » / « elle dure ») et créneaux plausibles (heures sur 24 h).
// br : noms bretons à relire
const ACTIVITES = [
  { nom: 'Le dessin animé', nomBr: 'An tresadenn-vev', pronom: 'il', debut: [8, 18], dureeMax: 60 },
  { nom: 'Le film', nomBr: 'Ar film', pronom: 'il', debut: [14, 17], dureeMax: 150 },
  { nom: 'La promenade', nomBr: 'Ar valeadenn', pronom: 'elle', debut: [9, 17], dureeMax: 180 },
  { nom: 'Le match de foot', nomBr: 'Ar match mell-droad', pronom: 'il', debut: [9, 17], dureeMax: 120 },
  { nom: 'La sieste', nomBr: "Ar c'housk-kreisteiz", pronom: 'elle', debut: [13, 15], dureeMax: 120 },
  { nom: 'Le pique-nique', nomBr: 'Ar piknik', pronom: 'il', debut: [11, 13], dureeMax: 120 },
  { nom: 'La séance de piscine', nomBr: 'An neuial', pronom: 'elle', debut: [9, 17], dureeMax: 90 },
  { nom: 'Le goûter', nomBr: 'Ar verenn-vihan', pronom: 'il', debut: [16, 17], dureeMax: 30 },
  { nom: "L'atelier de peinture", nomBr: 'An atalier livañ', pronom: 'il', debut: [9, 16], dureeMax: 120 },
]

const MATIERES = {
  fr: ['Lecture', 'Mathématiques', 'Anglais', 'Sport', 'Musique', 'Sciences', 'Dessin', 'Écriture', 'Géographie'],
  br: ['Lenn', 'Matematikoù', 'Saozneg', 'Sport', 'Sonerezh', 'Skiantoù', 'Tresañ', 'Skrivañ', 'Douaroniezh'],
}
const RECRE = { fr: 'Récréation', br: 'Diskuizh' }

// Données par niveau : pour ajouter un niveau, il suffit d'ajouter une entrée ici.
const NIVEAUX = {
  ce1: {
    exercices: ['lire', 'placer', 'journee', 'duree'],
    exercicesDefaut: ['lire'],
    precisions: ['heure', 'demi', 'quart', 'cinq'],
    precisionsDefaut: ['heure', 'demi', 'quart'],
    // durées proposées (en minutes)
    durees: [15, 30, 45, 60, 90, 120, 180],
    dureesCinq: [5, 10, 20],
    dureesMinute: [],
    dureeMax: 180,
    conversions: [],
  },
  ce2: {
    exercices: ['lire', 'placer', 'journee', 'duree', 'conversion', 'emploi'],
    exercicesDefaut: ['lire', 'duree', 'conversion'],
    precisions: ['heure', 'demi', 'quart', 'cinq', 'minute'],
    precisionsDefaut: ['quart', 'cinq', 'minute'],
    durees: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 180, 210],
    dureesCinq: [5, 10, 20, 25, 35, 40, 50, 55, 70, 80, 100, 110, 125, 140, 160],
    dureesMinute: [12, 18, 27, 33, 48, 52, 64, 72, 87, 96],
    dureeMax: 240,
    // 1 h = 60 min, 1 min = 60 s
    conversions: ['h-min', 'hmin-min', 'min-hmin', 'min-s', 'minsec-s', 's-min'],
  },
}

const HEURES_MOTS = ['zéro', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf', 'vingt',
  'vingt et une', 'vingt-deux', 'vingt-trois']
const UNITES_MOTS = ['', 'une', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf']
const DIZAINES_MOTS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante']

// Minutes en lettres (1 → 59) : « une », « vingt et une », « quarante-sept »
function minutesMots(n) {
  if (n < 20) return UNITES_MOTS[n]
  const d = Math.floor(n / 10), u = n % 10
  if (u === 0) return DIZAINES_MOTS[d]
  if (u === 1) return DIZAINES_MOTS[d] + ' et une'
  return DIZAINES_MOTS[d] + '-' + UNITES_MOTS[u]
}

function pioche(t) { return t[aleatoire(0, t.length - 1)] }
function deux(n) { return String(n).padStart(2, '0') }

// « 3 h », « 3 h 05 », « 15 h 30 »
function ecrit(h, m) { return m === 0 ? `${h} h` : `${h} h ${deux(m)}` }

// « 1 h 30 min », « 2 h », « 45 min »
function ecritDuree(d) {
  const h = Math.floor(d / 60), m = d % 60
  if (h && m) return `${h} h ${m} min`
  return h ? `${h} h` : `${m} min`
}

// Heure sur un cadran (1 → 12) dite « à l'ancienne » : « trois heures et quart »,
// « quatre heures moins le quart ». 12 se dit « midi » (ou « minuit »).
// À la minute près (CE2), on dit « trois heures quarante-sept » au-delà de la demie.
function nomHeure12(h) {
  if (h === 12) return 'midi'
  return HEURES_MOTS[h] + (h === 1 ? ' heure' : ' heures')
}
// Breton (br: à relire) : « teir eur ha kard », « div eur hanter », « peder eur nemet kard »,
// « teir eur ha 20 munut », « peder eur nemet 20 munut » (minutes en chiffres, nom au singulier).
const HEURES_BR = ['', 'un eur', 'div eur', 'teir eur', 'peder eur', 'pemp eur', "c'hwec'h eur", 'seizh eur',
  'eizh eur', 'nav eur', 'dek eur', 'unnek eur', 'kreisteiz']
function oral12Br(h, m) {
  const suivante = (h % 12) + 1
  if (m === 0) return HEURES_BR[h]
  if (m === 15) return HEURES_BR[h] + ' ha kard'
  if (m === 30) return HEURES_BR[h] + ' hanter'
  if (m === 45) return HEURES_BR[suivante] + ' nemet kard'
  if (m < 30 || m % 5 !== 0) return `${HEURES_BR[h]} ha ${m} munut`
  return `${HEURES_BR[suivante]} nemet ${60 - m} munut`
}
function oral12(h, m) {
  if (enBr()) return oral12Br(h, m)
  const suivante = (h % 12) + 1
  if (m === 0) return nomHeure12(h)
  if (m === 15) return nomHeure12(h) + ' et quart'
  if (m === 30) return nomHeure12(h) + (h === 12 ? ' et demi' : ' et demie')
  if (m === 45) return nomHeure12(suivante) + ' moins le quart'
  if (m < 30 || m % 5 !== 0) return nomHeure12(h) + ' ' + minutesMots(m)
  return nomHeure12(suivante) + ' moins ' + minutesMots(60 - m)
}

// « trois heures et quart de l'après-midi » ; pas de suffixe si l'on dit « midi » (11 h 45 → « midi moins le quart »)
function oralMoment(h, m, moment) {
  const o = oral12(h, m)
  if (enBr()) return o.startsWith('kreisteiz') ? o : `${o} ${moment.suffixeBr}`
  return o.startsWith('midi') ? o : `${o} ${moment.suffixe}`
}

// Heure sur 24 h : « quinze heures trente »
function oral24(h, m) {
  const base = h === 0 ? 'minuit' : h === 12 ? 'midi' : HEURES_MOTS[h] + (h === 1 ? ' heure' : ' heures')
  return m === 0 ? base : base + ' ' + minutesMots(m)
}

function minutesDisponibles(precisions) {
  return [...new Set(precisions.flatMap(p => MINUTES_PAR_PRECISION[p] || []))].sort((a, b) => a - b)
}

function dureesDisponibles(niv, precisions) {
  const fin = precisions.includes('cinq') || precisions.includes('minute')
  const ok = d => {
    const r = d % 60
    if (r % 5 !== 0) return precisions.includes('minute')
    if (r === 0) return true
    if (r === 30) return precisions.includes('demi') || fin
    if (r === 15 || r === 45) return precisions.includes('quart') || fin
    return fin
  }
  const liste = [...niv.durees,
    ...(precisions.includes('cinq') || precisions.includes('minute') ? niv.dureesCinq : []),
    ...(precisions.includes('minute') ? niv.dureesMinute : [])]
  const res = [...new Set(liste.filter(ok))]
  return res.length ? res : [60, 120]
}

const egal = (a, b) => a.h === b.h && a.m === b.m
const h12 = x => ((x - 1 + 120) % 12) + 1

// Distracteurs plausibles pour une heure (h 1..12, m) : erreurs typiques d'enfants.
function distracteurs(h, m, pool) {
  const cands = [
    { h: h12(h + 1), m },                      // « 2 h 45 » lu « 3 h 45 »
    { h: h12(h - 1), m },
    { h: m === 0 ? 12 : m / 5, m: (h * 5) % 60 }, // aiguilles inversées
    { h, m: (m + 30) % 60 },
    { h, m: (60 - m) % 60 },
    { h: h12(h + 1), m: (60 - m) % 60 },       // « moins le quart » ↔ « et quart »
    { h, m: (m + 5) % 60 },
  ].filter(c => Number.isInteger(c.h) && c.h >= 1 && c.h <= 12 && !egal(c, { h, m }))
  const uniques = []
  for (const c of melanger(cands)) if (!uniques.some(u => egal(u, c))) uniques.push(c)
  let essais = 0
  while (uniques.length < 3 && essais++ < 100) {
    const c = { h: aleatoire(1, 12), m: pioche(pool) }
    if (!egal(c, { h, m }) && !uniques.some(u => egal(u, c))) uniques.push(c)
  }
  return uniques.slice(0, 3)
}

const MOMENTS = [
  // br: à relire (« eizh eur vintin », « teir eur goude merenn », « eizh eur noz »)
  { nom: 'matin', phrase: "C'est le matin.", suffixe: 'du matin', phraseBr: 'Mintin eo.', suffixeBr: 'vintin', heures: [7, 8, 9, 10, 11], decalage: 0 },
  { nom: 'apres-midi', phrase: "C'est l'après-midi.", suffixe: "de l'après-midi", phraseBr: 'Goude merenn eo.', suffixeBr: 'goude merenn', heures: [1, 2, 3, 4, 5], decalage: 12 },
  { nom: 'soir', phrase: "C'est le soir.", suffixe: 'du soir', phraseBr: 'Noz eo.', suffixeBr: 'noz', heures: [6, 7, 8, 9, 10], decalage: 12 },
]

// Emploi du temps d'une matinée ou d'un après-midi : créneaux consécutifs.
function genererEmploi(niv) {
  const matin = Math.random() < 0.6
  let t = matin ? 8 * 60 + 30 : 13 * 60 + 30
  const pas = niv.precisions.includes('minute') ? [30, 45, 60, 40, 50] : [30, 45, 60]
  const noms = melanger(enBr() ? MATIERES.br : MATIERES.fr)
  const lignes = []
  for (let i = 0; i < 4; i++) {
    const d = pioche(pas)
    lignes.push({ nom: noms[i], debut: t, fin: t + d })
    t += d
    if (i === 1) { lignes.push({ nom: enBr() ? RECRE.br : RECRE.fr, recre: true, debut: t, fin: t + 15 }); t += 15 }
  }
  return lignes
}
const hm = t => ecrit(Math.floor(t / 60), t % 60)

function genererConversion(niv) {
  const k = pioche(niv.conversions)
  if (k === 'h-min') { const h = aleatoire(1, 4); return { k, texte: `${h} h = ? min`, unites: ['min'], valeurs: [h * 60] } }
  if (k === 'hmin-min') {
    const h = aleatoire(1, 3), m = pioche([5, 10, 15, 20, 30, 40, 45, 50])
    return { k, texte: `${h} h ${m} min = ? min`, unites: ['min'], valeurs: [h * 60 + m] }
  }
  if (k === 'min-hmin') {
    const t = pioche([70, 75, 80, 90, 100, 110, 120, 130, 135, 150, 180, 200])
    return { k, texte: `${t} min = ? h ? min`, unites: ['h', 'min'], valeurs: [Math.floor(t / 60), t % 60] }
  }
  if (k === 'min-s') { const m = aleatoire(1, 5); return { k, texte: `${m} min = ? s`, unites: ['s'], valeurs: [m * 60] } }
  if (k === 'minsec-s') {
    const m = aleatoire(1, 2), s = pioche([10, 15, 20, 30, 45])
    return { k, texte: `${m} min ${s} s = ? s`, unites: ['s'], valeurs: [m * 60 + s] }
  }
  const s = pioche([60, 120, 180, 240, 300])
  return { k, texte: `${s} s = ? min`, unites: ['min'], valeurs: [s / 60] }
}

function genererQuestion(cfg) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const types = cfg.exercices.filter(e => niv.exercices.includes(e))
  const type = pioche(types.length ? types : ['lire'])
  const precisions = cfg.precisions.filter(p => niv.precisions.includes(p))
  const pool = minutesDisponibles(precisions.length ? precisions : ['heure'])

  if (type === 'lire') {
    const h = aleatoire(1, 12), m = pioche(pool)
    const q = { type, cle: `lire-${h}-${m}`, h, m, mode: cfg.saisie === 'clavier' ? 'clavier' : 'choix',
      texte: enBr() ? 'Pe eur eo ?' : 'Quelle heure est-il ?', attendu: `${ecrit(h, m)} (${oral12(h, m)})`, oral: oral12(h, m) }
    if (q.mode === 'choix') {
      const enLettres = Math.random() < 0.4
      const opts = melanger([{ h, m }, ...distracteurs(h, m, pool)])
      q.options = opts.map(o => ({ ...o, label: enLettres ? oral12(o.h, o.m) : ecrit(o.h, o.m) }))
      q.bonne = opts.findIndex(o => egal(o, { h, m }))
    }
    return q
  }

  if (type === 'placer') {
    const h = aleatoire(1, 12), m = pioche(pool)
    let depart
    do { depart = { h: aleatoire(0, 11), m: aleatoire(0, 11) * 5 } } while (depart.h === h % 12 && depart.m === m)
    return { type, cle: `placer-${h}-${m}`, h, m, depart, consigneOrale: Math.random() < 0.5,
      ecrit: ecrit(h, m), oral: oral12(h, m),
      texte: `${enBr() ? 'Lakaat an nadozioù' : 'Placer les aiguilles'} : ${ecrit(h, m)}`, attendu: `${ecrit(h, m)} (${oral12(h, m)})` }
  }

  if (type === 'journee') {
    const moment = pioche(Math.random() < 0.25 ? [MOMENTS[0]] : MOMENTS.slice(1))
    const h = pioche(moment.heures), m = pioche(pool)
    const h24 = h + moment.decalage
    const oral = oralMoment(h, m, moment)
    const sous = Math.random() < 0.5 ? 'lire24' : 'choisir'
    const q = { type, sous, cle: `journee-${sous}-${h24}-${m}`, h, m, h24, ecrit24: ecrit(h24, m),
      phrase: enBr() ? moment.phraseBr : moment.phrase, oral,
      attendu: `${ecrit(h24, m)} (${oral})` }
    if (sous === 'lire24') {
      q.texte = enBr() ? `${moment.phraseBr} Pe eur eo ?` : `${moment.phrase} Quelle heure est-il ?`
    } else {
      q.texte = enBr() ? `Peseurt horolaj a ziskouez ${ecrit(h24, m)} ?` : `Quelle horloge indique ${ecrit(h24, m)} ?`
      const cands = [
        { h: h12(h + 2), m },          // « 16 h » confondu avec « 6 h »
        { h: h12(h + 1), m },
        { h: h12(h - 1), m },
        { h, m: (m + 30) % 60 },
      ].filter(c => !egal(c, { h, m }))
      const uniques = []
      for (const c of cands) if (!uniques.some(u => egal(u, c))) uniques.push(c)
      const opts = melanger([{ h, m }, ...uniques.slice(0, 3)])
      q.options = opts
      q.bonne = opts.findIndex(o => egal(o, { h, m }))
    }
    return q
  }

  if (type === 'conversion') {
    const c = genererConversion(niv)
    return { type, cle: `conv-${c.texte}`, ...c,
      attendu: c.texte.replace(/\?\s*h\s*\?\s*min/, `${c.valeurs[0]} h ${c.valeurs[1]} min`).replace('?', c.valeurs[0]) }
  }

  if (type === 'emploi') {
    const emploi = genererEmploi(niv)
    const cours = emploi.filter(l => !l.recre)
    const sous = pioche(['debut', 'duree', 'quoi'])
    const l = pioche(sous === 'duree' ? emploi : cours)
    const q = { type, sous, emploi, cle: `emploi-${sous}-${l.nom}-${l.debut}-${l.fin}` }
    if (sous === 'debut') {
      q.question = enBr() ? `Da bet eur e krog ar gentel « ${l.nom} » ?` : `À quelle heure commence la séance de ${l.nom.toLowerCase()} ?`
      q.h24 = Math.floor(l.debut / 60); q.m = l.debut % 60
      q.attendu = hm(l.debut)
    } else if (sous === 'duree') {
      q.question = enBr()
        ? (l.recre ? 'Pegeit e pad an diskuizh ?' : `Pegeit e pad ar gentel « ${l.nom} » ?`)
        : (l.recre ? 'Combien de temps dure la récréation ?' : `Combien de temps dure la séance de ${l.nom.toLowerCase()} ?`)
      q.d = l.fin - l.debut
      q.attendu = ecritDuree(q.d)
    } else {
      const t = l.debut + aleatoire(1, Math.floor((l.fin - l.debut) / 5) - 1) * 5
      q.question = enBr() ? `Petra a vez graet da ${hm(t)} ?` : `Que fait-on à ${hm(t)} ?`
      const autres = melanger(emploi.filter(x => x.nom !== l.nom).map(x => x.nom)).slice(0, 3)
      q.options = melanger([l.nom, ...autres]).map(n => ({ label: n }))
      q.bonne = q.options.findIndex(o => o.label === l.nom)
      q.attendu = l.nom
    }
    q.texte = q.question
    return q
  }

  // Durées : départ à une heure plausible (8 h → 11 h ou 13 h → 18 h), fin avant 19 h.
  const d = pioche(dureesDisponibles(niv, precisions).filter(x => x <= niv.dureeMax))
  const departsPour = ([hMin, hMax]) => {
    const res = []
    for (let h = hMin; h <= hMax; h++) {
      if (h === 12) continue
      for (const m of pool) if (h * 60 + m + d <= 19 * 60) res.push({ h, m })
    }
    return res
  }
  const acts = ACTIVITES.filter(a => a.dureeMax >= d && departsPour(a.debut).length)
  const sous = Math.random() < 0.6 || !acts.length ? 'apres' : 'combien'
  const act = sous === 'combien' ? pioche(acts) : null
  const { h: h24, m } = pioche(departsPour(act ? act.debut : [8, 18]))
  const debut = h24 * 60 + m
  const fin = debut + d
  const h24f = Math.floor(fin / 60), m2 = fin % 60
  const q = { type, sous, cle: `duree-${sous}-${debut}-${d}`, h: h12(h24), m, h2: h12(h24f), m2, h24, h24f, d,
    ecritDebut: ecrit(h24, m), ecritFin: ecrit(h24f, m2), ecritDuree: ecritDuree(d) }
  if (sous === 'apres') {
    q.texte = enBr() ? `${ecrit(h24, m)} eo. A-benn ${ecritDuree(d)}, pe eur e vo ?` : `Il est ${ecrit(h24, m)}. Dans ${ecritDuree(d)}, quelle heure sera-t-il ?`
    q.attendu = ecrit(h24f, m2)
  } else {
    q.activite = enBr() ? act.nomBr : act.nom
    q.pronom = act.pronom
    q.texte = enBr()
      ? `${act.nomBr} a grog da ${ecrit(h24, m)} hag a echu da ${ecrit(h24f, m2)}. Pegeit e pad ?`
      : `${act.nom} commence à ${ecrit(h24, m)} et se termine à ${ecrit(h24f, m2)}. Combien de temps dure-t-${act.pronom} ?`
    q.attendu = ecritDuree(d)
  }
  return q
}

function genererSansRepetition(cfg, nb) {
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 60) {
    essais++
    const q = genererQuestion(cfg)
    if (!vus.has(q.cle)) { vus.add(q.cle); result.push(q) }
  }
  return result
}

// rep : { choix } | { h, m } (saisie, nombres ou chaînes) | { aiguilles: { h: 0..11, m } }
function verifier(q, rep) {
  if (rep.choix !== undefined) return rep.choix === q.bonne
  if (rep.aiguilles) return rep.aiguilles.h === q.h % 12 && rep.aiguilles.m === q.m
  const vide = v => v === '' || v === null || v === undefined
  if (vide(rep.h) && vide(rep.m)) return false
  const h = vide(rep.h) ? 0 : Number(rep.h)
  const m = vide(rep.m) ? 0 : Number(rep.m)
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || m < 0) return false
  if (q.type === 'conversion') {
    if (q.valeurs.length === 1) return h === q.valeurs[0]
    return h === q.valeurs[0] && m === q.valeurs[1]
  }
  if (q.type === 'lire') return m === q.m && h % 12 === q.h % 12 && h <= 23 // 3 h 15 ou 15 h 15
  if (q.type === 'journee') return m === q.m && h === q.h24
  if (q.type === 'emploi' && q.sous === 'debut') return m === q.m && h === q.h24
  if (q.type === 'duree' && q.sous === 'apres') return m === q.m2 && h % 12 === q.h24f % 12 && h <= 23
  if (q.type === 'duree' || q.type === 'emploi') return m < 60 && h * 60 + m === q.d || (h === 0 && m === q.d)
  return false
}

// Horloge analogique en SVG (chaîne). h : 0..23 (seul h % 12 compte), m : 0..59.
function svgHorloge(h, m, { aiguilles = true, aideMinutes = false, fantome = null, taille = null, impression = false } = {}) {
  const R = 100
  const ext = aideMinutes ? 122 : 104
  const pt = (angle, r) => {
    const a = angle * Math.PI / 180
    return [+(r * Math.sin(a)).toFixed(2), +(-r * Math.cos(a)).toFixed(2)]
  }
  const encre = '#2c3e50'
  const couleurH = impression ? '#111' : '#c0392b'
  const couleurM = impression ? '#111' : '#1a5fb4'
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-ext} ${-ext} ${2 * ext} ${2 * ext}"`
    + (taille ? ` width="${taille}" height="${taille}"` : ' width="100%" height="100%"')
    + ` role="img" aria-label="${enBr() ? 'horolaj' : 'horloge'}">`
  s += `<circle r="${R}" fill="${impression ? '#fff' : '#fffdf5'}" stroke="${encre}" stroke-width="5"/>`
  // graduations des minutes (60) et des heures (12)
  for (let i = 0; i < 60; i++) {
    const heure = i % 5 === 0
    const [x1, y1] = pt(i * 6, heure ? 80 : 87)
    const [x2, y2] = pt(i * 6, 94)
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${encre}" stroke-width="${heure ? 3.5 : 1.3}" stroke-linecap="round"/>`
  }
  for (let n = 1; n <= 12; n++) {
    const [x, y] = pt(n * 30, 66)
    s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="19" font-weight="700" fill="${encre}">${n}</text>`
  }
  if (aideMinutes) {
    for (let n = 0; n < 12; n++) {
      const [x, y] = pt(n * 30, 113)
      s += `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-family="Arial, sans-serif" font-size="11" font-weight="700" fill="${couleurM}">${n * 5}</text>`
    }
  }
  const aiguille = (angle, long, larg, coul, opacite = 1) => {
    const [x, y] = pt(angle, long)
    const [xq, yq] = pt(angle + 180, 12)
    return `<line x1="${xq}" y1="${yq}" x2="${x}" y2="${y}" stroke="${coul}" stroke-width="${larg}" stroke-linecap="round" opacity="${opacite}"/>`
  }
  const angleH = (hh, mm) => (hh % 12) * 30 + mm * 0.5
  if (fantome) {
    s += aiguille(angleH(fantome.h, fantome.m), 48, 9, '#27ae60', 0.55)
    s += aiguille(fantome.m * 6, 78, 6, '#27ae60', 0.55)
  }
  if (aiguilles) {
    s += aiguille(angleH(h, m), 48, 9, couleurH)
    s += aiguille(m * 6, 78, 5, couleurM)
  }
  s += `<circle r="6" fill="${encre}"/></svg>`
  return s
}

// #endregion

const { lire } = useTTS()

const DEFAUT = { niveau: 'ce1', exercices: NIVEAUX.ce1.exercicesDefaut, precisions: NIVEAUX.ce1.precisionsDefaut, saisie: 'choix', aideMinutes: true, nbQ: 10, nbHorloges: 8, corrige: true }
const config = ref({ ...DEFAUT, ...charger('heure_config', {}) })
if (!NIVEAUX[config.value.niveau]) config.value.niveau = 'ce1'
if (![4, 8, 12].includes(config.value.nbHorloges)) config.value.nbHorloges = 8
watch(config, v => sauvegarder('heure_config', v), { deep: true })

const niveau = computed(() => NIVEAUX[config.value.niveau] || NIVEAUX.ce1)

// Changement de niveau : on garde ce qui existe dans le nouveau niveau, sinon ses valeurs par défaut.
watch(() => config.value.niveau, () => {
  const niv = niveau.value
  const ex = config.value.exercices.filter(e => niv.exercices.includes(e))
  config.value.exercices = ex.length ? ex : [...niv.exercicesDefaut]
  config.value.precisions = [...niv.precisionsDefaut]
})

function basculer(champ, val) {
  const t = config.value[champ]
  if (t.includes(val)) {
    if (t.length === 1) return
    config.value[champ] = t.filter(x => x !== val)
  } else {
    config.value[champ] = [...t, val]
  }
}

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const repH = ref('')
const repM = ref('')
const choixDonne = ref(null)
const repondu = ref(false)
const dernierOk = ref(false)
const feedback = ref('')
const feedbackOral = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const inputEl = ref(null)
const cadranEl = ref(null)
const aiguilles = ref({ h: 0, m: 0 })
let minuteur = null

const q = computed(() => questions.value[idx.value])
const champs = ref(['', ''])
const pasMinutes = computed(() =>
  niveau.value.precisions.includes('minute') && config.value.precisions.includes('minute') ? 1 : 5)
const estChoix = computed(() => q.value && (q.value.options !== undefined))

function horlogeSvg(h, m, fantome = null) {
  return svgHorloge(h, m, { aideMinutes: config.value.aideMinutes, fantome })
}

function demarrer() {
  clearTimeout(minuteur)
  questions.value = genererSansRepetition(config.value, config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  afficherQuestion()
}

function quitter() {
  clearTimeout(minuteur)
  phase.value = 'config'
}

function afficherQuestion() {
  repH.value = ''; repM.value = ''; champs.value = ['', '']; choixDonne.value = null
  repondu.value = false; dernierOk.value = false
  feedback.value = ''; feedbackOral.value = ''; feedbackClass.value = ''; inputClass.value = ''
  if (q.value?.type === 'placer') aiguilles.value = { ...q.value.depart }
  nextTick(() => (inputEl.value || document.querySelector('.exercise-box input:not([disabled])'))?.focus?.())
}

function classeChoix(i) {
  if (!repondu.value) return ''
  if (i === q.value.bonne) return 'ok'
  if (i === choixDonne.value) return 'erreur'
  return 'grise'
}

function validerChoix(i) {
  if (repondu.value) return
  choixDonne.value = i
  const o = q.value.options[i]
  const donne = o.label ?? ecrit(o.h, o.m)
  terminer(verifier(q.value, { choix: i }), donne)
}

function valider() {
  if (repondu.value) return
  const question = q.value
  if (question.type === 'placer') {
    const { h, m } = aiguilles.value
    terminer(verifier(question, { aiguilles: aiguilles.value }), ecrit(h === 0 ? 12 : h, m))
    return
  }
  if (question.type === 'conversion') {
    if (champs.value.slice(0, question.unites.length).every(v => v === '')) return
    const donne = question.unites.map((u, i) => `${champs.value[i] || 0} ${u}`).join(' ')
    terminer(verifier(question, { h: champs.value[0], m: champs.value[1] }), donne)
    return
  }
  if (repH.value === '' && repM.value === '') return
  const enDuree = (question.type === 'duree' && question.sous === 'combien') || (question.type === 'emploi' && question.sous === 'duree')
  const donne = enDuree
    ? `${repH.value || 0} h ${repM.value || 0} min`
    : `${repH.value || 0} h ${deux(+repM.value || 0)}`
  terminer(verifier(question, { h: repH.value, m: repM.value }), donne)
}

function passer() {
  if (repondu.value) return
  terminer(false, t('passe'))
}

function terminer(ok, donne) {
  const question = q.value
  repondu.value = true
  dernierOk.value = ok
  inputClass.value = ok ? 'ok' : 'erreur'
  feedbackClass.value = ok ? 'ok' : 'erreur'
  if (ok) {
    feedback.value = pioche(t('bravo'))
    bonnes.value++
  } else {
    mauvaises.value++
    const br = enBr()
    if (question.type === 'duree' && question.sous === 'combien') feedback.value = br ? `❌ Padout a ra ${question.attendu}.` : `❌ ${question.pronom === 'elle' ? 'Elle' : 'Il'} dure ${question.attendu}.`
    else if (question.type === 'conversion') feedback.value = `❌ ${question.attendu}`
    else if (question.type === 'emploi') feedback.value = `❌ ${t('bonneReponse')} : ${question.attendu}`
    else if (question.type === 'duree') feedback.value = br ? `❌ ${question.attendu} e vo.` : `❌ Il sera ${question.attendu}.`
    else if (question.type === 'journee') feedback.value = `❌ ${t('bonneReponse')} : ${ecrit(question.h24, question.m)}`
    else if (question.type === 'placer') feedback.value = br ? `❌ Sell ouzh an nadozioù gwer : ${question.ecrit}` : `❌ Regarde les aiguilles vertes : ${question.ecrit}`
    else feedback.value = br ? `❌ ${ecrit(question.h, question.m)} eo.` : `❌ Il est ${ecrit(question.h, question.m)}`
  }
  // br : pas d'heure « sur 24 h » dite en lettres, seulement l'oral du cadran (br: à relire)
  if (question.type === 'journee') feedbackOral.value = enBr() ? question.oral : `${oral24(question.h24, question.m)}, ou ${question.oral}`
  else if (question.oral) feedbackOral.value = question.oral

  const horloge = ['lire', 'journee', 'duree'].includes(question.type) ? { h: question.h, m: question.m } : null
  historique.value.push({ texte: question.texte, donne, attendu: question.attendu, ok, horloge })
  if (ok) minuteur = setTimeout(suivant, 1600)
}

function suivant() {
  clearTimeout(minuteur)
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else afficherQuestion()
}

// ── Aiguilles : boutons ──
function ajouterHeures(n) {
  aiguilles.value = { ...aiguilles.value, h: (aiguilles.value.h + n + 12) % 12 }
}
function ajouterMinutes(n) {
  let { h, m } = aiguilles.value
  m += n
  if (m >= 60) { m -= 60; h = (h + 1) % 12 }
  if (m < 0) { m += 60; h = (h + 11) % 12 }
  aiguilles.value = { h, m }
}

// ── Aiguilles : glisser ──
let aiguilleTenue = null
function angleDepuis(e) {
  const r = cadranEl.value.getBoundingClientRect()
  const dx = e.clientX - (r.left + r.width / 2)
  const dy = e.clientY - (r.top + r.height / 2)
  const a = Math.atan2(dx, -dy) * 180 / Math.PI
  return { angle: (a + 360) % 360, dist: Math.hypot(dx, dy) / (r.width / 2) }
}
const ecart = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d }

function debutGlisser(e) {
  if (repondu.value) return
  const { angle, dist } = angleDepuis(e)
  const { h, m } = aiguilles.value
  const eH = ecart(angle, h * 30 + m / 2), eM = ecart(angle, m * 6)
  if (Math.abs(eH - eM) < 20) aiguilleTenue = dist < 0.5 ? 'h' : 'm'
  else aiguilleTenue = eH < eM ? 'h' : 'm'
  cadranEl.value.setPointerCapture?.(e.pointerId)
  glisser(e)
}
function glisser(e) {
  if (!aiguilleTenue || repondu.value) return
  const { angle } = angleDepuis(e)
  let { h, m } = aiguilles.value
  if (aiguilleTenue === 'm') {
    const pas = pasMinutes.value
    const nm = (Math.round(angle / (6 * pas)) * pas) % 60
    if (m >= 45 && nm <= 15 && nm < m) h = (h + 1) % 12
    else if (m <= 15 && nm >= 45 && nm > m) h = (h + 11) % 12
    m = nm
  } else {
    h = ((Math.round((angle - m / 2) / 30) % 12) + 12) % 12
  }
  if (h !== aiguilles.value.h || m !== aiguilles.value.m) aiguilles.value = { h, m }
}
function finGlisser() { aiguilleTenue = null }

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80) { confettis(25); return t('resultat80') }
  if (pct >= 60) return t('resultat60')
  if (pct >= 40) return t('resultat40')
  return t('resultat0')
})

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
function htmlFiche() {
  const cfg = config.value
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const precisions = cfg.precisions.filter(p => niv.precisions.includes(p))
  const pool = minutesDisponibles(precisions.length ? precisions : ['heure'])
  const aide = cfg.aideMinutes

  const tirer = (n, exclus = new Set()) => {
    const res = []
    let essais = 0
    while (res.length < n && essais++ < 500) {
      const h = aleatoire(1, 12), m = pioche(pool), k = `${h}-${m}`
      if (!exclus.has(k)) { exclus.add(k); res.push({ h, m }) }
    }
    return res
  }
  const vus = new Set()
  const nbH = cfg.nbHorloges || 8
  // parties « horloges » selon les exercices choisis (les deux si aucune autre partie n'est demandée)
  const autres = ['journee', 'duree', 'conversion', 'emploi'].some(e => cfg.exercices.includes(e) && niv.exercices.includes(e))
  let avecLire = cfg.exercices.includes('lire'), avecPlacer = cfg.exercices.includes('placer')
  if (!avecLire && !avecPlacer && !autres) avecLire = avecPlacer = true
  const aLire = tirer(nbH, vus)
  const aDessiner = tirer(nbH, vus)

  const opt = { aideMinutes: aide, taille: '3.8cm', impression: true }
  const cellLire = aLire.map((t, i) => `<div class="cell">
      <div class="num">${i + 1}.</div>${svgHorloge(t.h, t.m, opt)}
      <div class="rep">______ h ______</div></div>`).join('')
  const cellDessin = aDessiner.map((t, i) => `<div class="cell">
      <div class="num">${i + 1}.</div>${svgHorloge(0, 0, { ...opt, aiguilles: false })}
      <div class="rep cible">${i % 2 ? oral12(t.h, t.m) : ecrit(t.h, t.m)}</div></div>`).join('')

  const br = enBr()
  const T = (fr, b) => (br ? b : fr)
  let extra = ''
  const corrige = avecLire
    ? [`<p><b>${T("Lis l'heure", 'Lenn an eur')} :</b> ${aLire.map((t, i) => `${i + 1}. ${ecrit(t.h, t.m)}`).join(' — ')}</p>`]
    : []
  if (cfg.exercices.includes('journee')) {
    const lignes = []
    const vusJ = new Set()
    let essais = 0
    while (lignes.length < 6 && essais++ < 200) {
      const mo = pioche(MOMENTS.slice(1)), h = pioche(mo.heures), m = pioche(pool)
      if (vusJ.has(`${h}-${m}-${mo.nom}`)) continue
      vusJ.add(`${h}-${m}-${mo.nom}`)
      lignes.push({ t: `${ecrit(h, m)} ${br ? mo.suffixeBr : mo.suffixe}`, r: ecrit(h + 12, m) })
    }
    extra += `<h2>${T("Le matin, l'après-midi, le soir", 'Ar mintin, ar goude merenn, an noz')}</h2><p class="consigne">${T("Écris l'heure comme sur une horloge numérique.", 'Skriv an eur evel war un horolaj niverel.')}</p>
      ${lignes.map((l, i) => `<div class="ligne">${i + 1}. ${l.t} &nbsp;→&nbsp; ________ h ________</div>`).join('')}`
    corrige.push(`<p><b>${T('Matin / après-midi', 'Mintin / goude merenn')} :</b> ${lignes.map((l, i) => `${i + 1}. ${l.r}`).join(' — ')}</p>`)
  }
  if (cfg.exercices.includes('duree')) {
    const qs = genererSansRepetition({ ...cfg, exercices: ['duree'] }, 4)
    extra += `<h2>${T('Les durées', 'Ar padelezhioù')}</h2>
      ${qs.map((d, i) => `<div class="ligne">${i + 1}. ${br
        ? (d.sous === 'apres'
          ? `${d.ecritDebut} eo. A-benn ${d.ecritDuree} e vo : ________________`
          : `${d.activite} a grog da ${d.ecritDebut} hag a echu da ${d.ecritFin}. Padout a ra : ________________`)
        : (d.sous === 'apres'
          ? `Il est ${d.ecritDebut}. Dans ${d.ecritDuree}, il sera : ________________`
          : `${d.activite} commence à ${d.ecritDebut} et se termine à ${d.ecritFin}. ${d.pronom === 'elle' ? 'Elle' : 'Il'} dure : ________________`)}</div>`).join('')}`
    corrige.push(`<p><b>${T('Durées', 'Padelezhioù')} :</b> ${qs.map((d, i) => `${i + 1}. ${d.attendu}`).join(' — ')}</p>`)
  }
  if (cfg.exercices.includes('conversion') && niv.exercices.includes('conversion')) {
    const qs = genererSansRepetition({ ...cfg, exercices: ['conversion'] }, 6)
    extra += `<h2>${T('Heures, minutes, secondes', 'Eurioù, munutoù, eilennoù')}</h2><p class="consigne">${t('rappel')} : 1 h = 60 min · 1 min = 60 s</p>
      <div class="deux-col">${qs.map((c, i) => `<div class="ligne">${i + 1}. ${c.texte.replace(/\?/g, '______')}</div>`).join('')}</div>`
    corrige.push(`<p><b>${T('Conversions', 'Amdroadurioù')} :</b> ${qs.map((c, i) => `${i + 1}. ${c.attendu}`).join(' — ')}</p>`)
  }
  if (cfg.exercices.includes('emploi') && niv.exercices.includes('emploi')) {
    const emploi = genererEmploi(niv)
    const cours = emploi.filter(l => !l.recre)
    const [a, b, c] = melanger(cours)
    extra += `<h2>${T('Emploi du temps', 'Implij-amzer')}</h2>
      <table class="emploi"><tr><th>${t('debut')}</th><th>${t('fin')}</th><th>${t('activite')}</th></tr>
      ${emploi.map(l => `<tr><td>${hm(l.debut)}</td><td>${hm(l.fin)}</td><td>${l.nom}</td></tr>`).join('')}</table>
      <div class="ligne">1. ${T(`À quelle heure commence la séance de ${a.nom.toLowerCase()} ?`, `Da bet eur e krog ar gentel « ${a.nom} » ?`)} ________________</div>
      <div class="ligne">2. ${T(`Combien de temps dure la séance de ${b.nom.toLowerCase()} ?`, `Pegeit e pad ar gentel « ${b.nom} » ?`)} ________________</div>
      <div class="ligne">3. ${T(`Que fait-on à ${hm(c.debut + 10)} ?`, `Petra a vez graet da ${hm(c.debut + 10)} ?`)} ________________</div>`
    corrige.push(`<p><b>${T('Emploi du temps', 'Implij-amzer')} :</b> 1. ${hm(a.debut)} — 2. ${ecritDuree(b.fin - b.debut)} — 3. ${c.nom}</p>`)
  }

  const html = `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${cfg.niveau.toUpperCase()}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 18cm; margin: 1cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: 1.05rem; margin: 1rem 0 .3rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .8rem; }
      .consigne { font-size: .9rem; margin: .2rem 0 .4rem; }
      .grille { display: grid; grid-template-columns: repeat(4, 1fr); gap: .3cm .2cm; }
      .cell { text-align: center; page-break-inside: avoid; position: relative; }
      .num { position: absolute; left: 0; top: 0; font-weight: 700; color: #777; }
      .rep { margin-top: .15cm; font-size: .95rem; font-weight: 700; }
      .rep.cible { font-size: .9rem; min-height: 2.4em; }
      .ligne { margin: .5cm 0; font-size: 1rem; }
      .page2 { page-break-before: always; font-size: .85rem; color: #444; }
      .deux-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0 1cm; }
      table.emploi { border-collapse: collapse; margin: .3cm 0; }
      table.emploi td, table.emploi th { border: 1px solid #555; padding: .15cm .4cm; text-align: left; }
    </style></head><body>
    <h1>🕐 ${t('titre')} — ${cfg.niveau.toUpperCase()}</h1>
    <p class="entete">${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    ${avecLire ? `<h2>${t('quelleHeure')}</h2>
    <p class="consigne">${T('La petite aiguille indique les heures, la grande aiguille indique les minutes.', 'An nadoz vihan a ziskouez an eurioù, an nadoz vras a ziskouez ar munutoù.')}</p>
    <div class="grille">${cellLire}</div>` : ''}
    ${avecPlacer ? `<h2>${T('Dessine les aiguilles', 'Tres an nadozioù')}</h2>
    <p class="consigne">${T('Dessine la petite aiguille (heures) et la grande aiguille (minutes).', 'Tres an nadoz vihan (eurioù) hag an nadoz vras (munutoù).')}</p>
    <div class="grille">${cellDessin}</div>` : ''}
    ${extra}
    ${cfg.corrige !== false ? `<div class="page2"><h2>${T("Corrigé (pour l'adulte)", 'Reizhadenn (evit an dud deuet)')}</h2>${corrige.join('')}</div>` : ''}
  </body></html>`

  return html
}

const { mode, graine, regenerer } = useModeExercice()
// recalculée quand les réglages changent ou qu'on demande une nouvelle fiche
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})

onUnmounted(() => clearTimeout(minuteur))
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #888; margin-top: .4rem; }
.emploi { max-width: 420px; margin: 0 auto 1rem; font-size: 1.05rem; }
.emploi tr.recre td { color: #888; font-style: italic; }

.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .5rem 0 1rem;
  line-height: 1.5;
}
.consigne small { font-size: .8rem; color: #888; font-weight: 600; }

.horloge {
  width: min(280px, 80vw);
  aspect-ratio: 1;
  margin: 0 auto;
}
.horloge.petite { width: min(170px, 38vw); }
.horloge.deplacable { touch-action: none; cursor: grab; user-select: none; }
.horloge :deep(svg) { display: block; }

.legende-aiguilles { text-align: center; font-size: .85rem; color: #888; margin: .4rem 0 1rem; }
.leg-h { color: #c0392b; font-weight: 700; }
.leg-m { color: #1a5fb4; font-weight: 700; }

.choix-grille {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
  margin-top: .5rem;
}
.choix-btn {
  min-height: 56px;
  padding: .6rem .75rem;
  font-size: 1.15rem;
  font-weight: 800;
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  color: var(--texte);
  cursor: pointer;
  transition: border-color .15s, background .15s;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); }
.choix-btn.ok, .choix-horloge.ok         { border-color: var(--vert); background: #f0faf0; }
.choix-btn.erreur, .choix-horloge.erreur { border-color: var(--rouge); background: #fef0f0; }
.choix-btn.grise, .choix-horloge.grise   { opacity: .5; }

.choix-horloges {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: .75rem;
  max-width: 420px;
  margin: 0 auto;
}
.choix-horloge {
  border: 3px solid var(--gris-brd);
  border-radius: var(--radius);
  background: white;
  padding: .4rem;
  cursor: pointer;
  aspect-ratio: 1;
}
.choix-horloge span { display: block; width: 100%; height: 100%; }
.choix-horloge:hover:not(:disabled) { border-color: var(--bleu); }

.saisie-heure {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  margin-top: .5rem;
}
.saisie-heure .champ { width: 5.5rem; display: inline-block; }
.unite { font-size: 1.5rem; font-weight: 800; }

.reglages {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.reglage { display: flex; flex-direction: column; align-items: center; gap: .4rem; font-size: .9rem; }
.btn-rond { min-width: 56px; min-height: 48px; justify-content: center; font-size: 1.5rem; padding: .3rem 1rem; }

.horloges-duree { display: flex; justify-content: center; gap: 1.5rem; flex-wrap: wrap; margin-bottom: .5rem; }
.horloges-duree figure { margin: 0; text-align: center; }
.horloges-duree figcaption { font-weight: 700; color: #888; font-size: .9rem; }

.oral { font-size: 1.05rem; color: var(--texte); font-weight: 700; margin-top: .25rem; }
.btn-ecouter {
  border: none; background: none; cursor: pointer; font-size: 1.2rem;
  vertical-align: middle; padding: .1rem .3rem;
}

.mini-horloge { display: inline-block; width: 40px; height: 40px; vertical-align: middle; margin-right: .4rem; }
.mini-horloge :deep(svg) { display: block; }

@media (max-width: 520px) {
  .choix-btn { font-size: 1rem; }
  .consigne { font-size: 1.1rem; }
}
</style>
