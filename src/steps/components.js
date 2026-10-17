import { run } from "../run.js"
import { shadcnSpec } from "./scaffold.js"

export function addAllComponents({ projectDir, shadcnVersion }, runner = run) {
  runner("npx", ["--yes", shadcnSpec(shadcnVersion), "add", "--all", "--yes"], {
    cwd: projectDir,
    phase: "components",
  })
}
