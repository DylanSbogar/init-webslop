import { SHADCN_VERSION, DEFAULT_PRESET } from "./constants.js"

const FLAGS_WITH_VALUES = new Set(["--name", "--preset", "--shadcn"])

// Allow a leading @ for scope-ish names, then letters, digits, . _ -
// Deliberately excludes / \ whitespace and the bare . and .. forms, so the
// name can never escape the working directory.
const NAME_PATTERN = /^@?[A-Za-z0-9._][A-Za-z0-9._-]*$/

export function isValidProjectName(name) {
  if (typeof name !== "string" || name.length === 0) return false
  if (name === "." || name === "..") return false
  if (name.length > 214) return false
  return NAME_PATTERN.test(name)
}

export function parseArgs(argv) {
  const out = {
    name: null,
    preset: DEFAULT_PRESET,
    shadcnVersion: SHADCN_VERSION,
    help: false,
    version: false,
  }

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]

    if (arg === "--help" || arg === "-h") {
      out.help = true
      continue
    }

    if (arg === "--version" || arg === "-v") {
      out.version = true
      continue
    }

    let flag = arg
    let value = null

    const eq = arg.indexOf("=")
    if (arg.startsWith("--") && eq !== -1) {
      flag = arg.slice(0, eq)
      value = arg.slice(eq + 1)
    }

    if (!FLAGS_WITH_VALUES.has(flag)) {
      throw new Error(`Unknown option: ${flag}`)
    }

    if (value === null) {
      const next = argv[i + 1]
      if (next === undefined || next.startsWith("-")) {
        throw new Error(`${flag} requires a value`)
      }
      value = next
      i++
    }

    if (value === "") {
      throw new Error(`${flag} requires a value`)
    }

    if (flag === "--name") out.name = value
    if (flag === "--preset") out.preset = value
    if (flag === "--shadcn") out.shadcnVersion = value
  }

  if (out.name !== null && !isValidProjectName(out.name)) {
    throw new Error(
      `${JSON.stringify(out.name)} is not a valid project name. ` +
        `Use letters, digits, dots, dashes and underscores — no slashes or spaces.`
    )
  }

  return out
}
