// Échappement HTML (texte et valeurs d'attributs entre guillemets doubles). Module pur, sans Vue ni Vite :
// importable par l'app comme par les scripts node (telechargements, couverture, i18n).
export const echapper = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
