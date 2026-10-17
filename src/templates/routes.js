export const ROOT_ROUTE_TSX = `import { Outlet, createRootRouteWithContext } from "@tanstack/react-router"
import type { QueryClient } from "@tanstack/react-query"

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootLayout,
})

function RootLayout() {
  return <Outlet />
}
`

export const INDEX_ROUTE_TSX = `import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/")({
  component: Home,
})

function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 p-6">
      <h1 className="text-lg font-medium">Ready</h1>
      <p className="text-sm text-muted-foreground">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
    </div>
  )
}
`
