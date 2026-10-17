import { test } from "node:test"
import assert from "node:assert/strict"
import { run, StepError } from "../src/run.js"

test("returns normally when the command succeeds", () => {
  assert.doesNotThrow(() => run(process.execPath, ["-e", "process.exit(0)"], { phase: "test" }))
})

// Review Focus 4: name the phase and the command, do not swallow the failure.
test("throws a StepError naming the phase and the command on non-zero exit", () => {
  let caught
  try {
    run(process.execPath, ["-e", "process.exit(3)"], { phase: "components" })
  } catch (err) {
    caught = err
  }

  assert.ok(caught instanceof StepError, "expected a StepError")
  assert.equal(caught.phase, "components")
  assert.match(caught.command, /-e/)
  assert.match(caught.message, /components/)
  assert.match(caught.message, /exit code 3/)
})

test("throws a StepError when the binary does not exist", () => {
  assert.throws(
    () => run("definitely-not-a-real-binary-xyz", [], { phase: "scaffold" }),
    StepError
  )
})

test("runs in the given cwd", () => {
  // tmpdir always exists; a script that reads cwd and exits non-zero if it is wrong.
  const dir = process.cwd()
  assert.doesNotThrow(() =>
    run(process.execPath, ["-e", `process.exit(process.cwd() === ${JSON.stringify(dir)} ? 0 : 9)`], {
      cwd: dir,
      phase: "test",
    })
  )
})
