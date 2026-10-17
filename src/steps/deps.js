import { run } from "../run.js"
import { TANSTACK_DEPS, TANSTACK_DEV_DEPS } from "../constants.js"

export function installDeps({ projectDir }, runner = run) {
  runner("npm", ["install", ...TANSTACK_DEPS], {
    cwd: projectDir,
    phase: "dependencies",
  })

  runner("npm", ["install", "--save-dev", ...TANSTACK_DEV_DEPS], {
    cwd: projectDir,
    phase: "dependencies",
  })
}
