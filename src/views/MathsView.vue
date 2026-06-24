<template>
  <div class="container">
    <h1 class="section-heading">🔢 Mathématiques</h1>
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
        <span class="card-desc">Entraîne-toi sur toutes les tables de 1 à 12</span>
        <span class="card-tag">CE1 → CM2</span>
      </RouterLink>
    </div>
  </div>
</template>
