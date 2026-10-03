<template>
  <div class="container">
    <h1>🌍 {{ t('titre') }}</h1>

    <!-- ══ CONFIG ══ -->
    <ConfigExercice v-if="phase === 'config'" v-model:mode="mode" :fiche="fiche"
      @commencer="demarrer" @regenerer="regenerer">

      <div class="config-section">
        <div class="config-section-title">{{ t('theme') }}</div>
        <div class="theme-grid">
          <button v-for="th in THEMES" :key="th.id"
            class="theme-btn" :class="{ active: config.theme === th.id }"
            @click="config.theme = th.id">
            <span class="theme-icon">{{ th.icon }}</span>
            <span class="theme-label">{{ tr(th.label) }}</span>
            <span class="theme-niveau">{{ th.niveau }}</span>
          </button>
        </div>
      </div>

      <div class="config-section">
        <div class="config-section-title">{{ t('nbQuestions') }}</div>
        <div class="btn-group">
          <button v-for="n in [5, 10, 15]" :key="n"
            class="level-btn" :class="{ active: config.nb === n }"
            @click="config.nb = n">{{ n }}</button>
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
          {{ idx + 1 < questions.length ? t('suivant') : t('voirResultats') }}
        </button>
      </div>
    </template>

    <!-- ══ RÉSULTATS ══ -->
    <div v-if="phase === 'resultats'" class="exercise-box" style="text-align:center;">
      <div class="result-score">{{ bonnes }} / {{ questions.length }}</div>
      <div class="result-msg">{{ resultMsg }}</div>

      <div v-if="erreurs.length > 0" class="erreurs-box">
        <div class="config-section-title" style="margin-bottom:.5rem;">{{ t('aRetenir') }}</div>
        <div v-for="(e, i) in erreurs" :key="i" class="erreur-quiz">
          <span class="erreur-q">{{ e.q }}</span>
          <span class="erreur-r">→ <strong>{{ e.bonne }}</strong></span>
        </div>
      </div>

      <div class="btn-group" style="justify-content:center;margin-top:1.25rem;">
        <button class="btn btn-primary" @click="demarrer">{{ t('rejouer') }}</button>
        <button class="btn btn-ghost" @click="phase = 'config'">{{ t('changer') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { melanger, confettis, sauvegarder, charger } from '../utils'
import { useI18n } from '../i18n'
import ConfigExercice from '../components/ConfigExercice.vue'
import { useModeExercice } from '../composables/useModeExercice'
import { echapper } from '../utils/impression'

const { t, tr, langue } = useI18n({
  fr: {
    titre: 'Quiz — Culture générale',
    theme: 'Thème',
    aRetenir: 'À retenir :',
    changer: '⚙️ Changer',
    bravoQuiz: ['Bravo ! 🎉', 'Parfait ! ⭐', 'Exact ! 👏', 'Bien joué ! 🌟'],
    mauvaise: 'La bonne réponse était : {r}.',
    res100: 'Parfait, sans faute ! 🏆',
    res80: 'Excellent ! 🌟',
    res60: 'Bien ! Continue à apprendre 💪',
    res0: 'Courage ! Relis les réponses et réessaie 📚',
    fConsigne: 'Lis chaque question et entoure la bonne réponse.',
  },
  br: {
    titre: 'Kwiz — Sevenadur hollek', // br: à relire
    theme: 'Tem',
    aRetenir: "Da zerc'hel soñj :",
    changer: '⚙️ Cheñch',
    bravoQuiz: ['Brav eo ! 🎉', 'Dispar ! ⭐', 'Just eo ! 👏', 'Mat-tre ! 🌟'],
    mauvaise: 'Ar respont mat a oa : {r}.',
    res100: 'Dispar, hep fazi ebet ! 🏆',
    res80: 'Gwellañ ! 🌟',
    res60: "Mat ! Kendalc'h da zeskiñ 💪",
    res0: "Kalon vat ! Adlenn ar respontoù hag adklask 📚",
    fConsigne: 'Lenn pep goulenn ha gromm ar respont mat.', // br: à relire
  },
})

const THEMES = [
  { id: 'geo-france',  icon: '🗺️', label: { fr: 'Géographie France',  br: "Douaroniezh Bro-C'hall" }, niveau: 'CE2→CM2' },
  { id: 'geo-monde',   icon: '🌍', label: { fr: 'Capitales du monde',  br: 'Kêrioù-penn ar bed' },     niveau: 'CM1→CM2' },
  { id: 'sciences',    icon: '🔬', label: { fr: 'Sciences & nature',   br: 'Skiantoù ha natur' },      niveau: 'CE1→CM2' },
  { id: 'histoire',    icon: '📜', label: { fr: 'Histoire de France',  br: "Istor Bro-C'hall" },       niveau: 'CM1→CM2' },
  { id: 'animaux',     icon: '🦁', label: { fr: 'Le monde animal',     br: 'Bed al loened' },          niveau: 'CP→CE2' },
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

// ── Traductions bretonnes des questions (clé = question française).
// Les questions absentes d'ici (noms propres, nuances délicates) ne sont proposées qu'en français :
// elles sont filtrées quand l'interface est en breton. « bonne » doit figurer dans « choix ».
const QUESTIONS_BR = {
  // ── Douaroniezh Bro-C'hall
  'Quelle est la capitale de la France ?': { q: "Pehini eo kêr-benn Bro-C'hall ?", bonne: 'Pariz', choix: ['Pariz', 'Lyon', 'Marseilh', 'Bourdel'] },
  'Quel est le plus long fleuve de France ?': { q: "Pehini eo ar stêr hirañ e Bro-C'hall ?", bonne: 'Al Liger', choix: ['Al Liger', 'Ar Sen', 'Ar Rodan', 'Ar Garonn'] },
  'Quel fleuve traverse Paris ?': { q: 'Peseurt stêr a dreuz Pariz ?', bonne: 'Ar Sen', choix: ['Ar Sen', 'Al Liger', 'Ar Rodan', 'Ar Garonn'] },
  // br: à relire (Menez Gwenn, Alpoù, Pireneoù)
  'Dans quel massif se trouve le Mont Blanc ?': { q: 'E peseurt menezioù emañ ar Menez Gwenn ?', bonne: 'An Alpoù', choix: ['An Alpoù', 'Ar Pireneoù', 'Ar Jura', 'Menez Are'] },
  'Quelle mer borde le sud de la France ?': { q: "Peseurt mor a zo e su Bro-C'hall ?", bonne: 'Ar Mor Kreizdouar', choix: ['Ar Mor Kreizdouar', 'Mor Breizh', 'Ar Meurvor Atlantel', 'Mor an Hanternoz'] },
  // br: à relire (« Meurvor Arktik »)
  "Quel océan borde l'ouest de la France ?": { q: "Peseurt meurvor a zo e kornôg Bro-C'hall ?", bonne: 'Ar Meurvor Atlantel', choix: ['Ar Meurvor Atlantel', 'Ar Mor Kreizdouar', 'Mor Breizh', 'Ar Meurvor Arktik'] },
  "Quelle montagne sépare la France de l'Espagne ?": { q: "Peseurt menezioù a zispartia Bro-C'hall diouzh Spagn ?", bonne: 'Ar Pireneoù', choix: ['Ar Pireneoù', 'An Alpoù', 'Ar Jura', 'Menez Are'] },
  'Quel département est une île en Méditerranée ?': { q: 'Peseurt departamant a zo un enez er Mor Kreizdouar ?', bonne: 'Korsika', choix: ['Korsika', 'Ar Reunion', 'Gwadeloup', 'Penn-ar-Bed'] },
  'Dans quelle ville se trouve la tour Eiffel ?': { q: 'E peseurt kêr emañ tour Eiffel ?', bonne: 'Pariz', choix: ['Pariz', 'Lyon', 'Marseilh', 'Tolosa'] },
  // br: à relire (« prefeti »)
  'Quelle ville est la préfecture du Finistère ?': { q: 'Pe gêr eo prefeti Penn-ar-Bed ?', bonne: 'Kemper', choix: ['Kemper', 'Brest', 'Roazhon', 'Sant-Brieg'] },

  // ── Kêrioù-penn ar bed
  "Quelle est la capitale de l'Allemagne ?": { q: 'Pehini eo kêr-benn Alamagn ?', bonne: 'Berlin', choix: ['Berlin', 'München', 'Hamburg', 'Frankfurt'] },
  "Quelle est la capitale de l'Espagne ?": { q: 'Pehini eo kêr-benn Spagn ?', bonne: 'Madrid', choix: ['Madrid', 'Barcelona', 'Sevilla', 'Valencia'] },
  "Quelle est la capitale de l'Italie ?": { q: 'Pehini eo kêr-benn Italia ?', bonne: 'Roma', choix: ['Roma', 'Milano', 'Napoli', 'Torino'] },
  'Quelle est la capitale du Royaume-Uni ?': { q: 'Pehini eo kêr-benn ar Rouantelezh-Unanet ?', bonne: 'Londrez', choix: ['Londrez', 'Manchester', 'Edinbourg', 'Kerdiz'] },
  'Quelle est la capitale des États-Unis ?': { q: 'Pehini eo kêr-benn ar Stadoù-Unanet ?', bonne: 'Washington', choix: ['Washington', 'New York', 'Los Angeles', 'Chicago'] },
  'Quelle est la capitale du Brésil ?': { q: 'Pehini eo kêr-benn Brazil ?', bonne: 'Brasília', choix: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'] },
  'Quelle est la capitale du Japon ?': { q: 'Pehini eo kêr-benn Japan ?', bonne: 'Tokyo', choix: ['Tokyo', 'Osaka', 'Kyoto', 'Hiroshima'] },
  'Quelle est la capitale de la Chine ?': { q: 'Pehini eo kêr-benn Sina ?', bonne: 'Beijing', choix: ['Beijing', 'Shanghai', 'Guangzhou', 'Chongqing'] },
  'Quel est le plus grand océan du monde ?': { q: 'Pehini eo ar meurvor brasañ er bed ?', bonne: 'Ar Meurvor Habask', choix: ['Ar Meurvor Habask', 'Ar Meurvor Atlantel', 'Ar Meurvor Indez', 'Ar Meurvor Arktik'] },
  'Quel est le plus long fleuve du monde ?': { q: 'Pehini eo ar stêr hirañ er bed ?', bonne: 'An Nil', choix: ['An Nil', 'An Amazon', 'Ar Mississippi', 'Ar Yangzi'], info: 'An Nil a zo war-dro 6 650 km hed dezhañ.' }, // br: à relire (info)
  "Sur quel continent se trouve l'Égypte ?": { q: 'War peseurt kevandir emañ Egipt ?', bonne: 'Afrika', choix: ['Afrika', 'Azia', 'Europa', 'Ar Reter-Kreiz'] },
  'Combien y a-t-il de continents ?': { q: 'Pet kevandir a zo ?', bonne: '7', choix: ['7', '5', '6', '8'] },
  "Quelle est la capitale de l'Australie ?": { q: 'Pehini eo kêr-benn Aostralia ?', bonne: 'Canberra', choix: ['Canberra', 'Sydney', 'Melbourne', 'Brisbane'] },
  'Sur quel continent se trouve le Brésil ?': { q: 'War peseurt kevandir emañ Brazil ?', bonne: 'Amerika ar Su', choix: ['Amerika ar Su', 'Amerika an Norzh', 'Afrika', 'Europa'] },
  'Quel pays a la plus grande superficie du monde ?': { q: 'Pe vro eo ar brasañ er bed ?', bonne: 'Rusia', choix: ['Rusia', 'Kanada', 'Ar Stadoù-Unanet', 'Sina'] },

  // ── Skiantoù ha natur
  'Combien y a-t-il de planètes dans le système solaire ?': { q: 'Pet planedenn a zo er reizhiad-heol ?', bonne: '8', choix: ['8', '9', '7', '10'], info: "Merc'her, Gwener, an Douar, Meurzh, Yaou, Sadorn, Ouranos, Neizhan." },
  'Quelle est la planète la plus proche du Soleil ?': { q: "Pehini eo ar blanedenn tostañ d'an Heol ?", bonne: "Merc'her", choix: ["Merc'her", 'Gwener', 'Meurzh', 'An Douar'] },
  // br: à relire (« kelc'hioù »)
  'Quelle planète a des anneaux visibles ?': { q: "Pe blanedenn he deus kelc'hioù a weler mat ?", bonne: 'Sadorn', choix: ['Sadorn', 'Yaou', 'Meurzh', 'Ouranos'] },
  'Sur quelle planète vivons-nous ?': { q: 'War peseurt planedenn e vevomp ?', bonne: 'An Douar', choix: ['An Douar', 'Meurzh', 'Gwener', "Merc'her"] },
  // br: à relire
  'De quoi ont besoin les plantes pour pousser ?': { q: "Petra a zo ezhomm d'ar plant evit kreskiñ ?", bonne: 'Dour, gouloù ha mineraloù', choix: ['Dour, gouloù ha mineraloù', 'Dour hepken', 'Gouloù hepken', 'Sukr ha holen'] },
  // br: à relire
  "Combien de litres d'eau boit-on en moyenne par jour ?": { q: 'E keitad, pet litrad dour a evomp bemdez ?', bonne: '1,5 litrad', choix: ['1,5 litrad', '5 litrad', '0,5 litrad', '3 litrad'] },
  'Quel gaz respirons-nous ?': { q: 'Peseurt gaz a analomp ?', bonne: 'An oksigen', choix: ['An oksigen', 'Ar CO₂', 'An azot', 'An hidrogen'] },
  "À quelle température l'eau se transforme-t-elle en glace ?": { q: 'Da beseurt temperadur e teu an dour da vezañ skorn ?', bonne: '0°C', choix: ['0°C', '-10°C', '4°C', '100°C'] },
  "À quelle température l'eau bout-elle ?": { q: 'Da beseurt temperadur e verv an dour ?', bonne: '100°C', choix: ['100°C', '80°C', '120°C', '60°C'] },
  // br: à relire
  "Quel est l'organe qui pompe le sang dans notre corps ?": { q: "Peseurt organ a bomp ar gwad en hor c'horf ?", bonne: 'Ar galon', choix: ['Ar galon', 'Ar skevent', 'An avu', 'An empenn'] },
  // br: à relire (info)
  "Combien d'os a le corps humain adulte ?": { q: 'Pet askorn en deus korf un den deuet ?', bonne: '206', choix: ['206', '150', '300', '100'], info: 'Ar babigoù a zo war-dro 270 askorn ganto pa vezont ganet.' },
  'Quelle planète est surnommée la planète rouge ?': { q: 'Pe blanedenn a vez graet « ar blanedenn ruz » anezhi ?', bonne: 'Meurzh', choix: ['Meurzh', 'Yaou', "Merc'her", 'Gwener'] }, // br: à relire

  // ── Istor Bro-C'hall (bloavezhioù hepken, pe dost)
  'En quelle année a débuté la Révolution française ?': { q: "Pe vloaz e krogas an Dispac'h gall ?", bonne: '1789', choix: ['1789', '1815', '1750', '1848'] },
  'En quelle année a eu lieu la bataille de Marignan ?': { q: 'Pe vloaz e voe emgann Marignan ?', bonne: '1515', choix: ['1515', '1415', '1618', '1792'] },
  'En quelle année la Première Guerre mondiale a-t-elle commencé ?': { q: 'Pe vloaz e krogas ar Brezel-bed kentañ ?', bonne: '1914', choix: ['1914', '1918', '1939', '1900'] },
  "En quelle année la Deuxième Guerre mondiale s'est-elle terminée ?": { q: 'Pe vloaz e echuas an Eil Brezel-bed ?', bonne: '1945', choix: ['1945', '1944', '1918', '1939'] },
  // br: à relire
  'En quelle année Charles de Gaulle a-t-il fondé la Ve République ?': { q: 'Pe vloaz e savas Charles de Gaulle ar Pempvet Republik ?', bonne: '1958', choix: ['1958', '1945', '1944', '1962'] },
  // br: à relire
  "Comment s'appelait la cité légendaire fondée par Romulus ?": { q: 'Peseurt kêr a voe diazezet gant Romulus, hervez ar vojenn ?', bonne: 'Roma', choix: ['Roma', 'Kartago', 'Atena', 'Sparta'] },
  'Quelle date est la fête nationale française ?': { q: "Peseurt deiz eo gouel broadel Bro-C'hall ?", bonne: '14 a viz Gouere', choix: ['14 a viz Gouere', '11 a viz Du', '8 a viz Mae', '1añ a viz Mae'] },
  "En quelle année Christophe Colomb a-t-il découvert l'Amérique ?": { q: 'Pe vloaz e tizhas Kristol Kolomb Amerika ?', bonne: '1492', choix: ['1492', '1502', '1415', '1512'] },

  // ── Bed al loened (br: à relire, anvioù loened gant ar ger-mell)
  'Quel animal est le plus grand du monde ?': { q: 'Pehini eo al loen brasañ er bed ?', bonne: 'Ar balum glas', choix: ['Ar balum glas', 'An olifant', 'Ar rinkin', 'Ar jirafenn'] },
  'Quel est le plus rapide des animaux terrestres ?': { q: 'Pehini eo al loen buanañ war an douar ?', bonne: 'Ar gepard', choix: ['Ar gepard', 'Al leon', "Ar marc'h", "Ar c'had"] },
  "Quel animal fabrique du miel ?": { q: 'Peseurt loen a ra mel ?', bonne: 'Ar wenanenn', choix: ['Ar wenanenn', 'Ar wespedenn', 'Ar verienn', 'Ar valafenn'] },
  'Combien de pattes a une araignée ?': { q: 'Pet pav he deus ur gevnidenn ?', bonne: '8', choix: ['8', '6', '10', '4'] },
  'Combien de pattes a un insecte ?': { q: 'Pet pav en deus un amprevan ?', bonne: '6', choix: ['6', '8', '4', '10'] },
  'Quel animal hiberne en hiver ?': { q: 'Peseurt loen a gousk a-hed ar goañv ?', bonne: 'An arzh', choix: ['An arzh', 'Ar bleiz', "Ar c'harv", 'Al louarn'] },
  "Quel est l'animal terrestre le plus lourd ?": { q: 'Pehini eo al loen pounnerañ war an douar ?', bonne: 'An olifant', choix: ['An olifant', 'Ar jirafenn', "Ar marc'h", 'An arzh'] },
  'Quel reptile peut changer de couleur ?': { q: "Peseurt stlejvil a c'hall cheñch liv ?", bonne: "Ar c'hameleon", choix: ["Ar c'hameleon", 'Ar glazard', 'Ar gekko', 'An iguana'] },
}
// Contenu d'une question dans la langue demandée (null si pas de traduction)
function enLangue(q, l) {
  if (l !== 'br') return q
  const br = QUESTIONS_BR[q.q]
  return br ? { ...q, ...br, info: br.info } : null
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
  const pool = melanger(QUESTIONS[config.value.theme].map(q => enLangue(q, langue.value)).filter(Boolean))
    .slice(0, config.value.nb)
    .map(q => ({ ...q, choix: melanger([...q.choix]), _resultat: undefined }))
  questions.value = pool
  idx.value = 0; bonnes.value = 0; mauvaises.value = 0; erreurs.value = []
  repondu.value = false; feedbackTxt.value = ''; feedbackCls.value = ''
  reponseDonnee.value = ''
  phase.value = 'jeu'
}

// ── Fiche imprimable : questions + choix à entourer, corrigé page 2
function htmlFiche() {
  const e = echapper
  const qs = melanger(QUESTIONS[config.value.theme].map(q => enLangue(q, langue.value)).filter(Boolean))
    .slice(0, config.value.nb)
    .map(q => ({ ...q, choix: melanger([...q.choix]) }))
  const th = THEMES.find(x => x.id === config.value.theme)
  const titre = `${t('titre')} — ${tr(th.label)}`
  const corps = qs.map((q, i) => `<div class="q"><div class="enonce"><span class="num">${i + 1}.</span> ${e(q.q)}</div>
    <div class="choix">${q.choix.map(c => `<span>${e(c)}</span>`).join('')}</div></div>`).join('')
  const corrige = qs.map((q, i) => `<div class="corr"><span class="num">${i + 1}.</span> <b>${e(q.bonne)}</b>${q.info ? ` <em>— ${e(q.info)}</em>` : ''}</div>`).join('')
  return `<!DOCTYPE html><html lang="${langue.value}"><head>
    <meta charset="UTF-8"><title>${e(titre)}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 700px; margin: 1.5cm auto; color: #222; }
      h1 { font-size: 1.3rem; border-bottom: 2px solid #333; padding-bottom: .4rem; margin-bottom: .5rem; }
      .entete { font-size: .85rem; color: #666; margin-bottom: .6rem; }
      .consigne { font-weight: 700; margin: .4rem 0 1rem; }
      .q { margin-bottom: 1rem; page-break-inside: avoid; }
      .enonce { font-size: 1.1rem; font-weight: 700; margin-bottom: .35rem; }
      .num { color: #777; }
      .choix { display: flex; flex-wrap: wrap; gap: .4rem 1.6rem; padding-left: 1.6rem; font-size: 1.05rem; }
      .choix span { padding: .1rem .5rem; }
      .corrige { page-break-before: always; break-before: page; }
      .corr { margin: .35rem 0; }
      em { color: #666; font-size: .9em; }
    </style></head><body>
    <h1>${e(titre)}</h1>
    <p class="entete">${t('prenom')} : ________________________ &nbsp; ${t('date')} : ______________</p>
    <p class="consigne">${t('fConsigne')}</p>
    ${corps}
    <div class="corrige"><h1>${t('corrige')} — ${e(titre)}</h1>${corrige}</div>
  </body></html>`
}

const { mode, graine, regenerer } = useModeExercice()
const fiche = computed(() => {
  if (mode.value !== 'imprimer') return ''
  graine.value
  return htmlFiche()
})

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
    const b = t('bravoQuiz'); feedbackTxt.value = b[Math.floor(Math.random() * b.length)]
    feedbackCls.value = 'ok'
  } else {
    mauvaises.value++
    feedbackTxt.value = `❌ ${t('mauvaise', { r: question.value.bonne })}`
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
  if (pct === 100) { confettis(50); return t('res100') }
  if (pct >= 80)   { confettis(25); return t('res80') }
  if (pct >= 60)   return t('res60')
  return t('res0')
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
