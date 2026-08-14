/**
 * Post-build packaging smoke test — the guard that would have caught the
 * 0.3.8 boot failure (ERR_MODULE_NOT_FOUND for shared/thinking.js).
 *
 * Runs automatically at the end of `npm run build` (and therefore inside
 * `npm run check`). It verifies the package EXACTLY as npm would ship it:
 * the package.json `files` list is authoritative for this repo (explicit
 * paths, no globs), so the shipped tree is simulated in a temp dir by
 * copying every listed entry plus package.json — no subprocess npm needed
 * (npm.cmd resolves its own prefix from the CWD on Windows, which is
 * unreliable from arbitrary directories).
 *
 * Checks performed on the simulated shipped tree:
 *
 *  1. the package-root `shared/thinking.js` is present (lib/contract.js
 *     imports it via '../shared/thinking.js' at runtime);
 *  2. every static relative import inside lib/*.js resolves within the
 *     package — a dangling import (source layout ≠ built layout) fails
 *     here, before it can take down a profile boot;
 *  3. the extracted lib/contract.js actually loads and exports its
 *     constants (the exact module that failed at boot).
 *
 * A failure exits non-zero and aborts the build.
 */
import { cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const root = resolve(import.meta.dirname, '..')
const tmp = mkdtempSync(join(tmpdir(), 'pmc-pack-check-'))
const rel = (p) => p.replaceAll('\\', '/').replace(tmp.replaceAll('\\', '/') + '/', '').replace(root.replaceAll('\\', '/') + '/', '')

let failed = false
const fail = (msg) => { failed = true; console.error(`✗ ${msg}`) }
const ok = (msg) => console.log(`✓ ${msg}`)

try {
  // Simulate the shipped package from the authoritative `files` list.
  const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
  const pkgDir = join(tmp, 'package')
  mkdirSync(pkgDir, { recursive: true })
  for (const entry of manifest.files) {
    cpSync(join(root, entry), join(pkgDir, entry), { recursive: true })
  }
  cpSync(join(root, 'package.json'), join(pkgDir, 'package.json'))

  // 1. The exact file that was missing in the 0.3.8 incident.
  if (!existsSync(join(pkgDir, 'shared', 'thinking.js'))) {
    fail('包根 shared/thinking.js 缺失 — lib/contract.js 的 ../shared/thinking.js 将无法解析(0.3.8 线上事故会复发)')
  } else {
    ok('包根 shared/thinking.js 已随包发布')
  }

  // 2. Resolve every static relative import inside the shipped lib/.
  const walk = (dir) => readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])
  const files = walk(join(pkgDir, 'lib')).filter((f) => f.endsWith('.js'))
  let bad = 0
  for (const f of files) {
    const src = readFileSync(f, 'utf8')
    const imports = [...src.matchAll(/^\s*(?:import|export)[^;]*?from\s+['"](\.[^'"]+)['"]/gm)]
    for (const m of imports) {
      const target = new URL(m[1], pathToFileURL(f))
      if (!existsSync(target)) {
        fail(`${rel(f)}: 相对导入 ${m[1]} 在打包产物中无法解析(${rel(target.pathname)})`)
        bad++
      }
    }
  }
  if (!bad) ok(`lib/ 下所有相对导入在打包产物中均可解析(${files.length} 个文件)`)

  // 3. Runtime import of the shipped contract (the exact module that failed at boot).
  const contract = await import(pathToFileURL(join(pkgDir, 'lib', 'contract.js')).href)
  if (!Array.isArray(contract.THINKING_LEVELS) || !Array.isArray(contract.THINKING_FORMATS)) {
    fail('lib/contract.js 可加载但未导出 THINKING_LEVELS / THINKING_FORMATS')
  } else {
    ok('lib/contract.js 从打包产物中加载成功并导出常量')
  }
} catch (cause) {
  fail(`打包/导入冒烟检查异常: ${cause.message}`)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

if (failed) {
  console.error('导入冒烟检查:失败')
  process.exit(1)
}
console.log('导入冒烟检查:通过')
