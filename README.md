# init-webslop

Scaffolds a web app on the shadcn Vite template with TanStack Query, Router and
Table already wired up, every shadcn component installed, and a barrel file
exporting them.

## Usage

```bash
npx init-webslop --name my-prototype
```

| Flag | Default | Meaning |
|---|---|---|
| `--name` | prompted | App name and directory to create |
| `--preset` | built-in favourite | shadcn preset (name, code or URL) |
| `--shadcn` | pinned version | shadcn CLI version to invoke |

Requires Node >= 20.19.

## Local development

```bash
npm link          # from this directory
init-webslop --help
npm test
```
