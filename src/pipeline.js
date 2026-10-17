import { join } from "node:path"
import { preflight } from "./steps/preflight.js"
import { scaffold } from "./steps/scaffold.js"
import { installDeps } from "./steps/deps.js"
import { addAllComponents } from "./steps/components.js"
import { wire } from "./steps/wire.js"
import { generateBarrel } from "./steps/barrel.js"

const DEFAULT_STEPS = {
  preflight,
  scaffold,
  installDeps,
  addAllComponents,
  wire,
  generateBarrel,
}

export function createWebslop(
  { name, preset, shadcnVersion, cwd },
  steps = DEFAULT_STEPS,
  log = () => {}
) {
  const projectDir = join(cwd, name)
  const ctx = { name, preset, shadcnVersion, cwd, projectDir }

  steps.preflight(ctx)

  log(`Scaffolding ${name} with shadcn@${shadcnVersion}`)
  steps.scaffold(ctx)

  log("Installing TanStack packages")
  steps.installDeps(ctx)

  log("Adding all shadcn components")
  steps.addAllComponents(ctx)

  log("Wiring router and query")
  steps.wire(ctx)

  const count = steps.generateBarrel(ctx)
  log(`Barrel file exports ${count} components`)
}
