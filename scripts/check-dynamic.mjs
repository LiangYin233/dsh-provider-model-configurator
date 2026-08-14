/**
 * Check the two standalone dynamic-plugin halves:
 *
 *  1. src/host/dynamic.js            — cordis_define `code.host` body
 *  2. dist/dynamic-client-body.js    — cordis_define `code.client` body
 *
 * Both are function bodies (top-level `return ...`), so `node --check`
 * cannot parse them. `new Function(body)` validates them as function bodies.
 * It also pins the inline THINKING_LEVELS / THINKING_FORMATS copies inside
 * src/host/dynamic.js to the canonical values in src/shared/thinking.js so
 * the standalone body can never drift from the shared source silently.
 */
import { readFile } from 'node:fs/promises'

let failed = false
const fail = (msg) => { failed = true; console.error(`✗ ${msg}`) }

for (const file of ['src/host/dynamic.js', 'dist/dynamic-client-body.js']) {
  const body = await readFile(file, 'utf8')
  try {
    new Function(body) // eslint-disable-line no-new-func
  } catch (err) {
    fail(`${file}: syntax error — ${err.message}`)
  }
}

// Pin the dynamic host body's inline constants to the shared source of truth.
const grab = (src, name) => {
  const m = src.match(new RegExp(`const ${name} = (\\[[^\\]]*\\])`))
  if (!m) throw new Error(`could not locate const ${name}`)
  // The arrays are plain JS literals (single-quoted strings); evaluate them
  // as an expression to compare values, not text.
  return JSON.stringify(new Function(`return (${m[1]})`)())
}
const shared = await readFile('src/shared/thinking.js', 'utf8')
const dynamic = await readFile('src/host/dynamic.js', 'utf8')
for (const name of ['THINKING_LEVELS', 'THINKING_FORMATS']) {
  try {
    if (grab(dynamic, name) !== grab(shared, name)) fail(`src/host/dynamic.js: ${name} drifted from src/shared/thinking.js`)
  } catch (err) {
    fail(err.message)
  }
}

if (failed) process.exit(1)
console.log('dynamic halves: syntax OK, constants in sync with src/shared/thinking.js')
