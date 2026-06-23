import { ref } from 'vue'

const synth = window.speechSynthesis
let voiceFR = null

function chargerVoix() {
  const voix = synth.getVoices()
  // Préférer une voix locale fr-FR, sinon n'importe quelle voix française
  voiceFR = voix.find(v => v.lang === 'fr-FR' && v.localService)
           || voix.find(v => v.lang.startsWith('fr') && v.localService)
           || voix.find(v => v.lang === 'fr-FR')
           || voix.find(v => v.lang.startsWith('fr'))
           || null
}

if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = chargerVoix
}
chargerVoix()

export function useTTS() {
  const enLecture = ref(false)

  function lire(texte, { vitesse = 0.8, apres } = {}) {
    synth.cancel()
    const u = new SpeechSynthesisUtterance(texte)
    u.lang  = 'fr-FR'
    u.rate  = vitesse
    u.pitch = 1.05
    if (voiceFR) u.voice = voiceFR

    u.onstart = () => { enLecture.value = true }
    u.onend   = () => { enLecture.value = false; apres?.() }
    u.onerror = () => { enLecture.value = false }

    synth.speak(u)
  }

  function arreter() {
    synth.cancel()
    enLecture.value = false
  }

  return { enLecture, lire, arreter }
}
