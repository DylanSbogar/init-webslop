import { readdirSync, writeFileSync, existsSync } from "node:fs"
import { join } from "node:path"

const UI_DIR = join("src", "components", "ui")

function isComponentModule(filename) {
  if (filename === "index.ts" || filename === "index.tsx") return false
  if (filename.endsWith(".d.ts")) return false
  if (/\.(test|spec)\.(ts|tsx)$/.test(filename)) return false
  return filename.endsWith(".ts") || filename.endsWith(".tsx")
}

export function barrelContents(filenames) {
  const modules = filenames
    .filter(isComponentModule)
    .map((f) => f.replace(/\.tsx?$/, ""))
    .sort()

  if (modules.length === 0) return ""

  return modules.map((m) => `export * from "./${m}"`).join("\n") + "\n"
}

export function generateBarrel({ projectDir }) {
  const uiPath = join(projectDir, UI_DIR)

  if (!existsSync(uiPath)) {
    throw new Error(
      `Expected ${UI_DIR} to exist after adding components, but it does not. Skipping the barrel file.`
    )
  }

  const filenames = readdirSync(uiPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)

  const contents = barrelContents(filenames)
  writeFileSync(join(uiPath, "index.ts"), contents)

  return contents === "" ? 0 : contents.trimEnd().split("\n").length
}
