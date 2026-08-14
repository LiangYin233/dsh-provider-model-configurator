/**
 * Build the client artifacts from the TSX page source and refresh the host
 * artifacts in lib/ from their sources in src/host/.
 *
 *   node build.mjs            → lib/client.js (ModuleLoader bundle + map),
 *                               the static bundle client shipped by the package;
 *                               lib/index.js + lib/contract.js re-copied from
 *                               src/host/ (the shipped host half)
 *   node build.mjs --dynamic  → dist/dynamic-client-body.js, a plain JS
 *                               function body for cordis_define `code.client`
 *                               (free symbols: React, styles, host, ctx)
 */
import { build } from 'esbuild'
import { copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const PACKAGE = 'dsh-provider-model-configurator'
const dynamic = process.argv.includes('--dynamic')

const common = {
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: ['es2020'],
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: { '.css': 'text' },
  logLevel: 'info',
}

if (dynamic) {
  await build({
    ...common,
    entryPoints: ['src/client/dynamic.ts'],
    outfile: 'dist/_dynamic-client.cjs',
    // Keep generated lines short so the body stays readable in cordis_define.
    lineLimit: 100,
  })
  const cjs = await readFile('dist/_dynamic-client.cjs', 'utf8')
  await mkdir('dist', { recursive: true })
  await writeFile(
    'dist/dynamic-client-body.js',
    `return (() => { var module = { exports: {} }; var exports = module.exports;\n${cjs}\nreturn module.exports; })();\n`,
  )
  await rm('dist/_dynamic-client.cjs')
  console.log('dynamic client body → dist/dynamic-client-body.js')
} else {
  await build({
    ...common,
    entryPoints: ['src/client/static.tsx'],
    outfile: 'lib/client.js',
    external: ['react'],
    sourcemap: true,
    banner: { js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports; var React = require('react');` },
    footer: { js: 'return module.exports; } });' },
  })
  console.log('static client bundle → lib/client.js (+ client.js.map)')
}

// Refresh the shipped host half from its sources (plain ESM, copied verbatim).
await copyFile('src/host/index.js', 'lib/index.js')
await copyFile('src/host/contract.js', 'lib/contract.js')
console.log('host sources → lib/index.js + lib/contract.js')

// Shared constants are imported by lib/contract.js at runtime.
await mkdir('lib/shared', { recursive: true })
await copyFile('src/shared/thinking.js', 'lib/shared/thinking.js')
console.log('shared constants → lib/shared/thinking.js')
