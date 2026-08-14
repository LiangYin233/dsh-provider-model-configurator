/** CSS files import as text (esbuild loader: .css → text, inlined at build). */
declare module '*.css' {
  const css: string
  export default css
}
