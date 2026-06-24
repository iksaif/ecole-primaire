<template>
  <div class="container">
    <h1>🌍 Quiz — Culture générale</h1>

    <!-- ══ CONFIG ══ -->
    <div v-if="phase === 'config'" class="config-box">

      <div class="config-section">
        <div class="config-section-title">Thème</div>
        <div class="theme-grid">
          <button v-for="t in THEMES" :key="t.id"
            class="theme-btn" :class="{ active: config.theme === t.id }"
            @click="config.theme = t.id">
            <span class="theme-icon">{{ t.icon }}</span>
            <span class="theme-label">{{ t.label }}</span>
            <span class="theme-niveau">{{ t.niveau }}</span>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">Nombre de questions</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
        </div>
      </div>

      <div style="text-align:center;margin-top:1.5rem;">
        <button class="btn btn-primary" style="font-size:1.1rem;padding:.75rem 2rem;" @click="demarrer">
          ▶ Commencer
        </button>
      </div>
    </div>

    <!-- ══ EXERCICE ══ -->
    <template v-if="phase === 'jeu' && question">
      <div class="score-bar">
        <button class="btn-quitter" @click="phase = 'config'">✕ Quitter</button>
        <span>Question {{ idx + 1 }} / {{ questions.length }}</span>
        <span>✅ {{ bonnes }} &nbsp; ❌ {{ mauvaises }}</span>
      </div>
      <div class="prog-dots" style="max-width:680px;margin:0 auto .5rem;">
        <div v-for="(_, i) in questions" :key="i" class="prog-dot" :class="dotClass(i)"></div>
      </div>

      <div class="exercise-box">
        <div class="question-text">{{ question.q }}</div>

        <div class="choix-grid" :class="{ 'choix-2': question.choix.length === 2 }">
          <button v-for="c in question.choix" :key="c"
            class="choix-btn" :class="reponduClass(c)"
            :disabled="repondu" @click="valider(c)">{{ c }}</button>
        </div>

        <div class="feedback" :class="feedbackCls" v-if="repondu">
          {{ feedbackTxt }}
          <span v-if="question.info && !estOk" class="feedback-info">{{ question.info }}</span>
        </div>

        <button v-if="repondu" class="btn btn-primary" style="margin-top:1rem;" @click="suivant">
          {{ idx + 1 < questions.length ? 'Suivant →' : 'Voir les résultats' }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div v-if="erreurs.length > 0" class="erreurs-box">
        <div class="config-section-title" style="margin-bottom:.5rem;">À retenir :</div>
        <div v-for="(e, i) in erreurs" :key="i" class="erreur-quiz">
          <span class="erreur-q">{{ e.q }}</span>
          <span class="erreur-r">→ <strong>{{ e.bonne }}</strong></span>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">🔄 Rejouer</button>
        <button class="btn btn-ghost" @click="phase = 'config'">⚙️ Changer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { melanger, confettis, sauvegarder, charger } from '../utils'

const THEMES = [
  { id: 'geo-france',  icon: '🗺️', label: 'Géographie France',    niveau: 'CE2→CM2' },
  { id: 'geo-monde',   icon: '🌍', label: 'Capitales du monde',    niveau: 'CM1→CM2' },
  { id: 'sciences',    icon: '🔬', label: 'Sciences & nature',     niveau: 'CE1→CM2' },
  { id: 'histoire',    icon: '📜', label: 'Histoire de France',    niveau: 'CM1→CM2' },
  { id: 'animaux',     icon: '🦁', label: 'Le monde animal',       niveau: 'CP→CE2' },
]

// ── Banque de questions
const QUESTIONS = {
  'geo-france': [
    { q: 'Quelle est la capitale de la France ?', bonne: 'Paris', choix: ['Paris','Lyon','Marseille','Bordeaux'] },
    { q: 'Quel est le plus long fleuve de France ?', bonne: 'La Loire', choix: ['La Loire','La Seine','Le Rhône','La Garonne'] },
    { q: 'Quel fleuve traverse Paris ?', bonne: 'La Seine', choix: ['La Seine','La Loire','Le Rhône','La Marne'] },
    { q: 'Dans quel massif se trouve le Mont Blanc ?', bonne: 'Les Alpes', choix: ['Les Alpes','Les Pyrénées','Le Massif central','Les Vosges'] },
    { q: 'Quel est le point culminant de France ?', bonne: 'Le Mont Blanc', choix: ['Le Mont Blanc','Le Puy de Dôme','Le Ventoux','Le Canigou'] },
    { q: 'Quelle mer borde le sud de la France ?', bonne: 'La Méditerranée', choix: ['La Méditerranée','La Manche','L\'Atlantique','La mer du Nord'] },
    { q: 'Quel océan borde l\'ouest de la France ?', bonne: 'L\'Atlantique', choix: ['L\'Atlantique','La Méditerranée','La Manche','L\'Arctique'] },
    { q: 'Combien la France métropolitaine a-t-elle de régions ?', bonne: '13', choix: ['13','22','10','17'] },
    { q: 'Dans quelle région se trouve Bordeaux ?', bonne: 'Nouvelle-Aquitaine', choix: ['Nouvelle-Aquitaine','Occitanie','Grand Est','Bretagne'] },
    { q: 'Dans quelle région se trouve Strasbourg ?', bonne: 'Grand Est', choix: ['Grand Est','Île-de-France','Hauts-de-France','Bourgogne'] },
    { q: 'Quelle montagne sépare la France de l\'Espagne ?', bonne: 'Les Pyrénées', choix: ['Les Pyrénées','Les Alpes','Le Jura','Les Vosges'] },
    { q: 'Quel département est une île en Méditerranée ?', bonne: 'La Corse', choix: ['La Corse','La Réunion','La Guadeloupe','Le Finistère'] },
    { q: 'Dans quelle ville se trouve la tour Eiffel ?', bonne: 'Paris', choix: ['Paris','Lyon','Marseille','Toulouse'] },
    { q: 'Quel fleuve se jette dans la Méditerranée à Marseille ?', bonne: 'Le Rhône', choix: ['Le Rhône','La Garonne','La Loire','La Saône'] },
    { q: 'Quelle ville est la préfecture du Finistère ?', bonne: 'Quimper', choix: ['Quimper','Brest','Rennes','Saint-Brieuc'] },
    { q: 'Quel détroit sépare la France de l\'Angleterre ?', bonne: 'Le Pas-de-Calais', choix: ['Le Pas-de-Calais','Le détroit de Gibraltar','La Manche (mer)','Le canal du Midi'] },
  ],

  'geo-monde': [
    { q: 'Quelle est la capitale de l\'Allemagne ?', bonne: 'Berlin', choix: ['Berlin','Munich','Hambourg','Francfort'] },
    { q: 'Quelle est la capitale de l\'Espagne ?', bonne: 'Madrid', choix: ['Madrid','Barcelone','Séville','Valence'] },
    { q: 'Quelle est la capitale de l\'Italie ?', bonne: 'Rome', choix: ['Rome','Milan','Naples','Turin'] },
    { q: 'Quelle est la capitale du Royaume-Uni ?', bonne: 'Londres', choix: ['Londres','Manchester','Édimbourg','Cardiff'] },
    { q: 'Quelle est la capitale des États-Unis ?', bonne: 'Washington', choix: ['Washington','New York','Los Angeles','Chicago'] },
    { q: 'Quelle est la capitale du Brésil ?', bonne: 'Brasília', choix: ['Brasília','Rio de Janeiro','São Paulo','Salvador'] },
    { q: 'Quelle est la capitale du Japon ?', bonne: 'Tokyo', choix: ['Tokyo','Osaka','Kyoto','Hiroshima'] },
    { q: 'Quelle est la capitale de la Chine ?', bonne: 'Pékin', choix: ['Pékin','Shanghai','Guangzhou','Chongqing'] },
    { q: 'Quel est le plus grand océan du monde ?', bonne: 'Le Pacifique', choix: ['Le Pacifique','L\'Atlantique','L\'Indien','L\'Arctique'] },
    { q: 'Quel est le plus long fleuve du monde ?', bonne: 'Le Nil', choix: ['Le Nil','L\'Amazone','Le Mississippi','Le Yangtsé'], info: 'Le Nil mesure environ 6 650 km.' },
    { q: 'Sur quel continent se trouve l\'Égypte ?', bonne: 'Afrique', choix: ['Afrique','Asie','Europe','Moyen-Orient'] },
    { q: 'Combien y a-t-il de continents ?', bonne: '7', choix: ['7','5','6','8'] },
    { q: 'Quelle est la capitale de l\'Australie ?', bonne: 'Canberra', choix: ['Canberra','Sydney','Melbourne','Brisbane'] },
    { q: 'Sur quel continent se trouve le Brésil ?', bonne: 'Amérique du Sud', choix: ['Amérique du Sud','Amérique du Nord','Afrique','Europe'] },
    { q: 'Quel pays a la plus grande superficie du monde ?', bonne: 'La Russie', choix: ['La Russie','Le Canada','Les États-Unis','La Chine'] },
  ],

  'sciences': [
    { q: 'Combien y a-t-il de planètes dans le système solaire ?', bonne: '8', choix: ['8','9','7','10'], info: 'Mercure, Vénus, Terre, Mars, Jupiter, Saturne, Uranus, Neptune.' },
    { q: 'Quelle est la planète la plus proche du Soleil ?', bonne: 'Mercure', choix: ['Mercure','Vénus','Mars','Terre'] },
    { q: 'Quelle planète a des anneaux visibles ?', bonne: 'Saturne', choix: ['Saturne','Jupiter','Mars','Uranus'] },
    { q: 'Sur quelle planète vivons-nous ?', bonne: 'La Terre', choix: ['La Terre','Mars','Vénus','Mercure'] },
    { q: 'Qu\'est-ce que la photosynthèse ?', bonne: 'Les plantes fabriquent leur nourriture avec la lumière', choix: ['Les plantes fabriquent leur nourriture avec la lumière','Les plantes respirent de l\'oxygène','Les animaux mangent des plantes','Les plantes boivent de l\'eau'] },
    { q: 'De quoi ont besoin les plantes pour pousser ?', bonne: 'Eau, lumière et minéraux', choix: ['Eau, lumière et minéraux','Seulement de l\'eau','Seulement de la lumière','Du sucre et du sel'] },
    { q: 'Combien de litres d\'eau boit-on en moyenne par jour ?', bonne: '1,5 litre', choix: ['1,5 litre','5 litres','0,5 litre','3 litres'] },
    { q: 'Que produit une centrale solaire ?', bonne: 'De l\'électricité', choix: ['De l\'électricité','De la chaleur','Du gaz','De l\'eau'] },
    { q: 'Quel gaz respirons-nous ?', bonne: 'L\'oxygène', choix: ['L\'oxygène','Le CO₂','L\'azote','L\'hydrogène'] },
    { q: 'Quel gaz rejette-t-on en expirant ?', bonne: 'Le CO₂', choix: ['Le CO₂','L\'oxygène','L\'azote','La vapeur d\'eau'] },
    { q: 'À quelle température l\'eau se transforme-t-elle en glace ?', bonne: '0°C', choix: ['0°C','-10°C','4°C','100°C'] },
    { q: 'À quelle température l\'eau bout-elle ?', bonne: '100°C', choix: ['100°C','80°C','120°C','60°C'] },
    { q: 'Quel est l\'organe qui pompe le sang dans notre corps ?', bonne: 'Le cœur', choix: ['Le cœur','Le poumon','Le foie','Le cerveau'] },
    { q: 'Combien d\'os a le corps humain adulte ?', bonne: '206', choix: ['206','150','300','100'], info: 'Les bébés naissent avec environ 270 os.' },
    { q: 'Quelle planète est surnommée la planète rouge ?', bonne: 'Mars', choix: ['Mars','Jupiter','Mercure','Vénus'] },
  ],

  'histoire': [
    { q: 'En quelle année a débuté la Révolution française ?', bonne: '1789', choix: ['1789','1815','1750','1848'] },
    { q: 'Qui était Vercingétorix ?', bonne: 'Un chef gaulois', choix: ['Un chef gaulois','Un roi romain','Un général grec','Un évêque mérovingien'] },
    { q: 'En quelle année a eu lieu la bataille de Marignan ?', bonne: '1515', choix: ['1515','1415','1618','1792'] },
    { q: 'Qui était Napoléon Bonaparte ?', bonne: 'Empereur des Français', choix: ['Empereur des Français','Roi de France','Général républicain','Ministre de Louis XVI'] },
    { q: 'En quelle année la Première Guerre mondiale a-t-elle commencé ?', bonne: '1914', choix: ['1914','1918','1939','1900'] },
    { q: 'En quelle année la Deuxième Guerre mondiale s\'est-elle terminée ?', bonne: '1945', choix: ['1945','1944','1918','1939'] },
    { q: 'Qui était Jeanne d\'Arc ?', bonne: 'Une héroïne qui libéra la France des Anglais', choix: ['Une héroïne qui libéra la France des Anglais','Une reine de France','Une sainte romaine','Une chevalière médiévale'] },
    { q: 'Quel roi fut surnommé "le Roi-Soleil" ?', bonne: 'Louis XIV', choix: ['Louis XIV','François Ier','Henri IV','Louis XVI'] },
    { q: 'Quelle était la devise de la République française ?', bonne: 'Liberté, Égalité, Fraternité', choix: ['Liberté, Égalité, Fraternité','Travail, Famille, Patrie','Foi, Roi, Loi','Paix, Justice, Progrès'] },
    { q: 'En quelle année Charles de Gaulle a-t-il fondé la Ve République ?', bonne: '1958', choix: ['1958','1945','1944','1962'] },
    { q: 'Quelle civilisation a construit les pyramides d\'Égypte ?', bonne: 'Les Égyptiens de l\'Antiquité', choix: ['Les Égyptiens de l\'Antiquité','Les Grecs','Les Romains','Les Mayas'] },
    { q: 'Comment s\'appelait la cité légendaire fondée par Romulus ?', bonne: 'Rome', choix: ['Rome','Carthage','Athènes','Sparte'] },
    { q: 'Quelle date est la fête nationale française ?', bonne: 'Le 14 juillet', choix: ['Le 14 juillet','Le 11 novembre','Le 8 mai','Le 1er mai'] },
    { q: 'En quelle année Christophe Colomb a-t-il découvert l\'Amérique ?', bonne: '1492', choix: ['1492','1502','1415','1512'] },
    { q: 'Quel peuple a envahi la Gaule en 58 avant J.-C. ?', bonne: 'Les Romains', choix: ['Les Romains','Les Huns','Les Germains','Les Vikings'] },
  ],

  'animaux': [
    { q: 'Quel animal est le plus grand du monde ?', bonne: 'La baleine bleue', choix: ['La baleine bleue','L\'éléphant','Le requin baleine','La girafe'] },
    { q: 'Quel oiseau ne peut pas voler ?', bonne: 'L\'autruche', choix: ['L\'autruche','L\'aigle','Le perroquet','Le flamant'] },
    { q: 'Quel est le plus rapide des animaux terrestres ?', bonne: 'Le guépard', choix: ['Le guépard','Le lion','Le cheval','Le lièvre'] },
    { q: 'Comment appelle-t-on les animaux qui mangent uniquement des plantes ?', bonne: 'Herbivores', choix: ['Herbivores','Carnivores','Omnivores','Insectivores'] },
    { q: 'Comment appelle-t-on les animaux qui mangent de la viande ?', bonne: 'Carnivores', choix: ['Carnivores','Herbivores','Omnivores','Frugivores'] },
    { q: 'Quel animal fabrique du miel ?', bonne: 'L\'abeille', choix: ['L\'abeille','La guêpe','Le bourdon','La fourmi'] },
    { q: 'Combien de pattes a une araignée ?', bonne: '8', choix: ['8','6','10','4'] },
    { q: 'Combien de pattes a un insecte ?', bonne: '6', choix: ['6','8','4','10'] },
    { q: 'Quel est le seul mammifère qui peut voler ?', bonne: 'La chauve-souris', choix: ['La chauve-souris','L\'écureuil volant','Le vampire','Le colibri'] },
    { q: 'Comment s\'appelle le petit de la vache ?', bonne: 'Le veau', choix: ['Le veau','L\'agneau','Le poulain','Le chevreau'] },
    { q: 'Comment s\'appelle le petit du cheval ?', bonne: 'Le poulain', choix: ['Le poulain','Le veau','L\'ânon','Le faon'] },
    { q: 'Quel animal hiberne en hiver ?', bonne: 'L\'ours', choix: ['L\'ours','Le loup','Le cerf','Le renard'] },
    { q: 'Quel est l\'animal terrestre le plus lourd ?', bonne: 'L\'éléphant', choix: ['L\'éléphant','L\'hippopotame','Le rhinocéros','La girafe'] },
    { q: 'Quel reptile peut changer de couleur ?', bonne: 'Le caméléon', choix: ['Le caméléon','Le lézard','Le gecko','L\'iguane'] },
    { q: 'De quoi se nourrissent les koalas ?', bonne: 'De feuilles d\'eucalyptus', choix: ['De feuilles d\'eucalyptus','De bambous','De fruits tropicaux','D\'herbe'] },
    { q: 'Quel est le plus grand oiseau du monde ?', bonne: 'L\'autruche', choix: ['L\'autruche','L\'albatros','L\'aigle','Le condor'] },
  ],
}

// ── État
const config = ref(charger('autres_config', { theme: 'animaux', nb: 10 }))
watch(config, v => sauvegarder('autres_config', v), { deep: true })
const phase = ref('config')
const questions = ref([])
const idx = ref(0)
const bonnes = ref(0)
const mauvaises = ref(0)
const erreurs = ref([])
const repondu = ref(false)
const feedbackTxt = ref('')
const feedbackCls = ref('')
const estOk = ref(false)
const reponseDonnee = ref('')

const question = computed(() => questions.value[idx.value])

function demarrer() {
  const pool = melanger([...QUESTIONS[config.value.theme]])
    .slice(0, config.value.nb)
    .map(q => ({ ...q, choix: melanger([...q.choix]), _resultat: undefined }))
  questions.value = pool
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; erreurs.value = []
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = ''
  phase.value = 'jeu'
}

function dotClass(i) {
  const r = questions.value[i]?._resultat
  if (i === idx.value && phase.value === 'jeu') return 'current'
  if (r === undefined) return ''
  return r ? 'ok' : 'erreur'
}

function valider(choix) {
  if (repondu.value) return
  reponseDonnee.value = choix
  const ok = choix === question.value.bonne
  question.value._resultat = ok
  repondu.value = true
  estOk.value = ok
  if (ok) {
    bonnes.value++
    feedbackTxt.value = ['Bravo ! 🎉', 'Parfait ! ⭐', 'Exact ! 👏', 'Bien joué ! 🌟'][Math.floor(Math.random() * 4)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    feedbackTxt.value = `❌ La bonne réponse était : ${question.value.bonne}.`
    feedbackCls.value = 'erreur'
    erreurs.value.push({ q: question.value.q, bonne: question.value.bonne })
  }
}

function reponduClass(c) {
  if (!repondu.value) return ''
  if (c === question.value.bonne) return 'bonne'
  if (c === reponseDonnee.value) return 'mauvaise'
  return ''
}

function suivant() {
  idx.value++
  if (idx.value >= questions.value.length) { phase.value = 'resultats'; return }
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = ''; estOk.value = false
}

const resultMsg = computed(() => {
  const pct = bonnes.value / questions.value.length * 100
  if (pct === 100) { confettis(50); return 'Parfait, sans faute ! 🏆' }
  if (pct >= 80)   { confettis(25); return 'Excellent ! 🌟' }
  if (pct >= 60)   return 'Bien ! Continue à apprendre 💪'
  return 'Courage ! Relis les réponses et réessaie 📚'
})
</script>

<style scoped>
.container { max-width: 680px; margin: 0 auto; padding: 1rem; }
h1 { color: var(--bleu); margin-bottom: 1rem; }

.config-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.config-section { margin-bottom: 1.25rem; }
.config-section-title { font-weight: 700; margin-bottom: .6rem; font-size: .9rem; text-transform: uppercase; letter-spacing: .04em; color: #555; }

.theme-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: .5rem; }
.theme-btn {
  background: white; border: 2px solid var(--gris-brd); border-radius: 10px;
  padding: .6rem .75rem; cursor: pointer; font-family: inherit; transition: all .15s;
  display: flex; flex-direction: column; align-items: center; gap: .15rem; text-align: center;
}
.theme-btn:hover  { border-color: var(--bleu); }
.theme-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.theme-btn.active { border-color: var(--bleu); background: #eef5ff; }
.theme-icon  { font-size: 1.75rem; }
.theme-label { font-weight: 700; font-size: .9rem; }
.theme-niveau { font-size: .72rem; color: #999; }

.exercise-box { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 1.5rem; }
.question-text { font-size: 1.25rem; font-weight: 700; text-align: center; margin-bottom: 1.5rem; line-height: 1.4; color: #222; }

.choix-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .65rem; margin-bottom: 1rem; }
.choix-grid.choix-2 { grid-template-columns: 1fr 1fr; max-width: 360px; margin-left: auto; margin-right: auto; }
@media (max-width: 480px) { .choix-grid { grid-template-columns: 1fr; } }

.choix-btn {
  padding: .65rem 1rem; border: 2px solid var(--gris-brd); border-radius: 10px;
  font-size: .95rem; font-weight: 600; font-family: inherit;
  background: white; cursor: pointer; transition: all .15s; text-align: left; line-height: 1.3;
}
.choix-btn:hover:not(:disabled) { border-color: var(--bleu); background: #eef5ff; }
.choix-btn:focus-visible { outline: 3px solid var(--bleu); outline-offset: 2px; }
.choix-btn.bonne   { border-color: #22c55e; background: #f0fdf4; color: #15803d; }
.choix-btn.mauvaise{ border-color: var(--rouge); background: #fff5f5; color: var(--rouge); }
.choix-btn:disabled { cursor: default; }

.feedback { padding: .6rem 1rem; border-radius: 8px; font-weight: 600; margin-top: .5rem; font-size: .95rem; }
.feedback.ok     { background: #f0fdf4; color: #15803d; }
.feedback.erreur { background: #fff5f5; color: var(--rouge); }
.feedback-info { display: block; font-weight: 400; font-size: .85rem; margin-top: .25rem; color: #555; }

.result-score { font-size: 3rem; font-weight: 900; color: var(--bleu); }
.result-msg   { font-size: 1.1rem; margin: .5rem 0 1.5rem; }

.erreurs-box { text-align: left; max-width: 560px; margin: 0 auto; }
.erreur-quiz {
  display: flex; gap: .75rem; align-items: baseline; flex-wrap: wrap;
  padding: .4rem 0; border-bottom: 1px solid #f0f0f0; font-size: .9rem;
}
.erreur-q  { flex: 1; color: #444; }
.erreur-r  { color: #15803d; white-space: nowrap; }
</style>
