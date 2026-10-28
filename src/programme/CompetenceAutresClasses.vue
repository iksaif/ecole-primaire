<template>
  <section aria-labelledby="h-autres-classes" class="bloc">
    <h2 id="h-autres-classes">{{ t('competence.autresClasses.titre') }}</h2>
    <p v-if="!autres.avant && !autres.apres" class="vide">{{ t('competence.autresClasses.aucune') }}</p>
    <div class="deux">
      <div v-for="g in groupes" :key="g.cle" class="groupe">
        <h3>{{ t(`competence.autresClasses.${g.cle}`, { classe: g.classe.toUpperCase() }) }}</h3>
        <ul class="liste">
          <li v-for="k in g.competences.slice(0, LIMITE)" :key="k.id"><RouterLink :to="vers(k.id, g.classe)" :lang="LANGUE_SOURCE">{{ k.libelle }}</RouterLink></li>
        </ul>
        <p class="toutes"><RouterLink :to="versLeProgramme(g.classe)">{{ t('competence.autresClasses.toutes', { classe: g.classe.toUpperCase() }) }}</RouterLink></p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// Ce que le même domaine introduit juste avant et juste après la classe lue : d'où vient la notion, et où elle va.
import { computed } from 'vue'
import type { Classe } from '../data/classes.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { useLangue } from '../langues/useLangue.ts'
import type { AutresClasses, IntroduitesEn } from './navigation.ts'

const props = defineProps<{ autres: AutresClasses, vers: (id: string, classe: Classe) => string, versLeProgramme: (classe: Classe) => string }>()
const { t } = useLangue()
/** nombre de compétences montrées par classe : le reste est dans le programme */
const LIMITE = 5

interface Groupe extends IntroduitesEn { cle: 'avant' | 'apres' }
const groupes = computed((): Groupe[] => {
  const liste: Groupe[] = []
  if (props.autres.avant) liste.push({ cle: 'avant', ...props.autres.avant })
  if (props.autres.apres) liste.push({ cle: 'apres', ...props.autres.apres })
  return liste
})
</script>

<style scoped>
.bloc { margin-top: 1.5rem; }
h2 { font-size: 1.15rem; margin-bottom: .5rem; }
h3 { font-size: 1rem; margin-bottom: .35rem; }
.deux { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: .8rem; }
.groupe { background: #fff; border-radius: 10px; box-shadow: var(--shadow); padding: .7rem .9rem; border-left: 5px solid var(--bleu); }
.liste { list-style: none; display: grid; gap: .3rem; }
.liste a { font-weight: 700; }
.toutes { margin-top: .5rem; font-weight: 700; }
.vide { color: var(--texte-doux); }
</style>
