import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { MAIN_TSX } from "../templates/main.js"
import { ROOT_ROUTE_TSX, INDEX_ROUTE_TSX } from "../templates/routes.js"

const PLUGIN_IMPORT = `import tanstackRouter from "@tanstack/router-plugin/vite"`
const PLUGIN_CALL = `tanstackRouter({ target: "react", autoCodeSplitting: true })`

const MANUAL_INSTRUCTIONS = `
  Add these to vite.config.ts by hand:

    ${PLUGIN_IMPORT}

  and put this first in the plugins array:

    ${PLUGIN_CALL}
`

export function patchViteConfig(source) {
  if (source.includes("@tanstack/router-plugin/vite")) {
    return source
  }

  const pluginsMatch = source.match(/plugins:\s*\[/)
  if (!pluginsMatch) {
    throw new Error(
      `Could not find a plugins array in vite.config.ts, so it was left untouched.\n${MANUAL_INSTRUCTIONS}`
    )
  }

  // Insert the import after the last existing top-level import.
  const imports = [...source.matchAll(/^import .*$/gm)]
  if (imports.length === 0) {
    throw new Error(
      `Could not find any imports in vite.config.ts, so it was left untouched.\n${MANUAL_INSTRUCTIONS}`
    )
  }
  const last = imports[imports.length - 1]
  const importEnd = last.index + last[0].length

  let out =
    source.slice(0, importEnd) + "\n" + PLUGIN_IMPORT + source.slice(importEnd)

  // Insert the plugin call at the head of the plugins array.
  out = out.replace(/plugins:\s*\[/, `plugins: [${PLUGIN_CALL}, `)

  return out
}

export function wire({ projectDir }) {
  const configPath = join(projectDir, "vite.config.ts")
  const source = readFileSync(configPath, "utf8")
  writeFileSync(configPath, patchViteConfig(source))

  writeFileSync(join(projectDir, "src", "main.tsx"), MAIN_TSX)

  const routesDir = join(projectDir, "src", "routes")
  mkdirSync(routesDir, { recursive: true })
  writeFileSync(join(routesDir, "__root.tsx"), ROOT_ROUTE_TSX)
  writeFileSync(join(routesDir, "index.tsx"), INDEX_ROUTE_TSX)
}
