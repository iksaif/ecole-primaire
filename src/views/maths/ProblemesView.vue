<template>
  <div class="container">
    <h1 class="section-heading">🧩 {{ t('titre') }}</h1>

    <!-- Config -->
    <ConfigExercice v-if="phase === 'config'" :config="config" v-model:mode="mode" :fiche="fiche"
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
        <div class="config-section-title">{{ t('typesProblemes') }}</div>
        <div class="btn-group">
          <button v-for="c in categoriesNiveau" :key="c.id"
            class="level-btn" :class="{ active: config.categories.includes(c.id) }"
            @click="toggleCategorie(c.id)">{{ tr(c.label) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nombres') }}</div>
        <div class="btn-group">
          <button v-for="(p, id) in niveauData.plages" :key="id"
            class="level-btn" :class="{ active: config.plage === id }"
            @click="config.plage = id">{{ t('jusqua', { n: p.max }) }}</button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbProblemes') }}</div>
        <div class="btn-group">
          <button v-for="n in [3, 5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nbQ === n }"
            @click="config.nbQ = n">{{ n }}</button>
        </div>
      </div>

      <div v-if="mode === 'imprimer'" class="config-section">
        <div class="config-section-title">{{ t('corrigeFin') }}</div>
        <div class="btn-group">
          <button class="level-btn" :class="{ active: config.corrige }" @click="config.corrige = true">{{ t('oui') }}</button>
          <button class="level-btn" :class="{ active: !config.corrige }" @click="config.corrige = false">{{ t('non') }}</button>
        </div>
      </div>
    </ConfigExercice>

    <!-- Exercice -->
    <template v-if="phase === 'jeu' && q">
      <div class="score-bar">
        <button class="btn-quitter" @click="quitter" :title="t('quitterTitre')">{{ t('quitter') }}</button>
        <span>{{ t('probleme', { n: idx + 1, total: questions.length }) }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>

      <div class="exercise-box">
        <div class="prog-dots">
          <span v-for="(_, i) in questions" :key="i" class="prog-dot"
            :class="{ current: i === idx, ok: historique[i]?.ok, erreur: historique[i] && !historique[i].ok }"></span>
        </div>

        <div class="enonce">
          <p>{{ q.enonce }}</p>
          <p class="enonce-question">{{ q.question }}</p>
        </div>

        <!-- pas de voix bretonne dans les navigateurs : bouton masqué en breton -->
        <div v-if="langue !== 'br'" style="text-align:center;margin-bottom:1rem;">
          <button class="btn btn-ghost" @click="lireEnonce">
            {{ enLecture ? t('arreter') : t('lireEnonce') }}
          </button>
        </div>

        <div class="reponse-ligne">
          <input ref="inputEl" class="exercise-input reponse-input" :class="inputClass"
                 type="number" inputmode="numeric" placeholder="?"
                 v-model="reponse" autocomplete="off" :disabled="verrou" @keydown.enter="valider">
          <span class="unite">{{ q.reponse >= 2 ? q.unite.p : q.unite.s }}</span>
        </div>

        <div class="feedback" :class="feedbackClass">{{ feedback }}</div>
        <div v-if="verrou && !dernierOk" class="calcul-correction">{{ q.calcul }}</div>

        <div class="btn-group" style="justify-content:center;margin-top:1rem;">
          <button class="btn btn-ghost" :disabled="verrou" @click="passer">{{ t('passer') }}</button>
          <button v-if="!verrou" class="btn btn-primary" @click="valider">{{ t('valider') }}</button>
          <button v-else-if="!dernierOk" class="btn btn-primary" @click="suivant">{{ t('suivant') }}</button>
        </div>
      </div>
    </template>

    <!-- Résultats -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <table class="correction-table">
        <thead><tr><th>{{ t('colProbleme') }}</th><th>{{ t('taReponse') }}</th><th>{{ t('colCorrection') }}</th><th></th></tr></thead>
        <tbody>
          <tr v-for="(h, i) in historique" :key="i" :class="h.ok ? 'ok' : 'erreur'">
            <td>{{ h.question }}</td>
            <td>{{ h.donne }}</td>
            <td><span style="font-weight:800;">{{ h.calcul }}</span><br>→ {{ h.attendu }}</td>
            <td>{{ h.ok ? '✅' : '❌' }}</td>
          </tr>
        </tbody>
      </table>

      <div class="btn-group" style="justify-content:center;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost"   @click="phase = 'config'">{{ t('parametres') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, watch, onUnmounted } from 'vue'
import { aleatoire, melanger, confettis, sauvegarder, charger } from '../../utils'
import { useTTS } from '../../composables/useTTS'
import { useI18n } from '../../i18n'
import ConfigExercice from '../../components/ConfigExercice.vue'
import { useModeExercice } from '../../composables/useModeExercice'

const { t, tr, langue } = useI18n({
  fr: {
    titre: 'Problèmes',
    typesProblemes: 'Types de problèmes',
    nombres: 'Nombres',
    jusqua: "Jusqu'à {n}",
    nbProblemes: 'Nombre de problèmes',
    probleme: 'Problème {n} / {total}',
    arreter: '⏹ Arrêter',
    lireEnonce: "🔊 Lire l'énoncé",
    colProbleme: 'Problème',
    colCorrection: 'Correction',
    pCalcul: 'Calcul :',
    pReponse: 'Réponse :',
    pNbProblemes: '{n} problèmes',
    corrigeFin: 'Corrigé (page à part)',
  },
  br: {
    titre: 'Kudennoù',
    typesProblemes: 'Seurtoù kudennoù',
    nombres: 'Niveroù',
    jusqua: 'Betek {n}',
    nbProblemes: 'Niver a gudennoù',
    probleme: 'Kudenn {n} / {total}',
    arreter: '⏹ Paouez',
    lireEnonce: '🔊 Lenn ar gudenn',
    colProbleme: 'Kudenn',
    colCorrection: 'Reizhadenn',
    pCalcul: 'Jedadur :',
    pReponse: 'Respont :',
    pNbProblemes: '{n} kudenn',
    corrigeFin: 'Reizhadenn (war ur bajenn all)', // br: à relire
  },
})

// #region generation — fonctions pures (testables hors de Vue)

// Données par niveau. Un modèle peut être réservé à certains niveaux (champ `niveaux`)
// ou à une plage minimale (champ `min`, ex. prix d'un vélo seulement « jusqu'à 1000 »).
const NIVEAUX = {
  ce1: {
    plages: {
      petits: { label: 'Jusqu\'à 20', max: 20 },
      moyens: { label: 'Jusqu\'à 100', max: 100 },
      grands: { label: 'Jusqu\'à 1000', max: 1000 },
    },
    tables: [2, 3, 4, 5, 10],
    categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'deuxEtapes'],
  },
  ce2: {
    plages: {
      moyens: { label: 'Jusqu\'à 100', max: 100 },
      grands: { label: 'Jusqu\'à 1000', max: 1000 },
    },
    tables: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    categories: ['ajoutRetrait', 'comparaison', 'partiesTout', 'multiplication', 'partage', 'foisPlus', 'deuxEtapes'],
  },
}

const CATEGORIES = [
  { id: 'ajoutRetrait', label: { fr: '➕➖ Ajout / retrait', br: '➕➖ Ouzhpennañ / lemel' } },
  { id: 'comparaison',  label: { fr: '⚖️ Comparaison', br: '⚖️ Keñveriañ' } },
  { id: 'partiesTout',  label: { fr: '🧺 Parties et tout', br: "🧺 Lodennoù hag an holl" } }, // br: à relire
  { id: 'multiplication', label: { fr: '✖️ Multiplication', br: '✖️ Liesadenn' } },
  { id: 'partage',      label: { fr: '🍰 Partage / groupements', br: '🍰 Rannañ / strollañ' } },
  { id: 'foisPlus',     label: { fr: '🔁 « Fois plus »', br: '🔁 « Gwech kement »' } }, // br: à relire
  { id: 'deuxEtapes',   label: { fr: '🪜 Plusieurs étapes', br: '🪜 Meur a bazenn' } },
]

const PRENOMS = [
  { nom: 'Léo', g: 'm' }, { nom: 'Emma', g: 'f' }, { nom: 'Inès', g: 'f' }, { nom: 'Noah', g: 'm' },
  { nom: 'Jade', g: 'f' }, { nom: 'Adam', g: 'm' }, { nom: 'Lina', g: 'f' }, { nom: 'Hugo', g: 'm' },
  { nom: 'Chloé', g: 'f' }, { nom: 'Yanis', g: 'm' }, { nom: 'Mila', g: 'f' }, { nom: 'Sacha', g: 'm' },
  { nom: 'Zoé', g: 'f' }, { nom: 'Malo', g: 'm' }, { nom: 'Aya', g: 'f' }, { nom: 'Nathan', g: 'm' },
  { nom: 'Louise', g: 'f' }, { nom: 'Gabriel', g: 'm' }, { nom: 'Rose', g: 'f' }, { nom: 'Mohamed', g: 'm' },
  { nom: 'Ambre', g: 'f' }, { nom: 'Timéo', g: 'm' }, { nom: 'Lou', g: 'f' }, { nom: 'Éliott', g: 'm' },
]
// Prénoms bretons (aucun ne commence par une consonne mutable après « da »)
const PRENOMS_BR = [
  { nom: 'Yann', g: 'm' }, { nom: 'Nolwenn', g: 'f' }, { nom: 'Erwan', g: 'm' }, { nom: 'Aziliz', g: 'f' },
  { nom: 'Ronan', g: 'm' }, { nom: 'Enora', g: 'f' }, { nom: 'Elouan', g: 'm' }, { nom: 'Lena', g: 'f' },
  { nom: 'Lomig', g: 'm' }, { nom: 'Yuna', g: 'f' }, { nom: 'Riwal', g: 'm' }, { nom: 'Sterenn', g: 'f' },
  { nom: 'Iwan', g: 'm' }, { nom: 'Soazig', g: 'f' }, { nom: 'Noan', g: 'm' }, { nom: 'Anna', g: 'f' },
]

// Objets que l'on collectionne / échange
// `br` : nom breton (toujours au singulier après un nombre)
const OBJETS = [
  { s: 'bille', p: 'billes', g: 'f', br: 'bilhenn' }, { s: 'carte', p: 'cartes', g: 'f', br: 'kartenn' },
  { s: 'image', p: 'images', g: 'f', br: 'skeudenn' }, { s: 'perle', p: 'perles', g: 'f', br: 'perlezenn' },
  { s: 'autocollant', p: 'autocollants', g: 'm', br: 'skritell' }, { s: 'coquillage', p: 'coquillages', g: 'm', br: 'kregenn' }, // br: à relire (« skritell » = autocollant)
  { s: 'bonbon', p: 'bonbons', g: 'm', br: 'bonbon' }, { s: 'timbre', p: 'timbres', g: 'm', br: 'timbr' },
]
const PAQUETS = [
  { s: 'gâteau', p: 'gâteaux', g: 'm', br: 'gwastell' }, { s: 'image', p: 'images', g: 'f', br: 'skeudenn' },
  { s: 'carte', p: 'cartes', g: 'f', br: 'kartenn' }, { s: 'biscuit', p: 'biscuits', g: 'm', br: 'gwispidenn' }, // br: à relire (« gwispidenn » = biscuit)
  { s: 'crayon', p: 'crayons', g: 'm', br: 'kreion' }, { s: 'bonbon', p: 'bonbons', g: 'm', br: 'bonbon' },
]
// « Un vélo a 2 roues »
// br : { un: « un/une … » avec mutation, s: nom, g: genre (kaout), partie } — pas de tricycle en breton
const CHOSES_A_PARTIES = [
  { s: 'vélo', p: 'vélos', g: 'm', k: 2, partie: { s: 'roue', p: 'roues' }, br: { un: "Ur marc'h-houarn", s: "marc'h-houarn", g: 'm', partie: 'rod' } },
  { s: 'tricycle', p: 'tricycles', g: 'm', k: 3, partie: { s: 'roue', p: 'roues' } },
  { s: 'voiture', p: 'voitures', g: 'f', k: 4, partie: { s: 'roue', p: 'roues' }, br: { un: 'Ur wetur', s: 'gwetur', g: 'f', partie: 'rod' } }, // br: à relire
  { s: 'chien', p: 'chiens', g: 'm', k: 4, partie: { s: 'patte', p: 'pattes' }, br: { un: "Ur c'hi", s: 'ki', g: 'm', partie: 'pav' } },
  { s: 'main', p: 'mains', g: 'f', k: 5, partie: { s: 'doigt', p: 'doigts' }, br: { un: 'Un dorn', s: 'dorn', g: 'm', partie: 'biz' } },
  { s: 'étoile de mer', p: 'étoiles de mer', g: 'f', k: 5, partie: { s: 'bras', p: 'bras' }, br: { un: 'Ur steredenn-vor', s: 'steredenn-vor', g: 'f', partie: 'brec\'h' } },
]

const U = (s, p) => ({ s, p: p ?? s + 's' })
const EUROS = U('euro')

function choisir(t) { return t[aleatoire(0, t.length - 1)] }
function deuxPrenoms() { const [a, b] = melanger(BR() ? PRENOMS_BR : PRENOMS); return [a, b] }
// Breton
const BR = () => langue.value === 'br'
const prenom = () => choisir(BR() ? PRENOMS_BR : PRENOMS)
const UB = s => ({ s, p: s })                                // pas de pluriel après un nombre
const deus = p => p.g === 'f' ? 'he deus' : 'en deus'        // il/elle a
const doa = p => p.g === 'f' ? 'he doa' : 'en doa'           // il/elle avait
const gant = p => p.g === 'f' ? 'ganti' : 'gantañ'           // avec lui/elle
const commenceParVoyelle = s => /^[aeiouyhéèêàâîïôûœAEIOUYHÉÈÊÀÂÎÔŒ]/.test(s)
const de = mot => commenceParVoyelle(mot) ? `d'${mot}` : `de ${mot}`
const que = p => commenceParVoyelle(p.nom) ? `qu'${p.nom}` : `que ${p.nom}`
const il = p => p.g === 'f' ? 'elle' : 'il'
const Il = p => p.g === 'f' ? 'Elle' : 'Il'
const ils = (p1, p2) => p1.g === 'f' && p2.g === 'f' ? 'elles' : 'ils'
const accord = (n, u) => `${n} ${n >= 2 ? u.p : u.s}`

// Deux nombres a, b avec a + b ≤ max, ni trop petits ni triviaux
function tirerSomme(max) {
  const lo = max <= 20 ? 2 : max <= 100 ? Math.max(3, Math.round(max / 10)) : 40
  const a = aleatoire(lo, max - lo)
  const b = aleatoire(Math.max(2, Math.round(lo / 2)), max - a)
  return [a, b]
}

// n × k avec k dans les tables du niveau, produit ≤ max
function tirerProduit(niv, max) {
  let n, k
  do { n = aleatoire(2, 10); k = choisir(niv.tables) } while (n * k > Math.max(max, 20))
  return [n, k]
}

function multiplicationDetail(n, k) {
  const r = n * k
  return n <= 5 ? `${Array(n).fill(k).join(' + ')} = ${r}, ${BR() ? 'neuze' : 'donc'} ${n} × ${k} = ${r}` : `${n} × ${k} = ${r}`
}

// Chaque modèle : cat, cap (plus grand nombre réaliste dans ce contexte), gen(niv, max)
// gen renvoie { enonce, question, reponse, unite, calcul }
// En breton (langue = 'br') : nombres en chiffres, nom au singulier après un nombre,
// tournures simples avec « kaout » (en deus / he deus). À faire relire par un brittophone.
const MODELES = [
  // ─── Ajout / retrait ──────────────────────────────────────────────────────
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état final, ajout
    const p = prenom(), o = choisir(OBJETS.filter(x => x.s !== 'timbre')), [a, b] = tirerSomme(max)
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${a} ${o.br}. E-pad ar ratre e c'hounez ${b} all.`,
      question: `Pet ${o.br} ${deus(p)} bremañ ?`, reponse: a + b, unite: UB(o.br), calcul: `${a} + ${b} = ${a + b}` }
    return { enonce: `${p.nom} a ${a} ${o.p}. À la récréation, ${il(p)} en gagne ${b}.`,
      question: `Combien ${de(o.p)} a-t-${il(p)} maintenant ?`, reponse: a + b, unite: o, calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = prenom(), [a, b] = tirerSomme(max)
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${a} timbr en ${p.g === 'f' ? 'he dastumad' : 'e zastumad'}. Evit ${p.g === 'f' ? 'he deiz-ha-bloaz' : 'e zeiz-ha-bloaz'} e resev ${b} timbr all.`, // br: à relire (mutations après e/he)
      question: `Pet timbr ${deus(p)} bremañ ?`, reponse: a + b, unite: UB('timbr'), calcul: `${a} + ${b} = ${a + b}` }
    return { enonce: `${p.nom} a ${a} timbres dans sa collection. Pour son anniversaire, on lui offre ${b} timbres.`,
      question: `Combien de timbres a-t-${il(p)} maintenant ?`, reponse: a + b, unite: U('timbre'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'ajoutRetrait', cap: 60, gen(niv, max) {           // état final, retrait
    const [r, b] = tirerSomme(max), a = r + b
    if (BR()) return { enonce: `Er bus ez eus ${a} beajour. En arsav e ziskenn ${b} beajour.`,
      question: 'Pet beajour a chom er bus ?', reponse: r, unite: UB('beajour'), calcul: `${a} − ${b} = ${r}` }
    return { enonce: `Dans le bus, il y a ${a} passagers. À l'arrêt, ${b} ${b >= 2 ? 'passagers descendent' : 'passager descend'}.`,
      question: 'Combien de passagers reste-t-il dans le bus ?', reponse: r, unite: U('passager'), calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = prenom(), [r, b] = tirerSomme(max), a = r + b
    if (BR()) return { enonce: `En ul levr ez eus ${a} pajenn. ${p.nom} ${deus(p)} lennet ${b} anezho dija.`,
      question: 'Pet pajenn a chom da lenn ?', reponse: r, unite: UB('pajenn'), calcul: `${a} − ${b} = ${r}` }
    return { enonce: `Un livre a ${a} pages. ${p.nom} en a déjà lu ${b}.`,
      question: 'Combien de pages lui reste-t-il à lire ?', reponse: r, unite: U('page'), calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état initial inconnu (après un gain)
    const p = prenom(), o = choisir(OBJETS), [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `${p.nom} ${deus(p)} gounezet ${b} ${o.br}. Bremañ ${deus(p)} ${c} ${o.br}.`,
      question: `Pet ${o.br} ${doa(p)} da gentañ ?`, reponse: a, unite: UB(o.br), calcul: `${c} − ${b} = ${a}` }
    return { enonce: `${p.nom} avait des ${o.p}. ${Il(p)} en a gagné ${b}. Maintenant, ${il(p)} en a ${c}.`,
      question: `Combien ${de(o.p)} avait-${il(p)} au début ?`, reponse: a, unite: o, calcul: `${c} − ${b} = ${a}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // état initial inconnu (après une perte)
    const p = prenom(), [b, c] = tirerSomme(max)
    if (BR()) return { enonce: `${p.nom} ${deus(p)} debret ${b} bonbon. Chom a ra ${c} bonbon ${gant(p)}.`,
      question: `Pet bonbon ${doa(p)} da gentañ ?`, reponse: b + c, unite: UB('bonbon'), calcul: `${b} + ${c} = ${b + c}` }
    return { enonce: `${p.nom} a mangé ${b} bonbons. Il lui en reste ${c}.`,
      question: `Combien de bonbons avait-${il(p)} au début ?`, reponse: b + c, unite: U('bonbon'), calcul: `${b} + ${c} = ${b + c}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const [b, c] = tirerSomme(max)
    if (BR()) return { enonce: `Ar miz-mañ ez eus bet prestet ${b} levr gant levraoueg ar skol. Chom a ra ${c} levr el levraoueg.`,
      question: 'Pet levr a oa el levraoueg e deroù ar miz ?', reponse: b + c, unite: UB('levr'), calcul: `${b} + ${c} = ${b + c}` }
    return { enonce: `Ce mois-ci, la bibliothèque de l'école a prêté ${b} livres. Il reste ${c} livres sur les étagères.`,
      question: 'Combien de livres y avait-il sur les étagères au début du mois ?', reponse: b + c, unite: U('livre'), calcul: `${b} + ${c} = ${b + c}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // transformation inconnue (ajout)
    const [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `E deroù ar ratre ez eus ${a} bugel er porzh. Bugale all a zeu. Bremañ ez eus ${c} bugel er porzh.`,
      question: 'Pet bugel a zo deuet ?', reponse: b, unite: UB('bugel'), calcul: `${c} − ${a} = ${b}` }
    return { enonce: `Au début de la récréation, il y a ${a} enfants dans la cour. D'autres enfants arrivent. Maintenant, il y a ${c} enfants dans la cour.`,
      question: 'Combien d\'enfants sont arrivés ?', reponse: b, unite: U('enfant'), calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'ajoutRetrait', cap: 100, gen(niv, max) {          // transformation inconnue (retrait)
    const p = prenom(), [c, b] = tirerSomme(max), a = b + c
    if (BR()) return { enonce: `${p.nom} ${doa(p)} ${a} euro. Prenet ${deus(p)} ur c'hoari. Bremañ e chom ${c} euro ${gant(p)}.`,
      question: 'Pegement e koust ar c\'hoari ?', reponse: b, unite: UB('euro'), calcul: `${a} − ${c} = ${b}` }
    return { enonce: `${p.nom} avait ${a} euros dans sa tirelire. ${Il(p)} a acheté un jeu. Maintenant, il lui reste ${c} euros.`,
      question: 'Combien a coûté le jeu ?', reponse: b, unite: EUROS, calcul: `${a} − ${c} = ${b}` }
  } },
  { cat: 'ajoutRetrait', cap: 1000, gen(niv, max) {
    const p = prenom(), [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `E deroù ar c'hoari ${deus(p)} ${p.nom} ${a} poent. E dibenn ar c'hoari ${deus(p)} ${c} poent.`,
      question: `Pet poent ${deus(p)} gounezet e-pad ar c'hoari ?`, reponse: b, unite: UB('poent'), calcul: `${c} − ${a} = ${b}` }
    return { enonce: `Au début de la partie, ${p.nom} a ${a} points. À la fin de la partie, ${il(p)} a ${c} points.`,
      question: `Combien de points a-t-${il(p)} gagnés pendant la partie ?`, reponse: b, unite: U('point'), calcul: `${c} − ${a} = ${b}` }
  } },

  // ─── Comparaison ──────────────────────────────────────────────────────────
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // « de plus »
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [a, b] = tirerSomme(max)
    if (BR()) return { enonce: `${p1.nom} ${deus(p1)} ${a} ${o.br}. ${p2.nom} ${deus(p2)} ${b} ${o.br} muioc'h eget ${p1.nom}.`,
      question: `Pet ${o.br} ${deus(p2)} ${p2.nom} ?`, reponse: a + b, unite: UB(o.br), calcul: `${a} + ${b} = ${a + b}` }
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${accord(b, o)} de plus ${que(p1)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: a + b, unite: o, calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // « de moins »
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [r, b] = tirerSomme(max), a = r + b
    if (BR()) return { enonce: `${p1.nom} ${deus(p1)} ${a} ${o.br}. ${p2.nom} ${deus(p2)} ${b} ${o.br} nebeutoc'h eget ${p1.nom}.`,
      question: `Pet ${o.br} ${deus(p2)} ${p2.nom} ?`, reponse: r, unite: UB(o.br), calcul: `${a} − ${b} = ${r}` }
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${accord(b, o)} de moins ${que(p1)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: r, unite: o, calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // écart
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `${p1.nom} ${deus(p1)} ${a} ${o.br}. ${p2.nom} ${deus(p2)} ${c} ${o.br}.`,
      question: `Pet ${o.br} ${deus(p2)} ${p2.nom} muioc'h eget ${p1.nom} ?`, reponse: b, unite: UB(o.br), calcul: `${c} − ${a} = ${b}` }
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} en a ${c}.`,
      question: `Combien ${de(o.p)} ${p2.nom} a-t-${il(p2)} de plus ${que(p1)} ?`, reponse: b, unite: o, calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'comparaison', cap: 100, gen(niv, max) {           // comparaison « inversée » (piège)
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [r, b] = tirerSomme(max), a = r + b
    if (BR()) return { enonce: `${p1.nom} ${deus(p1)} ${a} ${o.br}. ${p1.nom} ${deus(p1)} ${b} ${o.br} muioc'h eget ${p2.nom}.`,
      question: `Pet ${o.br} ${deus(p2)} ${p2.nom} ?`, reponse: r, unite: UB(o.br), calcul: `${a} − ${b} = ${r}` }
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${Il(p1)} a ${accord(b, o)} de plus ${que(p2)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: r, unite: o, calcul: `${a} − ${b} = ${r}` }
  } },
  { cat: 'comparaison', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    if (BR()) return { enonce: `E skol Kerlann ez eus ${a} skoliad. E skol Penhoat ez eus ${b} skoliad muioc'h.`,
      question: 'Pet skoliad a zo e skol Penhoat ?', reponse: a + b, unite: UB('skoliad'), calcul: `${a} + ${b} = ${a + b}` }
    return { enonce: `L'école des Tilleuls a ${a} élèves. L'école des Lilas a ${accord(b, U('élève'))} de plus.`,
      question: 'Combien d\'élèves y a-t-il à l\'école des Lilas ?', reponse: a + b, unite: U('élève'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'comparaison', cap: 1000, min: 1000, gen(niv, max) {
    const r = aleatoire(40, 300), b = aleatoire(20, 400), a = r + b
    if (BR()) return { enonce: `Ur marc'h-houarn bras a goust ${a} euro. Ur marc'h-houarn bihan a goust ${b} euro nebeutoc'h.`,
      question: 'Pegement e koust ar marc\'h-houarn bihan ?', reponse: r, unite: UB('euro'), calcul: `${a} − ${b} = ${r}` }
    return { enonce: `Un vélo coûte ${a} euros. Une trottinette coûte ${accord(b, EUROS)} de moins que le vélo.`,
      question: 'Combien coûte la trottinette ?', reponse: r, unite: EUROS, calcul: `${a} − ${b} = ${r}` }
  } },

  // ─── Parties et tout ──────────────────────────────────────────────────────
  { cat: 'partiesTout', cap: 30, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    if (BR()) return { enonce: `Er c'hlas ez eus ${a} plac'h ha ${b} paotr.`,
      question: 'Pet skoliad a zo er c\'hlas ?', reponse: a + b, unite: UB('skoliad'), calcul: `${a} + ${b} = ${a + b}` }
    return { enonce: `Dans la classe, il y a ${accord(a, U('fille'))} et ${accord(b, U('garçon'))}.`,
      question: 'Combien d\'élèves y a-t-il dans la classe ?', reponse: a + b, unite: U('élève'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'partiesTout', cap: 50, gen(niv, max) {            // partie inconnue
    const [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `En ur paner ez eus ${c} frouezhenn : avaloù ha per. ${a} aval a zo.`, // br: à relire (« frouezhenn », « perenn » au singulatif)
      question: 'Pet perenn a zo ?', reponse: b, unite: UB('perenn'), calcul: `${c} − ${a} = ${b}` }
    return { enonce: `Dans un panier, il y a ${c} fruits : des pommes et des poires. Il y a ${accord(a, U('pomme'))}.`,
      question: 'Combien y a-t-il de poires ?', reponse: b, unite: U('poire'), calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'partiesTout', cap: 100, gen(niv, max) {
    const p = prenom(), o = choisir(OBJETS.filter(x => x.s !== 'timbre')), [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${c} ${o.br}. ${a} anezho a zo ruz hag ar re all a zo glas.`,
      question: 'Pet anezho a zo glas ?', reponse: b, unite: UB(o.br), calcul: `${c} − ${a} = ${b}` }
    const bleu = o.g === 'f' ? 'bleues' : 'bleus'
    return { enonce: `${p.nom} a ${c} ${o.p}. Parmi ces ${o.p}, ${a} ${a >= 2 ? 'sont rouges' : 'est rouge'} et les autres sont ${bleu}.`,
      question: `Combien ${de(o.p)} ${bleu} ${p.nom} a-t-${il(p)} ?`, reponse: b, unite: o, calcul: `${c} − ${a} = ${b}` }
  } },
  { cat: 'partiesTout', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max)
    if (BR()) return { enonce: `Ur feurmer en deus ${a} yar ha ${b} houad.`,
      question: 'Pet loen en deus en holl ?', reponse: a + b, unite: UB('loen'), calcul: `${a} + ${b} = ${a + b}` }
    return { enonce: `Dans sa ferme, un fermier a ${accord(a, U('poule'))} et ${accord(b, U('canard'))}.`,
      question: 'Combien d\'animaux a-t-il en tout ?', reponse: a + b, unite: U('animal', 'animaux'), calcul: `${a} + ${b} = ${a + b}` }
  } },
  { cat: 'partiesTout', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max), c = a + b
    if (BR()) return { enonce: `Er sinema ez eus ${c} arvester : oadourien ha bugale. ${a} oadour a zo.`, // br: à relire (« oadour » = adulte)
      question: 'Pet bugel a zo ?', reponse: b, unite: UB('bugel'), calcul: `${c} − ${a} = ${b}` }
    return { enonce: `Au cinéma, il y a ${c} spectateurs : des adultes et des enfants. Il y a ${accord(a, U('adulte'))}.`,
      question: 'Combien d\'enfants y a-t-il ?', reponse: b, unite: U('enfant'), calcul: `${c} − ${a} = ${b}` }
  } },

  // ─── Multiplication (tables de 2, 3, 4, 5, 10) ────────────────────────────
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const p = prenom(), o = choisir(PAQUETS), [n, k] = tirerProduit(niv, max)
    if (BR()) return { enonce: `${p.nom} a bren ${n} pakad. E pep pakad ez eus ${k} ${o.br}.`,
      question: `Pet ${o.br} ${deus(p)} en holl ?`, reponse: n * k, unite: UB(o.br), calcul: multiplicationDetail(n, k) }
    return { enonce: `${p.nom} achète ${n} paquets de ${k} ${o.p}.`,
      question: `Combien ${de(o.p)} a-t-${il(p)} en tout ?`, reponse: n * k, unite: o, calcul: multiplicationDetail(n, k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const [n, k] = tirerProduit(niv, max)
    if (BR()) return { enonce: `Evit an abadenn ez eus ${n} renkad kadorioù. E pep renkad ez eus ${k} kador.`,
      question: 'Pet kador a zo en holl ?', reponse: n * k, unite: UB('kador'), calcul: multiplicationDetail(n, k) }
    return { enonce: `Pour le spectacle, on installe ${n} rangées de ${k} chaises.`,
      question: 'Combien de chaises y a-t-il en tout ?', reponse: n * k, unite: U('chaise'), calcul: multiplicationDetail(n, k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const ch = choisir(CHOSES_A_PARTIES.filter(c => 2 * c.k <= Math.max(max, 20) && (!BR() || c.br)))
    let n
    do { n = aleatoire(2, 10) } while (n * ch.k > Math.max(max, 20))
    if (BR()) return { enonce: `${ch.br.un} ${ch.br.g === 'f' ? 'he deus' : 'en deus'} ${ch.k} ${ch.br.partie}.`,
      question: `Pet ${ch.br.partie} o deus ${n} ${ch.br.s} ?`, reponse: n * ch.k, unite: UB(ch.br.partie), calcul: multiplicationDetail(n, ch.k) } // br: à relire
    const un = ch.g === 'f' ? 'Une' : 'Un'
    return { enonce: `${un} ${ch.s} a ${ch.k} ${ch.partie.p}.`,
      question: `Combien ${de(ch.partie.p)} ont ${n} ${ch.p} ?`, reponse: n * ch.k, unite: ch.partie, calcul: multiplicationDetail(n, ch.k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const p = prenom(), [n, k] = tirerProduit(niv, max)
    if (BR()) return { enonce: `Ur voestad kreion a goust ${k} euro. ${p.nom} a bren ${n} boestad kreion.`,
      question: `Pet euro a rank ${p.nom} paeañ ?`, reponse: n * k, unite: UB('euro'), calcul: multiplicationDetail(n, k) }
    return { enonce: `Une boîte de feutres coûte ${k} euros. ${p.nom} achète ${n} boîtes de feutres.`,
      question: `Combien d'euros ${p.nom} doit-${il(p)} payer ?`, reponse: n * k, unite: EUROS, calcul: multiplicationDetail(n, k) }
  } },
  { cat: 'multiplication', cap: 1000, gen(niv, max) {
    const [n, k] = tirerProduit(niv, max)
    if (BR()) return { enonce: `Ur dablezenn chokolad he deus ${n} renkad. E pep renkad ez eus ${k} karrez.`, // br: à relire (« tablezenn » = tablette)
      question: 'Pet karrez chokolad a zo en dablezenn ?', reponse: n * k, unite: UB('karrez'), calcul: multiplicationDetail(n, k) }
    return { enonce: `Une tablette de chocolat a ${n} rangées de ${k} carrés.`,
      question: 'Combien de carrés de chocolat y a-t-il dans la tablette ?', reponse: n * k, unite: U('carré'), calcul: multiplicationDetail(n, k) }
  } },

  // ─── Partage équitable / groupements (pas de signe ÷ au CE1) ──────────────
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const p = prenom(), o = choisir(OBJETS), [q, k] = tirerProduit(niv, max), t = q * k
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${t} ${o.br}. Rannañ a ra anezho etre ${k} mignon. Pep mignon a resev ar memes niver.`,
      question: `Pet ${o.br} a resev pep mignon ?`, reponse: q, unite: UB(o.br),
      calcul: `${k} × ${q} = ${t}, neuze pep mignon a resev ${q} ${o.br}` }
    return { enonce: `${p.nom} a ${t} ${o.p}. ${Il(p)} les partage entre ses ${k} amis. Chaque ami reçoit le même nombre ${de(o.p)}.`,
      question: `Combien ${de(o.p)} reçoit chaque ami ?`, reponse: q, unite: o,
      calcul: `${k} × ${q} = ${t}, donc chaque ami reçoit ${accord(q, o)}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), t = q * k
    if (BR()) {
      const skolaer = Math.random() < 0.5 ? 'Ar skolaerez' : 'Ar skolaer'
      return { enonce: `${skolaer} a ro ${t} kreion da ${k} strollad. Pep strollad a resev ar memes niver.`,
        question: 'Pet kreion a resev pep strollad ?', reponse: q, unite: UB('kreion'),
        calcul: `${k} × ${q} = ${t}, neuze pep strollad a resev ${q} kreion` }
    }
    const maitre = Math.random() < 0.5 ? 'La maîtresse' : 'Le maître'
    return { enonce: `${maitre} distribue ${t} feutres à ${k} groupes. Chaque groupe reçoit le même nombre de feutres.`,
      question: 'Combien de feutres reçoit chaque groupe ?', reponse: q, unite: U('feutre'),
      calcul: `${k} × ${q} = ${t}, donc chaque groupe reçoit ${accord(q, U('feutre'))}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {              // groupement
    const p = prenom(), [q, k] = tirerProduit(niv, max), t = q * k
    if (BR()) return { enonce: `${p.nom} a stag ${t} luc'hskeudenn en un albom. Lakaat a ra ${k} luc'hskeudenn war pep pajenn.`,
      question: `Pet pajenn a leunia ${p.nom} ?`, reponse: q, unite: UB('pajenn'),
      calcul: `${q} × ${k} = ${t}, neuze ${q} pajenn` }
    return { enonce: `${p.nom} colle ${t} photos dans un album. ${Il(p)} met ${k} photos sur chaque page.`,
      question: `Combien de pages ${p.nom} remplit-${il(p)} ?`, reponse: q, unite: U('page'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('page'))}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), t = q * k
    if (BR()) return { enonce: `Evit ur c'hoari, ${t} bugel a ra skipailhoù. E pep skipailh ez eus ${k} bugel.`,
      question: 'Pet skipailh a zo ?', reponse: q, unite: UB('skipailh'),
      calcul: `${q} × ${k} = ${t}, neuze ${q} skipailh` }
    return { enonce: `Pour un jeu, ${t} enfants forment des équipes de ${k} enfants.`,
      question: 'Combien d\'équipes y a-t-il ?', reponse: q, unite: U('équipe'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('équipe'))}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {
    const p = prenom(), [q, k] = tirerProduit(niv, max), t = q * k
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${t} euro. Ul levr a goust ${k} euro. Gant ${p.g === 'f' ? 'he' : 'e'} holl arc'hant e pren levrioù.`,
      question: `Pet levr a bren ${p.nom} ?`, reponse: q, unite: UB('levr'),
      calcul: `${q} × ${k} = ${t}, neuze ${q} levr` }
    return { enonce: `${p.nom} a ${t} euros. Un livre coûte ${k} euros. ${Il(p)} dépense tout son argent en livres.`,
      question: `Combien de livres ${p.nom} achète-t-${il(p)} ?`, reponse: q, unite: U('livre'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('livre'))}` }
  } },

  // ─── Deux étapes ──────────────────────────────────────────────────────────
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    // livre de 3 à 25 €, stylo de 1 à 5 €
    const p = prenom(), c = aleatoire(1, 5), b = aleatoire(3, Math.min(25, max - c - 2)), x = b + c
    if (x >= max) return null
    const r = aleatoire(1, Math.min(max - x, 50)), a = r + x
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${a} euro. Prenañ a ra ul levr a goust ${b} euro hag ur stilo a goust ${c} euro.`,
      question: `Pet euro a chom ${gant(p)} ?`, reponse: r, unite: UB('euro'), calcul: `${b} + ${c} = ${x} ; ${a} − ${x} = ${r}` }
    return { enonce: `${p.nom} a ${a} euros. ${Il(p)} achète un livre à ${b} ${b >= 2 ? 'euros' : 'euro'} et un stylo à ${c} ${c >= 2 ? 'euros' : 'euro'}.`,
      question: 'Combien d\'euros lui reste-t-il ?', reponse: r, unite: EUROS, calcul: `${b} + ${c} = ${x} ; ${a} − ${x} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 60, gen(niv, max) {
    const [a, b] = tirerSomme(max), x = a + b, c = aleatoire(1, x - 1), r = x - c
    if (BR()) return { enonce: `Er bus ez eus ${a} beajour. Er c'hentañ arsav e pign ${b} beajour. En eil arsav e ziskenn ${c} beajour.`,
      question: 'Pet beajour a zo er bus bremañ ?', reponse: r, unite: UB('beajour'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}` }
    return { enonce: `Dans le bus, il y a ${a} passagers. Au premier arrêt, ${b} ${b >= 2 ? 'passagers montent' : 'passager monte'}. Au deuxième arrêt, ${c} ${c >= 2 ? 'passagers descendent' : 'passager descend'}.`,
      question: 'Combien de passagers y a-t-il maintenant dans le bus ?', reponse: r, unite: U('passager'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), [n, k] = tirerProduit(niv, max), x = n * k
    if (x < 3) return null
    const d = aleatoire(1, x - 1), r = x - d
    if (BR()) return { enonce: `${p1.nom} a bren ${n} pakad. E pep pakad ez eus ${k} skeudenn. ${p1.nom} a ro ${d} skeudenn da ${p2.nom}.`,
      question: `Pet skeudenn a chom gant ${p1.nom} ?`, reponse: r, unite: UB('skeudenn'),
      calcul: `${n} × ${k} = ${x} ; ${x} − ${d} = ${r}` }
    return { enonce: `${p1.nom} achète ${n} paquets de ${k} images. ${Il(p1)} en donne ${d} à ${p2.nom}.`,
      question: `Combien d'images reste-t-il à ${p1.nom} ?`, reponse: r, unite: U('image'),
      calcul: `${n} × ${k} = ${x} ; ${x} − ${d} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 100, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS)
    let a, b
    do { [a, b] = tirerSomme(max) } while (2 * a + b > max)
    const x = a + b, r = a + x
    if (BR()) return { enonce: `${p1.nom} ${deus(p1)} ${a} ${o.br}. ${p2.nom} ${deus(p2)} ${b} ${o.br} muioc'h eget ${p1.nom}.`,
      question: `Pet ${o.br} o deus ${p1.g === 'f' && p2.g === 'f' ? 'o-div' : 'o-daou'} ?`, reponse: r, unite: UB(o.br),
      calcul: `${a} + ${b} = ${x} ; ${a} + ${x} = ${r}` }
    const eux = ils(p1, p2) === 'elles' ? 'elles' : 'eux'
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} en a ${b} de plus ${que(p1)}.`,
      question: `Combien ${de(o.p)} ont-${ils(p1, p2)} à ${eux} deux ?`, reponse: r, unite: o,
      calcul: `${a} + ${b} = ${x} ; ${a} + ${x} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 1000, gen(niv, max) {
    const [a, b] = tirerSomme(max), x = a + b, c = aleatoire(1, x - 1), r = x - c
    if (BR()) return { enonce: `Ur feurmer a zastum ${a} aval d'al Lun ha ${b} aval d'ar Meurzh. D'ar Merc'her e werzh ${c} anezho.`,
      question: 'Pet aval a chom gantañ ?', reponse: r, unite: UB('aval'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}` }
    return { enonce: `Un fermier ramasse ${a} pommes lundi et ${b} pommes mardi. Mercredi, il en vend ${c}.`,
      question: 'Combien de pommes lui reste-t-il ?', reponse: r, unite: U('pomme'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${r}` }
  } },

  // ─── Partage avec reste (CE2) ─────────────────────────────────────────────
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
    const p = prenom(), [q, k] = tirerProduit(niv, max), reste = aleatoire(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${t} vi. Lakaat a ra anezho e boestoù. E pep boest e lak ${k} vi.`,
      question: `Pet boest a c'hall ${p.nom} leuniañ penn-da-benn ?`, reponse: q, unite: UB('boest'),
      calcul: `${q} × ${k} = ${q * k} ; chom a ra ${t - q * k} vi, re nebeut evit ur voest ouzhpenn` }
    return { enonce: `${p.nom} a ${t} œufs. ${Il(p)} les range dans des boîtes de ${k} œufs.`,
      question: `Combien de boîtes ${p.nom} peut-${il(p)} remplir complètement ?`, reponse: q, unite: U('boîte'),
      calcul: `${q} × ${k} = ${q * k} ; il reste ${t - q * k} œuf${reste > 1 ? 's' : ''}, pas assez pour une boîte de plus` }
  } },
  { cat: 'partage', cap: 1000, niveaux: ['ce2'], gen(niv, max) {
    const [q, k] = tirerProduit(niv, max), reste = aleatoire(1, k - 1)
    if (k < 3) return null
    const t = q * k + reste
    if (t > max) return null
    if (BR()) return { enonce: `${t} bugel a ya e baleadenn. Pep karr a c'hall kas ${k} bugel.`,
      question: 'Pet karr a zo ezhomm evit kas an holl vugale ?', reponse: q + 1, unite: UB('karr'),
      calcul: `${q} × ${k} = ${q * k} ; chom a ra ${reste} bugel, ret eo kaout ur c'harr ouzhpenn : ${q} + 1 = ${q + 1}` }
    return { enonce: `${t} enfants partent en sortie. Chaque voiture peut transporter ${k} enfants.`,
      question: 'Combien de voitures faut-il pour emmener tous les enfants ?', reponse: q + 1, unite: U('voiture'),
      calcul: `${q} × ${k} = ${q * k} ; il reste ${reste} enfant${reste > 1 ? 's' : ''}, il faut une voiture de plus : ${q} + 1 = ${q + 1}` }
  } },
  { cat: 'partage', cap: 1000, gen(niv, max) {             // « combien de fois »
    const [q, k] = tirerProduit(niv, max), t = q * k
    if (BR()) return { enonce: `Ur seizenn he deus ${t} cm a hirder. Troc'hañ a reer anezhi e tammoù a ${k} cm.`, // br: à relire
      question: 'Pet tamm a vo ?', reponse: q, unite: UB('tamm'),
      calcul: `${q} × ${k} = ${t}, neuze ${q} tamm` }
    return { enonce: `Un ruban mesure ${t} cm. On le coupe en morceaux de ${k} cm.`,
      question: 'Combien de morceaux obtient-on ?', reponse: q, unite: U('morceau', 'morceaux'),
      calcul: `${q} × ${k} = ${t}, donc ${accord(q, U('morceau', 'morceaux'))}` }
  } },

  // ─── Multiplication par 10, 100 (CE2) ─────────────────────────────────────
  { cat: 'multiplication', cap: 1000, min: 1000, niveaux: ['ce2'], gen(niv, max) {
    const n = aleatoire(2, 9), k = Math.random() < 0.5 ? 10 : 100
    if (BR()) return { enonce: `En ur pakad ez eus ${k} follenn.`,
      question: `Pet follenn a zo e ${n} pakad ?`, reponse: n * k, unite: UB('follenn'), calcul: `${n} × ${k} = ${n * k}` }
    return { enonce: `Un paquet contient ${k} feuilles.`,
      question: `Combien de feuilles y a-t-il dans ${n} paquets ?`, reponse: n * k, unite: U('feuille'), calcul: `${n} × ${k} = ${n * k}` }
  } },

  // ─── Comparaison multiplicative « fois plus » (CE2) ───────────────────────
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const [p1, p2] = deuxPrenoms(), o = choisir(OBJETS), [a, k] = tirerProduit({ tables: [2, 3, 4, 5] }, max)
    if (BR()) return { enonce: `${p1.nom} ${deus(p1)} ${a} ${o.br}. ${p2.nom} ${deus(p2)} ${k} gwech kement ha ${p1.nom}.`, // br: à relire (« gwech kement ha » = fois plus que)
      question: `Pet ${o.br} ${deus(p2)} ${p2.nom} ?`, reponse: a * k, unite: UB(o.br), calcul: `${a} × ${k} = ${a * k}` }
    return { enonce: `${p1.nom} a ${a} ${o.p}. ${p2.nom} a ${k} fois plus ${de(o.p)} ${que(p1)}.`,
      question: `Combien ${de(o.p)} a ${p2.nom} ?`, reponse: a * k, unite: o, calcul: `${a} × ${k} = ${a * k}` }
  } },
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const [a, k] = tirerProduit({ tables: [2, 3, 4, 5] }, max)
    if (BR()) return { enonce: `Ur roched a goust ${a} euro. Ur vantell a goust ${k} gwech kement hag ar roched.`, // br: à relire
      question: 'Pegement e koust ar vantell ?', reponse: a * k, unite: UB('euro'), calcul: `${a} × ${k} = ${a * k}` }
    return { enonce: `Un tee-shirt coûte ${a} euros. Un manteau coûte ${k} fois plus cher que le tee-shirt.`,
      question: 'Combien coûte le manteau ?', reponse: a * k, unite: EUROS, calcul: `${a} × ${k} = ${a * k}` }
  } },
  { cat: 'foisPlus', cap: 1000, gen(niv, max) {
    const p = prenom(), a = aleatoire(7, 10), k = choisir([3, 4])
    if (BR()) {
      // possessif « e » (à lui) / « he » (à elle) avec la mutation correspondante
      const parent = choisir([['e vamm', 'he mamm'], ['e dad', 'he zad'], ['e voereb', 'he moereb'], ['e eontr', 'he eontr']])[p.g === 'f' ? 1 : 0]
      return { enonce: `${p.nom} ${deus(p)} ${a} bloaz. ${parent[0].toUpperCase() + parent.slice(1)} a zo ${k} gwech koshoc'h ${p.g === 'f' ? 'egeti' : 'egetañ'}.`, // br: à relire (« bloaz » sans mutation après le chiffre ; « gwech koshoc'h »)
        question: `Pe oad eo ${parent} ?`,
        reponse: a * k, unite: UB('bloaz'), calcul: `${a} × ${k} = ${a * k}` }
    }
    const parent = choisir([
      { sujet: 'Sa maman', nom: 'la maman', e: 'e' }, { sujet: 'Son papa', nom: 'le papa', e: '' },
      { sujet: 'Sa tante', nom: 'la tante', e: 'e' }, { sujet: 'Son oncle', nom: "l'oncle", e: '' },
    ])
    return { enonce: `${p.nom} a ${a} ans. ${parent.sujet} est ${k} fois plus âgé${parent.e} ${p.g === 'f' ? "qu'elle" : 'que lui'}.`,
      question: `Quel âge a ${parent.nom} ${de(p.nom)} ?`,
      reponse: a * k, unite: U('an'), calcul: `${a} × ${k} = ${a * k}` }
  } },

  // ─── Trois étapes (CE2) ───────────────────────────────────────────────────
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
    const p = prenom(), n = aleatoire(2, 5), k = aleatoire(2, 6), c = aleatoire(3, 9)
    const y = n * k + c
    if (y >= max) return null
    const r = aleatoire(1, Math.min(max - y, 40)), a = y + r
    if (BR()) return { enonce: `${p.nom} ${deus(p)} ${a} euro. Prenañ a ra ${n} kaier a goust ${k} euro pep hini, hag ur reolenn a goust ${c} euro.`,
      question: `Pet euro a chom ${gant(p)} ?`, reponse: r, unite: UB('euro'),
      calcul: `${n} × ${k} = ${n * k} ; ${n * k} + ${c} = ${y} ; ${a} − ${y} = ${r}` }
    return { enonce: `${p.nom} a ${a} euros. ${Il(p)} achète ${n} cahiers à ${k} euros chacun et une trousse à ${c} euros.`,
      question: 'Combien d\'euros lui reste-t-il ?', reponse: r, unite: EUROS,
      calcul: `${n} × ${k} = ${n * k} ; ${n * k} + ${c} = ${y} ; ${a} − ${y} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 60, niveaux: ['ce2'], gen(niv, max) {
    const a = aleatoire(10, Math.max(11, max - 25)), b = aleatoire(3, 12), c = aleatoire(2, a + b - 1), d = aleatoire(2, 10)
    const x = a + b, y = x - c, r = y + d
    if (r > max || y < 1) return null
    if (BR()) return { enonce: `Er bus ez eus ${a} beajour. Er c'hentañ arsav e pign ${b} beajour. En eil arsav e ziskenn ${c} beajour. En trede arsav e pign ${d} beajour.`,
      question: 'Pet beajour a zo er bus bremañ ?', reponse: r, unite: UB('beajour'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${y} ; ${y} + ${d} = ${r}` }
    return { enonce: `Dans le bus, il y a ${a} passagers. Au premier arrêt, ${b} passagers montent. Au deuxième arrêt, ${accord(c, U('passager'))} ${c >= 2 ? 'descendent' : 'descend'}. Au troisième arrêt, ${d} passagers montent.`,
      question: 'Combien de passagers y a-t-il maintenant dans le bus ?', reponse: r, unite: U('passager'),
      calcul: `${a} + ${b} = ${x} ; ${x} − ${c} = ${y} ; ${y} + ${d} = ${r}` }
  } },
  { cat: 'deuxEtapes', cap: 100, niveaux: ['ce2'], gen(niv, max) {
    const [n, k] = tirerProduit(niv, max), x = n * k
    if (x < 6) return null
    const b = aleatoire(1, Math.min(9, x - 1)), y = x - b, c = aleatoire(2, 12), r = y + c
    if (r > max) return null
    if (BR()) {
      const skolaer = Math.random() < 0.5 ? 'ar skolaerez' : 'ar skolaer'
      return { enonce: `Evit ar fest, ${skolaer} a bren ${n} pakad. E pep pakad ez eus ${k} balon. ${b} balon a darzh. Goude-se e pren ${c} balon all.`,
        question: 'Pet balon a zo bremañ ?', reponse: r, unite: UB('balon'),
        calcul: `${n} × ${k} = ${x} ; ${x} − ${b} = ${y} ; ${y} + ${c} = ${r}` }
    }
    const maitre = Math.random() < 0.5 ? 'La maîtresse' : 'Le maître'
    return { enonce: `Pour la fête, ${maitre.toLowerCase()} achète ${n} paquets de ${k} ballons. ${accord(b, U('ballon'))} ${b >= 2 ? 'éclatent' : 'éclate'}. Ensuite, ${maitre.startsWith('La') ? 'elle' : 'il'} en achète ${c} autres.`,
      question: 'Combien de ballons y a-t-il maintenant ?', reponse: r, unite: U('ballon'),
      calcul: `${n} × ${k} = ${x} ; ${x} − ${b} = ${y} ; ${y} + ${c} = ${r}` }
  } },
]

function genererProbleme(cfg, cat) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  const plage = niv.plages[cfg.plage] || Object.values(niv.plages)[1]
  const nivId = NIVEAUX[cfg.niveau] ? cfg.niveau : 'ce1'
  let modeles = MODELES.filter(m => m.cat === cat && (!m.niveaux || m.niveaux.includes(nivId)) && (m.min ?? 0) <= plage.max)
  if (!modeles.length) return null
  // En « grands nombres », on privilégie les contextes où ces nombres sont réalistes
  const grands = modeles.filter(m => m.cap >= plage.max)
  if (grands.length && plage.max > 100 && Math.random() < 0.75) modeles = grands
  for (let essai = 0; essai < 20; essai++) {
    const m = choisir(modeles)
    // la plage de la série, bornée par le réalisme du contexte (pas 900 passagers dans un bus)
    const max = Math.max(10, Math.min(plage.max, m.cap))
    const p = m.gen(niv, max)
    if (p && p.reponse > 0) return { ...p, cat, cle: p.enonce + p.question }
  }
  return null
}

function genererSansRepetition(cfg, nb) {
  const niv = NIVEAUX[cfg.niveau] || NIVEAUX.ce1
  let cats = cfg.categories.filter(c => niv.categories.includes(c))
  if (!cats.length) cats = niv.categories
  // catégories mélangées d'abord : quand il y a moins de problèmes que de catégories,
  // ce ne sont pas toujours les dernières de la liste qui sont oubliées
  const melangees = melanger(cats)
  const ordre = melanger(Array.from({ length: nb }, (_, i) => melangees[i % melangees.length]))
  const vus = new Set()
  const result = []
  let essais = 0
  while (result.length < nb && essais < nb * 50) {
    essais++
    const p = genererProbleme(cfg, ordre[result.length])
    if (p && !vus.has(p.cle)) { vus.add(p.cle); result.push(p) }
  }
  return result
}

// #endregion generation

const config = ref({
  niveau: 'ce1', categories: CATEGORIES.map(c => c.id), plage: 'moyens', nbQ: 5, corrige: false,
  ...charger('problemes_config', {}),
})
watch(config, v => sauvegarder('problemes_config', v), { deep: true })
if (!NIVEAUX[config.value.niveau]) config.value.niveau = 'ce1'

const niveauData = computed(() => NIVEAUX[config.value.niveau] || NIVEAUX.ce1)
const categoriesNiveau = computed(() => CATEGORIES.filter(c => niveauData.value.categories.includes(c.id)))
watch(niveauData, n => {
  const cats = config.value.categories.filter(c => n.categories.includes(c))
  config.value.categories = cats.length ? cats : [...n.categories]
  if (!n.plages[config.value.plage]) config.value.plage = Object.keys(n.plages)[Object.keys(n.plages).length - 1]
}, { immediate: true })

function toggleCategorie(id) {
  const c = config.value.categories
  if (c.includes(id)) {
    if (c.length === 1) return
    config.value.categories = c.filter(x => x !== id)
  } else config.value.categories = [...c, id]
}

const { enLecture, lire, arreter } = useTTS()

const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const historique = ref([])
const reponse = ref('')
const feedback = ref('')
const feedbackClass = ref('')
const inputClass = ref('')
const verrou = ref(false)
const dernierOk = ref(false)
const inputEl = ref(null)
let timeout = null

const q = computed(() => questions.value[idx.value])

function lireEnonce() {
  if (enLecture.value) { arreter(); return }
  lire(`${q.value.enonce} ${q.value.question}`)
}

function demarrer() {
  clearTimeout(timeout)
  questions.value = genererSansRepetition(config.value, config.value.nbQ)
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; historique.value = []
  phase.value = 'jeu'
  afficherQuestion()
}

function quitter() {
  clearTimeout(timeout)
  arreter()
  phase.value = 'config'
}

function afficherQuestion() {
  reponse.value = ''; feedback.value = ''; feedbackClass.value = ''; inputClass.value = ''
  verrou.value = false; dernierOk.value = false
  nextTick(() => inputEl.value?.focus())
}

function valider() {
  if (verrou.value) return
  const val = String(reponse.value).trim()
  if (val === '') return
  const p = q.value
  const ok = +val === p.reponse
  verrou.value = true
  dernierOk.value = ok
  if (ok) {
    inputClass.value = 'ok'
    const bravos = t('bravo')
    feedback.value = bravos[aleatoire(0, bravos.length - 1)]
    feedbackClass.value = 'ok'
    bonnes.value++
    timeout = setTimeout(suivant, 1200)
  } else {
    inputClass.value = 'erreur'
    feedback.value = '❌ ' + t('laBonneReponse', { r: accord(p.reponse, p.unite) })
    feedbackClass.value = 'erreur'
    mauvaises.value++
    // pas d'enchaînement automatique : l'enfant prend le temps de lire la correction
  }
  historique.value.push({ question: p.question, donne: accord(+val, p.unite), attendu: accord(p.reponse, p.unite), calcul: p.calcul, ok })
}

function passer() {
  if (verrou.value) return
  const p = q.value
  mauvaises.value++
  historique.value.push({ question: p.question, donne: t('passe'), attendu: accord(p.reponse, p.unite), calcul: p.calcul, ok: false })
  suivant()
}

function suivant() {
  clearTimeout(timeout)
  arreter()
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

onUnmounted(() => { clearTimeout(timeout); arreter() })

// Document HTML de la fiche (aperçu + impression gérés par ConfigExercice)
function htmlFiche() {
  const qs = genererSansRepetition(config.value, config.value.nbQ)
  const niv = config.value.niveau.toUpperCase()
  const blocs = qs.map((p, i) => `
    <div class="pb">
      <div class="enonce"><span class="num">${i + 1}.</span> ${p.enonce} <b>${p.question}</b></div>
      <div class="calcul">${t('pCalcul')}</div>
      <div class="reponse">${t('pReponse')} <span class="ligne"></span> ${p.reponse >= 2 ? p.unite.p : p.unite.s}</div>
    </div>`).join('')

  const corrige = config.value.corrige
    ? `<h1 class="saut">${t('corrige')} — ${t('titre')} — ${niv}</h1>
    <ol class="corrige">${qs.map(p => `<li><b>${p.calcul}</b> → ${p.reponse} ${p.reponse >= 2 ? p.unite.p : p.unite.s}</li>`).join('')}</ol>`
    : ''

  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${t('titre')} — ${niv}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 720px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.25rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: 1.5rem; }
      .pb { margin: 0 0 1.4rem; page-break-inside: avoid; }
      .enonce { font-size: 1.15rem; line-height: 1.6; }
      .num { font-weight: 700; color: #777; }
      .calcul { border: 1.5px solid #999; border-radius: 6px; height: 4.5rem; margin: .5rem 0; padding: .3rem .5rem; color: #777; font-size: .9rem; }
      .reponse { font-size: 1.05rem; }
      .ligne { display: inline-block; width: 5rem; border-bottom: 1.5px solid #555; }
      h1.saut { page-break-before: always; break-before: page; margin-bottom: 1.5rem; }
      .corrige { font-size: 1.1rem; line-height: 2; }
    </style></head><body>
    <h1>${t('titre')} — ${niv}</h1>
    <p class="entete">${t('pNbProblemes', { n: qs.length })} &nbsp;&nbsp;&nbsp; ${t('nom')} : ________________________________ &nbsp; ${t('date')} : ______________</p>
    ${blocs}
    ${corrige}
  </body></html>`
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
.enonce {
  font-size: 1.35rem; line-height: 1.6; background: var(--gris-bg);
  border-left: 5px solid var(--orange); border-radius: 8px; padding: 1rem 1.25rem; margin: .5rem 0 1rem;
}
.enonce p + p { margin-top: .5rem; }
.enonce-question { font-weight: 800; }
.reponse-ligne { display: flex; align-items: center; justify-content: center; gap: .75rem; }
.reponse-input { max-width: 10rem; }
.unite { font-size: 1.5rem; font-weight: 700; }
.calcul-correction {
  text-align: center; font-size: 1.3rem; font-weight: 800; color: var(--bleu); margin: .25rem 0 .5rem;
}
.btn:disabled { opacity: .45; cursor: default; }
@media (max-width: 520px) {
  .enonce { font-size: 1.15rem; }
}
</style>
