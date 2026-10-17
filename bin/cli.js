#!/usr/bin/env node

import { readFileSync } from "node:fs"
import { createInterface } from "node:readline/promises"
import { parseArgs, isValidProjectName } from "../src/args.js"
import { createWebslop } from "../src/pipeline.js"
import { StepError } from "../src/run.js"

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
)

const USAGE = `
  init-webslop — scaffold a web app on the shadcn Vite template

  Usage
    $ init-webslop [options]

  Options
    --name <name>       App name, and the directory to create. Prompted for if omitted.
    --preset <preset>   shadcn preset. Defaults to the built-in favourite.
    --shadcn <version>  shadcn CLI version to use. Defaults to the pinned version.
    --help, -h          Show this help.
    --version, -v       Show the version.

  Example
    $ init-webslop --name my-prototype
`

async function promptForName() {
  const rl = createInterface({ input: process.stdin, output: process.stdout })
  try {
    for (let attempt = 0; attempt < 3; attempt++) {
      const answer = (await rl.question("  App name: ")).trim()
      if (isValidProjectName(answer)) return answer
      process.stdout.write(
        "  Use letters, digits, dots, dashes and underscores — no slashes or spaces.\n"
      )
    }
    throw new Error("No valid app name given.")
  } finally {
    rl.close()
  }
}

async function main(argv) {
  const opts = parseArgs(argv)

  if (opts.help) {
    process.stdout.write(USAGE)
    return 0
  }

  if (opts.version) {
    process.stdout.write(`${pkg.version}\n`)
    return 0
  }

  const name = opts.name ?? (await promptForName())

  process.stdout.write(`\n  Creating ${name}\n\n`)

  createWebslop(
    {
      name,
      preset: opts.preset,
      shadcnVersion: opts.shadcnVersion,
      cwd: process.cwd(),
    },
    undefined,
    (message) => process.stdout.write(`\n  ${message}\n\n`)
  )

  process.stdout.write(
    `\n  Done. Next:\n\n    cd ${name}\n    npm run dev\n\n` +
      `  The first dev-server start generates src/routeTree.gen.ts.\n` +
      `  Until then your editor will flag that import as unresolved.\n\n`
  )

  return 0
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err) => {
    if (err instanceof StepError) {
      process.stderr.write(
        `\n  Failed during: ${err.phase}\n` +
          `  Command: ${err.command}\n\n` +
          `  The partial project was left in place so you can inspect it.\n\n`
      )
    } else {
      process.stderr.write(`\n  ${err.message}\n\n`)
    }
    process.exit(1)
  })
