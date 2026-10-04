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
import messagesFr from '../../i18n/fr/views/maternelle/MaternelleView.js'
import messagesBr from '../../i18n/br/views/maternelle/MaternelleView.js'

const { t } = useI18n({ fr: messagesFr, br: messagesBr })
</script>

<style>
.card.maternelle { border-color: var(--rose); }
</style>
