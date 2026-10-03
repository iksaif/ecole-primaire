<template>
  <div class="container">
    <h1 class="section-heading">💶 {{ t('titre') }}</h1>

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
          <button v-for="ty in typesNiveau" :key="ty.id"
            class="level-btn" :class="{ active: config.exercices.includes(ty.id) }"
            @click="toggleExercice(ty.id)">{{ tr(ty.label) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('options') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: !config.centimes }" @click="config.centimes = false">{{ t('eurosEntiers') }}</button>
          <button class="level-btn" :class="{ active: config.centimes }" @click="config.centimes = true">{{ t('avecCentimes') }}</button>
        </div>
        <div v-if="mode === 'jouer'" class="btn-group" style="margin-top:.5rem;">
          <button class="level-btn" :class="{ active: config.aideTotal }" @click="config.aideTotal = !config.aideTotal">
            {{ config.aideTotal ? '✔' : '✖' }} {{ t('afficherTotal') }}
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

      <div class="apercu">
        <span v-for="v in paletteApercu" :key="v" class="argent" v-html="svgArgent(v, 0.7)"></span>
      </div>

      <div v-if="mode === 'imprimer'" class="aide-config">{{ t('aideFiche') }}</div>
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
          <span v-for="(e, i) in questions" :key="i" class="prog-dot"
                :class="[etatsDots[i], { current: i === idx }]"></span>
        </div>

        <!-- Compter -->
        <template v-if="q.type === 'compter'">
          <div class="consigne">{{ t('combienArgent') }}</div>
          <div class="tas">
            <span v-for="(v, i) in q.items" :key="i" class="argent" v-html="svgArgent(v)"></span>
          </div>
          <div v-if="q.avecCentimes && niveau.saisieDecimale" class="saisie-somme">
            <input ref="inputEl" v-model="saisieT" class="exercise-input saisie-large"
                   :class="inputClass" type="text" inputmode="decimal" :placeholder="t('exemple')"
                   :disabled="repondu" autocomplete="off" @keydown.enter="entree">
          </div>
          <div v-if="q.avecCentimes && niveau.saisieDecimale" class="astuce" style="text-align:center;">
            {{ t('tuPeuxEcrire') }}
          </div>
          <div v-else class="saisie-somme">
            <input ref="inputEl" v-model="saisieE" class="exercise-input saisie-petite"
                   :class="inputClass" type="number" inputmode="numeric" min="0" placeholder="?"
                   :disabled="repondu" autocomplete="off" @keydown.enter="entree">
            <span class="unite">€</span>
            <template v-if="q.avecCentimes">
              <input v-model="saisieC" class="exercise-input saisie-petite"
                     :class="inputClass" type="number" inputmode="numeric" min="0" max="99" placeholder="?"
                     :disabled="repondu" autocomplete="off" @keydown.enter="entree">
              <span class="unite">c</span>
            </template>
          </div>
        </template>

        <!-- Composer / le moins possible / rendre -->
        <template v-if="['composer', 'moins', 'rendre'].includes(q.type)">
          <div v-if="q.type === 'composer'" class="consigne">
            {{ t('composer1') }} <strong class="somme">{{ f(q.cible) }}</strong>
          </div>
          <div v-else-if="q.type === 'moins'" class="consigne">
            {{ t('moins1') }} <strong class="somme">{{ f(q.cible) }}</strong>
            {{ t('moins2') }} <strong>{{ t('moins3') }}</strong> {{ t('moins4') }}
          </div>
          <template v-else>
            <div class="consigne">
              <span class="objet">{{ q.objet[0] }}</span>
              {{ t('tuAchetes') }} {{ q.objet[1] }} {{ coute(q.objet) }} <strong class="somme">{{ f(q.prix) }}</strong>.
            </div>
            <div class="consigne petite">
              {{ t('tuDonnes') }}
              <span class="argent" v-html="svgArgent(q.paye, 0.8)"></span>
            </div>
            <div class="consigne petite">{{ t('combienRendre') }}</div>
          </template>

          <div class="plateau" :class="inputClass">
            <span v-if="!selection.length" class="plateau-vide">{{ t('plateauVide') }}</span>
            <button v-for="(v, i) in selection" :key="i" class="btn-argent dans-plateau"
                    :disabled="repondu" :title="t('enlever') + ' : ' + nomArgent(v)"
                    @click="enlever(i)">
              <span class="argent" v-html="svgArgent(v, 0.8)"></span>
            </button>
          </div>
          <div class="plateau-actions">
            <span v-if="config.aideTotal" class="total-aide">{{ t('total') }} : <strong>{{ f(totalDe(selection)) }}</strong></span>
            <span v-else></span>
            <span class="btn-group">
              <button class="btn btn-ghost petit" :disabled="repondu || !selection.length" @click="annuler">{{ t('annuler') }}</button>
              <button class="btn btn-ghost petit" :disabled="repondu || !selection.length" @click="selection = []">{{ t('toutEnlever') }}</button>
            </span>
          </div>

          <div class="palette">
            <button v-for="v in palette" :key="v" class="btn-argent" :disabled="repondu"
                    :title="t('ajouter') + ' : ' + nomArgent(v)" @click="ajouter(v)">
              <span class="argent" v-html="svgArgent(v)"></span>
            </button>
          </div>
        </template>

        <!-- Convertir (CE2) -->
        <template v-if="q.type === 'convertir'">
          <div class="consigne">{{ t('rappel') }} : <strong>1 € = 100 c</strong></div>
          <div class="consigne conversion">{{ q.texte.replace(/ = \?.*$/, ' =') }}</div>
          <div class="saisie-somme">
            <template v-if="q.sous === 'c2ec'">
              <input ref="inputEl" v-model="saisieE" class="exercise-input saisie-petite" :class="inputClass"
                     type="number" inputmode="numeric" min="0" placeholder="?" :disabled="repondu" autocomplete="off" @keydown.enter="entree">
              <span class="unite">€</span>
              <input v-model="saisieC" class="exercise-input saisie-petite" :class="inputClass"
                     type="number" inputmode="numeric" min="0" max="99" placeholder="?" :disabled="repondu" autocomplete="off" @keydown.enter="entree">
              <span class="unite">c</span>
            </template>
            <template v-else-if="q.sous === 'ec2dec'">
              <input ref="inputEl" v-model="saisieT" class="exercise-input saisie-large" :class="inputClass"
                     type="text" inputmode="decimal" placeholder="?,??" :disabled="repondu" autocomplete="off" @keydown.enter="entree">
              <span class="unite">€</span>
            </template>
            <template v-else>
              <input ref="inputEl" v-model="saisieT" class="exercise-input saisie-large" :class="inputClass"
                     type="text" inputmode="numeric" placeholder="?" :disabled="repondu" autocomplete="off" @keydown.enter="entree">
              <span class="unite">c</span>
            </template>
          </div>
        </template>

        <!-- Comparer -->
        <template v-if="q.type === 'comparer'">
          <div class="consigne">{{ t('quiPlus') }}</div>
          <div class="porte-monnaies">
            <div v-for="cote in ['A', 'B']" :key="cote" class="porte-monnaie"
                 :class="{ gagnant: repondu && (q.bonne === cote || q.bonne === 'egal') }">
              <div class="porte-nom">👛 {{ cote === 'A' ? q.nomA : q.nomB }}</div>
              <div class="tas">
                <span v-for="(v, i) in (cote === 'A' ? q.itemsA : q.itemsB)" :key="i"
                      class="argent" v-html="svgArgent(v, 0.75)"></span>
              </div>
              <div v-if="repondu" class="porte-total">{{ f(cote === 'A' ? q.totalA : q.totalB) }}</div>
            </div>
          </div>
          <div class="btn-group" style="justify-content:center;margin-top:1rem;">
            <button class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('A')">{{ q.nomA }}</button>
            <button class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('B')">{{ q.nomB }}</button>
            <button class="btn btn-ghost choix" :disabled="repondu" @click="choisirComparer('egal')">{{ t('autantDeux') }}</button>
          </div>
        </template>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>

        <!-- Correction visuelle -->
        <div v-if="repondu && !dernierOk" class="correction">
          <template v-if="q.type === 'compter'">
            {{ t('ilYa1') }}<strong>{{ q.attendu }}</strong>{{ t('ilYa2') }}
            <div class="astuce">{{ t('astuceCompter') }}<span v-if="config.niveau !== 'ce1'"> {{ t('noublie') }} : 100 c = 1 €.</span></div>
          </template>
          <template v-else-if="q.type === 'convertir'">
            {{ q.texte.replace(/ = \?.*$/, '') }} = <strong>{{ q.attendu }}</strong>
            <div class="astuce">{{ t('astuceConvertir') }}</div>
          </template>
          <template v-else-if="q.type === 'comparer'">
            {{ q.nomA }}{{ t('aSomme') }} <strong>{{ f(q.totalA) }}</strong>,
            {{ q.nomB }}{{ t('aSomme') }} <strong>{{ f(q.totalB) }}</strong>.
            <div class="astuce">{{ t('astuceComparer') }}</div>
          </template>
          <template v-else>
            <div>{{ q.type === 'moins' ? t('avecMoins') : t('uneBonne') }}</div>
            <div class="tas">
              <span v-for="(v, i) in q.solution" :key="i" class="argent" v-html="svgArgent(v, 0.75)"></span>
            </div>
            <div v-if="q.type === 'rendre'" class="astuce">
              {{ t('astuceRendre', { prix: f(q.prix), paye: f(q.paye), cible: f(q.cible) }) }}
            </div>
            <div v-else-if="q.type === 'moins'" class="astuce">
              {{ t('astuceMoins') }}
            </div>
          </template>
        </div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <template v-if="!repondu">
            <button class="btn btn-ghost" @click="passer">{{ t('passer') }}</button>
            <button v-if="q.type !== 'comparer'" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
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
            <td>{{ h.texte }}</td>
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
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useI18n } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, tr, langue } = useI18n({
  fr: {
    titre: 'La monnaie',
    options: 'Options',
    eurosEntiers: 'Euros entiers',
    avecCentimes: 'Avec centimes',
    afficherTotal: 'Afficher le total pendant que je compose',
    aideFiche: 'La fiche reprend les exercices choisis : compter, faire une somme (entourer), rendre la monnaie, conversions.',
    combienArgent: "Combien d'argent y a-t-il ?",
    exemple: 'ex : 3,50 €',
    tuPeuxEcrire: 'Tu peux écrire « 3,50 € » ou « 3 € 50 c ».',
    composer1: 'Clique sur les pièces et les billets pour faire',
    moins1: 'Paye',
    moins2: 'avec',
    moins3: 'le moins possible',
    moins4: 'de pièces et de billets',
    tuAchetes: 'Tu achètes',
    tuDonnes: 'Tu donnes',
    combienRendre: 'Combien doit-on te rendre ? Montre-le avec les pièces et les billets.',
    plateauVide: 'Ta monnaie apparaît ici',
    enlever: 'Enlever',
    ajouter: 'Ajouter',
    total: 'Total',
    toutEnlever: '🗑 Tout enlever',
    rappel: 'Rappel',
    quiPlus: "Qui a le plus d'argent ?",
    autantDeux: 'Autant tous les deux',
    ilYa1: 'Il y a ',
    ilYa2: '.',
    astuceCompter: 'Astuce : commence par compter les billets, puis les grosses pièces.',
    noublie: "N'oublie pas",
    astuceConvertir: '1 € = 100 c : les euros vont avant la virgule, les centimes après (toujours 2 chiffres : 2 € 5 c = 2,05 €).',
    aSomme: ' a',
    astuceComparer: "Ce n'est pas le nombre de pièces qui compte, mais leur valeur !",
    avecMoins: 'Avec le moins de pièces et billets :',
    uneBonne: 'Une bonne réponse :',
    astuceRendre: "On compte de {prix} jusqu'à {paye} : il manque {cible}.",
    astuceMoins: "Astuce : prends d'abord le plus grand billet ou la plus grande pièce possible.",
    colQuestion: 'Question',
    pasTout: 'Pas tout à fait… Regarde la correction.',
    ecrisSomme: 'Écris la somme comme « 3,50 € » ou « 3 € 50 c ».',
    auLieuDe: 'Tu as fait {t} au lieu de {c}.',
    tropDePieces: "C'est bien {t} 👍 mais on peut payer avec seulement {n} pièces et billets.",
    ilManque: 'Tu as fait {t} : il manque {m}.',
    deTrop: "Tu as fait {t} : c'est {m} de trop.",
    autantArgent: "Ils ont autant d'argent tous les deux : {s}.",
    lePlus: "C'est {nom} qui a le plus d'argent.",
    autant: 'Autant',
  },
  br: {
    titre: 'Ar moneiz',
    options: 'Dibarzhioù',
    eurosEntiers: 'Euro hepken',
    avecCentimes: 'Gant santimoù',
    afficherTotal: 'Diskouez ar sammad e-keit ma lakaan an arc\'hant', // br: à relire
    aideFiche: "Er fichenn e vo ar poelladennoù dibabet : kontañ, ober ur sammad (kelc'hiañ), distreiñ ar moneiz, amdroadurioù.", // br: à relire
    combienArgent: "Pegement a arc'hant a zo ?",
    exemple: 'sk. : 3,50 €',
    tuPeuxEcrire: 'Gallout a rez skrivañ « 3,50 € » pe « 3 € 50 c ».',
    composer1: 'Klik war ar pezhioù moneiz hag ar bilhedoù evit ober',
    moins1: 'Paea',
    moins2: 'gant',
    moins3: 'an nebeutañ posubl',
    moins4: 'a bezhioù moneiz hag a vilhedoù',
    tuAchetes: 'Prenañ a rez',
    tuDonnes: 'Reiñ a rez',
    combienRendre: 'Pegement a vo distroet dit ? Diskouez anezhañ gant ar pezhioù moneiz hag ar bilhedoù.',
    plateauVide: 'Da voneiz a zeuio amañ',
    enlever: 'Tennañ',
    ajouter: 'Ouzhpennañ',
    total: 'Sammad',
    toutEnlever: '🗑 Tennañ pep tra',
    rappel: "Dalc'h soñj",
    quiPlus: "Piv en deus ar muiañ a arc'hant ?",
    autantDeux: 'Kement o-daou',
    ilYa1: '',
    ilYa2: ' a zo.',
    astuceCompter: "Tun : kont ar bilhedoù da gentañ, ha goude ar pezhioù moneiz bras.",
    noublie: "N'ankouaha ket",
    astuceConvertir: "1 € = 100 c : an euro a ya a-raok ar skej, ar santimoù war-lerc'h (atav 2 sifr : 2 € 5 c = 2,05 €).", // br: à relire
    aSomme: ' :',
    astuceComparer: "N'eo ket an niver a bezhioù a gont, met o zalvoudegezh !",
    avecMoins: 'Gant an nebeutañ a bezhioù hag a vilhedoù :',
    uneBonne: 'Ur respont mat :',
    astuceRendre: 'Kontañ a reer eus {prix} betek {paye} : mankout a ra {cible}.',
    astuceMoins: 'Tun : kemer da gentañ ar bilhed pe ar pezh moneiz brasañ posubl.',
    colQuestion: 'Goulenn',
    pasTout: "N'eo ket mat c'hoazh… Sell ouzh ar reizhadenn.",
    ecrisSomme: 'Skriv ar sammad evel « 3,50 € » pe « 3 € 50 c ».',
    auLieuDe: "Graet ec'h eus {t} e-lec'h {c}.",
    tropDePieces: "{t} eo, mat 👍 met gallout a reer paeañ gant {n} pezh pe bilhed hepken.", // br: à relire
    ilManque: "Graet ec'h eus {t} : mankout a ra {m}.",
    deTrop: "Graet ec'h eus {t} : {m} re a zo.", // br: à relire
    autantArgent: "Kement a arc'hant o deus o-daou : {s}.",
    lePlus: "Gant {nom} emañ ar muiañ a arc'hant.",
    autant: 'Kement',
  },
})
const enBr = () => langue.value === 'br'

