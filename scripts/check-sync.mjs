/**
 * Pre-build consistency checks (npm run check):
 *
 *  1. src ↔ lib drift detection for the files copied verbatim by build.mjs.
 *     A mismatch warns that the shipped lib/ artifacts are stale — the check
 *     run that follows rebuilds them, so this is a warning, not a failure.
 *  2. Locale key parity: zh.json and en.json must have exactly the same keys
 *     and the same {placeholder}s per key (failures exit non-zero).
 */
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

let failed = false
const fail = (msg) => { failed = true; console.error(`✗ ${msg}`) }

// 1. Files copied verbatim from src to lib by build.mjs.
const pairs = [
  ['src/host/index.js', 'lib/index.js'],
  ['src/host/contract.js', 'lib/contract.js'],
  ['src/shared/thinking.js', 'lib/shared/thinking.js'],
]
let stale = 0
for (const [src, lib] of pairs) {
  const [a, b] = await Promise.all([readFile(src), readFile(lib)])
  const hash = (buf) => createHash('sha256').update(buf).digest('hex')
  if (hash(a) !== hash(b)) {
    stale++
    console.warn(`⚠ ${lib} 与 ${src} 不同步(上次构建后 src 有改动);本次 check 将自动重建,提交前请确认 lib/ 已刷新`)
  }
}

// 2. Locale dictionaries: identical key sets and per-key placeholder parity.
const zh = JSON.parse(await readFile('src/client/locales/zh.json', 'utf8'))
const en = JSON.parse(await readFile('src/client/locales/en.json', 'utf8'))
const zk = Object.keys(zh)
const ek = Object.keys(en)
const zOnly = zk.filter((k) => !(k in en))
const eOnly = ek.filter((k) => !(k in zh))
if (zOnly.length || eOnly.length) fail(`语言包键位不一致 — 仅 zh: [${zOnly.join(', ')}] 仅 en: [${eOnly.join(', ')}]`)
const placeholders = (s) => [...String(s).matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',')
for (const k of zk) {
  const zp = placeholders(zh[k])
  const ep = placeholders(en[k])
  if (zp !== ep) fail(`语言包占位符不一致 "${k}": zh=[${zp}] en=[${ep}]`)
}

if (failed) process.exit(1)
console.log(stale
  ? `src ↔ lib: ${stale} 处漂移(将由构建刷新);语言包键位/占位符一致`
  : 'src ↔ lib 同步,语言包键位/占位符一致')
