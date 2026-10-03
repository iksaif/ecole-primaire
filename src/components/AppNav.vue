<template>
  <nav class="nav">
    <RouterLink to="/" class="nav-logo">{{ SITE.emoji }} {{ SITE.nom }}</RouterLink>
    <ul class="nav-links">
      <li><RouterLink to="/maths"      :class="{ active: route.path.startsWith('/maths') || route.path.startsWith('/maternelle') }">🔢 Maths</RouterLink></li>
      <li><RouterLink to="/francais"   :class="{ active: route.path.startsWith('/francais') }">📝 Français</RouterLink></li>
      <li><RouterLink to="/lecture"    :class="{ active: route.path.startsWith('/lecture') }">📖 Lecture</RouterLink></li>
      <li><RouterLink to="/autres"     :class="{ active: route.path.startsWith('/autres') }">🌍 Autres</RouterLink></li>
      <li><RouterLink to="/imprimer"   :class="{ active: route.path.startsWith('/imprimer') }" class="nav-imprimer">🖨️ À imprimer</RouterLink></li>
      <li><RouterLink to="/about"       :class="{ active: route.path === '/about' }">ℹ️ À propos</RouterLink></li>
      <li><RouterLink to="/parametres"  :class="{ active: route.path === '/parametres' }" class="nav-settings">⚙️</RouterLink></li>
    </ul>
    <div class="nav-classe" role="group" aria-label="Filtrer par classe">
      <span class="nav-classe-label">Classe</span>
      <button :class="{ active: !classe }" @click="classe = ''">Toutes</button>
      <button v-for="c in CLASSES" :key="c.id" :class="{ active: classe === c.id }" @click="classe = c.id">{{ c.label }}</button>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { CLASSES } from '../data/activites'
import { useClasse } from '../composables/useClasse'
import { SITE } from '../site'
const route = useRoute()
const classe = useClasse()
</script>

<style scoped>
.nav {
  background: white;
  box-shadow: var(--shadow);
  padding: .75rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.nav-logo {
  font-size: 1.5rem;
  font-weight: 800;
  text-decoration: none;
  color: var(--bleu);
}
.nav-links {
  display: flex;
  gap: .5rem;
  flex-wrap: wrap;
  list-style: none;
}
.nav-links a {
  text-decoration: none;
  padding: .35rem .75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: .9rem;
  transition: background .15s, color .15s;
  color: var(--texte);
}
.nav-links a:hover { background: var(--gris-bg); }
.nav-links a.active { background: var(--bleu); color: white; }
.nav-links a.nav-imprimer { border: 2px solid var(--orange); color: #b35c00; }
.nav-links a.nav-imprimer.active { background: var(--orange); color: white; }
.nav-settings { opacity: .55; font-size: 1.1rem; }
.nav-settings:hover { opacity: 1; }

.nav-classe {
  margin-left: auto;
  display: flex; align-items: center; gap: 2px; flex-wrap: wrap;
  background: var(--gris-bg); border-radius: 20px; padding: 3px;
}
.nav-classe-label { font-size: .75rem; font-weight: 800; color: #888; text-transform: uppercase; padding: 0 .4rem 0 .5rem; }
.nav-classe button {
  border: none; background: none; border-radius: 16px; padding: .25rem .55rem;
  font: inherit; font-size: .8rem; font-weight: 700; color: #555; cursor: pointer;
}
.nav-classe button:hover { background: white; }
.nav-classe button.active { background: var(--vert); color: white; }
@media print { .nav { display: none; } }
</style>
