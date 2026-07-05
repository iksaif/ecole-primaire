<template>
  <div class="container">
    <div class="hero">
      <h1>Bienvenue ! 👋</h1>
      <p>Des exercices interactifs pour réviser et progresser en s'amusant.</p>
    </div>

    <div class="matiere-section">
      <h2 class="section-heading">🔢 Mathématiques</h2>
      <div class="card-grid">
        <RouterLink to="/maternelle/compter" class="card maths">
          <span class="card-icon">🔢</span>
          <span class="card-title">Compter les objets</span>
          <span class="card-desc">Compte et trouve le bon nombre</span>
          <span class="card-tag">MS / GS</span>
        </RouterLink>
        <RouterLink to="/maternelle/comparer" class="card maths">
          <span class="card-icon">⚖️</span>
          <span class="card-title">Comparer les quantités</span>
          <span class="card-desc">Quel groupe a le plus ?</span>
          <span class="card-tag">MS / GS</span>
        </RouterLink>
        <RouterLink to="/maternelle/ordonner" class="card maths">
          <span class="card-icon">📶</span>
          <span class="card-title">Ranger les nombres</span>
          <span class="card-desc">Du plus petit au plus grand</span>
          <span class="card-tag">MS / GS</span>
        </RouterLink>
        <RouterLink to="/maternelle/formes" class="card maths">
          <span class="card-icon">🔷</span>
          <span class="card-title">Les formes</span>
          <span class="card-desc">Reconnaître cercle, carré, triangle et plus</span>
          <span class="card-tag">MS / GS</span>
        </RouterLink>
        <RouterLink to="/maths/calcul-mental" class="card maths">
          <span class="card-icon">🧮</span>
          <span class="card-title">Calcul mental</span>
          <span class="card-desc">Addition, soustraction, multiplication, division</span>
          <span class="card-tag">CP → CM2</span>
        </RouterLink>
        <RouterLink to="/maths/calcul-pose" class="card maths">
          <span class="card-icon">📐</span>
          <span class="card-title">Calcul posé</span>
          <span class="card-desc">Pose et effectue des additions et soustractions</span>
          <span class="card-tag">GS → CE2</span>
        </RouterLink>
        <RouterLink to="/maths/tables" class="card maths">
          <span class="card-icon">✖️</span>
          <span class="card-title">Tables de multiplication</span>
          <span class="card-desc">Entraîne-toi sur toutes les tables</span>
          <span class="card-tag">CE1 → CM2</span>
        </RouterLink>
      </div>
    </div>

    <div class="matiere-section">
      <h2 class="section-heading">📝 Français</h2>
      <div class="card-grid">
        <RouterLink to="/maternelle/lettres" class="card francais">
          <span class="card-icon">🔡</span>
          <span class="card-title">Les lettres</span>
          <span class="card-desc">Reconnaître et associer majuscules et minuscules</span>
          <span class="card-tag">GS / CP</span>
        </RouterLink>
        <RouterLink to="/francais/dictee" class="card francais">
          <span class="card-icon">🖊️</span>
          <span class="card-title">Dictée</span>
          <span class="card-desc">Écoute et écris les mots — avec synthèse vocale</span>
          <span class="card-tag">CP → CM2</span>
        </RouterLink>
        <RouterLink to="/francais/conjugaison" class="card francais">
          <span class="card-icon">✍️</span>
          <span class="card-title">Conjugaison</span>
          <span class="card-desc">Conjugue les verbes aux bons temps</span>
          <span class="card-tag">CE1 → CM2</span>
        </RouterLink>
        <RouterLink to="/francais/orthographe" class="card francais">
          <span class="card-icon">🔤</span>
          <span class="card-title">Orthographe</span>
          <span class="card-desc">Mots à compléter et règles</span>
          <span class="card-tag">CP → CM2</span>
        </RouterLink>
      </div>
    </div>

    <div class="matiere-section">
      <h2 class="section-heading">📖 Lecture &amp; Compréhension</h2>
      <div class="card-grid">
        <RouterLink to="/lecture" class="card lecture">
          <span class="card-icon">📖</span>
          <span class="card-title">Lecture &amp; Syllabes</span>
          <span class="card-desc">Syllabes, reconstitution de mots et lecture de textes interactifs</span>
          <span class="card-tag">CP → CE2</span>
        </RouterLink>
      </div>
    </div>

    <div class="matiere-section">
      <h2 class="section-heading">🌍 Culture générale</h2>
      <div class="card-grid">
        <RouterLink to="/autres" class="card autres">
          <span class="card-icon">🗺️</span>
          <span class="card-title">Quiz culture générale</span>
          <span class="card-desc">Géographie, histoire, sciences, animaux</span>
          <span class="card-tag">CP → CM2</span>
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 2.5rem 1rem 1.5rem;
}
.hero h1 {
  font-size: 2.4rem;
  font-weight: 900;
  color: var(--bleu);
  margin-bottom: .5rem;
}
.hero p {
  font-size: 1.1rem;
  color: #555;
  max-width: 540px;
  margin: 0 auto;
}
.matiere-section { margin-bottom: 2.5rem; }
</style>
