import { test } from "node:test"
import assert from "node:assert/strict"
import { parseArgs, isValidProjectName } from "../src/args.js"
import { SHADCN_VERSION, DEFAULT_PRESET } from "../src/constants.js"

test("defaults preset and shadcn version when not given", () => {
  const got = parseArgs(["--name", "foo"])
  assert.equal(got.name, "foo")
  assert.equal(got.preset, DEFAULT_PRESET)
  assert.equal(got.shadcnVersion, SHADCN_VERSION)
})

test("name is null when not given, so the caller can prompt", () => {
  assert.equal(parseArgs([]).name, null)
})

test("accepts overrides for preset and shadcn version", () => {
  const got = parseArgs(["--preset", "nova", "--shadcn", "latest"])
  assert.equal(got.preset, "nova")
  assert.equal(got.shadcnVersion, "latest")
})

test("supports --flag=value form", () => {
  assert.equal(parseArgs(["--name=my-app"]).name, "my-app")
})

test("throws on an unknown flag", () => {
  assert.throws(() => parseArgs(["--nope"]), /Unknown option: --nope/)
})

test("throws when a flag is missing its value", () => {
  assert.throws(() => parseArgs(["--name"]), /--name requires a value/)
})

test("throws when a flag value looks like another flag", () => {
  assert.throws(() => parseArgs(["--name", "--preset"]), /--name requires a value/)
})

// Review Focus 1: an unvalidated name writes outside the cwd.
test("rejects names that escape the working directory or are unsafe", () => {
  for (const bad of ["../evil", "/etc/passwd", "a/b", "my app", "", ".", "..", "-leading"]) {
    assert.equal(isValidProjectName(bad), false, `expected ${JSON.stringify(bad)} to be invalid`)
  }
})

test("accepts ordinary project names", () => {
  for (const good of ["my-app", "my_app", "app2", "My.App", "@scope-ish"]) {
    assert.equal(isValidProjectName(good), true, `expected ${JSON.stringify(good)} to be valid`)
  }
})

test("parseArgs rejects an invalid --name immediately", () => {
  assert.throws(() => parseArgs(["--name", "../evil"]), /not a valid project name/)
})
