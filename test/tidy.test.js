import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { stripUnusedReactImport, tidyComponents } from "../src/steps/tidy.js"

// Upstream shadcn ships scroll-area.tsx with an unused `import * as React`,
// which fails the template's own `noUnusedLocals: true` during `npm run build`.
const AFFECTED = `import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { cn } from "cn"

function ScrollArea({ className, ...props }) {
  return <ScrollAreaPrimitive className={cn(className)} {...props} />
}

export { ScrollArea }
`

const USES_REACT = `import * as React from "react"
import { cn } from "cn"

function Thing({ className }: { className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  return <div ref={ref} className={cn(className)} />
}

export { Thing }
`

test("removes an import * as React line that the file never uses", () => {
  const out = stripUnusedReactImport(AFFECTED)
  assert.ok(!out.includes('import * as React from "react"'), "unused import should be gone")
  assert.match(out, /ScrollAreaPrimitive/, "other imports must survive")
  assert.match(out, /import { cn } from "cn"/)
})

test("keeps the import when React is actually referenced", () => {
  const out = stripUnusedReactImport(USES_REACT)
  assert.equal(out, USES_REACT)
})

test("keeps the import when React is used only in a type position", () => {
  const typeOnly = `import * as React from "react"

function Thing(props: React.ComponentProps<"div">) {
  return <div {...props} />
}

export { Thing }
`
  assert.equal(stripUnusedReactImport(typeOnly), typeOnly)
})

test("leaves a file with no React import untouched", () => {
  const plain = `import { cn } from "cn"\n\nexport const x = 1\n`
  assert.equal(stripUnusedReactImport(plain), plain)
})

test("does not match a different identifier that merely contains React", () => {
  const other = `import * as React from "react"\n\nexport const ReactLike = 1\n`
  const out = stripUnusedReactImport(other)
  assert.ok(!out.includes('import * as React from "react"'), "ReactLike is not a use of React")
})

test("is idempotent", () => {
  const once = stripUnusedReactImport(AFFECTED)
  assert.equal(stripUnusedReactImport(once), once)
})

test("tidyComponents rewrites only the affected files and reports the count", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-tidy-"))
  const ui = join(dir, "src", "components", "ui")
  mkdirSync(ui, { recursive: true })
  writeFileSync(join(ui, "scroll-area.tsx"), AFFECTED)
  writeFileSync(join(ui, "thing.tsx"), USES_REACT)
  writeFileSync(join(ui, "notes.md"), 'import * as React from "react"\n')

  const fixed = tidyComponents({ projectDir: dir })

  assert.equal(fixed, 1)
  assert.ok(!readFileSync(join(ui, "scroll-area.tsx"), "utf8").includes("as React"))
  assert.equal(readFileSync(join(ui, "thing.tsx"), "utf8"), USES_REACT)
  assert.equal(readFileSync(join(ui, "notes.md"), "utf8"), 'import * as React from "react"\n')
})

test("tidyComponents is a no-op when the ui directory is absent", () => {
  const dir = mkdtempSync(join(tmpdir(), "iws-tidy-"))
  assert.equal(tidyComponents({ projectDir: dir }), 0)
})
