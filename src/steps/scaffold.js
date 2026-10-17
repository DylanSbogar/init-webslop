import { run } from "../run.js"

export function shadcnSpec(version) {
  return `shadcn@${version}`
}

export function scaffold({ cwd, name, preset, shadcnVersion }, runner = run) {
  runner(
    "npx",
    [
      "--yes",
      shadcnSpec(shadcnVersion),
      "init",
      "--template",
      "vite",
      "--pointer",
      "--preset",
      preset,
      "--name",
      name,
      "--yes",
    ],
    { cwd, phase: "scaffold" }
  )
}
