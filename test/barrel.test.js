import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { barrelContents, generateBarrel } from "../src/steps/barrel.js"

test("emits one export per component, sorted", () => {
  const out = barrelContents(["button.tsx", "accordion.tsx", "alert.tsx"])
  assert.equal(
    out,
    `export * from "./accordion"\nexport * from "./alert"\nexport * from "./button"\n`
  )
})

test("strips both .ts and .tsx extensions", () => {
  const out = barrelContents(["use-mobile.ts", "button.tsx"])
  assert.match(out, /export \* from "\.\/use-mobile"/)
  assert.match(out, /export \* from "\.\/button"/)
  assert.ok(!out.includes(".ts\""), "extensions must be stripped")
})

// Review Focus 3: only component modules, and idempotent across re-runs.
test("excludes index.ts so the barrel never re-exports itself", () => {
  const out = barrelContents(["index.ts", "button.tsx"])
  assert.ok(!out.includes("./index"), "must not export itself")
  assert.match(out, /export \* from "\.\/button"/)
})

test("excludes test and declaration files", () => {
  const out = barrelContents([
    "button.tsx",
    "button.test.tsx",
    "button.spec.ts",
    "types.d.ts",
  ])
  assert.equal(out, `export * from "./button"\n`)
})

test("excludes files that are not ts or tsx", () => {
  const out = barrelContents(["button.tsx", "theme.json", "README.md", "styles.css"])
  assert.equal(out, `export * from "./button"\n`)
})

test("returns an empty string for no components", () => {
  assert.equal(barrelContents([]), "")
})

test("generateBarrel writes the file and ignores directories", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-barrel-"))
  const ui = join(dir, "src", "components", "ui")
  mkdirSync(ui, { recursive: true })
  writeFileSync(join(ui, "button.tsx"), "export const Button = () => null\n")
  writeFileSync(join(ui, "card.tsx"), "export const Card = () => null\n")
  writeFileSync(join(ui, "notes.md"), "ignore me\n")
  mkdirSync(join(ui, "nested"))

  const count = generateBarrel({ projectDir: dir })

  assert.equal(count, 2)
  const written = readFileSync(join(ui, "index.ts"), "utf8")
  assert.equal(written, `export * from "./button"\nexport * from "./card"\n`)
})

test("generateBarrel is idempotent when run twice", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-barrel-"))
  const ui = join(dir, "src", "components", "ui")
  mkdirSync(ui, { recursive: true })
  writeFileSync(join(ui, "button.tsx"), "export const Button = () => null\n")

  generateBarrel({ projectDir: dir })
  const first = readFileSync(join(ui, "index.ts"), "utf8")
  generateBarrel({ projectDir: dir })
  const second = readFileSync(join(ui, "index.ts"), "utf8")

  assert.equal(first, second)
})

test("generateBarrel throws a clear error when the ui directory is missing", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-barrel-"))
  assert.throws(() => generateBarrel({ projectDir: dir }), /src\/components\/ui/)
})
