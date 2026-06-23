import { ref } from 'vue'

const synth = window.speechSynthesis

function voixFR() {
  const voix = synth.getVoices()
  // Priorité : voix locale fr-FR > locale fr-* > réseau fr-FR > réseau fr-*
  return voix.find(v => v.lang === 'fr-FR' && v.localService)
      || voix.find(v => v.lang.startsWith('fr') && v.localService)
      || voix.find(v => v.lang === 'fr-FR')
      || voix.find(v => v.lang.startsWith('fr'))
      || null
}

// Pré-charge les voix dès qu'elles sont disponibles (Chrome les charge en async)
if (typeof speechSynthesis.onvoiceschanged !== 'undefined') {
  speechSynthesis.onvoiceschanged = () => { voixFR() }
}

export function useTTS() {
  const enLecture = ref(false)

  function lire(texte, { vitesse = 0.8, apres } = {}) {
    synth.cancel()
    const u = new SpeechSynthesisUtterance(texte)
    u.lang  = 'fr-FR'
    u.rate  = vitesse
    u.pitch = 1.05

    // Appel au moment du lire() — les voix sont disponibles à ce stade
    const v = voixFR()
    if (v) u.voice = v

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
