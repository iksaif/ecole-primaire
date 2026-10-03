<template>
  <nav class="nav">
    <RouterLink to="/" class="nav-logo">{{ SITE.emoji }} {{ SITE.nom }}</RouterLink>
    <ul class="nav-links">
      <li><RouterLink to="/maths"      :class="{ active: route.path.startsWith('/maths') || route.path.startsWith('/maternelle') }">🔢 {{ t('maths') }}</RouterLink></li>
      <li><RouterLink to="/francais"   :class="{ active: route.path.startsWith('/francais') }">📝 {{ t('francais') }}</RouterLink></li>
      <li><RouterLink to="/lecture"    :class="{ active: route.path.startsWith('/lecture') }">📖 {{ t('lecture') }}</RouterLink></li>
      <li><RouterLink to="/autres"     :class="{ active: route.path.startsWith('/autres') }">🌍 {{ t('autres') }}</RouterLink></li>
      <li><RouterLink to="/imprimer"   :class="{ active: route.path.startsWith('/imprimer') }" class="nav-imprimer">🖨️ {{ t('imprimer') }}</RouterLink></li>
      <li><RouterLink to="/about"       :class="{ active: route.path === '/about' }">ℹ️ {{ t('apropos') }}</RouterLink></li>
      <li><RouterLink to="/parametres"  :class="{ active: route.path === '/parametres' }" class="nav-settings" :title="t('parametres')">⚙️</RouterLink></li>
    </ul>
    <div class="nav-droite">
      <div class="nav-langue" role="group" :aria-label="t('langue')">
        <button v-for="l in LANGUES_INTERFACE" :key="l.id" :class="{ active: langue === l.id }"
          :title="l.label" :aria-pressed="langue === l.id" @click="langue = l.id">
          <Drapeau :langue="l.id" /> <span>{{ l.court }}</span>
        </button>
      </div>
      <div class="nav-classe" role="group" :aria-label="t('filtrerClasse')">
        <span class="nav-classe-label">{{ t('classe') }}</span>
        <button :class="{ active: !classe }" @click="classe = ''">{{ t('toutes') }}</button>
        <button v-for="c in CLASSES" :key="c.id" :class="{ active: classe === c.id }" @click="classe = c.id">{{ c.label }}</button>
      </div>
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
import Drapeau from './Drapeau.vue'
import AvisTraduction from './AvisTraduction.vue'

const route = useRoute()
const classe = useClasse()
const { t, langue } = useI18n({
  fr: { maths: 'Maths', francais: 'Français', lecture: 'Lecture', autres: 'Autres', imprimer: 'À imprimer', apropos: 'À propos',
    parametres: 'Paramètres', langue: 'Langue', classe: 'Classe', toutes: 'Toutes', filtrerClasse: 'Filtrer par classe' },
  br: { maths: 'Matematik', francais: 'Galleg', lecture: 'Lenn', autres: 'Traoù all', imprimer: 'Da voullañ', apropos: 'Diwar-benn',
    parametres: 'Arventennoù', langue: 'Yezh', classe: 'Klas', toutes: 'An holl', filtrerClasse: 'Silañ dre glas' },
})
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

.nav-droite { margin-left: auto; display: flex; gap: .5rem; flex-wrap: wrap; align-items: center; }
.nav-langue, .nav-classe {
  display: flex; align-items: center; gap: 2px; flex-wrap: wrap;
  background: var(--gris-bg); border-radius: 20px; padding: 3px;
}
.nav-langue button, .nav-classe button {
  border: none; background: none; border-radius: 16px; padding: .25rem .55rem;
  font: inherit; font-size: .8rem; font-weight: 700; color: #555; cursor: pointer;
  display: inline-flex; align-items: center; gap: .3rem;
}
.nav-langue button:hover, .nav-classe button:hover { background: white; }
.nav-langue button.active { background: white; box-shadow: 0 0 0 2px var(--bleu); color: var(--texte); }
.nav-classe-label { font-size: .75rem; font-weight: 800; color: #888; text-transform: uppercase; padding: 0 .4rem 0 .5rem; }
.nav-classe button.active { background: var(--vert); color: white; }
@media print { .nav { display: none; } }
</style>
