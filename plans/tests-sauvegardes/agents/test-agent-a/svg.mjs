import { charger } from './extract.mjs'
import fs from 'fs'
const M = await charger('NumerationView.vue', ['svgBase10'])
fs.writeFileSync('/tmp/test-agent-a/cube.html', `<body style="margin:0;background:#fff">${M.svgBase10(3, 2, 4, 6)}</body>`)
