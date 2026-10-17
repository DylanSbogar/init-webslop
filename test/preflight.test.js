import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { preflight, satisfiesMinNode } from "../src/steps/preflight.js"

function tmp() {
  return mkdtempSync(join(tmpdir(), "iws-pre-"))
}

test("accepts a Node version at or above the floor", () => {
  assert.equal(satisfiesMinNode("20.19.0", "20.19.0"), true)
  assert.equal(satisfiesMinNode("20.19.4", "20.19.0"), true)
  assert.equal(satisfiesMinNode("22.12.0", "20.19.0"), true)
  assert.equal(satisfiesMinNode("24.0.0", "20.19.0"), true)
})

test("rejects a Node version below the floor", () => {
  assert.equal(satisfiesMinNode("20.18.0", "20.19.0"), false)
  assert.equal(satisfiesMinNode("18.20.0", "20.19.0"), false)
  assert.equal(satisfiesMinNode("20.9.0", "20.19.0"), false)
})

test("tolerates a v prefix and prerelease suffix", () => {
  assert.equal(satisfiesMinNode("v20.19.0", "20.19.0"), true)
  assert.equal(satisfiesMinNode("21.0.0-nightly", "20.19.0"), true)
})

test("passes when the directory is free and Node is new enough", () => {
  const dir = join(tmp(), "fresh-app")
  assert.doesNotThrow(() => preflight({ projectDir: dir, nodeVersion: "22.12.0" }))
})

test("explains the Node requirement rather than failing later", () => {
  const dir = join(tmp(), "fresh-app")
  assert.throws(
    () => preflight({ projectDir: dir, nodeVersion: "20.18.0" }),
    /Node 20\.19\.0 or newer is required.*you have 20\.18\.0/s
  )
})

// Review Focus 5: refuse before any subprocess runs.
test("refuses when the target directory already exists", () => {
  const base = tmp()
  const dir = join(base, "taken")
  mkdirSync(dir)
  assert.throws(() => preflight({ projectDir: dir, nodeVersion: "22.12.0" }), /already exists/)
})

test("refuses when the target path exists as a file", () => {
  const base = tmp()
  const dir = join(base, "taken")
  writeFileSync(dir, "")
  assert.throws(() => preflight({ projectDir: dir, nodeVersion: "22.12.0" }), /already exists/)
})