// ── LOGIQUE ── (toutes les sommes sont en CENTIMES entiers)

// Diamètres réels en mm (pour des tailles relatives réalistes)
const PIECES = {
  1:   { d: 16.25, metal: 'cuivre', label: '1',  unite: 'c' },
  2:   { d: 18.75, metal: 'cuivre', label: '2',  unite: 'c' },
  5:   { d: 21.25, metal: 'cuivre', label: '5',  unite: 'c' },
  10:  { d: 19.75, metal: 'or',     label: '10', unite: 'c' },
  20:  { d: 22.25, metal: 'or',     label: '20', unite: 'c' },
  50:  { d: 24.25, metal: 'or',     label: '50', unite: 'c' },
  100: { d: 23.25, metal: 'bi1',    label: '1',  unite: '€' },
  200: { d: 25.75, metal: 'bi2',    label: '2',  unite: '€' },
}
// Dimensions réelles en mm, couleurs approximatives
const BILLETS = {
  500:  { w: 120, h: 62, fond: '#b8c2b0', fonce: '#5f6e58' },
  1000: { w: 127, h: 67, fond: '#f0a090', fonce: '#a8402f' },
  2000: { w: 133, h: 72, fond: '#9dbde8', fonce: '#2c5b9a' },
  5000: { w: 140, h: 77, fond: '#f6b46e', fonce: '#a9601a' },
  10000: { w: 147, h: 77, fond: '#9ccf9a', fonce: '#2f7a3b' },
}
const METAUX = {
  cuivre: { fond: '#cd7f4f', bord: '#8f5130' },
  or:     { fond: '#e6c65c', bord: '#a8862a' },
  argent: { fond: '#dcdfe2', bord: '#8e959c' },
}
const VALEURS = [10000, 5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1]

