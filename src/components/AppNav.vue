<template>
  <nav class="nav">
    <RouterLink to="/" class="nav-logo">📚 École Primaire</RouterLink>
    <ul class="nav-links">
      <li><RouterLink to="/maths"      :class="{ active: route.path.startsWith('/maths') || route.path.startsWith('/maternelle') }">🔢 Maths</RouterLink></li>
      <li><RouterLink to="/francais"   :class="{ active: route.path.startsWith('/francais') }">📝 Français</RouterLink></li>
      <li><RouterLink to="/lecture"    :class="{ active: route.path.startsWith('/lecture') }">📖 Lecture</RouterLink></li>
      <li><RouterLink to="/autres"     :class="{ active: route.path.startsWith('/autres') }">🌍 Autres</RouterLink></li>
      <li><RouterLink to="/about"       :class="{ active: route.path === '/about' }">ℹ️ À propos</RouterLink></li>
      <li><RouterLink to="/parametres"  :class="{ active: route.path === '/parametres' }" class="nav-settings">⚙️</RouterLink></li>
    </ul>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
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
.nav-settings { opacity: .55; font-size: 1.1rem; }
.nav-settings:hover { opacity: 1; }
</style>
