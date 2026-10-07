const path = '/Users/corentin.chary/dev/ecole-primaire/'
const { parse, compileScript, compileTemplate } = require(path + 'node_modules/@vue/compiler-sfc')
const fs = require('fs')
for (const f of process.argv.slice(2)) {
  const src = fs.readFileSync(path + 'src/views/maths/' + f, 'utf8')
  const { descriptor, errors } = parse(src, { filename: f })
  if (errors.length) { console.log(f, 'PARSE', errors); continue }
  const script = compileScript(descriptor, { id: 'x', inlineTemplate: true })
  const t = compileTemplate({ source: descriptor.template.content, filename: f, id: 'x', compilerOptions: { bindingMetadata: script.bindings } })
  if (t.errors.length) console.log(f, 'TEMPLATE', t.errors)
  else console.log(f, 'OK', script.content.length)
  // vérifie que le JS final parse
  try { new Function(script.content.replace(/^import .*$/mg, '').replace(/export default/, 'const __x =')) } catch (e) { console.log(f, 'JS', e.message) }
}