const TYPES = [
  { id: 'compter',  label: { fr: '🔢 Compter une somme', br: '🔢 Kontañ ur sammad' } },
  { id: 'composer', label: { fr: '🧩 Faire une somme', br: '🧩 Ober ur sammad' } },
  { id: 'moins',    label: { fr: '🪙 Le moins de pièces', br: '🪙 An nebeutañ a bezhioù' } },
  { id: 'rendre',   label: { fr: '🛒 Rendre la monnaie', br: '🛒 Distreiñ ar moneiz' } },
  { id: 'comparer', label: { fr: '👛 Comparer', br: '👛 Keñveriañ' } },
  { id: 'convertir', label: { fr: '🔁 1 € = 100 c', br: '🔁 1 € = 100 c' } },
]

// Données par niveau. notation : 'ec' (« 3 € 50 c ») ou 'les2' (« 3,50 € (3 € 50 c) »).
const NIVEAUX = {
  ce1: {
    types: ['compter', 'composer', 'moins', 'rendre', 'comparer'],
    notation: 'ec',
    saisieDecimale: false,
    compter: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [2, 6], min: 300, max: 9900 },
      centimes: { euros: [100, 200, 500, 1000], nbEuros: [1, 3], maxEuros: 2000,
                  cents: [1, 2, 5, 10, 20, 50], nbCents: [2, 5], maxCents: 99 },
    },
    composer: {
      entiers:  { min: 300, max: 9900, pas: 100 },
      centimes: { euros: [1, 20], cents: [1, 99] },
    },
    moins: { minPieces: { entiers: 2, centimes: 3 } },
    rendre: {
      entiers: [
        { paye: 500,  rendu: [100, 400],  pas: 100 },
        { paye: 1000, rendu: [100, 900],  pas: 100 },
        { paye: 2000, rendu: [100, 1000], pas: 100 },
        { paye: 5000, rendu: [100, 2500], pas: 100 },
      ],
      centimes: [
        { paye: 100, rendu: [5, 95],  pas: 5 },
        { paye: 200, rendu: [5, 95],  pas: 5 },
        { paye: 500, rendu: [5, 250], pas: 5 },
      ],
    },
    comparer: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000], nb: [2, 6], max: 5000 },
      centimes: { valeurs: [5, 10, 20, 50, 100, 200, 500], nb: [3, 6], max: 1000 },
      probaEgal: 0.15,
    },
    palette: {
      entiers:  [100, 200, 500, 1000, 2000, 5000],
      centimes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000],
    },
  },
  // CE2 : euros et centimes, 1 € = 100 c, écriture « 3,50 € », sommes jusqu'à 200 €, billet de 100 €
  ce2: {
    types: ['compter', 'composer', 'moins', 'rendre', 'comparer', 'convertir'],
    notation: 'les2',
    saisieDecimale: true,
    compter: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000, 10000], nb: [3, 8], min: 1000, max: 19900 },
      // plus de 1 € en pièces de centimes : il faut regrouper 100 c = 1 €
      centimes: { euros: [100, 200, 500, 1000, 2000, 5000], nbEuros: [2, 4], maxEuros: 10000,
                  cents: [1, 2, 5, 10, 20, 50], nbCents: [3, 7], maxCents: 250 },
    },
    composer: {
      entiers:  { min: 1000, max: 19900, pas: 100 },
      centimes: { euros: [1, 99], cents: [1, 99] },
    },
    moins: { minPieces: { entiers: 3, centimes: 4 } },
    rendre: {
      entiers: [
        { paye: 2000,  rendu: [100, 1000], pas: 100 },
        { paye: 5000,  rendu: [100, 2500], pas: 100 },
        { paye: 10000, rendu: [100, 5000], pas: 100 },
      ],
      centimes: [
        { paye: 500,  rendu: [5, 300],  pas: 5 },
        { paye: 1000, rendu: [5, 500],  pas: 5 },
        { paye: 2000, rendu: [5, 1000], pas: 5 },
      ],
    },
    comparer: {
      entiers:  { valeurs: [100, 200, 500, 1000, 2000, 5000], nb: [3, 7], max: 20000 },
      centimes: { valeurs: [5, 10, 20, 50, 100, 200, 500, 1000], nb: [4, 7], max: 3000 },
      probaEgal: 0.15,
    },
    convertir: { min: 105, max: 995 },
    palette: {
      entiers:  [100, 200, 500, 1000, 2000, 5000, 10000],
      centimes: [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000],
    },
  },
}

