<template>
  <div class="container">
    <div class="about-box">
      <template v-if="langue === 'br'">
      <!-- br: à relire par un brittophone -->
      <div class="disclaimer">
        <div class="disclaimer-icon">⚠️</div>
        <div>
          <strong>Graet eo bet al lec'hienn-mañ gant tadoù ha mammoù, ha n'eo ket gant kelennerien.</strong>
          Diazezet eo ar poelladennoù war ar programmoù ofisiel, met n'int ket bet gwiriet gant tud a vicher.
          Ma vez un douetañs war ur reolenn pe ur respont, goulennit digant kelenner ho pugel.
        </div>
      </div>
      <p class="about-para avis-fr" lang="fr">
        🤖 La traduction bretonne a été faite automatiquement et n'a pas encore été relue : tout retour est le bienvenu à
        <a :href="`mailto:${CONTACT}?subject=Traduction%20bretonne`">{{ CONTACT }}</a>.
      </p>

      <h1 class="section-heading" style="margin-top:1.5rem;">📚 Diwar-benn</h1>
      <p class="about-para">
        Poelladennoù etrewezhiat digoust ha fichennoù da voullañ evit ambroug ar vugale eus ar
        <strong>skol-vamm</strong> betek ar <strong>CM2</strong>.
        Pep tra a dro er merdeer : hep kont, hep bruderezh, hep dastum roadennoù.
      </p>
      <h2 class="about-h2">🎯 Petra a gaver amañ ?</h2>
      <ul class="about-list">
        <li><strong>🔢 Matematik</strong> — kontañ, niveroù, jediñ e penn, jedadurioù lakaet, taolennoù liesañ, darnaouennoù, kudennoù, eur, moneiz, muzulioù, mentoniezh</li>
        <li><strong>📝 Galleg</strong> — skrivadeg, reizhskrivañ, yezhadur, displegañ, geriaoueg, lenn (an danvez a zo e galleg)</li>
        <li><strong>🖨️ Fichennoù da voullañ</strong> — skrivañ war linennoù Seyès, skritelloù al lizherenneg, niveroù e galleg hag e brezhoneg, fichennoù jediñ</li>
      </ul>
      <h2 class="about-h2">🛠️ Penaos e ya en-dro ?</h2>
      <ul class="about-list">
        <li>An holl respontoù hag ar skorioù a chom war an drobarzhell.</li>
        <li>Ar c'hod mammenn a zo war <a href="https://github.com/iksaif/ecole-primaire" target="_blank" rel="noopener">GitHub</a>.</li>
        <!-- br: à relire (Belle Allure) -->
        <li>Evit ar skritur a-stag e kuzulier <a href="https://www.jeanboyault.fr/belle-allure/" target="_blank" rel="noopener">Belle Allure</a>
          gant Jean Boyault (pe <a href="https://www.dafont.com/fr/jean-marie-douteau.d75" target="_blank" rel="noopener">Écolier</a>).
          N'hall ket bezañ kinniget gant al lec'hienn abalamour d'an aotre-implijout : ret eo he staliañ war an urzhiataer,
          pe ouzhpennañ ar restr e dibab an nodrezh. Neuze e vo er roll.</li>
      </ul>
      <h2 class="about-h2">🤝 Kemer perzh</h2>
      <p class="about-para">
        Digor eo al lec'hienn : an holl god a zo war
        <a :href="DEPOT" target="_blank" rel="noopener">GitHub (iksaif/ecole-primaire)</a>.
        Degemer mat eo pep skoazell, ha pa ne ouifec'h ket programmiñ :
      </p>
      <ul class="about-list">
        <li>🐞 <strong>Kemenn ur fazi</strong> : <a :href="`${DEPOT}/issues/new`" target="_blank" rel="noopener">digeriñ un issue</a>
          pe skrivañ da <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a>.</li>
        <li>💡 <strong>Kinnig ur boelladenn pe ur fichenn</strong> talvoudus er c'hlas pe er gêr.</li>
        <li>🏴 <strong>Adlenn an droidigezh</strong> : merket eo ar frazennoù da wiriañ gant « br: à relire » er c'hod ;
          ur gemennadenn gant ho reizhadennoù a vo a-walc'h.</li>
        <li>🛠️ <strong>Diorroerien</strong> : degemer mat d'ar <em>pull requests</em> — sellit ouzh ar
          <a :href="`${DEPOT}#readme`" target="_blank" rel="noopener">README</a>.</li>
      </ul>
      <!-- br: à relire (section Kemer perzh) -->
      </template>

      <template v-else>

      <div class="disclaimer">
        <div class="disclaimer-icon">⚠️</div>
        <div>
          <strong>Ce site est fait par des parents, pas par des enseignants.</strong>
          Les exercices s'appuient sur les programmes officiels mais n'ont pas été validés
          par des professionnels de l'éducation. En cas de doute sur une règle ou une réponse,
          demandez à l'enseignant de votre enfant.
        </div>
      </div>

      <h1 class="section-heading" style="margin-top:1.5rem;">📚 À propos</h1>

      <p class="about-para">
        Ce site propose des exercices interactifs gratuits pour accompagner les enfants
        de la <strong>maternelle</strong> (MS, GS) à la fin de l'<strong>élémentaire</strong> (CP → CM2) dans leurs révisions.
        Tout fonctionne directement dans le navigateur — sans compte, sans publicité, sans données collectées.
      </p>

      <h2 class="about-h2">🎯 Exercices disponibles</h2>
      <ul class="about-list">
        <li><strong>🌱 Maternelle (MS/GS → CP)</strong> — Compter, comparer, ranger des nombres ; reconnaître les lettres</li>
        <li><strong>🧮 Calcul mental</strong> — Addition, soustraction, multiplication, division (CP → CM2)</li>
        <li><strong>📐 Calcul posé</strong> — Additions et soustractions en colonnes, avec ou sans retenue (GS → CM)</li>
        <li><strong>✖️ Tables de multiplication</strong> — Entraînement, aléatoire, défi chrono (CE1 → CM2)</li>
        <li><strong>🖊️ Dictée</strong> — Synthèse vocale en français, mots seuls ou phrases générées, correction (CP → CM2)</li>
        <li><strong>✍️ Conjugaison</strong> — Présent, passé composé, imparfait, futur ; mode lacunes ou complet (CE1 → CM2)</li>
        <li><strong>🔤 Orthographe</strong> — Homophones (a/à, ou/où…), accords, lettres manquantes (CP → CM2)</li>
        <li><strong>📖 Lecture &amp; Syllabes</strong> — Compter les syllabes, reconstituer un mot par syllabes, et lecture de phrases ou d'histoires interactives (CP → CE2)</li>
        <li><strong>🌍 Quiz culture générale</strong> — Géographie France et monde, sciences, histoire, animaux (CP → CM2)</li>
        <li><strong>💯 CE1 et CE2</strong> — Nombres jusqu'à 1 000 puis 10 000, fractions, problèmes, heure, monnaie, mesures, géométrie, grammaire, vocabulaire</li>
      </ul>

      <h2 class="about-h2">🖨️ Fiches à imprimer</h2>
      <ul class="about-list">
        <li><strong>✏️ Fiches d'écriture</strong> — Script et attaché, majuscules et minuscules, sur lignage Seyès (2 à 4 mm)</li>
        <li><strong>🔤 Affiche de l'alphabet</strong> — Les quatre écritures, en A4 ou A3</li>
        <li><strong>🧮 Fiches de calcul</strong> — Tables, compléments, doubles et moitiés, calcul mental du programme, avec corrigé ; affiches des tables</li>
        <li><strong>🔢 Nombres en lettres</strong> — Unités, dizaines, centaines, milliers ; affiches ou fiche mémo</li>
        <li><strong>🏴 Breton</strong> — À activer dans les <RouterLink to="/parametres">paramètres</RouterLink> : nombres bilingues, alphabet breton (ch, c'h), jours et mois dans les fiches d'écriture</li>
        <li>Les polices sont incluses : <a href="https://fonts.google.com/specimen/Playwrite+FR+Trad" target="_blank" rel="noopener">Playwrite FR Trad</a>
          (écriture cursive française) et <a href="https://software.sil.org/andika/" target="_blank" rel="noopener">Andika</a> (script, conçue pour l'apprentissage de la lecture),
          <a href="https://opendyslexic.org/" target="_blank" rel="noopener">OpenDyslexic</a> (licence OFL) et
          <a href="https://www.luciole-vision.com/" target="_blank" rel="noopener">Luciole</a> © Laurent Bourcellier &amp; Jonathan Perez (licence CC BY 4.0).</li>
        <li>Pour l'écriture attachée, on conseille <a href="https://www.jeanboyault.fr/belle-allure/" target="_blank" rel="noopener">Belle Allure</a>
          de Jean Boyault, la cursive la plus utilisée en classe (ou <a href="https://www.dafont.com/fr/jean-marie-douteau.d75" target="_blank" rel="noopener">Écolier</a>).
          Leur licence ne permet pas de les livrer avec le site : il faut les installer soi-même sur l'ordinateur, ou ajouter le fichier
          dans le choix de la police d'une fiche. Elles apparaissent alors dans la liste.</li>
      </ul>

      <h2 class="about-h2">🛠️ Comment ça marche ?</h2>
      <ul class="about-list">
        <li>Toutes les réponses et scores restent sur l'appareil (stockage local du navigateur).</li>
        <li>La dictée utilise la synthèse vocale intégrée du navigateur — aucun service externe requis.</li>
        <li>La dictée de phrases et la génération d'histoires en lecture peuvent utiliser <strong>l'API Mistral</strong> pour générer du contenu varié
            (clé configurable dans les <RouterLink to="/parametres">Paramètres parents</RouterLink>).</li>
        <li>Le code source est disponible sur
            <a href="https://github.com/iksaif/ecole-primaire" target="_blank" rel="noopener">GitHub</a>.</li>
      </ul>

      <h2 class="about-h2">📋 Programmes de référence</h2>
      <p class="about-para">
        Les exercices s'appuient sur les attendus de fin de cycle publiés au
        <a href="https://www.education.gouv.fr/les-programmes-de-l-ecole-primaire-et-du-college-9916" target="_blank" rel="noopener">
          Bulletin officiel de l'Éducation nationale
        </a>.
      </p>
      <ul class="about-list prog-list">
        <li>
          <strong>Cycle 1 — Maternelle (MS / GS)</strong><br>
          Dénombrer, comparer et ranger des quantités jusqu'à 10 ; reconnaître les formes géométriques simples ;
          identifier et nommer les lettres de l'alphabet en majuscules et minuscules.
        </li>
        <li>
          <strong>Cycle 2 — CP, CE1, CE2</strong><br>
          Lire et écrire des nombres jusqu'à 1 000 ; additions et soustractions posées ; tables de multiplication (× 2 à × 5 en CE1, jusqu'à × 9 en CE2) ;
          correspondances graphèmes-phonèmes, syllabes ; accord sujet-verbe ; conjugaison au présent, imparfait, futur ;
          homophones grammaticaux courants (a/à, et/est, on/ont…).
        </li>
        <li>
          <strong>Cycle 3 — CM1, CM2</strong><br>
          Grands nombres et fractions ; quatre opérations posées ; tables jusqu'à × 12 ; divisions euclidiennes ;
          conjugaison à tous les temps du programme (dont passé composé, plus-que-parfait) ;
          accords dans le groupe nominal ; vocabulaire civique, géographique et littéraire ;
          lecture de textes variés et compréhension fine.
        </li>
      </ul>

      <h2 class="about-h2">🤝 Contribuer</h2>
      <p class="about-para">
        Le site est libre et ouvert : tout le code est sur
        <a :href="DEPOT" target="_blank" rel="noopener">GitHub (iksaif/ecole-primaire)</a>.
        Toute aide est la bienvenue, même sans savoir programmer :
      </p>
      <ul class="about-list">
        <li>🐞 <strong>Signaler une erreur</strong> (une réponse fausse, une faute, un bug) :
          <a :href="`${DEPOT}/issues/new`" target="_blank" rel="noopener">ouvrir une issue</a> ou écrire à
          <a :href="`mailto:${CONTACT}`">{{ CONTACT }}</a>.</li>
        <li>💡 <strong>Proposer un exercice ou une fiche</strong> utile en classe ou à la maison.</li>
        <li>🏴 <strong>Relire la traduction bretonne</strong> : les passages à vérifier sont marqués
          « br: à relire » dans le code ; un message avec vos corrections suffit.</li>
        <li>👩‍🏫 <strong>Enseignant·e ?</strong> Vos retours sur la conformité au programme sont précieux.</li>
        <li>🛠️ <strong>Développeur·se ?</strong> Les <em>pull requests</em> sont bienvenues — voir le
          <a :href="`${DEPOT}#readme`" target="_blank" rel="noopener">README</a> pour lancer le projet.</li>
      </ul>
      </template>

    </div>
  </div>
</template>

<script setup>
import { langue } from '../i18n'
import { CONTACT, DEPOT } from '../site'
</script>


<style scoped>
.avis-fr { background: #f4f6fb; border-radius: 8px; padding: .6rem .9rem; font-size: .9rem; }
.about-box {
  max-width: 720px;
  margin: 0 auto;
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 2rem 2rem 2.5rem;
}

.disclaimer {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #fff8e1;
  border: 2px solid var(--orange);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  font-size: .95rem;
  line-height: 1.5;
}
.disclaimer-icon { font-size: 1.8rem; flex-shrink: 0; }

.about-h2 {
  font-size: 1.1rem;
  font-weight: 800;
  margin: 1.5rem 0 .5rem;
  color: var(--bleu);
}
.about-para {
  font-size: .95rem;
  line-height: 1.6;
  color: #444;
}
.about-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .4rem;
  font-size: .95rem;
  color: #444;
  line-height: 1.5;
}
.about-list li::before {
  content: '→ ';
  color: var(--bleu);
  font-weight: 700;
}

.prog-list { gap: .85rem; }
.prog-list li { line-height: 1.6; }

a { color: var(--bleu); }
a:hover { text-decoration: underline; }
</style>
