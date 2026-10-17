import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const UI_DIR = join("src", "components", "ui")

const REACT_IMPORT = /^import \* as React from ["']react["']\r?\n/m

// Upstream shadcn ships at least one component (scroll-area) with a namespace
// React import it never uses. The Vite template sets noUnusedLocals: true, so
// `npm run build` fails on a freshly scaffolded project. Drop the dead import
// only when nothing in the file references the namespace.
export function stripUnusedReactImport(source) {
  if (!REACT_IMPORT.test(source)) return source

  const withoutImport = source.replace(REACT_IMPORT, "")

  // A real use is `React` followed by . or < — covers values (React.useRef)
  // and types (React.ComponentProps<...>), but not identifiers like ReactLike.
  if (/\bReact\s*[.<]/.test(withoutImport)) return source

  return withoutImport
}

export function tidyComponents({ projectDir }) {
  const uiPath = join(projectDir, UI_DIR)
  if (!existsSync(uiPath)) return 0

  let fixed = 0

  for (const entry of readdirSync(uiPath, { withFileTypes: true })) {
    if (!entry.isFile()) continue
    if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".ts")) continue

    const path = join(uiPath, entry.name)
    const source = readFileSync(path, "utf8")
    const tidied = stripUnusedReactImport(source)

    if (tidied !== source) {
      writeFileSync(path, tidied)
      fixed++
    }
  }

  return fixed
}