// [emoji, nom, pluriel ?] — rangés par prix plausible
const OBJETS = {
  pasCher:  [['🍎', 'une pomme'], ['✏️', 'un crayon'], ['🍬', 'des bonbons', true], ['🧃', 'un jus de fruits'], ['🥖', 'une baguette']],
  moyen:    [['🍫', 'une tablette de chocolat'], ['📒', 'un cahier'], ['⚽', 'un ballon'], ['🖍️', 'des feutres', true], ['🚗', 'une petite voiture']],
  cher:     [['🧸', 'un ours en peluche'], ['🧩', 'un puzzle'], ['📕', 'un livre'], ['🎨', 'une boîte de peinture']],
  tresCher: [['🛴', 'une trottinette'], ['🛼', 'des rollers', true], ['🎲', 'un grand jeu de société'], ['🎧', 'un casque audio']],
}
// Mêmes objets en breton, dans le même ordre (br: à relire)
const OBJETS_BR = {
  pasCher:  ['un aval', "ur c'hreion", 'bonbonoù', 'chug frouezh', 'ur bara hir'],
  moyen:    ['un dablezenn chokolad', "ur c'haier", 'ur volotenn', 'feltroù', "ur c'harr bihan"],
  cher:     ['un arzh pluch', 'ur puzzle', 'ul levr', 'ur voest livañ'],
  tresCher: ['un trotinell', 'botoù-ruilh', "ur c'hoari-taol bras", 'ur selaouer'],
}
function coute(objet) { return enBr() ? 'a goust' : objet[2] ? 'qui coûtent' : 'qui coûte' }
const PRENOMS = [['Léa', 'Tom'], ['Inès', 'Hugo'], ['Jade', 'Noah'], ['Chloé', 'Lucas'], ['Emma', 'Adam'], ['Lina', 'Gabriel']]
const PRENOMS_BR = [['Nolwenn', 'Erwan'], ['Maiwenn', 'Yann'], ['Enora', 'Loig'], ['Gwenn', 'Malo'], ['Azenor', 'Tudual'], ['Lena', 'Gwenole']]

const NB = ' '
function formatSomme(c) {
  const e = Math.floor(c / 100), r = c % 100
  if (r === 0) return `${e}${NB}€`
  if (e === 0) return `${r}${NB}c`
  return `${e}${NB}€ ${r}${NB}c`
}
// « 3,50 € »
function formatDecimal(c) {
  return `${Math.floor(c / 100)},${String(c % 100).padStart(2, '0')}${NB}€`
}
// Notation selon le niveau : au CE2 on montre aussi l'écriture à virgule
function fmt(c, niv) {
  if (niv?.notation === 'les2' && c % 100 !== 0) return `${formatDecimal(c)} (${formatSomme(c)})`
  return formatSomme(c)
}
// Lit une somme écrite par l'enfant : « 3,50 », « 3.5 € », « 3 € 50 », « 3 € 50 c », « 350 c », « 7 ». Renvoie des centimes ou null.
function lireSomme(texte) {
  const s = String(texte ?? '').toLowerCase().trim()
    .replace(/euros?/g, '€').replace(/centimes?|santim(?:où)?/g, 'c').replace(/\s+/g, ' ')
  let m
  if ((m = s.match(/^(\d{1,4}) ?[,.] ?(\d{1,2}) ?€?$/))) return +m[1] * 100 + (m[2].length === 1 ? +m[2] * 10 : +m[2])
  if ((m = s.match(/^(\d{1,4}) ?€ ?(?:(\d{1,2}) ?c?)?$/))) return +m[1] * 100 + (m[2] ? +m[2] : 0)
  if ((m = s.match(/^(\d{1,5}) ?c$/))) return +m[1]
  if ((m = s.match(/^(\d{1,4})$/))) return +m[1] * 100
  return null
}
function nomArgent(v) {
  if (enBr()) {
    if (v >= 500) return `bilhed ${v / 100} euro`
    if (v >= 100) return `pezh ${v / 100} euro`
    return `pezh ${v} santim`
  }
  if (v >= 500) return `billet de ${v / 100} €`
  if (v >= 100) return `pièce de ${v / 100} €`
  return `pièce de ${v} centime${v > 1 ? 's' : ''}`
}
function totalDe(items) { return items.reduce((s, v) => s + v, 0) }
function trierDesc(items) { return [...items].sort((a, b) => b - a) }
function aleatoirePas(min, max, pas) { return min + pas * aleatoire(0, Math.floor((max - min) / pas)) }
function pioche(t) { return t[aleatoire(0, t.length - 1)] }

// Le système de l'euro est « canonique » : l'algorithme glouton donne le nombre minimal
function glouton(total, valeurs = VALEURS) {
  const r = []
  let reste = total
  for (const v of trierDesc(valeurs)) while (reste >= v) { r.push(v); reste -= v }
  return r
}

function tirerItems(valeurs, nbMin, nbMax) {
  const n = aleatoire(nbMin, nbMax)
  return Array.from({ length: n }, () => pioche(valeurs))
}

// Tire des items dont le total est dans [min, max] (essais bornés, sinon décomposition)
function tirerDansPlage(valeurs, nbMin, nbMax, min, max) {
  for (let essai = 0; essai < 200; essai++) {
    const items = tirerItems(valeurs, nbMin, nbMax)
    const t = totalDe(items)
    if (t >= min && t <= max) return trierDesc(items)
  }
  const pas = Math.min(...valeurs)
  return decomposerAuHasard(aleatoirePas(min, max, pas), valeurs, nbMax)
}

