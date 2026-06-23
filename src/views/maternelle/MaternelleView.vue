<template>
  <div class="container">
    <h1 class="section-heading">🌱 Maternelle — MS / GS</h1>
    <div class="card-grid">
      <RouterLink to="/maternelle/compter" class="card maternelle">
        <span class="card-icon">🔢</span>
        <span class="card-title">Compter les objets</span>
        <span class="card-desc">Compte et trouve le bon nombre</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
      <RouterLink to="/maternelle/comparer" class="card maternelle">
        <span class="card-icon">⚖️</span>
        <span class="card-title">Comparer les quantités</span>
        <span class="card-desc">Quel groupe a le plus ?</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
      <RouterLink to="/maternelle/ordonner" class="card maternelle">
        <span class="card-icon">📶</span>
        <span class="card-title">Ranger les nombres</span>
        <span class="card-desc">Du plus petit au plus grand</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
    </div>
  </div>
</template>

<style>
.card.maternelle { border-color: var(--rose); }
</style>
