#!/usr/bin/env node

import { readFileSync } from "node:fs"

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

async function main(argv) {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(USAGE)
    return 0
  }

  if (argv.includes("--version") || argv.includes("-v")) {
    process.stdout.write(`${pkg.version}\n`)
    return 0
  }

  process.stdout.write(USAGE)
  return 0
}

main(process.argv.slice(2))
  .then((code) => process.exit(code))
  .catch((err) => {
    process.stderr.write(`\n  Error: ${err.message}\n\n`)
    process.exit(1)
  })