// Décomposition aléatoire (pas forcément minimale) d'un total
function decomposerAuHasard(total, valeurs, maxItems) {
  const dispo = trierDesc(valeurs)
  for (let essai = 0; essai < 30; essai++) {
    const r = []
    let reste = total
    while (reste > 0) {
      const possibles = dispo.filter(v => v <= reste).slice(0, 3)
      if (!possibles.length) break
      const v = pioche(possibles)
      r.push(v); reste -= v
    }
    if (reste === 0 && r.length <= maxItems) return trierDesc(r)
  }
  return glouton(total, dispo)
}

function genCompter(niv, centimes) {
  let items
  if (!centimes) {
    const p = niv.compter.entiers
    items = tirerDansPlage(p.valeurs, p.nb[0], p.nb[1], p.min, p.max)
  } else {
    const p = niv.compter.centimes
    const euros = tirerDansPlage(p.euros, p.nbEuros[0], p.nbEuros[1], 100, p.maxEuros)
    const cents = tirerDansPlage(p.cents, p.nbCents[0], p.nbCents[1], 1, p.maxCents)
    items = trierDesc([...euros, ...cents])
  }
  const total = totalDe(items)
  return {
    type: 'compter', cle: 'compter:' + items.join(','), items, total, avecCentimes: centimes,
    texte: (enBr() ? 'Kontañ : ' : 'Compter : ') + items.map(formatSomme).join(' + '),
    attendu: fmt(total, niv),
  }
}

function cibleComposer(niv, centimes) {
  if (!centimes) {
    const p = niv.composer.entiers
    return aleatoirePas(p.min, p.max, p.pas)
  }
  const p = niv.composer.centimes
  return aleatoire(p.euros[0], p.euros[1]) * 100 + aleatoire(p.cents[0], p.cents[1])
}

function genComposer(niv, centimes) {
  const cible = cibleComposer(niv, centimes)
  return {
    type: 'composer', cle: 'composer:' + cible, cible, solution: glouton(cible),
    texte: `${enBr() ? 'Ober' : 'Faire'} ${fmt(cible, niv)}`, attendu: fmt(cible, niv),
  }
}

function genMoins(niv, centimes) {
  const min = niv.moins.minPieces[centimes ? 'centimes' : 'entiers']
  let cible, solution
  for (let essai = 0; essai < 100; essai++) {
    cible = cibleComposer(niv, centimes)
    solution = glouton(cible)
    if (solution.length >= min) break
  }
  return {
    type: 'moins', cle: 'moins:' + cible, cible, solution,
    texte: enBr() ? `Paeañ ${fmt(cible, niv)} gant an nebeutañ posubl` : `Payer ${fmt(cible, niv)} avec le moins possible`,
    attendu: `${solution.length} : ${solution.map(formatSomme).join(' + ')}`,
  }
}

function objetPour(prix) {
  const cat = prix <= 200 ? 'pasCher' : prix <= 1000 ? 'moyen' : prix <= 2000 ? 'cher' : 'tresCher'
  const i = aleatoire(0, OBJETS[cat].length - 1)
  const o = OBJETS[cat][i]
  return enBr() ? [o[0], OBJETS_BR[cat][i], o[2]] : o
}

function genRendre(niv, centimes) {
  const cas = pioche(niv.rendre[centimes ? 'centimes' : 'entiers'])
  const rendu = aleatoirePas(cas.rendu[0], cas.rendu[1], cas.pas)
  const prix = cas.paye - rendu
  const objet = objetPour(prix)
  return {
    type: 'rendre', cle: `rendre:${prix}/${cas.paye}`, paye: cas.paye, prix, cible: rendu, objet,
    solution: glouton(rendu),
    texte: `${objet[0]} ${fmt(prix, niv)}, ${enBr() ? 'paeet gant' : 'payé avec'} ${formatSomme(cas.paye)}`,
    attendu: fmt(rendu, niv),
  }
}

function genComparer(niv, centimes) {
  const p = niv.comparer[centimes ? 'centimes' : 'entiers']
  const itemsA = tirerDansPlage(p.valeurs, p.nb[0], p.nb[1], 1, p.max)
  const totalA = totalDe(itemsA)
  let itemsB = null
  if (Math.random() < niv.comparer.probaEgal) {
    // Même somme, mais autrement composée
    for (let essai = 0; essai < 10 && !itemsB; essai++) {
      const b = decomposerAuHasard(totalA, p.valeurs, p.nb[1] + 2)
      if (b.join(',') !== itemsA.join(',')) itemsB = b
    }
  }
  if (!itemsB) {
    for (let essai = 0; essai < 100; essai++) {
      itemsB = tirerDansPlage(p.valeurs, p.nb[0], p.nb[1], 1, p.max)
      if (totalDe(itemsB) !== totalA) break
    }
  }
  const totalB = totalDe(itemsB)
  const [nomA, nomB] = melanger(pioche(enBr() ? PRENOMS_BR : PRENOMS))
  const bonne = totalA > totalB ? 'A' : totalB > totalA ? 'B' : 'egal'
  return {
    type: 'comparer', cle: 'comparer:' + itemsA.join(',') + '|' + itemsB.join(','),
    itemsA, itemsB, totalA, totalB, nomA, nomB, bonne,
    texte: `${nomA} (${fmt(totalA, niv)}) ${enBr() ? 'pe' : 'ou'} ${nomB} (${fmt(totalB, niv)}) ?`,
    attendu: bonne === 'A' ? nomA : bonne === 'B' ? nomB : t('autant'),
  }
}

// CE2 : 1 € = 100 c. sous : 'c2ec' (235 c = ? € ? c), 'ec2c' (2 € 35 c = ? c), 'dec2c' (2,35 € = ? c), 'ec2dec' (2 € 5 c = ? €)
function genConvertir(niv) {
  const p = niv.convertir || { min: 105, max: 995 }
  const sous = pioche(['c2ec', 'ec2c', 'dec2c', 'ec2dec'])
  let valeur = aleatoire(p.min, p.max)
  if (valeur % 100 === 0) valeur += aleatoire(1, 9) * 5
  // pour « 2 € 5 c = 2,05 € », on force souvent un petit nombre de centimes (piège classique)
  if (sous === 'ec2dec' && Math.random() < 0.5) valeur = Math.floor(valeur / 100) * 100 + aleatoire(1, 9)
  const ec = formatSomme(valeur), dec = formatDecimal(valeur)
  const enonces = {
    c2ec:   [`${valeur}${NB}c = ? € ? c`, ec],
    ec2c:   [`${ec} = ? c`, `${valeur}${NB}c`],
    dec2c:  [`${dec} = ? c`, `${valeur}${NB}c`],
    ec2dec: [`${ec} = ? € (${enBr() ? 'gant ur skej' : 'avec une virgule'})`, dec],
  }
  const [texte, attendu] = enonces[sous]
  return { type: 'convertir', sous, cle: `convertir:${sous}:${valeur}`, valeur, texte, attendu }
}

