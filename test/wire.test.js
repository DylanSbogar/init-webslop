import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { patchViteConfig, wire } from "../src/steps/wire.js"

const UPSTREAM = `import { resolve } from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "./src"),
    },
  },
})
`

test("adds the plugin import", () => {
  const out = patchViteConfig(UPSTREAM)
  assert.match(out, /import tanstackRouter from "@tanstack\/router-plugin\/vite"/)
})

test("inserts tanstackRouter before react in the plugins array", () => {
  const out = patchViteConfig(UPSTREAM)
  assert.match(out, /plugins:\s*\[\s*tanstackRouter\(/)
  const pluginsLine = out.match(/plugins: \[[^\]]*\]/s)[0]
  assert.ok(
    pluginsLine.indexOf("tanstackRouter") < pluginsLine.indexOf("react()"),
    "tanstackRouter must come before react()"
  )
})

test("passes the react target and enables auto code splitting", () => {
  const out = patchViteConfig(UPSTREAM)
  assert.match(out, /target: "react"/)
  assert.match(out, /autoCodeSplitting: true/)
})

test("leaves the rest of the config intact", () => {
  const out = patchViteConfig(UPSTREAM)
  assert.match(out, /tailwindcss\(\)/)
  assert.match(out, /"@": resolve\(import\.meta\.dirname, "\.\/src"\)/)
})

test("generated config has no semicolons at line ends, matching .prettierrc", () => {
  const out = patchViteConfig(UPSTREAM)
  for (const line of out.split("\n")) {
    assert.ok(!/;\s*$/.test(line), `unexpected trailing semicolon: ${line}`)
  }
})

test("is not applied twice if somehow run again", () => {
  const once = patchViteConfig(UPSTREAM)
  const twice = patchViteConfig(once)
  assert.equal(twice, once)
  assert.equal(twice.match(/tanstackRouter\(/g).length, 1)
})

// Review Focus 2: an unexpected shape must not produce a mangled config.
test("declines and explains when there is no plugins array", () => {
  const odd = `import { defineConfig } from "vite"\nexport default defineConfig({})\n`
  assert.throws(() => patchViteConfig(odd), /could not find a plugins array/i)
})

test("the decline message tells the user exactly what to add by hand", () => {
  const odd = `import { defineConfig } from "vite"\nexport default defineConfig({})\n`
  assert.throws(() => patchViteConfig(odd), (err) => {
    assert.match(err.message, /@tanstack\/router-plugin\/vite/)
    assert.match(err.message, /tanstackRouter\(\{ target: "react", autoCodeSplitting: true \}\)/)
    return true
  })
})

test("wire writes main.tsx and both route files, preserving ThemeProvider", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-wire-"))
  mkdirSync(join(dir, "src"), { recursive: true })
  writeFileSync(join(dir, "vite.config.ts"), UPSTREAM)
  writeFileSync(join(dir, "src", "main.tsx"), "// placeholder from template\n")

  wire({ projectDir: dir })

  const main = readFileSync(join(dir, "src", "main.tsx"), "utf8")
  assert.match(main, /QueryClientProvider/)
  assert.match(main, /RouterProvider/)
  // The template's dark mode depends on this wrapper surviving.
  assert.match(main, /ThemeProvider/)
  assert.match(main, /routeTree\.gen/)

  const root = readFileSync(join(dir, "src", "routes", "__root.tsx"), "utf8")
  assert.match(root, /createRootRoute/)
  assert.match(root, /<Outlet \/>/)

  const index = readFileSync(join(dir, "src", "routes", "index.tsx"), "utf8")
  assert.match(index, /createFileRoute/)

  assert.match(readFileSync(join(dir, "vite.config.ts"), "utf8"), /tanstackRouter/)
})

test("wire does not create routeTree.gen.ts — the Vite plugin does that", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-wire-"))
  mkdirSync(join(dir, "src"), { recursive: true })
  writeFileSync(join(dir, "vite.config.ts"), UPSTREAM)
  writeFileSync(join(dir, "src", "main.tsx"), "// placeholder\n")

  wire({ projectDir: dir })

  assert.throws(() => readFileSync(join(dir, "src", "routeTree.gen.ts"), "utf8"))
})
