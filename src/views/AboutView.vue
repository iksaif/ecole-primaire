<template>
  <div class="container">
    <div class="about-box">

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
        de la <strong>Maternelle (MS/GS)</strong> jusqu'au <strong>CM2</strong> dans leurs révisions.
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
        <li><strong>🔠 Syllabes</strong> — Compter les syllabes, reconstituer un mot par syllabes (CP → CE2)</li>
        <li><strong>🌍 Quiz culture générale</strong> — Géographie France et monde, sciences, histoire, animaux (CP → CM2)</li>
      </ul>

      <h2 class="about-h2">🛠️ Comment ça marche ?</h2>
      <ul class="about-list">
        <li>Toutes les réponses et scores restent sur l'appareil (stockage local du navigateur).</li>
        <li>La dictée utilise la synthèse vocale intégrée du navigateur — aucun service externe requis.</li>
        <li>Le mode "phrases" de la dictée peut utiliser <strong>l'API Mistral</strong> pour générer des phrases variées
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

      <h2 class="about-h2">💬 Contact &amp; contributions</h2>
      <p class="about-para">
        Des bugs ? Des idées d'exercices ? Ouvrez une
        <a href="https://github.com/iksaif/ecole-primaire/issues" target="_blank" rel="noopener">
          issue sur GitHub
        </a>.
      </p>

    </div>
  </div>
</template>

<style scoped>
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