// Vérifie la réponse à une conversion. rep : { e, c } pour c2ec, { texte } sinon.
function verifierConversion(q, rep) {
  if (q.sous === 'c2ec') {
    const e = parseInt(rep.e || '0', 10), c = parseInt(rep.c || '0', 10)
    return !isNaN(e) && !isNaN(c) && c < 100 && e * 100 + c === q.valeur
  }
  const t = String(rep.texte ?? '').trim()
  if (q.sous === 'ec2dec') return /^\d+\s*[,.]\s*\d{2}\s*(€|euros?)?$/i.test(t) && lireSomme(t) === q.valeur
  const n = t.replace(/\s*(c|centimes?)$/i, '')
  return /^\d+$/.test(n) && +n === q.valeur
}

const GENERATEURS = { compter: genCompter, composer: genComposer, moins: genMoins, rendre: genRendre, comparer: genComparer, convertir: genConvertir }

function genererSansRepetition(typesDemandes, nb, niv, centimes) {
  const types = typesDemandes.filter(t => !niv.types || niv.types.includes(t))
  if (!types.length) types.push(niv.types?.[0] || 'compter')
  // Types répartis équitablement puis mélangés
  const liste = melanger(Array.from({ length: nb }, (_, i) => types[i % types.length]))
  const vus = new Set()
  const result = []
  for (const type of liste) {
    let q = null
    for (let essai = 0; essai < 50; essai++) {
      const c = GENERATEURS[type](niv, centimes)
      if (!vus.has(c.cle)) { q = c; break }
    }
    if (q) { vus.add(q.cle); result.push(q) }
  }
  return result
}

// ── Dessins SVG ──
function svgPiece(v, echelle = 1) {
  const p = PIECES[v]
  const taille = Math.round(p.d * 2.6 * echelle)
  let disque
  if (p.metal === 'bi1' || p.metal === 'bi2') {
    const ext = p.metal === 'bi1' ? METAUX.or : METAUX.argent
    const int = p.metal === 'bi1' ? METAUX.argent : METAUX.or
    disque = `<circle cx="50" cy="50" r="47" fill="${ext.fond}" stroke="${ext.bord}" stroke-width="3"/>`
           + `<circle cx="50" cy="50" r="31" fill="${int.fond}" stroke="${int.bord}" stroke-width="2"/>`
  } else {
    const m = METAUX[p.metal]
    disque = `<circle cx="50" cy="50" r="47" fill="${m.fond}" stroke="${m.bord}" stroke-width="3"/>`
           + `<circle cx="50" cy="50" r="39" fill="none" stroke="${m.bord}" stroke-width="1.5" opacity=".6"/>`
  }
  const fs = p.label.length > 1 ? 30 : 36
  const texte = `<text x="50" y="${50 + fs * 0.36}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" `
              + `font-weight="800" font-size="${fs}" fill="#222">${p.label}<tspan font-size="${Math.round(fs * 0.62)}" dx="2">${p.unite}</tspan></text>`
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}" viewBox="0 0 100 100" role="img" aria-label="${nomArgent(v)}">${disque}${texte}</svg>`
}

function svgBillet(v, echelle = 1) {
  const b = BILLETS[v]
  const W = Math.round(b.w * 0.9 * echelle), H = Math.round(b.h * 0.9 * echelle)
  const n = String(v / 100)
  const { w, h } = b
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${nomArgent(v)}">`
    + `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="4" fill="${b.fond}" stroke="${b.fonce}" stroke-width="2"/>`
    + `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" rx="2" fill="none" stroke="#fff" stroke-width="1.2" opacity=".75"/>`
    + `<path d="M ${w * 0.58} ${h - 6} V ${h * 0.45} A ${w * 0.12} ${w * 0.12} 0 0 1 ${w * 0.82} ${h * 0.45} V ${h - 6} Z" fill="#fff" opacity=".4"/>`
    + `<text x="11" y="${h * 0.55}" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="${h * 0.44}" fill="${b.fonce}">${n}<tspan font-size="${h * 0.26}" dx="3">€</tspan></text>`
    + `<text x="12" y="${h * 0.82}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${h * 0.13}" fill="#222" letter-spacing="2">EURO</text>`
    + `<text x="${w - 9}" y="${h * 0.27}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${h * 0.18}" fill="#222">${n}</text>`
    + `</svg>`
}

function svgArgent(v, echelle = 1) {
  return v >= 500 ? svgBillet(v, echelle) : svgPiece(v, echelle)
}
// ── FIN LOGIQUE ──

const DEFAUT = { niveau: 'ce1', exercices: ['compter', 'composer'], nbQ: 10, centimes: false, aideTotal: true }
const stocke = { ...DEFAUT, ...charger('monnaie_config', {}) }
if (!NIVEAUX[stocke.niveau]) stocke.niveau = 'ce1'
stocke.exercices = (Array.isArray(stocke.exercices) ? stocke.exercices : []).filter(e => GENERATEURS[e])
if (!stocke.exercices.length) stocke.exercices = [...DEFAUT.exercices]
if (![5, 10, 15].includes(stocke.nbQ)) stocke.nbQ = 10
const config = ref(stocke)
watch(config, v => sauvegarder('monnaie_config', v), { deep: true })

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const etatsDots = ref([])
const saisieE = ref('')
const saisieC = ref('')
const saisieT = ref('')
const selection = ref([])
const repondu = ref(false)
const dernierOk = ref(false)
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const inputEl = ref(null)
let minuterie = null

const niveau = computed(() => NIVEAUX[config.value.niveau] || NIVEAUX.ce1)
const typesNiveau = computed(() => TYPES.filter(t => niveau.value.types.includes(t.id)))
const f = c => fmt(c, niveau.value)
watch(() => config.value.niveau, () => {
  const ex = config.value.exercices.filter(e => niveau.value.types.includes(e))
  config.value.exercices = ex.length ? ex : [...DEFAUT.exercices]
})
const q = computed(() => questions.value[idx.value])
const palette = computed(() => niveau.value.palette[config.value.centimes ? 'centimes' : 'entiers'])
const paletteApercu = computed(() => palette.value)

function toggleExercice(id) {
  const ex = config.value.exercices
  if (ex.includes(id)) {
    if (ex.length === 1) return
    config.value.exercices = ex.filter(e => e !== id)
  } else {
    config.value.exercices = TYPES.map(t => t.id).filter(t => t === id || ex.includes(t))
  }
}

function demarrer() {
  clearTimeout(minuterie)
  questions.value = genererSansRepetition(config.value.exercices, config.value.nbQ, niveau.value, config.value.centimes)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  etatsDots.value = questions.value.map(() => '')
  phase.value = 'jeu'
  afficherQuestion()
}

function quitter() {
  clearTimeout(minuterie)
  phase.value = 'config'
}

function afficherQuestion() {
  saisieE.value = ''; saisieC.value = ''; saisieT.value = ''; selection.value = []
  repondu.value = false; dernierOk.value = false
  feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  nextTick(() => inputEl.value?.focus?.())
}

function ajouter(v) { if (!repondu.value && selection.value.length < 30) selection.value.push(v) }
function enlever(i) { if (!repondu.value) selection.value.splice(i, 1) }
function annuler() { if (!repondu.value) selection.value.pop() }

