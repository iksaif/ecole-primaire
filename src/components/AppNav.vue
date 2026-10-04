<template>
  <nav class="nav">
    <RouterLink to="/" class="nav-logo">{{ SITE.emoji }} {{ SITE.nom }}</RouterLink>
    <ul class="nav-links">
      <li><RouterLink to="/maths"      :class="{ active: route.path.startsWith('/maths') || route.path.startsWith('/maternelle') }">🔢 {{ t('maths') }}</RouterLink></li>
      <li><RouterLink to="/francais"   :class="{ active: route.path.startsWith('/francais') || route.path.startsWith('/lecture') }">📝 {{ t('francais') }}</RouterLink></li>
      <!-- langue régionale : seulement si elle est active (réglage, ou interface dans cette langue) -->
      <li v-if="regionale"><RouterLink to="/langue-regionale" :class="{ active: route.path === '/langue-regionale' }"><Drapeau :langue="regionale.id" /> {{ majuscule(regionale.nomLocal) }}</RouterLink></li>
      <li><RouterLink to="/autres"     :class="{ active: route.path.startsWith('/autres') }">🌍 {{ t('monde') }}</RouterLink></li>
      <li><RouterLink to="/imprimer"   :class="{ active: route.path.startsWith('/imprimer') }" class="nav-imprimer">🖨️ {{ t('imprimer') }}</RouterLink></li>
      <li><RouterLink to="/parametres"  :class="{ active: route.path === '/parametres' }" class="nav-settings" :title="t('parametres')">⚙️</RouterLink></li>
    </ul>
    <div class="nav-droite">
      <RechercheGlobale />
      <div class="nav-langue" role="group" :aria-label="t('langue')">
        <button v-for="l in LANGUES_INTERFACE" :key="l.id" :class="{ active: langue === l.id }"
          :title="l.label" :aria-label="l.label" :aria-pressed="langue === l.id" @click="langue = l.id">
          <Drapeau :langue="l.id" />
        </button>
      </div>
      <label class="nav-classe" :class="{ filtre: classe }" :title="t('filtrerClasse')">
        <span aria-hidden="true">🎒</span>
        <span class="nav-classe-label">{{ t('classe') }}</span>
        <select v-model="classe" :aria-label="t('filtrerClasse')">
          <option value="">{{ t('toutes') }}</option>
          <option v-for="c in CLASSES" :key="c.id" :value="c.id">{{ c.label }}</option>
        </select>
      </label>
    </div>
  </nav>
  <AvisTraduction />
</template>

<script setup>
import { useRoute } from 'vue-router'
import { CLASSES } from '../data/activites'
import { useClasse } from '../composables/useClasse'
import { SITE } from '../site'
import { useI18n, LANGUES_INTERFACE } from '../i18n'
import messagesFr from '../i18n/fr/components/AppNav.js'
import messagesBr from '../i18n/br/components/AppNav.js'
import Drapeau from './Drapeau.vue'
import AvisTraduction from './AvisTraduction.vue'
import RechercheGlobale from './RechercheGlobale.vue'
import { useLangueRegionale } from '../composables/useLangueRegionale'

const route = useRoute()
const classe = useClasse()
const { langue: regionale } = useLangueRegionale()
const majuscule = s => s.charAt(0).toUpperCase() + s.slice(1)
const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })
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
.nav-logo {
  font-size: 1.4rem;
  font-weight: 800;
  text-decoration: none;
  color: var(--bleu);
  white-space: nowrap;
}
.nav-links {
  display: flex;
  gap: .35rem;
  list-style: none;
  min-width: 0;
}
.nav-links a {
  text-decoration: none;
  padding: .35rem .7rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: .9rem;
  white-space: nowrap;
  transition: background .15s, color .15s;
  color: var(--texte);
  display: inline-block;
}
.nav-links a:hover { background: var(--gris-bg); }
.nav-links a.active { background: var(--bleu); color: white; }
.nav-links a.nav-imprimer { border: 2px solid var(--orange); color: #b35c00; padding: .25rem .65rem; }
.nav-links a.nav-imprimer.active { background: var(--orange); color: white; }
.nav-settings { opacity: .55; font-size: 1.05rem; }
.nav-settings:hover { opacity: 1; }

.nav-droite { margin-left: auto; display: flex; gap: .5rem; align-items: center; flex-shrink: 0; }
.nav-langue {
  display: flex; align-items: center; gap: 2px;
  background: var(--gris-bg); border-radius: 20px; padding: 3px;
}
.nav-langue button {
  border: none; background: none; border-radius: 16px; padding: .3rem .45rem;
  cursor: pointer; display: inline-flex; align-items: center; line-height: 1;
}
.nav-langue button:hover { background: white; }
.nav-langue button.active { background: white; box-shadow: 0 0 0 2px var(--bleu); }
.nav-classe {
  display: flex; align-items: center; gap: .35rem;
  background: var(--gris-bg); border-radius: 20px; padding: .2rem .35rem .2rem .7rem;
  font-size: .85rem; cursor: pointer; white-space: nowrap;
}
.nav-classe.filtre { background: #e8f6e8; box-shadow: 0 0 0 2px var(--vert); }
.nav-classe-label { font-size: .72rem; font-weight: 800; color: #888; text-transform: uppercase; }
.nav-classe select {
  border: none; background: white; border-radius: 14px; padding: .25rem .5rem;
  font: inherit; font-weight: 700; color: var(--texte); cursor: pointer;
}

/* Écrans étroits : le logo et les réglages sur une ligne, les rubriques défilent sur la suivante */
@media (max-width: 900px) {
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
  .nav-classe { padding: .15rem .25rem .15rem .45rem; }
  .nav-classe select { padding: .2rem .3rem; }
}
@media print { .nav { display: none; } }
</style>
