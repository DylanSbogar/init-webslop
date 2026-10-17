import { spawnSync } from "node:child_process"

export class StepError extends Error {
  constructor(message, { phase, command }) {
    super(message)
    this.name = "StepError"
    this.phase = phase
    this.command = command
  }
}

export function run(command, args, { cwd, phase } = {}) {
  const printable = [command, ...args].join(" ")

  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
  })

  if (result.error) {
    throw new StepError(
      `[${phase}] could not run: ${printable}\n  ${result.error.message}`,
      { phase, command: printable }
    )
  }

  if (result.status !== 0) {
    const how =
      result.signal != null ? `signal ${result.signal}` : `exit code ${result.status}`
    throw new StepError(`[${phase}] failed with ${how}: ${printable}`, {
      phase,
      command: printable,
    })
  }
}
