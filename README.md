# init-webslop

Scaffolds a web app on the shadcn Vite template with TanStack Query, Router and
Table already wired up, every shadcn component installed, and a barrel file
exporting them.

```bash
npx init-webslop --name my-prototype
```

One command gets you a project that builds, serves a routed page, and has
data-fetching ready — no boilerplate to write first.

## Options

| Flag | Default | Meaning |
|---|---|---|
| `--name <name>` | prompted | App name, and the directory created under the cwd |
| `--preset <preset>` | `bK05e04oq` | shadcn preset: a built-in name (`nova`, `vega`, `maia`, `lyra`, `mira`, `luma`, `sera`, `rhea`), a custom preset code, or a `shadcn.com/create` URL |
| `--shadcn <version>` | `4.21.1` | shadcn CLI version to invoke. Accepts any npm version or dist-tag, including `latest` |
| `--help`, `-h` | | Show help |
| `--version`, `-v` | | Show the version |

**Requires Node >= 20.19** — the Vite 8 template depends on it
(`engines.node: "^20.19.0 || >=22.12.0"`). The CLI checks this up front and
tells you rather than failing deep inside Vite.

## What it does

1. **Preflight** — Node version, `npm` on PATH, target directory free.
2. **Scaffold** — `npx shadcn@<version> init --template vite --pointer --preset <preset>`.
3. **Install** — `@tanstack/react-query`, `@tanstack/react-router`,
   `@tanstack/react-table`, plus `@tanstack/router-plugin` as a dev dependency.
4. **Components** — `npx shadcn@<version> add --all` (61 components as of 4.21.1).
5. **Wire** — adds `tanstackRouter()` first in `vite.config.ts`, writes a
   `main.tsx` with `QueryClientProvider` + `RouterProvider` (keeping the
   template's `ThemeProvider`, which powers dark mode), and creates
   `src/routes/__root.tsx` and `src/routes/index.tsx`.
6. **Tidy** — removes the unused `import * as React` that shadcn 4.21.1 ships in
   `scroll-area.tsx`, which otherwise fails the template's own
   `noUnusedLocals` during `npm run build`.
7. **Barrel** — writes `src/components/ui/index.ts` re-exporting every
   component, so you can `import { Button, Card } from "@/components/ui"`.

## Expected on first open: one unresolved import

`src/main.tsx` imports `./routeTree.gen`, which the TanStack Router Vite plugin
generates when the dev server starts. Until you run `npm run dev` once, your
editor flags that import and `tsc --noEmit` fails. This is by design — run the
dev server and it resolves.

```bash
cd my-prototype
npm run dev     # generates src/routeTree.gen.ts, serves on :5173
```

## Why the shadcn version is pinned

`SHADCN_VERSION` in [`src/constants.js`](src/constants.js) pins the CLI rather
than tracking `@latest`, so an upstream release cannot break this tool on a day
you did not change anything. Pinning both `init` and `add` to the *same* version
also guarantees the `components.json` schema matches between them — mismatched
versions could half-apply `add --all` across 61 files and leave a project that
is subtly wrong rather than obviously broken.

Pinning the CLI does not freeze your dependencies: the template's `package.json`
carries ranges (`"react": "^19.2.8"`, `"vite": "^8"`), so npm resolves current
compatible versions at install time.

To move to a newer stack, bump that one constant and do a test run.

## If a step fails

The run stops at the failing phase, names it and the exact command, and leaves
any partial directory in place for you to inspect:

```
  Failed during: scaffold
  Command: npx --yes shadcn@4.21.1 init --template vite ...
```

## Local development

```bash
npm link          # from this directory
init-webslop --help
npm test          # 58 tests, no dependencies
```

The CLI has no runtime dependencies — arg parsing, prompting and process
spawning all use Node built-ins, and the tests use `node:test`.

## Known trade-off: barrel collisions

The barrel uses `export *` per component. If two components ever export the same
name, ESM silently drops it rather than erroring, so that import would arrive as
`undefined`. No collisions exist at shadcn 4.21.1 (verified by typechecking
imports through the barrel). Worth knowing if you bump the version.
