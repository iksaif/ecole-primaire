<template>
  <div class="container">
    <div class="boite">
      <p v-if="langue === 'br'" class="note" lang="br">{{ t('enFrancais') }}</p>
      <!-- CHANGELOG.md (texte écrit par nous, sans HTML) : rendu Markdown minimal -->
      <div class="contenu" lang="fr" v-html="html"></div>
      <p class="retour">{{ t('idee') }} <a :href="`mailto:${CONTACT}?subject=${encodeURIComponent(t('sujet'))}`">{{ CONTACT }}</a></p>
    </div>
  </div>
</template>

<script setup>
import journal from '../../CHANGELOG.md?raw'
import { useI18n } from '../i18n'
import messagesFr from '../i18n/fr/views/NouveautesView.js'
import messagesBr from '../i18n/br/views/NouveautesView.js'
import { CONTACT } from '../site'

const { t, langue } = useI18n({ fr: messagesFr, br: messagesBr })

const echapper = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
const enLigne = s => echapper(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/« (.+?) »/g, '« <em>$1</em> »')

// Markdown minimal : titres #/##, listes « - » (avec suite de ligne indentée), paragraphes
function rendre(md) {
  const out = []
  let liste = null
  const fermer = () => { if (liste) { out.push(`<ul>${liste.map(l => `<li>${enLigne(l)}</li>`).join('')}</ul>`); liste = null } }
  for (const ligne of md.split('\n')) {
    if (/^# /.test(ligne)) { fermer(); out.push(`<h1 class="section-heading">🆕 ${enLigne(ligne.slice(2))}</h1>`) }
    else if (/^## /.test(ligne)) { fermer(); out.push(`<h2>${enLigne(ligne.slice(3))}</h2>`) }
    else if (/^- /.test(ligne)) { (liste ??= []).push(ligne.slice(2)) }
    else if (/^\s+\S/.test(ligne) && liste) { liste[liste.length - 1] += ' ' + ligne.trim() }
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