function entree() {
  if (repondu.value) { if (!dernierOk.value) suivant() }
  else valider()
}

function valider() {
  if (repondu.value) return
  const qu = q.value
  if (qu.type === 'convertir') {
    const vide = qu.sous === 'c2ec' ? saisieE.value === '' && saisieC.value === '' : !String(saisieT.value).trim()
    if (vide) return
    const donne = qu.sous === 'c2ec' ? `${saisieE.value || 0} € ${saisieC.value || 0} c`
      : `${String(saisieT.value).trim()}${qu.sous === 'ec2dec' ? '' : ' c'}`
    terminer(verifierConversion(qu, { e: saisieE.value, c: saisieC.value, texte: saisieT.value }), donne,
      t('pasTout'))
    return
  }
  if (qu.type === 'compter' && qu.avecCentimes && niveau.value.saisieDecimale) {
    if (!String(saisieT.value).trim()) return
    const val = lireSomme(saisieT.value)
    if (val === null) {
      feedback.value = t('ecrisSomme')
      feedbackClass.value = 'erreur'
      return
    }
    terminer(val === qu.total, f(val), t('pasTout'))
    return
  }
  if (qu.type === 'compter') {
    if (saisieE.value === '' && saisieC.value === '') return
    const e = parseInt(saisieE.value || '0', 10)
    const c = qu.avecCentimes ? parseInt(saisieC.value || '0', 10) : 0
    if (isNaN(e) || isNaN(c) || e < 0 || c < 0) return
    const val = e * 100 + c
    const ok = c < 100 && val === qu.total
    terminer(ok, f(val), t('pasTout'))
    return
  }
  if (!selection.value.length) return
  const tot = totalDe(selection.value)
  const n = selection.value.length
  if (qu.type === 'moins') {
    const donne = `${n} : ${trierDesc(selection.value).map(formatSomme).join(' + ')}`
    if (tot !== qu.cible) {
      terminer(false, donne, t('auLieuDe', { t: f(tot), c: f(qu.cible) }))
    } else if (n > qu.solution.length) {
      terminer(false, donne, t('tropDePieces', { t: f(tot), n: qu.solution.length }))
    } else {
      terminer(true, donne)
    }
    return
  }
  // composer / rendre
  terminer(tot === qu.cible, f(tot),
    tot < qu.cible ? t('ilManque', { t: f(tot), m: f(qu.cible - tot) })
                   : t('deTrop', { t: f(tot), m: f(tot - qu.cible) }))
}

function choisirComparer(choix) {
  if (repondu.value) return
  const qu = q.value
  const donne = choix === 'A' ? qu.nomA : choix === 'B' ? qu.nomB : t('autant')
  const msg = qu.bonne === 'egal'
    ? t('autantArgent', { s: f(qu.totalA) })
    : t('lePlus', { nom: qu.attendu })
  terminer(choix === qu.bonne, donne, msg)
}

function terminer(ok, donne, msgErreur = '') {
  const qu = q.value
  repondu.value = true
  dernierOk.value = ok
  historique.value.push({ texte: qu.texte, donne, attendu: qu.attendu, ok })
  etatsDots.value[idx.value] = ok ? 'ok' : 'erreur'
  if (ok) {
    bonnes.value++
    inputClass.value = 'ok'
    feedback.value = pioche(t('bravo'))
    feedbackClass.value = 'ok'
    minuterie = setTimeout(suivant, 900)
  } else {
    mauvaises.value++
    inputClass.value = 'erreur'
    feedback.value = '❌ ' + msgErreur
    feedbackClass.value = 'erreur'
  }
}

function passer() {
  if (repondu.value) return
  const qu = q.value
  historique.value.push({ texte: qu.texte, donne: t('passe'), attendu: qu.attendu, ok: false })
  etatsDots.value[idx.value] = 'erreur'
  mauvaises.value++
  suivant()
}

function suivant() {
  clearTimeout(minuterie)
  if (phase.value !== 'jeu') return
  idx.value++
  if (idx.value >= questions.value.length) phase.value = 'resultats'
  else afficherQuestion()
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return t('resultat100') }
  if (pct >= 80)   { confettis(25); return t('resultat80') }
  if (pct >= 60)   return t('resultat60')
  if (pct >= 40)   return t('resultat40')
  return t('resultat0')
})

onUnmounted(() => clearTimeout(minuterie))

