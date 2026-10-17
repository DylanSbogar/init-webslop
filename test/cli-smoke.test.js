import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { fileURLToPath } from "node:url"

const CLI = fileURLToPath(new URL("../bin/cli.js", import.meta.url))

function run(args) {
  return execFileSync(process.execPath, [CLI, ...args], { encoding: "utf8" })
}

test("--help prints usage including both main flags", () => {
  const out = run(["--help"])
  assert.match(out, /init-webslop/)
  assert.match(out, /--name/)
  assert.match(out, /--preset/)
  assert.match(out, /--shadcn/)
})

test("--version prints the package version", () => {
  const out = run(["--version"])
  assert.match(out.trim(), /^\d+\.\d+\.\d+$/)
})
