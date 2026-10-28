<template>
  <!-- Où l'on est : le rang dans le domaine pour la classe, la précédente et la suivante. -->
  <nav class="position" :aria-label="t('competence.position.nav')">
    <p class="rang">{{ t('competence.position.rang', { n: position.rang, total: position.domaine.length, domaine, classe: position.classe.toUpperCase() }) }}</p>
    <div class="pas">
      <RouterLink v-if="position.precedente" class="pas-lien" :to="vers(position.precedente.id)" rel="prev">
        <span class="sens"><span aria-hidden="true">←</span> {{ t('competence.position.precedente') }}</span>
        <span class="nom" :lang="LANGUE_SOURCE">{{ position.precedente.libelle }}</span>
      </RouterLink>
      <RouterLink v-if="position.suivante" class="pas-lien suivante" :to="vers(position.suivante.id)" rel="next">
        <span class="sens">{{ t('competence.position.suivante') }} <span aria-hidden="true">→</span></span>
        <span class="nom" :lang="LANGUE_SOURCE">{{ position.suivante.libelle }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Le rang d'une compétence dans son domaine (pour une classe) et un lien vers celle d'avant et celle d'après, dans l'ordre du programme.
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { Position } from './navigation.ts'

defineProps<{ position: Position, domaine: string, vers: (id: string) => string }>()
const { t } = useLangue()
</script>

<style scoped>
.position { margin: .2rem 0 1rem; }
.rang { color: var(--texte-doux); font-size: .9rem; margin-bottom: .5rem; }
.pas { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: .6rem; }
.pas-lien { display: grid; gap: .15rem; min-height: 44px; padding: .55rem .8rem; background: #fff; border-radius: 10px; box-shadow: var(--shadow); text-decoration: none; }
.pas-lien.suivante { text-align: right; }
.sens { font-size: .8rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em; color: var(--texte-doux); }
.nom { font-weight: 700; color: var(--bleu-fort); }
.pas-lien:hover .nom { text-decoration: underline; }
</style>
