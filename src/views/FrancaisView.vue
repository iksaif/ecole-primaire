<template>
  <div class="container">
    <h1 class="section-heading">📝 Français</h1>
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
        <span class="card-desc">Écoute et écris les mots — synthèse vocale</span>
        <span class="card-tag">CP → CM2</span>
      </RouterLink>
      <RouterLink to="/francais/conjugaison" class="card francais">
        <span class="card-icon">🔀</span>
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
</template>
