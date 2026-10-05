<template>
  <nav class="nav" :aria-label="t('nav.menu')">
    <RouterLink to="/" class="nav-logo" :title="t('nav.logo')">{{ SITE.emoji }} {{ SITE.nom }}</RouterLink>
    <ul class="nav-links">
      <li><RouterLink to="/" :class="{ active: route.path === '/' }">{{ t('nav.accueil') }}</RouterLink></li>
      <!-- langue régionale : seulement si elle est active (réglage, ou interface dans cette langue) -->
      <li v-if="regionale.def.value">
        <RouterLink to="/langue-regionale" :class="{ active: route.path === '/langue-regionale' }">
          <Drapeau :langue="regionale.def.value.code" /> {{ majuscule(regionale.def.value.nomLocal) }}
        </RouterLink>
      </li>
      <li><RouterLink to="/telechargements" :class="{ active: route.path.startsWith('/telechargements') }">🖨️ {{ t('nav.telechargements') }}</RouterLink></li>
      <li><RouterLink to="/nouveautes" :class="{ active: route.path === '/nouveautes' }">{{ t('nav.nouveautes') }}</RouterLink></li>
      <li v-if="DEV"><RouterLink to="/dev" :class="{ active: route.path.startsWith('/dev') }">🛠️ {{ t('nav.dev') }}</RouterLink></li>
      <li><RouterLink to="/parametres" :class="{ active: route.path === '/parametres' }" class="nav-settings" :title="t('nav.reglages')" :aria-label="t('nav.reglages')">⚙️</RouterLink></li>
    </ul>
    <div class="nav-droite">
      <!-- langue de l'interface : un drapeau par langue proposée par le site -->
      <div v-if="langues.length > 1" class="nav-langue" role="group" :aria-label="t('nav.langueInterface')">
        <button v-for="l in langues" :key="l.code" :class="{ active: langue === l.code }"
          :title="majuscule(l.nomLocal)" :aria-label="majuscule(l.nomLocal)" :aria-pressed="langue === l.code" @click="langue = l.code">
          <Drapeau :langue="l.code" />
        </button>
      </div>
      <!-- langue régionale : choix rapide si le site en propose -->
      <label v-if="regionale.proposees.length" class="nav-regionale" :class="{ actif: regionale.reglage.value }" :title="t('nav.langueRegionale')">
        <span aria-hidden="true">🏴</span>
        <select v-model="regionale.reglage.value" :aria-label="t('nav.langueRegionale')">
          <option value="">{{ t('reglages.regionale.aucune') }}</option>
          <option v-for="l in regionale.proposees" :key="l.code" :value="l.code">{{ majuscule(l.nomLocal) }}</option>
        </select>
      </label>
      <label class="nav-classe" :class="{ filtre: classe }" :title="t('nav.filtrerClasse')">
        <span aria-hidden="true">🎒</span>
        <span class="nav-classe-label">{{ t('nav.classe') }}</span>
        <select v-model="classe" :aria-label="t('nav.filtrerClasse')">
          <option value="">{{ t('nav.toutes') }}</option>
          <option v-for="c in CLASSES" :key="c.id" :value="c.id">{{ c.label }}</option>
        </select>
      </label>
    </div>
  </nav>
  <AvisTraduction />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { CLASSES } from '../data/classes.ts'
import { useClasse } from '../noyau/useClasse.ts'
import { SITE } from '../sites.ts'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import Drapeau from './Drapeau.vue'
import AvisTraduction from './AvisTraduction.vue'

const DEV = import.meta.env.DEV
const route = useRoute()
const classe = useClasse()
const regionale = useLangueRegionale()
const { t, langue, langues } = useLangue()
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
</script>

<style scoped>
.nav {
  background: white;
  box-shadow: var(--shadow);
  padding: .6rem 1.25rem;
  display: flex;
  align-items: center;
  gap: .75rem 1rem;
}
.nav-logo { font-size: 1.4rem; font-weight: 800; text-decoration: none; color: var(--bleu); white-space: nowrap; }
.nav-links { display: flex; gap: .35rem; list-style: none; min-width: 0; }
.nav-links a {
  text-decoration: none; padding: .35rem .7rem; border-radius: 20px; font-weight: 600; font-size: .9rem;
  white-space: nowrap; transition: background .15s, color .15s; color: var(--texte); display: inline-block;
}
.nav-links a:hover { background: var(--gris-bg); }
.nav-links a.active { background: var(--bleu); color: white; }
.nav-settings { opacity: .55; font-size: 1.05rem; }
.nav-settings:hover { opacity: 1; }

.nav-droite { margin-left: auto; display: flex; gap: .5rem; align-items: center; flex-shrink: 0; }
.nav-langue { display: flex; align-items: center; gap: 2px; background: var(--gris-bg); border-radius: 20px; padding: 3px; }
.nav-langue button { border: none; background: none; border-radius: 16px; padding: .3rem .45rem; cursor: pointer; display: inline-flex; align-items: center; line-height: 1; }
.nav-langue button:hover { background: white; }
.nav-langue button.active { background: white; box-shadow: 0 0 0 2px var(--bleu); }
.nav-classe, .nav-regionale {
  display: flex; align-items: center; gap: .35rem; background: var(--gris-bg); border-radius: 20px;
  padding: .2rem .35rem .2rem .7rem; font-size: .85rem; cursor: pointer; white-space: nowrap;
}
.nav-classe.filtre, .nav-regionale.actif { background: #e8f6e8; box-shadow: 0 0 0 2px var(--vert); }
.nav-classe-label { font-size: .72rem; font-weight: 800; color: #888; text-transform: uppercase; }
.nav-classe select, .nav-regionale select {
  border: none; background: white; border-radius: 14px; padding: .25rem .5rem; font: inherit; font-weight: 700; color: var(--texte); cursor: pointer;
}

/* Écrans étroits : le logo et les réglages sur une ligne, les rubriques défilent sur la suivante */
@media (max-width: 1180px) {
  .nav { flex-wrap: wrap; padding: .5rem .75rem; }
  .nav-logo { font-size: 1.2rem; }
  .nav-links { order: 3; flex-basis: 100%; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
  .nav-links::-webkit-scrollbar { display: none; }
  .nav-classe-label { display: none; }
}
@media (max-width: 480px) {
  .nav { gap: .5rem; }
  .nav-logo { font-size: 1.05rem; }
  .nav-droite { gap: .3rem; }
  .nav-langue button { padding: .25rem .3rem; }
  .nav-classe, .nav-regionale { padding: .15rem .25rem .15rem .45rem; }
}
@media print { .nav { display: none; } }
</style>
