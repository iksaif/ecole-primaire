<template>
  <div class="container" data-page="nouveautes">
    <div class="boite">
      <p v-if="langue !== LANGUE_SOURCE" class="note" :lang="langue">{{ t('nouveautes.enFrancais') }}</p>
      <!-- CHANGELOG.md (texte écrit par nous, échappé ici) : rendu Markdown minimal, en français -->
      <div class="contenu" :lang="LANGUE_SOURCE" v-html="html"></div>
      <p class="retour">{{ t('nouveautes.idee') }} <a :href="`mailto:${SITE.contact}?subject=${encodeURIComponent(t('nouveautes.sujet'))}`">{{ SITE.contact }}</a></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import journal from '../../CHANGELOG.md?raw'
import { SITE } from '../sites.ts'
import { useLangue } from '../langues/useLangue.ts'
import { LANGUE_SOURCE } from '../langues/registre.ts'
import { echapper } from '../utils/html.js'

const { t, langue } = useLangue()

const enLigne = (s: string): string => echapper(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/« (.+?) »/g, '« <em>$1</em> »')

// Markdown minimal : titres #/##, listes « - » (avec suite de ligne indentée), paragraphes
function rendre(md: string): string {
  const out: string[] = []
  let items: string[] | null = null
  const fermer = (): void => { if (items) { out.push(`<ul>${items.map(l => `<li>${enLigne(l)}</li>`).join('')}</ul>`); items = null } }
  for (const ligne of md.split('\n')) {
    if (/^# /.test(ligne)) { fermer(); out.push(`<h1 class="section-heading">🆕 ${enLigne(ligne.slice(2))}</h1>`) }
    else if (/^## /.test(ligne)) { fermer(); out.push(`<h2>${enLigne(ligne.slice(3))}</h2>`) }
    else if (/^- /.test(ligne)) { (items ??= []).push(ligne.slice(2)) }
    else if (/^\s+\S/.test(ligne) && items) { items[items.length - 1] += ' ' + ligne.trim() }
    else if (ligne.trim()) { fermer(); out.push(`<p>${enLigne(ligne)}</p>`) }
    else fermer()
  }
  fermer()
  return out.join('\n')
}
const html = rendre(journal)
</script>

<style scoped>
.boite { background: white; border-radius: var(--radius); box-shadow: var(--shadow); padding: 2rem; max-width: 780px; margin: 0 auto; }
.contenu :deep(h2) { font-size: 1.15rem; margin: 1.75rem 0 .5rem; color: var(--bleu); }
.contenu :deep(ul) { padding-left: 1.25rem; }
.contenu :deep(li) { margin: .4rem 0; line-height: 1.55; color: #444; }
.note { background: #f4f6fb; border-radius: 8px; padding: .5rem .8rem; font-size: .9rem; color: #555; margin-bottom: 1rem; }
.retour { margin-top: 2rem; color: #666; }
</style>
