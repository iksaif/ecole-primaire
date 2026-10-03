import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

// Génération des PDF au build (scripts/telechargements.mjs)
if (new URLSearchParams(location.search).has('generation')) {
  import('./impression/api-build.js').then(m => { window.__ecolePrimaire = m })
}
