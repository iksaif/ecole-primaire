<template>
  <div class="container">
    <h1 class="section-heading">🌱 {{ t('titre') }} — MS / GS</h1>
    <div class="card-grid">
      <RouterLink to="/maternelle/compter" class="card maternelle">
        <span class="card-icon">🔢</span>
        <span class="card-title">{{ t('compter') }}</span>
        <span class="card-desc">{{ t('compterDesc') }}</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
      <RouterLink to="/maternelle/comparer" class="card maternelle">
        <span class="card-icon">⚖️</span>
        <span class="card-title">{{ t('comparer') }}</span>
        <span class="card-desc">{{ t('comparerDesc') }}</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
      <RouterLink to="/maternelle/ordonner" class="card maternelle">
        <span class="card-icon">📶</span>
        <span class="card-title">{{ t('ordonner') }}</span>
        <span class="card-desc">{{ t('ordonnerDesc') }}</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
      <RouterLink to="/maternelle/lettres" class="card maternelle">
        <span class="card-icon">🔡</span>
        <span class="card-title">{{ t('lettres') }}</span>
        <span class="card-desc">{{ t('lettresDesc') }}</span>
        <span class="card-tag">GS / CP</span>
      </RouterLink>
      <RouterLink to="/maternelle/formes" class="card maternelle">
        <span class="card-icon">🔷</span>
        <span class="card-title">{{ t('formes') }}</span>
        <span class="card-desc">{{ t('formesDesc') }}</span>
        <span class="card-tag">MS / GS</span>
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { useI18n } from '../../i18n'

const { t } = useI18n({
  fr: {
    titre: 'Maternelle',
    compter: 'Compter les objets', compterDesc: 'Compte et trouve le bon nombre',
    comparer: 'Comparer les quantités', comparerDesc: 'Quel groupe a le plus ?',
    ordonner: 'Ranger les nombres', ordonnerDesc: 'Du plus petit au plus grand',
    lettres: 'Les lettres', lettresDesc: 'Reconnaître et associer majuscules et minuscules',
    formes: 'Les formes', formesDesc: 'Reconnaître cercle, carré, triangle et plus',
  },
  br: {
    titre: 'Skol-vamm',
    compter: 'Kontañ an traoù', compterDesc: 'Kont ha kav an niver mat',
    comparer: "Keñveriañ ar c'hementadoù", comparerDesc: "Peseurt strollad en deus muioc'h ?", // br: à relire
    ordonner: 'Renkañ an niveroù', ordonnerDesc: "Eus ar bihanañ d'ar brasañ",
    lettres: 'Al lizherennoù', lettresDesc: 'Anaout ar pennlizherennoù hag al lizherennoù bihan',
    formes: 'Ar stummoù', formesDesc: "Anaout kelc'h, karrez, tric'horn ha muioc'h",
  },
})
</script>

<style>
.card.maternelle { border-color: var(--rose); }
</style>
