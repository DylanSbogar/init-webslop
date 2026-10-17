import { test } from "node:test"
import assert from "node:assert/strict"
import { createWebslop } from "../src/pipeline.js"

function fakeSteps(order) {
  return {
    preflight: () => order.push("preflight"),
    scaffold: () => order.push("scaffold"),
    installDeps: () => order.push("installDeps"),
    addAllComponents: () => order.push("addAllComponents"),
    wire: () => order.push("wire"),
    tidyComponents: () => {
      order.push("tidyComponents")
      return 1
    },
    generateBarrel: () => {
      order.push("generateBarrel")
      return 60
    },
  }
}

test("runs the six steps in the specified order", () => {
  const order = []
  createWebslop(
    { name: "my-app", preset: "p", shadcnVersion: "4.21.1", cwd: "/tmp/w" },
    fakeSteps(order)
  )

  assert.deepEqual(order, [
    "preflight",
    "scaffold",
    "installDeps",
    "addAllComponents",
    "wire",
    "tidyComponents",
    "generateBarrel",
  ])
})

test("stops at the first failing step and does not run later ones", () => {
  const order = []
  const steps = fakeSteps(order)
  steps.scaffold = () => {
    throw new Error("shadcn blew up")
  }

  assert.throws(
    () => createWebslop({ name: "a", preset: "p", shadcnVersion: "1", cwd: "/tmp" }, steps),
    /shadcn blew up/
  )
  assert.deepEqual(order, ["preflight"])
})

test("passes the resolved project directory to the steps that need it", () => {
  const seen = {}
  const steps = {
    preflight: (ctx) => (seen.preflight = ctx.projectDir),
    scaffold: (ctx) => (seen.scaffold = ctx.cwd),
    installDeps: (ctx) => (seen.installDeps = ctx.projectDir),
    addAllComponents: (ctx) => (seen.add = ctx.projectDir),
    wire: (ctx) => (seen.wire = ctx.projectDir),
    tidyComponents: (ctx) => {
      seen.tidy = ctx.projectDir
      return 0
    },
    generateBarrel: (ctx) => {
      seen.barrel = ctx.projectDir
      return 0
    },
  }

  createWebslop({ name: "my-app", preset: "p", shadcnVersion: "1", cwd: "/tmp/w" }, steps)

  assert.equal(seen.preflight, "/tmp/w/my-app")
  assert.equal(seen.scaffold, "/tmp/w")
  assert.equal(seen.installDeps, "/tmp/w/my-app")
  assert.equal(seen.add, "/tmp/w/my-app")
  assert.equal(seen.wire, "/tmp/w/my-app")
  assert.equal(seen.tidy, "/tmp/w/my-app")
  assert.equal(seen.barrel, "/tmp/w/my-app")
})
