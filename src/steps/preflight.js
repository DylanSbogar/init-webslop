import { existsSync } from "node:fs"
import { execFileSync } from "node:child_process"
import { MIN_NODE } from "../constants.js"

export function satisfiesMinNode(current, min) {
  const parse = (v) =>
    String(v)
      .replace(/^v/, "")
      .split("-")[0]
      .split(".")
      .map((n) => Number.parseInt(n, 10) || 0)

  const [a, b, c] = parse(current)
  const [x, y, z] = parse(min)

  if (a !== x) return a > x
  if (b !== y) return b > y
  return c >= z
}

function hasNpm() {
  try {
    execFileSync("npm", ["--version"], { stdio: "ignore" })
    return true
  } catch {
    return false
  }
}

export function preflight({ projectDir, nodeVersion = process.version, checkNpm = true }) {
  if (!satisfiesMinNode(nodeVersion, MIN_NODE)) {
    throw new Error(
      `Node ${MIN_NODE} or newer is required (the Vite 8 template depends on it), ` +
        `but you have ${String(nodeVersion).replace(/^v/, "")}.\n` +
        `  Upgrade Node, then run init-webslop again.`
    )
  }

  if (existsSync(projectDir)) {
    throw new Error(
      `${projectDir} already exists. Choose another --name, or remove it first.`
    )
  }

  if (checkNpm && !hasNpm()) {
    throw new Error("npm was not found on PATH. init-webslop needs npm to install dependencies.")
  }
}