// ── Fiche imprimable (aperçu + impression gérés par ConfigExercice) ──
function htmlFiche() {
  const niv = niveau.value
  // Parties de la fiche selon les exercices choisis (toutes si aucun n'a d'équivalent papier)
  const choisis = config.value.exercices
  let parties = {
    compter: choisis.includes('compter'),
    entoure: choisis.includes('composer') || choisis.includes('moins'),
    rendre: choisis.includes('rendre'),
    convertir: choisis.includes('convertir') && niv.types.includes('convertir'),
  }
  if (!Object.values(parties).some(Boolean)) parties = { compter: true, entoure: true, rendre: true, convertir: niv.types.includes('convertir') }
  let numPartie = 0
  const titrePartie = txt => `<h2>${++numPartie}. ${txt}</h2>`
  const centimes = config.value.centimes
  const dessin = items => items.map(v => `<span class="arg">${svgArgent(v, 0.8)}</span>`).join('')
  const decimale = centimes && niv.saisieDecimale
  const br = enBr()
  const T = (fr, b) => (br ? b : fr)
  const ligneRep = decimale ? '__________ €' : centimes ? '______ € ______ c' : '__________ €'

  // 1. Compter
  const compter = genererSansRepetition(['compter'], 6, niv, centimes)
  const blocCompter = compter.map((qu, i) => `
    <div class="bloc">
      <div class="num">${i + 1}.</div>
      <div class="tas">${dessin(qu.items)}</div>
      <div class="rep">${T('Il y a', 'Sammad')} : ${ligneRep}</div>
    </div>`).join('')

  // 2. Entoure pour payer
  const valeursEntoure = niv.palette[centimes ? 'centimes' : 'entiers'].filter(v => v <= 2000)
  const vus = new Set()
  const entoure = []
  for (let essai = 0; essai < 100 && entoure.length < 3; essai++) {
    const cible = centimes ? aleatoire(1, 9) * 100 + aleatoirePas(10, 90, 5) : aleatoire(6, 45) * 100
    if (vus.has(cible)) continue
    vus.add(cible)
    const bons = decomposerAuHasard(cible, valeursEntoure, 6)
    const intrus = tirerItems(valeursEntoure, 2, 3)
    entoure.push({ cible, items: trierDesc([...bons, ...intrus]) })
  }
  const blocEntoure = entoure.map((e, i) => `
    <div class="bloc">
      <div class="num">${i + 1}.</div>
      <div class="enonce">${T("Entoure ce qu'il faut pour payer exactement", 'Kelc\'hia ar pezh a zo ezhomm evit paeañ resis')} <strong>${fmt(e.cible, niv)}</strong>.</div>
      <div class="tas">${dessin(e.items)}</div>
    </div>`).join('')

  // 3. Rendre la monnaie
  const rendre = genererSansRepetition(['rendre'], 4, niv, centimes)
  const blocRendre = rendre.map((qu, i) => `
    <div class="ligne-rendre">
      <span class="num">${i + 1}.</span>
      ${qu.objet[0]} ${t('tuAchetes')} ${qu.objet[1]} ${T('à', 'da')} <strong>${fmt(qu.prix, niv)}</strong>.
      ${t('tuDonnes')} <strong>${formatSomme(qu.paye)}</strong>. ${T('On te rend', 'Distroet e vo dit')} : ${centimes ? '______________' : '______ €'}
    </div>`).join('')

  // 4. Conversions (CE2)
  let blocConvertir = ''
  if (parties.convertir) {
    const conv = genererSansRepetition(['convertir'], 8, niv, centimes)
    blocConvertir = `<div class="grille">`
      + conv.map((qu, i) => `<div class="ligne-rendre"><span class="num">${i + 1}.</span> ${qu.texte
        .replace('? € ? c', '______ € ______ c').replace(/\? € \(.*\)/, '__________ €').replace('? c', '__________ c')}</div>`).join('')
      + '</div>'
  }

  const html = `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${config.value.niveau.toUpperCase()}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.2cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      h2 { font-size: 1.05rem; margin: 1.2rem 0 .4rem; }
      h2 small { font-weight: 400; color: #666; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1rem; }
      .bloc { border: 1.5px solid #bbb; border-radius: 8px; padding: .5rem .75rem; margin: .5rem 0; page-break-inside: avoid; }
      .num { font-weight: 700; color: #777; display: inline-block; min-width: 1.6rem; }
      .tas { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: .3rem 0; }
      .arg svg { display: block; }
      .rep { text-align: right; font-size: 1.1rem; margin-top: .3rem; }
      .enonce { display: inline; }
      .ligne-rendre { margin: .9rem 0; font-size: 1.05rem; line-height: 1.6; }
      .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 0 .75rem; }
      * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    </style></head><body>
    <h1>💶 ${t('titre')} — ${config.value.niveau.toUpperCase()}</h1>
    <p class="entete">${centimes ? T('Euros et centimes', 'Euro ha santimoù') : T('Euros', 'Euro')} &nbsp;&nbsp;&nbsp; ${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    ${parties.compter ? `${titrePartie(`${T("Compte l'argent.", "Kont an arc'hant.")}${decimale ? ` <small>${T('(écris par exemple 3,50 €)', '(skriv da skouer 3,50 €)')}</small>` : ''}`)}
    <div class="grille">${blocCompter}</div>` : ''}
    ${parties.entoure ? `${titrePartie(T('Entoure les pièces et les billets.', 'Kelc\'hia ar pezhioù moneiz hag ar bilhedoù.'))}
    ${blocEntoure}` : ''}
    ${parties.rendre ? `${titrePartie(T('Combien te rend-on ?', 'Pegement a vez distroet dit ?'))}
    ${blocRendre}` : ''}
    ${blocConvertir ? `${titrePartie(`${T('Complète.', 'Leunia.')} <small>(1 € = 100 c)</small>`)}${blocConvertir}` : ''}
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
</script>

<style scoped>
.aide-config { font-size: .8rem; color: #888; margin-top: .4rem; }
.consigne {
  font-size: 1.3rem;
  font-weight: 700;
  text-align: center;
  margin: .75rem 0;
  line-height: 1.5;
}
.consigne.petite { font-size: 1.1rem; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: .5rem; flex-wrap: wrap; }
.somme { color: var(--bleu); white-space: nowrap; font-size: 1.5rem; }
.objet { font-size: 2rem; vertical-align: middle; }

.apercu {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 6px; margin-top: 1rem; padding: .75rem; background: var(--gris-bg); border-radius: 8px;
}

.tas {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
  gap: 8px; margin: 1rem 0;
}
.argent { display: inline-flex; line-height: 0; }
.argent :deep(svg) { display: block; filter: drop-shadow(0 1px 1px rgba(0,0,0,.25)); }

.saisie-somme {
  display: flex; align-items: center; justify-content: center; gap: .5rem; margin-top: .5rem;
}
.saisie-petite { width: 7rem; display: inline-block; }
.saisie-large { width: 12rem; display: inline-block; }
.consigne.conversion { font-size: 1.8rem; font-weight: 900; }
.unite { font-size: 1.8rem; font-weight: 800; }

.plateau {
  min-height: 90px;
  border: 3px dashed var(--gris-brd);
  border-radius: var(--radius);
  padding: .5rem;
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 4px;
  margin-top: .75rem;
  background: #fffdf5;
}
.plateau.ok     { border-color: var(--vert); background: #f0faf0; }
.plateau.erreur { border-color: var(--rouge); background: #fef0f0; }
.plateau-vide { color: #aaa; font-style: italic; }

.plateau-actions {
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
  gap: .5rem; margin: .5rem 0 1rem;
}
.total-aide { font-size: 1.1rem; }
.btn.petit { padding: .45rem .9rem; font-size: .9rem; min-height: 44px; }
.btn:disabled { opacity: .45; cursor: not-allowed; }

.palette {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 8px;
  padding: .75rem; background: var(--gris-bg); border-radius: var(--radius);
}
.btn-argent {
  min-width: 48px; min-height: 48px;
  display: inline-flex; align-items: center; justify-content: center;
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: 4px; cursor: pointer; transition: transform .1s, border-color .15s;
  touch-action: manipulation;
}
.btn-argent:hover:not(:disabled)  { border-color: var(--bleu); }
.btn-argent:active:not(:disabled) { transform: scale(.94); }
.btn-argent:disabled { cursor: default; opacity: .8; }
.btn-argent.dans-plateau { background: transparent; border-color: transparent; }

.porte-monnaies {
  display: grid; grid-template-columns: 1fr 1fr; gap: .75rem;
}
.porte-monnaie {
  border: 3px solid var(--gris-brd); border-radius: var(--radius); padding: .5rem;
  background: #fffdf5;
}
.porte-monnaie.gagnant { border-color: var(--vert); background: #f0faf0; }
.porte-nom { font-weight: 800; text-align: center; font-size: 1.15rem; }
.porte-monnaie .tas { margin: .5rem 0; gap: 4px; }
.porte-total { text-align: center; font-weight: 800; font-size: 1.2rem; color: var(--bleu); }
.choix { min-height: 48px; font-size: 1.05rem; }

.correction {
  border: 2px solid var(--orange); background: #fff8ec; border-radius: var(--radius);
  padding: .75rem 1rem; text-align: center; font-size: 1.05rem;
}
.correction .tas { margin: .5rem 0; }
.astuce { font-size: .95rem; color: #666; margin-top: .4rem; }

@media (max-width: 520px) {
  .porte-monnaies { grid-template-columns: 1fr; }
  .exercise-box { padding: 1.25rem .75rem; }
}
</style>
