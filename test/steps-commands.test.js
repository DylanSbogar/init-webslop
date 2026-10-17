import { test } from "node:test"
import assert from "node:assert/strict"
import { scaffold, shadcnSpec } from "../src/steps/scaffold.js"
import { installDeps } from "../src/steps/deps.js"
import { addAllComponents } from "../src/steps/components.js"

function recorder() {
  const calls = []
  const runner = (command, args, opts) => calls.push({ command, args, opts })
  return { calls, runner }
}

test("shadcnSpec pins the version", () => {
  assert.equal(shadcnSpec("4.21.1"), "shadcn@4.21.1")
  assert.equal(shadcnSpec("latest"), "shadcn@latest")
})

test("scaffold invokes npx shadcn init with the vite template and pointer", () => {
  const { calls, runner } = recorder()
  scaffold(
    { cwd: "/tmp/work", name: "my-app", preset: "bK05e04oq", shadcnVersion: "4.21.1" },
    runner
  )

  assert.equal(calls.length, 1)
  const [call] = calls
  assert.equal(call.command, "npx")
  assert.deepEqual(call.args, [
    "--yes",
    "shadcn@4.21.1",
    "init",
    "--template",
    "vite",
    "--pointer",
    "--preset",
    "bK05e04oq",
    "--name",
    "my-app",
    "--yes",
  ])
  assert.equal(call.opts.cwd, "/tmp/work")
  assert.equal(call.opts.phase, "scaffold")
})

test("installDeps installs the three TanStack packages then the dev plugin", () => {
  const { calls, runner } = recorder()
  installDeps({ projectDir: "/tmp/work/my-app" }, runner)

  assert.equal(calls.length, 2)
  assert.deepEqual(calls[0].args, [
    "install",
    "@tanstack/react-query",
    "@tanstack/react-router",
    "@tanstack/react-table",
  ])
  assert.deepEqual(calls[1].args, ["install", "--save-dev", "@tanstack/router-plugin"])
  for (const call of calls) {
    assert.equal(call.command, "npm")
    assert.equal(call.opts.cwd, "/tmp/work/my-app")
    assert.equal(call.opts.phase, "dependencies")
  }
})

test("addAllComponents adds every component at the pinned version", () => {
  const { calls, runner } = recorder()
  addAllComponents({ projectDir: "/tmp/work/my-app", shadcnVersion: "4.21.1" }, runner)

  assert.equal(calls.length, 1)
  assert.deepEqual(calls[0].args, ["--yes", "shadcn@4.21.1", "add", "--all", "--yes"])
  assert.equal(calls[0].opts.phase, "components")
  assert.equal(calls[0].opts.cwd, "/tmp/work/my-app")
})

test("the same pinned version reaches both init and add", () => {
  const a = recorder()
  const b = recorder()
  scaffold({ cwd: "/w", name: "n", preset: "p", shadcnVersion: "9.9.9" }, a.runner)
  addAllComponents({ projectDir: "/w/n", shadcnVersion: "9.9.9" }, b.runner)
  assert.ok(a.calls[0].args.includes("shadcn@9.9.9"))
  assert.ok(b.calls[0].args.includes("shadcn@9.9.9"))
})
