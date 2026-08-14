/**
 * Build the client artifacts from the TSX page source.
 *
 *   node build.mjs            → lib/client.js (ModuleLoader bundle + map),
 *                               the static bundle client shipped by the package
 *   node build.mjs --dynamic  → dist/dynamic-client-body.js, a plain JS
 *                               function body for cordis_define `code.client`
 *                               (free symbols: React, styles, host, ctx)
 */
import { build } from 'esbuild'
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'

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
    entryPoints: ['src/dynamic.ts'],
    outfile: 'dist/_dynamic-client.cjs',
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
    entryPoints: ['src/static.tsx'],
    outfile: 'lib/client.js',
    external: ['react'],
    sourcemap: true,
    banner: { js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PACKAGE)}, factory: (require) => { var module = { exports: {} }; var exports = module.exports; var React = require('react');` },
    footer: { js: 'return module.exports; } });' },
  })
  console.log('static client bundle → lib/client.js (+ client.js.map)')
}
