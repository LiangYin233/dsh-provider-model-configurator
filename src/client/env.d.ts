/**
 * Ambient symbols of the two client runtimes this package can mount in.
 *
 * - Static bundle (`lib/client.js`, served by the web shell): `React` is
 *   injected by the build banner (`require('react')` through the shell's
 *   static registry); `styles` / `host` are NOT defined — the static entry
 *   uses document-based CSS and the Typert Remote handle instead.
 * - Dynamic plugin (cordis_define `code.client`): `React`, `styles` and
 *   `host` arrive as closure parameters of the evaluated body.
 */
declare const React: typeof import('react')
declare const styles: { insert(css: string): unknown }
declare const host: { call(method: string, payload?: unknown): Promise<unknown> }
