<template>
  <div class="container" data-page="accueil">
    <header class="hero">
      <h1>{{ t('accueil.bienvenue') }}</h1>
      <p class="accroche">{{ t('accueil.accroche') }}</p>

      <div class="ma-classe" role="group" :aria-label="t('accueil.maClasse')">
        <span class="ma-classe-titre">🎒 {{ t('accueil.maClasse') }}</span>
        <div class="puces">
          <button v-for="c in CLASSES" :key="c.id" class="puce" :class="{ active: classe === c.id }"
            :aria-pressed="classe === c.id" @click="classe = classe === c.id ? '' : c.id">{{ c.label }}</button>
          <button class="puce toutes" :class="{ active: !classe }" :aria-pressed="!classe" @click="classe = ''">{{ t('accueil.toutes') }}</button>
        </div>
      </div>

      <div class="acces">
        <RouterLink to="/parametres" class="tuile">
          <span class="tuile-icone">⚙️</span>
          <span><strong>{{ t('accueil.reglages') }}</strong><small>{{ t('accueil.reglagesDesc') }}</small></span>
        </RouterLink>
        <RouterLink v-if="regionale.def.value" to="/langue-regionale" class="tuile">
          <span class="tuile-icone"><Drapeau :langue="regionale.def.value.code" /></span>
          <span><strong>{{ majuscule(regionale.def.value.nomLocal) }}</strong><small>{{ t('accueil.regionaleDesc') }}</small></span>
        </RouterLink>
        <RouterLink to="/nouveautes" class="tuile nouveautes">
          <span class="tuile-icone">🆕</span>
          <span><strong>{{ t('accueil.nouveautes') }}</strong><small>{{ t('accueil.nouveautesDesc') }}</small></span>
        </RouterLink>
      </div>
    </header>

    <p class="construction">🚧 {{ t('accueil.enConstruction') }}</p>
  </div>
</template>

<script setup lang="ts">
import { CLASSES } from '../data/classes.ts'
import { useClasse } from '../noyau/useClasse.ts'
import { useLangue } from '../langues/useLangue.ts'
import { useLangueRegionale } from '../langues/useLangueRegionale.ts'
import Drapeau from '../shell/Drapeau.vue'

const { t } = useLangue()
const classe = useClasse()
const regionale = useLangueRegionale()
const majuscule = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)
</script>

<style scoped>
.hero { text-align: center; padding: 2rem 0 1.75rem; }
.hero h1 { font-size: 2.3rem; font-weight: 900; color: var(--bleu); margin-bottom: .4rem; }
.accroche { font-size: 1.1rem; color: #555; max-width: 560px; margin: 0 auto 1.4rem; }

.ma-classe {
  display: inline-flex; align-items: center; gap: .4rem .8rem; flex-wrap: wrap; justify-content: center;
  background: white; box-shadow: var(--shadow); border-radius: 999px; padding: .5rem .6rem .5rem 1.1rem;
}
.ma-classe-titre { font-weight: 800; font-size: .95rem; color: #555; white-space: nowrap; }
.puces { display: flex; flex-wrap: wrap; gap: .3rem; justify-content: center; }
.puce {
  border: 2px solid var(--gris-brd); background: white; border-radius: 999px; padding: .3rem .75rem;
  font: inherit; font-weight: 800; font-size: .9rem; color: var(--texte); cursor: pointer; transition: all .15s;
}
.puce:hover { border-color: var(--vert); }
.puce.active { background: var(--vert); border-color: var(--vert); color: white; }
.puce.toutes { font-weight: 600; color: #777; }
.puce.toutes.active { background: var(--gris-bg); border-color: var(--gris-brd); color: var(--texte); }

.acces { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: .8rem; max-width: 760px; margin: 1.25rem auto 0; }
.tuile {
  display: flex; align-items: center; gap: .8rem; text-align: left; text-decoration: none; color: var(--texte);
  background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: .8rem 1rem;
  border-left: 5px solid var(--bleu); transition: transform .15s;
}
.tuile:hover { transform: translateY(-2px); }
.tuile.nouveautes { border-left-color: var(--orange); }
.tuile-icone { font-size: 1.8rem; }
.tuile strong { display: block; font-size: 1rem; }
.tuile small { display: block; color: #666; font-size: .85rem; line-height: 1.3; margin-top: .1rem; }
.construction { text-align: center; color: #777; background: #fff8e1; border: 2px dashed #f5c27a; border-radius: var(--radius); padding: 1rem; max-width: 640px; margin: 1rem auto; }
@media (max-width: 600px) {
  .hero { padding-top: 1.25rem; }
  .hero h1 { font-size: 1.8rem; }
  .ma-classe { border-radius: var(--radius); padding: .6rem; }
}
</style>
